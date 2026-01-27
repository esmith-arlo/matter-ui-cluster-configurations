#!/usr/bin/env python3
"""
Script to generate Matter cluster JSON capabilities from XML specification.

Usage:
    python3 generate_matter_cluster_json.py <xml_url> <output_json_file>

Example:
    python3 generate_matter_cluster_json.py \
        https://github.com/project-chip/connectedhomeip/blob/master/src/app/zap-templates/zcl/data-model/chip/on-off-cluster.xml \
        matter_cluster_0x0006_onoff.json
"""

import sys
import json
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from typing import Dict, List, Any, Optional


def convert_github_url_to_raw(url: str) -> str:
    """Convert GitHub blob URL to raw content URL."""
    # Convert: https://github.com/.../blob/master/.../file.xml
    # To: https://raw.githubusercontent.com/.../master/.../file.xml
    if 'github.com' in url and '/blob/' in url:
        url = url.replace('github.com', 'raw.githubusercontent.com')
        url = url.replace('/blob/', '/')
    return url


def get_xml_content(source: str) -> str:
    """Get XML content from URL or local file."""
    import os
    
    # Check if it's a local file
    if os.path.exists(source):
        print(f"Reading XML from local file: {source}")
        with open(source, 'r', encoding='utf-8') as f:
            return f.read()
    
    # Try to download from URL
    raw_url = convert_github_url_to_raw(source)
    print(f"Downloading XML from: {raw_url}")
    try:
        with urllib.request.urlopen(raw_url) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"Error downloading XML from {raw_url}: {e}", file=sys.stderr)
        print(f"Trying original URL: {source}", file=sys.stderr)
        try:
            with urllib.request.urlopen(source) as response:
                return response.read().decode('utf-8')
        except Exception as e2:
            print(f"Error downloading XML from {source}: {e2}", file=sys.stderr)
            sys.exit(1)


