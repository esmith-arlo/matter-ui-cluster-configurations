#!/bin/bash
#
# Script to run comparisons for all cluster XML files.
# 
# Usage:
#     ./run_all_comparisons.sh [cluster_pattern]
# 
# Example:
#     ./run_all_comparisons.sh
#     ./run_all_comparisons.sh OnOff
#     ./run_all_comparisons.sh "OnOff|LevelControl"
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLUSTERS_DIR="$PROJECT_ROOT/data/clusters"
PATTERN="${1:-.*}"

# Find all XML files matching pattern
XML_FILES=$(find "$CLUSTERS_DIR" -name "*.xml" -type f | grep -E "$PATTERN" | sort)

if [ -z "$XML_FILES" ]; then
    echo -e "${RED}No XML files found matching pattern: $PATTERN${NC}"
    exit 1
fi

# Count files
TOTAL=$(echo "$XML_FILES" | wc -l | tr -d ' ')
SUCCESS=0
FAILED=0
FAILED_FILES=()

echo "=" | head -c 80
echo ""
echo -e "${BLUE}Running comparisons for $TOTAL cluster(s)${NC}"
echo "=" | head -c 80
echo ""

# Process each file
while IFS= read -r XML_FILE; do
    CLUSTER_NAME=$(basename "$XML_FILE" .xml)
    echo -e "${YELLOW}Processing: $CLUSTER_NAME${NC}"
    echo "-" | head -c 80
    echo ""
    
    if "$SCRIPT_DIR/run_comparison.sh" "$XML_FILE" > /tmp/comparison_${CLUSTER_NAME}.log 2>&1; then
        echo -e "${GREEN}✅ $CLUSTER_NAME: PASSED${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ $CLUSTER_NAME: FAILED${NC}"
        echo "   Check /tmp/comparison_${CLUSTER_NAME}.log for details"
        FAILED_FILES+=("$CLUSTER_NAME")
        ((FAILED++))
    fi
    echo ""
done <<< "$XML_FILES"

# Print summary
echo "=" | head -c 80
echo ""
echo -e "${BLUE}SUMMARY${NC}"
echo "=" | head -c 80
echo ""
echo -e "Total:   $TOTAL"
echo -e "${GREEN}Passed:  $SUCCESS${NC}"
echo -e "${RED}Failed:  $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed clusters:${NC}"
    for file in "${FAILED_FILES[@]}"; do
        echo "  - $file"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}All comparisons passed!${NC}"
    exit 0
fi
