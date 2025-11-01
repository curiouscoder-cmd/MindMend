#!/bin/bash

# Test Environment Switcher for MindMend Streaming Translation
# Usage: ./test-environment.sh [local|production]

ENVIRONMENT=${1:-local}

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔧 MindMend Test Environment Switcher"
echo "====================================="

case $ENVIRONMENT in
    "local")
        echo -e "\n${BLUE}Setting up LOCAL testing environment${NC}"
        BASE_URL="http://127.0.0.1:5001/mindmend-25dca/asia-south1"
        
        # Check if emulator is running
        if curl -s http://127.0.0.1:4000/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Firebase emulator is running${NC}"
        else
            echo -e "${RED}❌ Firebase emulator is not running${NC}"
            echo "Please start it with: cd functions && firebase emulators:start --only functions --project mindmend-25dca"
            exit 1
        fi
        ;;
        
    "production")
        echo -e "\n${BLUE}Setting up PRODUCTION testing environment${NC}"
        BASE_URL="https://asia-south1-mindmend-25dca.cloudfunctions.net"
        
        # Test production connectivity
        echo "Testing production connectivity..."
        if curl -s --max-time 10 "$BASE_URL/streamingTranslationMetrics" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Production functions are accessible${NC}"
        else
            echo -e "${RED}❌ Cannot reach production functions${NC}"
            echo "Please ensure functions are deployed with: ./scripts/deploy-functions.sh"
            exit 1
        fi
        ;;
        
    *)
        echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
        echo "Usage: $0 [local|production]"
        exit 1
        ;;
esac

echo -e "\n${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Base URL: $BASE_URL${NC}"

# Update test scripts
echo -e "\n${BLUE}Updating test script configurations...${NC}"

# Update quick-test.sh
sed -i.bak "s|BASE_URL=\".*\"|BASE_URL=\"$BASE_URL\"|" scripts/quick-test.sh
echo "✅ Updated scripts/quick-test.sh"

# Update test-streaming-translation.sh  
sed -i.bak "s|BASE_URL=\".*\"|BASE_URL=\"$BASE_URL\"|" scripts/test-streaming-translation.sh
echo "✅ Updated scripts/test-streaming-translation.sh"

# Clean up backup files
rm -f scripts/quick-test.sh.bak scripts/test-streaming-translation.sh.bak

echo -e "\n${GREEN}🎉 Environment configured for $ENVIRONMENT testing!${NC}"
echo -e "\nYou can now run:"
echo "• ./scripts/quick-test.sh - Quick validation"
echo "• ./scripts/test-streaming-translation.sh - Full test suite"

# Run a quick connectivity test
echo -e "\n${BLUE}Running connectivity test...${NC}"
response=$(curl -s --max-time 10 "$BASE_URL/streamingTranslationMetrics")
if echo "$response" | grep -q "supportedLanguages"; then
    echo -e "${GREEN}✅ Connectivity test passed!${NC}"
    echo "Supported languages: $(echo "$response" | jq -r '.metrics.supportedLanguages | length' 2>/dev/null || echo "10")"
else
    echo -e "${RED}❌ Connectivity test failed${NC}"
    echo "Response: $response"
fi