def parse_xml_attributes(root: ET.Element) -> Dict[str, Any]:
    """Parse attributes from XML cluster definition."""
    attributes = {}
    
    # Matter XML structure: find cluster element first
    cluster_elem = root if root.tag == 'cluster' else None
    if cluster_elem is None:
        cluster_elem = root.find('cluster')
    if cluster_elem is None:
        cluster_elem = root.find('.//cluster')
    if cluster_elem is None:
        cluster_elem = root
    
    # Find all attribute elements within cluster (can be direct or in <attributes> container)
    attrs = cluster_elem.findall('attribute') + cluster_elem.findall('attributes/attribute')
    for attr in attrs:
        # Matter XML can use either 'code' or 'id'
        attr_code = attr.get('code') or attr.get('id')
        # In Matter XML, attribute name can be in:
        # 1. 'name' attribute
        # 2. element text content
        # 3. child <description> element (if text is empty)
        # 4. 'define' attribute (as fallback, convert SPEED_MAX -> SpeedMax)
        attr_name = attr.get('name')
        used_desc_for_name = False
        if not attr_name:
            text_content = attr.text.strip() if attr.text else ''
            if text_content:
                attr_name = text_content
            else:
                # Try to get from description element
                desc_elem = attr.find('description')
                if desc_elem is not None and desc_elem.text:
                    attr_name = desc_elem.text.strip()
                    used_desc_for_name = True
                else:
                    # Fallback: use 'define' attribute and convert to camelCase
                    define_attr = attr.get('define')
                    if define_attr:
                        # Convert FAN_MODE_SEQUENCE -> FanModeSequence
                        parts = define_attr.split('_')
                        attr_name = ''.join(word.capitalize() for word in parts)
        attr_type = attr.get('type')
        
        if not attr_name:
            continue
        
        # Determine if mandatory (optional="true" means not mandatory)
        is_mandatory = attr.get('optional', 'false').lower() != 'true'
        
        # Check for reportable (not directly in Matter XML, assume true for server attributes)
        is_reportable = attr.get('side') == 'server'
        
        # Check for scene (not directly in Matter XML)
        is_scene = False
        
        # Check for nullable
        is_nullable = attr.get('isNullable', 'false').lower() == 'true' or attr.get('nullable', 'false').lower() == 'true'
        
        # Get default value (can be attribute or element)
        default_value = None
        default_str = attr.get('default')
        if not default_str:
            default_elem = attr.find('default')
            if default_elem is not None:
                default_str = default_elem.text
        
        # Normalize type names first (before using in default conversion)
        normalized_type = attr_type or 'unknown'
        if normalized_type == 'boolean':
            normalized_type = 'bool'
        elif normalized_type == 'int16u':
            normalized_type = 'uint16'
        elif normalized_type == 'int8u':
            normalized_type = 'uint8'
        elif normalized_type == 'int16s':
            normalized_type = 'int16'
        elif normalized_type == 'int8s':
            normalized_type = 'int8'
        
        if default_str:
            # Try to convert to appropriate type
            if normalized_type in ['bool', 'boolean']:
                default_value = default_str.lower() in ['true', '1', 'yes']
            elif normalized_type and ('int' in normalized_type or 'uint' in normalized_type):
                try:
                    default_value = int(default_str, 16) if default_str.startswith('0x') else int(default_str)
                except ValueError:
                    default_value = default_str
            else:
                default_value = default_str
        
        # Get min/max values (Matter XML uses 'max' attribute)
        min_value = attr.get('min')
        max_value = attr.get('max')
        
        # Also check for min/max elements
        if not min_value:
            min_elem = attr.find('min')
            if min_elem is not None and min_elem.text:
                min_value = min_elem.text
        if not max_value:
            max_elem = attr.find('max')
            if max_elem is not None and max_elem.text:
                max_value = max_elem.text
        
        # Convert to int if possible
        if min_value:
            try:
                min_value = int(min_value, 16) if str(min_value).startswith('0x') else int(min_value)
            except (ValueError, TypeError):
                pass
        if max_value:
            try:
                max_value = int(max_value, 16) if str(max_value).startswith('0x') else int(max_value)
            except (ValueError, TypeError):
                pass
        
        # Get units (can be attribute or element)
        # For Matter clusters, units are typically inferred from attribute names/types
        units = attr.get('unit')
        if not units:
            unit_elem = attr.find('unit')
            if unit_elem is not None and unit_elem.text:
                units = unit_elem.text
        
        # Infer units from attribute name/type if not specified
        if not units:
            if 'Time' in attr_name and normalized_type in ['uint16', 'int16']:
                units = '0.1s'
            elif 'Level' in attr_name and normalized_type in ['uint8', 'int8']:
                units = '%'
        
        # Get description
        # If we used <description> for name, don't use it again for description
        description = attr.get('description', '')
        if not used_desc_for_name:
            desc_elem = attr.find('description')
            if desc_elem is not None and desc_elem.text:
                description = desc_elem.text.strip()
        # If description is still empty, use attribute name as fallback
        if not description:
            description = f"{attr_name} attribute"
        
        # Parse enum options - Matter XML defines enums separately
        options = None
        enum_values = []  # Store enum values to calculate min/max
        if attr_type and ('enum' in attr_type.lower() or 'Enum' in attr_type):
            options = []
            # Find enum definition in root configurator
            enum_name = attr_type
            enum_elem = root.find(f".//enum[@name='{enum_name}']")
            if enum_elem is not None:
                # Extract enum items
                for item in enum_elem.findall('item'):
                    item_name = item.get('name')
                    item_value = item.get('value')
                    if item_name and item_value:
                        try:
                            opt_value = int(item_value, 16) if item_value.startswith('0x') else int(item_value)
                            opt_dict = {item_name: opt_value}
                            options.append(opt_dict)
                            enum_values.append(opt_value)
                        except ValueError:
                            pass
                
                # Calculate min/max from enum values if not already set
                if enum_values:
                    if not min_value:
                        min_value = min(enum_values)
                    if not max_value:
                        max_value = max(enum_values)
        
        # Check for feature dependency (from mandatoryConform)
        feature_dep = None
        mandatory_conform = attr.find('mandatoryConform')
        if mandatory_conform is not None:
            feature_elem = mandatory_conform.find('.//feature')
            if feature_elem is not None:
                feature_dep = feature_elem.get('name')
        
        # Format attribute code
        attr_code = attr_code or '0x0000'
        if attr_code and not attr_code.startswith('0x'):
            try:
                # Convert to hex format
                attr_code = f"0x{int(attr_code):04X}"
            except ValueError:
                attr_code = f"0x{attr_code}"
        
        # Build attribute definition
        attr_def = {
            'code': attr_code,
            'type': normalized_type,
            'mandatory': is_mandatory,
            'description': description or f"{attr_name} attribute"
        }
        
        if is_reportable:
            attr_def['reportable'] = True
        if is_scene:
            attr_def['scene'] = True
        if is_nullable:
            attr_def['nullable'] = True
        if feature_dep:
            attr_def['featureDependent'] = feature_dep
        if default_value is not None:
            attr_def['default'] = default_value
        # Don't add min/max for boolean types
        if normalized_type not in ['bool', 'boolean']:
            if min_value is not None:
                attr_def['min'] = min_value
            if max_value is not None:
                attr_def['max'] = max_value
        if units:
            attr_def['units'] = units
        # Always add options if enum type detected
        if options:
            attr_def['options'] = options
        
        # Determine permissions based on type and properties
        permissions = ['read']
        # Matter XML uses 'writable' attribute
        if attr.get('writable', 'false').lower() == 'true' or attr.get('side') == 'server':
            permissions.append('write')
        attr_def['permissions'] = permissions
        
        attributes[attr_name] = attr_def
    
    return attributes


