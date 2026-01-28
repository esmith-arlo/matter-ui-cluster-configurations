#!/usr/bin/env node
/**
 * JavaScript script to generate Matter cluster JSON capabilities from XML specification.
 * This script generates capabilities in the same format as generate_matter_cluster_json.py
 * 
 * Usage:
 *     node generate_capabilities_js.js <xml_file> <output_json_file>
 * 
 * Example:
 *     node generate_capabilities_js.js data/clusters/OnOff.xml output/onoff_capabilities.json
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

function normalizeType(type) {
    if (!type) return 'unknown';
    const typeMap = {
        'boolean': 'bool',
        'int16u': 'uint16',
        'int8u': 'uint8',
        'int16s': 'int16',
        'int8s': 'int8',
        'int32u': 'uint32',
        'int32s': 'int32',
        'int64u': 'uint64',
        'int64s': 'int64'
    };
    return typeMap[type] || type;
}

function formatCode(code) {
    if (!code) return '0x0000';
    if (code.startsWith('0x')) return code;
    try {
        return `0x${parseInt(code).toString(16).padStart(4, '0').toUpperCase()}`;
    } catch (e) {
        return `0x${code}`;
    }
}

function formatCommandId(code) {
    if (!code) return '0x00';
    if (code.startsWith('0x')) return code;
    try {
        return `0x${parseInt(code).toString(16).padStart(2, '0').toUpperCase()}`;
    } catch (e) {
        return `0x${code}`;
    }
}

function parseValue(value, type) {
    if (!value) return null;
    const normalizedType = normalizeType(type);
    
    if (normalizedType === 'bool' || normalizedType === 'boolean') {
        return value.toLowerCase() === 'true' || value === '1' || value === 'yes';
    }
    
    if (normalizedType.includes('int') || normalizedType.includes('uint')) {
        try {
            return parseInt(value, value.startsWith('0x') ? 16 : 10);
        } catch (e) {
            return value;
        }
    }
    
    return value;
}

function parseAttributes(clusterElem, root) {
    const attributes = {};
    // Attributes can be direct children or in <attributes> container
    // Only get direct children of <attributes> element, not nested ones (like in constraints)
    const attributesContainer = clusterElem.getElementsByTagName('attributes')[0];
    const attrElements = attributesContainer 
        ? Array.from(attributesContainer.getElementsByTagName('attribute')).filter(attr => 
            attr.parentNode === attributesContainer || attr.parentNode.tagName === 'attributes'
        )
        : clusterElem.getElementsByTagName('attribute');
    
    for (let i = 0; i < attrElements.length; i++) {
        const attr = attrElements[i];
        
        // Get attribute code (can be 'code' or 'id')
        const attrCode = attr.getAttribute('code') || attr.getAttribute('id');
        
        // Get attribute name
        let attrName = attr.getAttribute('name');
        if (!attrName) {
            const textContent = attr.textContent?.trim();
            if (textContent) {
                attrName = textContent;
            } else {
                const descElem = attr.getElementsByTagName('description')[0];
                if (descElem && descElem.textContent) {
                    attrName = descElem.textContent.trim();
                } else {
                    const defineAttr = attr.getAttribute('define');
                    if (defineAttr) {
                        attrName = defineAttr.split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join('');
                    }
                }
            }
        }
        
        if (!attrName) continue;
        
        const attrType = normalizeType(attr.getAttribute('type'));
        const isMandatory = attr.getAttribute('optional')?.toLowerCase() !== 'true';
        const isReportable = attr.getAttribute('side') === 'server';
        const isNullable = attr.getAttribute('isNullable')?.toLowerCase() === 'true' || 
                          attr.getAttribute('nullable')?.toLowerCase() === 'true';
        
        // Get default value
        let defaultValue = null;
        const defaultAttr = attr.getAttribute('default');
        if (defaultAttr) {
            // Handle special values - Python keeps "null" and "MS" as strings
            if (defaultAttr === 'null') {
                defaultValue = 'null'; // Keep as string to match Python
            } else if (defaultAttr === 'MS') {
                defaultValue = 'MS'; // Keep as string to match Python
            } else {
                defaultValue = parseValue(defaultAttr, attrType);
            }
        } else {
            const defaultElem = attr.getElementsByTagName('default')[0];
            if (defaultElem) {
                // Python uses default_elem.text (not textContent), which includes whitespace
                // Check if there's a child attribute element (reference to another attribute)
                const attrRef = defaultElem.getElementsByTagName('attribute')[0];
                if (attrRef) {
                    // This is a reference to another attribute - Python saves the text content (whitespace)
                    // Python's ElementTree.text only gets direct text, not nested text
                    // So we need to get only the direct text content before the attribute element
                    let defaultText = '';
                    for (let node = defaultElem.firstChild; node; node = node.nextSibling) {
                        if (node.nodeType === 3) { // Text node
                            defaultText += node.nodeValue;
                        } else if (node.nodeType === 1 && node.tagName === 'attribute') {
                            break; // Stop at attribute element
                        }
                    }
                    defaultValue = defaultText; // Keep whitespace to match Python
                } else if (defaultElem.textContent) {
                    const defaultText = defaultElem.textContent.trim();
                    if (defaultText === 'null') {
                        defaultValue = 'null'; // Keep as string to match Python
                    } else if (defaultText === 'MS') {
                        defaultValue = 'MS'; // Keep as string to match Python
                    } else {
                        defaultValue = parseValue(defaultText, attrType);
                    }
                } else {
                    // Empty default element - Python saves text content (whitespace)
                    defaultValue = defaultElem.textContent || '';
                }
            }
        }
        
        // Get min/max values
        let minValue = attr.getAttribute('min');
        let maxValue = attr.getAttribute('max');
        
        if (!minValue) {
            const minElem = attr.getElementsByTagName('min')[0];
            if (minElem && minElem.textContent) {
                minValue = minElem.textContent.trim();
            }
        }
        if (!maxValue) {
            const maxElem = attr.getElementsByTagName('max')[0];
            if (maxElem && maxElem.textContent) {
                maxValue = maxElem.textContent.trim();
            }
        }
        
        if (minValue) {
            try {
                minValue = parseInt(minValue, minValue.startsWith('0x') ? 16 : 10);
            } catch (e) {
                // Keep as string
            }
        }
        if (maxValue) {
            try {
                maxValue = parseInt(maxValue, maxValue.startsWith('0x') ? 16 : 10);
            } catch (e) {
                // Keep as string
            }
        }
        
        // Get units
        let units = attr.getAttribute('unit');
        if (!units) {
            const unitElem = attr.getElementsByTagName('unit')[0];
            if (unitElem && unitElem.textContent) {
                units = unitElem.textContent.trim();
            }
        }
        
        // Infer units from attribute name/type
        if (!units) {
            if (attrName.includes('Time') && ['uint16', 'int16'].includes(attrType)) {
                units = '0.1s';
            } else if (attrName.includes('Level') && ['uint8', 'int8'].includes(attrType)) {
                units = '%';
            }
        }
        
        // Get description
        let description = attr.getAttribute('description') || '';
        const descElem = attr.getElementsByTagName('description')[0];
        if (!description && descElem && descElem.textContent) {
            description = descElem.textContent.trim();
        }
        if (!description) {
            description = `${attrName} attribute`;
        }
        
        // Parse enum options
        let options = null;
        const enumValues = [];
        if (attrType && (attrType.toLowerCase().includes('enum') || attrType.includes('Enum'))) {
            options = [];
            const enumName = attrType;
            const enumElems = root.getElementsByTagName('enum');
            
            for (let j = 0; j < enumElems.length; j++) {
                const enumElem = enumElems[j];
                if (enumElem.getAttribute('name') === enumName) {
                    const items = enumElem.getElementsByTagName('item');
                    for (let k = 0; k < items.length; k++) {
                        const item = items[k];
                        const itemName = item.getAttribute('name');
                        const itemValue = item.getAttribute('value');
                        if (itemName && itemValue) {
                            try {
                                const optValue = parseInt(itemValue, itemValue.startsWith('0x') ? 16 : 10);
                                options.push({ [itemName]: optValue });
                                enumValues.push(optValue);
                            } catch (e) {
                                // Skip invalid values
                            }
                        }
                    }
                    break;
                }
            }
            
            // Calculate min/max from enum values
            if (enumValues.length > 0) {
                if (!minValue) minValue = Math.min(...enumValues);
                if (!maxValue) maxValue = Math.max(...enumValues);
            }
        }
        
        // Check for feature dependency (from mandatoryConform or optionalConform)
        let featureDep = null;
        const mandatoryConform = attr.getElementsByTagName('mandatoryConform')[0];
        if (mandatoryConform) {
            // Use .//feature to find feature anywhere in mandatoryConform (including nested)
            const featureElems = mandatoryConform.getElementsByTagName('feature');
            if (featureElems.length > 0) {
                featureDep = featureElems[0].getAttribute('name');
            }
        }
        // Also check optionalConform (Python doesn't, but let's match behavior)
        // Actually, Python only checks mandatoryConform, so we should too
        
        // Build attribute definition
        const attrDef = {
            code: formatCode(attrCode),
            type: attrType,
            mandatory: isMandatory,
            description: description
        };
        
        if (isReportable) attrDef.reportable = true;
        if (isNullable) attrDef.nullable = true;
        if (featureDep) attrDef.featureDependent = featureDep;
        if (defaultValue !== null) attrDef.default = defaultValue;
        // Don't add min/max for boolean types or if values are empty strings
        if (attrType !== 'bool' && attrType !== 'boolean') {
            if (minValue !== null && minValue !== undefined && minValue !== '') {
                attrDef.min = minValue;
            }
            if (maxValue !== null && maxValue !== undefined && maxValue !== '') {
                attrDef.max = maxValue;
            }
        }
        if (units) attrDef.units = units;
        if (options) attrDef.options = options;
        
        // Determine permissions
        const permissions = ['read'];
        if (attr.getAttribute('writable')?.toLowerCase() === 'true' || 
            attr.getAttribute('side') === 'server') {
            permissions.push('write');
        }
        attrDef.permissions = permissions;
        
        attributes[attrName] = attrDef;
    }
    
    return attributes;
}

function parseCommands(clusterElem, root) {
    const commands = {};
    // Commands can be direct children or in <commands> container
    // Only get direct children of <commands> element, not nested ones
    const commandsContainer = clusterElem.getElementsByTagName('commands')[0];
    const cmdElements = commandsContainer 
        ? Array.from(commandsContainer.getElementsByTagName('command')).filter(cmd => 
            cmd.parentNode === commandsContainer || cmd.parentNode.tagName === 'commands'
        )
        : clusterElem.getElementsByTagName('command');
    
    for (let i = 0; i < cmdElements.length; i++) {
        const cmd = cmdElements[i];
        
        // Get command code (can be 'code' or 'id')
        const cmdCode = cmd.getAttribute('code') || cmd.getAttribute('id');
        const cmdName = cmd.getAttribute('name');
        
        if (!cmdName) continue;
        
        const isMandatory = cmd.getAttribute('optional')?.toLowerCase() !== 'true';
        
        // Get description
        let description = cmd.getAttribute('description') || '';
        const descElem = cmd.getElementsByTagName('description')[0];
        if (!description && descElem && descElem.textContent) {
            description = descElem.textContent.trim();
        }
        if (!description) {
            description = `${cmdName} command`;
        }
        
        const cmdDef = {
            id: formatCommandId(cmdCode),
            mandatory: isMandatory,
            description: description
        };
        
        // Parse command arguments
        const args = [];
        const argElements = cmd.getElementsByTagName('arg');
        
        for (let j = 0; j < argElements.length; j++) {
            const arg = argElements[j];
            const argName = arg.getAttribute('name');
            const argType = normalizeType(arg.getAttribute('type'));
            const argId = arg.getAttribute('id');
            
            if (!argName) continue;
            
            // Get min/max values
            let argMin = arg.getAttribute('min');
            let argMax = arg.getAttribute('max');
            
            if (argMin) {
                try {
                    argMin = parseInt(argMin, argMin.startsWith('0x') ? 16 : 10);
                } catch (e) {
                    // Keep as string
                }
            }
            if (argMax) {
                try {
                    argMax = parseInt(argMax, argMax.startsWith('0x') ? 16 : 10);
                } catch (e) {
                    // Keep as string
                }
            }
            
            // Parse enum/bitmap options
            let argOptions = null;
            const argEnumValues = [];
            if (argType && (argType.toLowerCase().includes('enum') || 
                           argType.includes('Enum') || 
                           argType.includes('Bitmap'))) {
                argOptions = [];
                const enumName = argType;
                const enumElems = root.getElementsByTagName('enum');
                const bitmapElems = root.getElementsByTagName('bitmap');
                
                let targetElem = null;
                for (let k = 0; k < enumElems.length; k++) {
                    if (enumElems[k].getAttribute('name') === enumName) {
                        targetElem = enumElems[k];
                        break;
                    }
                }
                if (!targetElem) {
                    for (let k = 0; k < bitmapElems.length; k++) {
                        if (bitmapElems[k].getAttribute('name') === enumName) {
                            targetElem = bitmapElems[k];
                            break;
                        }
                    }
                }
                
                if (targetElem) {
                    // Extract items (for enum) or fields (for bitmap)
                    const items = targetElem.getElementsByTagName('item');
                    for (let k = 0; k < items.length; k++) {
                        const item = items[k];
                        const itemName = item.getAttribute('name');
                        const itemValue = item.getAttribute('value');
                        if (itemName && itemValue) {
                            try {
                                const optValue = parseInt(itemValue, itemValue.startsWith('0x') ? 16 : 10);
                                argOptions.push({ [itemName]: optValue });
                                argEnumValues.push(optValue);
                            } catch (e) {
                                // Skip invalid values
                            }
                        }
                    }
                    
                    // Extract fields for bitmap
                    const fields = targetElem.getElementsByTagName('field');
                    for (let k = 0; k < fields.length; k++) {
                        const field = fields[k];
                        const fieldName = field.getAttribute('name');
                        const fieldMask = field.getAttribute('mask');
                        if (fieldName && fieldMask) {
                            try {
                                const optValue = parseInt(fieldMask, fieldMask.startsWith('0x') ? 16 : 10);
                                argOptions.push({ [fieldName]: optValue });
                                argEnumValues.push(optValue);
                            } catch (e) {
                                // Skip invalid values
                            }
                        }
                    }
                    
                    // Calculate min/max from enum/bitmap values
                    if (argEnumValues.length > 0) {
                        if (!argMin) argMin = Math.min(...argEnumValues);
                        if (!argMax) argMax = Math.max(...argEnumValues);
                    }
                }
            }
            
            // Build argument definition
            const argDef = {
                id: argId ? parseInt(argId) : args.length,
                name: argName,
                type: argType
            };
            
            if (argMin !== null && argMin !== undefined) argDef.min = argMin;
            if (argMax !== null && argMax !== undefined) argDef.max = argMax;
            if (argOptions) argDef.options = argOptions;
            
            args.push(argDef);
        }
        
        if (args.length > 0) {
            cmdDef.arguments = args;
        }
        
        // Check for feature dependency
        const mandatoryConform = cmd.getElementsByTagName('mandatoryConform')[0];
        if (mandatoryConform) {
            const featureElem = mandatoryConform.getElementsByTagName('feature')[0];
            if (featureElem) {
                const featureDep = featureElem.getAttribute('name');
                if (featureDep) {
                    cmdDef.featureDependent = featureDep;
                }
            }
        }
        
        commands[cmdName] = cmdDef;
    }
    
    return commands;
}

function parseFeatures(clusterElem) {
    const features = {};
    const featuresElem = clusterElem.getElementsByTagName('features')[0];
    
    if (!featuresElem) return features;
    
    const featureElements = featuresElem.getElementsByTagName('feature');
    
    for (let i = 0; i < featureElements.length; i++) {
        const feature = featureElements[i];
        const featureCode = feature.getAttribute('code');
        const featureName = feature.getAttribute('name');
        const featureBit = feature.getAttribute('bit');
        let featureSummary = feature.getAttribute('summary') || '';
        
        if (!featureCode || !featureName) continue;
        
        if (!featureSummary) {
            const summaryElem = feature.getElementsByTagName('summary')[0];
            if (summaryElem && summaryElem.textContent) {
                featureSummary = summaryElem.textContent.trim();
            }
        }
        
        const featureDef = {
            code: featureCode,
            name: featureName,
            summary: featureSummary
        };
        
        if (featureBit) {
            try {
                featureDef.bit = parseInt(featureBit);
            } catch (e) {
                // Skip invalid bit values
            }
        }
        
        features[featureCode] = featureDef;
    }
    
    return features;
}

function extractClusterInfo(clusterElem, xmlSource) {
    // Get cluster name and code from attributes first
    let clusterName = clusterElem.getAttribute('name') || 'Unknown';
    let clusterId = clusterElem.getAttribute('id') || clusterElem.getAttribute('code') || '0x0000';
    
    // Try to get from clusterIds element if not found in attributes
    if (clusterId === '0x0000' || !clusterName || clusterName === 'Unknown') {
        const clusterIdsElem = clusterElem.getElementsByTagName('clusterIds')[0];
        if (clusterIdsElem) {
            const clusterIdElem = clusterIdsElem.getElementsByTagName('clusterId')[0];
            if (clusterIdElem) {
                if (!clusterId || clusterId === '0x0000') {
                    clusterId = clusterIdElem.getAttribute('id') || clusterId;
                }
                if (!clusterName || clusterName === 'Unknown') {
                    clusterName = clusterIdElem.getAttribute('name') || clusterName;
                }
            }
        }
    }
    
    // Fallback to child elements if still not found
    if (clusterName === 'Unknown') {
        const nameElem = clusterElem.getElementsByTagName('name')[0];
        if (nameElem && nameElem.textContent) {
            clusterName = nameElem.textContent.trim();
        }
    }
    
    if (clusterId === '0x0000') {
        const codeElem = clusterElem.getElementsByTagName('code')[0];
        if (codeElem && codeElem.textContent) {
            clusterId = codeElem.textContent.trim();
        }
    }
    
    // Normalize cluster ID format
    if (!clusterId.startsWith('0x')) {
        try {
            clusterId = `0x${parseInt(clusterId).toString(16).padStart(4, '0').toUpperCase()}`;
        } catch (e) {
            clusterId = `0x${clusterId}`;
        }
    }
    
    // Generate JSON ID
    const jsonId = `com.matter.cluster.${clusterName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/\//g, '')
        .replace(/-/g, '')}`;
    
    // Get description
    let description = `Matter ${clusterName} Cluster`;
    const descElem = clusterElem.getElementsByTagName('description')[0];
    if (descElem && descElem.textContent) {
        description = descElem.textContent.trim();
    }
    
    return {
        id: jsonId,
        clusterId: clusterId,
        name: clusterName,
        schemaVersion: 1,
        description: description,
        xmlSource: xmlSource
    };
}

function generateJSONFromXML(xmlFile, outputFile) {
    console.log(`Reading XML from: ${xmlFile}`);
    
    if (!fs.existsSync(xmlFile)) {
        console.error(`Error: XML file not found: ${xmlFile}`);
        process.exit(1);
    }
    
    const xmlContent = fs.readFileSync(xmlFile, 'utf-8');
    
    console.log('Parsing XML...');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Find cluster element (root might be cluster itself)
    let clusterElem = null;
    if (xmlDoc.documentElement && xmlDoc.documentElement.tagName === 'cluster') {
        clusterElem = xmlDoc.documentElement;
    } else {
        const clusterElems = xmlDoc.getElementsByTagName('cluster');
        if (clusterElems.length === 0) {
            console.error('Error: No cluster element found in XML');
            process.exit(1);
        }
        clusterElem = clusterElems[0];
    }
    
    // Extract cluster information
    const clusterInfo = extractClusterInfo(clusterElem, xmlFile);
    
    // Parse attributes, commands, and features
    const attributes = parseAttributes(clusterElem, xmlDoc);
    const commands = parseCommands(clusterElem, xmlDoc);
    const features = parseFeatures(clusterElem);
    
    // Build capabilities structure
    const capabilities = {};
    if (Object.keys(attributes).length > 0) {
        capabilities.Attributes = attributes;
    }
    if (Object.keys(commands).length > 0) {
        capabilities.Commands = commands;
    }
    if (Object.keys(features).length > 0) {
        capabilities.Features = features;
    }
    
    // Build final JSON structure
    const result = {
        ...clusterInfo,
        Capabilities: capabilities
    };
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write JSON file
    console.log(`Writing JSON to: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
    
    console.log(`Successfully generated ${outputFile}`);
    console.log(`  - Cluster: ${clusterInfo.name} (${clusterInfo.clusterId})`);
    console.log(`  - Attributes: ${Object.keys(attributes).length}`);
    console.log(`  - Commands: ${Object.keys(commands).length}`);
    console.log(`  - Features: ${Object.keys(features).length}`);
}

// Main function
function main() {
    if (process.argv.length !== 4) {
        console.error('Usage: node generate_capabilities_js.js <xml_file> <output_json_file>');
        console.error('');
        console.error('Example:');
        console.error('  node generate_capabilities_js.js data/clusters/OnOff.xml output/onoff_capabilities.json');
        process.exit(1);
    }
    
    const xmlFile = process.argv[2];
    const outputFile = process.argv[3];
    
    generateJSONFromXML(xmlFile, outputFile);
}

if (require.main === module) {
    main();
}

module.exports = { generateJSONFromXML };
