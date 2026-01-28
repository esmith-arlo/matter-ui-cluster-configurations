#!/bin/bash
#
# Script to run both Python and JavaScript capability generators and compare results.
# 
# Usage:
#     ./run_comparison.sh <cluster_xml_file>
# 
# Example:
#     ./run_comparison.sh data/clusters/OnOff.xml
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <cluster_xml_file>"
    echo ""
    echo "Example:"
    echo "  $0 data/clusters/OnOff.xml"
    exit 1
fi

XML_FILE="$1"

# Check if XML file exists
if [ ! -f "$XML_FILE" ]; then
    echo -e "${RED}Error: XML file not found: $XML_FILE${NC}"
    exit 1
fi

# Get cluster name from XML file
CLUSTER_NAME=$(basename "$XML_FILE" .xml)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/output"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Generate output file names
PYTHON_OUTPUT="$OUTPUT_DIR/${CLUSTER_NAME}_python.json"
JS_OUTPUT="$OUTPUT_DIR/${CLUSTER_NAME}_js.json"
DIFF_OUTPUT="$OUTPUT_DIR/${CLUSTER_NAME}_diff.json"

echo "=" | head -c 80
echo ""
echo "Generating capabilities for: $CLUSTER_NAME"
echo "=" | head -c 80
echo ""
echo "XML File: $XML_FILE"
echo "Output Directory: $OUTPUT_DIR"
echo ""

# Step 1: Generate with Python
echo -e "${YELLOW}Step 1: Generating with Python...${NC}"
if ! python3 "$PROJECT_ROOT/scripts/generate_matter_cluster_json.py" "$XML_FILE" "$PYTHON_OUTPUT"; then
    echo -e "${RED}Error: Python generation failed${NC}"
    exit 1
fi
echo ""

# Step 2: Generate with JavaScript
echo -e "${YELLOW}Step 2: Generating with JavaScript...${NC}"
if ! node "$SCRIPT_DIR/generate_capabilities_js.js" "$XML_FILE" "$JS_OUTPUT"; then
    echo -e "${RED}Error: JavaScript generation failed${NC}"
    exit 1
fi
echo ""

# Step 3: Compare results
echo -e "${YELLOW}Step 3: Comparing results...${NC}"
if node "$SCRIPT_DIR/compare_capabilities.js" "$PYTHON_OUTPUT" "$JS_OUTPUT" "$DIFF_OUTPUT"; then
    echo ""
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Differences found. Check $DIFF_OUTPUT for details.${NC}"
    exit 1
fi