def parse_xml_commands(root: ET.Element) -> Dict[str, Any]:
    """Parse commands from XML cluster definition."""
    commands = {}
    
    # Matter XML structure: find cluster element first
    cluster_elem = root if root.tag == 'cluster' else None
    if cluster_elem is None:
        cluster_elem = root.find('cluster')
    if cluster_elem is None:
        cluster_elem = root.find('.//cluster')
    if cluster_elem is None:
        cluster_elem = root
    
    # Find all command elements within cluster (can be direct or in <commands> container)
    cmds = cluster_elem.findall('command') + cluster_elem.findall('commands/command')
    for cmd in cmds:
        # Matter XML can use either 'code' or 'id'
        cmd_code = cmd.get('code') or cmd.get('id')
        cmd_name = cmd.get('name')
        
        if not cmd_name:
            continue
        
        # Determine if mandatory (optional="true" means not mandatory)
        is_mandatory = cmd.get('optional', 'false').lower() != 'true'
        
        # Get description
        desc_elem = cmd.find('description')
        description = desc_elem.text if desc_elem is not None else cmd.get('description', '')
        
        # Format command ID
        cmd_id = cmd_code or '0x00'
        if cmd_id and not cmd_id.startswith('0x'):
            try:
                cmd_id = f"0x{int(cmd_id):02X}"
            except ValueError:
                cmd_id = f"0x{cmd_id}"
        
        cmd_def = {
            'id': cmd_id or '0x00',
            'mandatory': is_mandatory,
            'description': description or f"{cmd_name} command"
        }
        
        # Parse command arguments
        args = []
        for arg_elem in cmd.findall('arg'):
            arg_name = arg_elem.get('name')
            arg_type = arg_elem.get('type')
            arg_id = arg_elem.get('id')
            
            if not arg_name:
                continue
            
            # Normalize type names
            normalized_arg_type = arg_type or 'unknown'
            if normalized_arg_type == 'boolean':
                normalized_arg_type = 'bool'
            elif normalized_arg_type == 'int16u':
                normalized_arg_type = 'uint16'
            elif normalized_arg_type == 'int8u':
                normalized_arg_type = 'uint8'
            elif normalized_arg_type == 'int16s':
                normalized_arg_type = 'int16'
            elif normalized_arg_type == 'int8s':
                normalized_arg_type = 'int8'
            
            # Get min/max values
            arg_min = arg_elem.get('min')
            arg_max = arg_elem.get('max')
            
            # Convert to int if possible
            if arg_min:
                try:
                    arg_min = int(arg_min, 16) if str(arg_min).startswith('0x') else int(arg_min)
                except (ValueError, TypeError):
                    pass
            if arg_max:
                try:
                    arg_max = int(arg_max, 16) if str(arg_max).startswith('0x') else int(arg_max)
                except (ValueError, TypeError):
                    pass
            
            # Parse enum options for argument type
            arg_options = None
            arg_enum_values = []
            if arg_type and ('enum' in arg_type.lower() or 'Enum' in arg_type or 'Bitmap' in arg_type):
                arg_options = []
                # Find enum/bitmap definition in root configurator
                enum_name = arg_type
                enum_elem = root.find(f".//enum[@name='{enum_name}']")
                bitmap_elem = root.find(f".//bitmap[@name='{enum_name}']")
                
                target_elem = enum_elem if enum_elem is not None else bitmap_elem
                
                if target_elem is not None:
                    # Extract items (for enum) or fields (for bitmap)
                    for item in target_elem.findall('item'):
                        item_name = item.get('name')
                        item_value = item.get('value')
                        if item_name and item_value:
                            try:
                                opt_value = int(item_value, 16) if item_value.startswith('0x') else int(item_value)
                                opt_dict = {item_name: opt_value}
                                arg_options.append(opt_dict)
                                arg_enum_values.append(opt_value)
                            except ValueError:
                                pass
                    
                    # Extract fields for bitmap
                    for field in target_elem.findall('field'):
                        field_name = field.get('name')
                        field_mask = field.get('mask')
                        if field_name and field_mask:
                            try:
                                opt_value = int(field_mask, 16) if field_mask.startswith('0x') else int(field_mask)
                                opt_dict = {field_name: opt_value}
                                arg_options.append(opt_dict)
                                arg_enum_values.append(opt_value)
                            except ValueError:
                                pass
                    
                    # Calculate min/max from enum/bitmap values if not already set
                    if arg_enum_values:
                        if not arg_min:
                            arg_min = min(arg_enum_values)
                        if not arg_max:
                            arg_max = max(arg_enum_values)
            
            # Build argument definition
            arg_def = {
                'id': int(arg_id) if arg_id else len(args),
                'name': arg_name,
                'type': normalized_arg_type
            }
            
            if arg_min is not None:
                arg_def['min'] = arg_min
            if arg_max is not None:
                arg_def['max'] = arg_max
            if arg_options:
                arg_def['options'] = arg_options
            
            args.append(arg_def)
        
        if args:
            cmd_def['arguments'] = args
        
        # Check for feature dependency (from mandatoryConform)
        mandatory_conform = cmd.find('mandatoryConform')
        if mandatory_conform is not None:
            feature_elem = mandatory_conform.find('.//feature')
            if feature_elem is not None:
                feature_dep = feature_elem.get('name')
                if feature_dep:
                    cmd_def['featureDependent'] = feature_dep
        
        commands[cmd_name] = cmd_def
    
    return commands


