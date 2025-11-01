#!/bin/bash

# Deploy MindMend Streaming Translation Functions to Production
# Project: mindmend-25dca
# Region: asia-south1

echo "🚀 Deploying MindMend Streaming Translation Functions"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Firebase CLI is logged in
echo -e "\n${BLUE}Checking Firebase authentication...${NC}"
if ! firebase projects:list > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged in to Firebase. Please run: firebase login${NC}"
    exit 1
fi

# Verify project
echo -e "\n${BLUE}Verifying project configuration...${NC}"
PROJECT_ID=$(firebase use --project mindmend-25dca 2>/dev/null | grep "Now using project" | awk '{print $4}' || echo "mindmend-25dca")
echo "Project ID: $PROJECT_ID"

# Build functions
echo -e "\n${BLUE}Installing function dependencies...${NC}"
cd functions
npm install

# Deploy specific streaming translation functions
echo -e "\n${BLUE}Deploying streaming translation functions...${NC}"
echo "Functions to deploy:"
echo "- streamingTranslation"
echo "- streamingTranslationMetrics" 
echo "- clearTranslationCache"
echo "- chatMultilingual"

# Deploy with region specification
firebase deploy --only functions:streamingTranslation,functions:streamingTranslationMetrics,functions:clearTranslationCache,functions:chatMultilingual --project mindmend-25dca

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Deployment successful!${NC}"
    echo -e "\n${YELLOW}Production URLs:${NC}"
    echo "🌐 streamingTranslation: https://asia-south1-mindmend-25dca.cloudfunctions.net/streamingTranslation"
    echo "📊 streamingTranslationMetrics: https://asia-south1-mindmend-25dca.cloudfunctions.net/streamingTranslationMetrics"
    echo "🗑️  clearTranslationCache: https://asia-south1-mindmend-25dca.cloudfunctions.net/clearTranslationCache"
    echo "💬 chatMultilingual: https://asia-south1-mindmend-25dca.cloudfunctions.net/chatMultilingual"
    
    echo -e "\n${YELLOW}Testing production deployment...${NC}"
    echo "Running basic health check..."
    
    # Test production endpoint
    response=$(curl -s -X POST "https://asia-south1-mindmend-25dca.cloudfunctions.net/streamingTranslation" \
        -H "Content-Type: application/json" \
        -d '{"text":"Hello world","targetLanguage":"hi","streaming":false}' \
        --max-time 30)
    
    if echo "$response" | grep -q "translatedText"; then
        echo -e "${GREEN}✅ Production endpoint is working!${NC}"
    else
        echo -e "${RED}❌ Production endpoint test failed${NC}"
        echo "Response: $response"
    fi
    
else
    echo -e "\n${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo -e "\n${BLUE}🎉 Deployment complete!${NC}"
echo "You can now update your test scripts to use production URLs."