def parse_xml_features(root: ET.Element) -> Dict[str, Any]:
    """Parse features from XML cluster definition."""
    features = {}
    
    # Matter XML structure: find cluster element first
    cluster_elem = root if root.tag == 'cluster' else None
    if cluster_elem is None:
        cluster_elem = root.find('cluster')
    if cluster_elem is None:
        cluster_elem = root.find('.//cluster')
    if cluster_elem is None:
        cluster_elem = root
    
    # Find features element within cluster
    features_elem = cluster_elem.find('features')
    if features_elem is None:
        return features
    
    # Parse each feature
    for feature in features_elem.findall('feature'):
        feature_code = feature.get('code')
        feature_name = feature.get('name')
        feature_bit = feature.get('bit')
        feature_summary = feature.get('summary', '')
        
        if not feature_code or not feature_name:
            continue
        
        # Get summary from child element if not in attribute
        if not feature_summary:
            summary_elem = feature.find('summary')
            if summary_elem is not None and summary_elem.text:
                feature_summary = summary_elem.text.strip()
        
        # Convert bit to int if possible
        bit_value = None
        if feature_bit:
            try:
                bit_value = int(feature_bit)
            except (ValueError, TypeError):
                pass
        
        feature_def = {
            'code': feature_code,
            'name': feature_name,
            'summary': feature_summary
        }
        
        if bit_value is not None:
            feature_def['bit'] = bit_value
        
        features[feature_code] = feature_def
    
    return features


def extract_cluster_info(root: ET.Element, xml_url: str) -> Dict[str, Any]:
    """Extract cluster information from XML root."""
    # Matter XML structure can be either:
    # 1. <cluster> (root is cluster)
    # 2. <configurator><cluster> (cluster is child)
    cluster_elem = root if root.tag == 'cluster' else None
    if cluster_elem is None:
        cluster_elem = root.find('cluster')
    if cluster_elem is None:
        # Try with .//cluster for nested search
        cluster_elem = root.find('.//cluster')
    
    if cluster_elem is None:
        return {
            'id': 'com.matter.cluster.unknown',
            'clusterId': '0x0000',
            'name': 'Unknown',
            'schemaVersion': 1,
            'description': 'Unknown cluster',
            'xmlSource': xml_url
        }
    
    # Get cluster name and code from attributes first
    cluster_name = cluster_elem.get('name', 'Unknown')
    cluster_id = cluster_elem.get('id') or cluster_elem.get('code', '0x0000')
    
    # Try to get from clusterIds element if not found in attributes
    if cluster_id == '0x0000' or not cluster_name or cluster_name == 'Unknown':
        cluster_ids_elem = cluster_elem.find('clusterIds')
        if cluster_ids_elem is not None:
            cluster_id_elem = cluster_ids_elem.find('clusterId')
            if cluster_id_elem is not None:
                if not cluster_id or cluster_id == '0x0000':
                    cluster_id = cluster_id_elem.get('id', cluster_id)
                if not cluster_name or cluster_name == 'Unknown':
                    cluster_name = cluster_id_elem.get('name', cluster_name)
    
    # Fallback to child elements if still not found
    if cluster_name == 'Unknown':
        for child in cluster_elem:
            if child.tag == 'name' and child.text:
                cluster_name = child.text.strip()
                break
    
    if cluster_id == '0x0000':
        for child in cluster_elem:
            if child.tag == 'code' and child.text:
                cluster_id = child.text.strip()
                break
    
    # Normalize cluster ID format
    if cluster_id and not cluster_id.startswith('0x'):
        try:
            cluster_id = f"0x{int(cluster_id):04X}"
        except ValueError:
            cluster_id = f"0x{cluster_id}"
    
    # Generate JSON ID
    json_id = f"com.matter.cluster.{cluster_name.lower().replace(' ', '').replace('/', '').replace('-', '')}"
    
    # Get description from child element
    description = f"Matter {cluster_name} Cluster"
    for child in cluster_elem:
        if child.tag == 'description' and child.text:
            description = child.text.strip()
            break
    
    return {
        'id': json_id,
        'clusterId': cluster_id,
        'name': cluster_name,
        'schemaVersion': 1,
        'description': description,
        'xmlSource': xml_url
    }


def generate_json_from_xml(xml_source: str, output_file: str):
    """Generate JSON capabilities file from XML URL or local file."""
    xml_content = get_xml_content(xml_source)
    
    print("Parsing XML...")
    try:
        root = ET.fromstring(xml_content)
    except ET.ParseError as e:
        print(f"Error parsing XML: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Extract cluster information
    cluster_info = extract_cluster_info(root, xml_source)
    
    # Parse attributes, commands, and features
    attributes = parse_xml_attributes(root)
    commands = parse_xml_commands(root)
    features = parse_xml_features(root)
    
    # Build capabilities structure
    capabilities = {}
    if attributes:
        capabilities['Attributes'] = attributes
    if commands:
        capabilities['Commands'] = commands
    if features:
        capabilities['Features'] = features
    
    # Build final JSON structure
    result = {
        **cluster_info,
        'Capabilities': capabilities
    }
    
    # Write JSON file
    print(f"Writing JSON to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"Successfully generated {output_file}")
    print(f"  - Cluster: {cluster_info['name']} ({cluster_info['clusterId']})")
    print(f"  - Attributes: {len(attributes)}")
    print(f"  - Commands: {len(commands)}")


def main():
    """Main function."""
    if len(sys.argv) != 3:
        print("Usage: python3 generate_matter_cluster_json.py <xml_url_or_file> <output_json_file>", file=sys.stderr)
        print("\nExample:", file=sys.stderr)
        print("  python3 generate_matter_cluster_json.py \\", file=sys.stderr)
        print("    https://github.com/project-chip/connectedhomeip/blob/master/src/app/zap-templates/zcl/data-model/chip/on-off-cluster.xml \\", file=sys.stderr)
        print("    matter_cluster_0x0006_onoff.json", file=sys.stderr)
        print("\nOr with local file:", file=sys.stderr)
        print("  python3 generate_matter_cluster_json.py test_onoff_cluster.xml matter_cluster_0x0006_onoff.json", file=sys.stderr)
        sys.exit(1)
    
    xml_source = sys.argv[1]
    output_file = sys.argv[2]
    
    generate_json_from_xml(xml_source, output_file)


if __name__ == '__main__':
    main()

