#!/bin/bash

# Quick validation test for streaming translation system
# Run this to verify the basic functionality is working

echo "🚀 MindMend Streaming Translation - Quick Test"
echo "=============================================="

# Configuration
BASE_URL="http://127.0.0.1:5001/mindmend-25dca/asia-south1"
# Uncomment for production:
# BASE_URL="http://127.0.0.1:5001/mindmend-25dca/asia-south1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Basic Translation
echo -e "\n${BLUE}Test 1: Basic Translation (English → Hindi)${NC}"
response=$(curl -s -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I need help with anxiety",
    "targetLanguage": "hi",
    "streaming": false
  }')

if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Translation successful${NC}"
    echo "Original: $(echo "$response" | jq -r '.originalText')"
    echo "Translated: $(echo "$response" | jq -r '.translatedText')"
    echo "Model: $(echo "$response" | jq -r '.model')"
    echo "Latency: $(echo "$response" | jq -r '.performance.total')ms"
else
    echo -e "${RED}❌ Translation failed${NC}"
    echo "$response"
fi

# Test 2: Streaming Test (short)
echo -e "\n${BLUE}Test 2: Streaming Translation${NC}"
echo "Starting streaming test..."
curl -s -N --max-time 10 \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "text": "I am feeling stressed about work",
    "targetLanguage": "hi",
    "streaming": true
  }' \
  "$BASE_URL/streamingTranslation" | head -10

echo -e "\n${GREEN}✅ Streaming test completed${NC}"

# Test 3: Metrics
echo -e "\n${BLUE}Test 3: Performance Metrics${NC}"
metrics=$(curl -s "$BASE_URL/streamingTranslationMetrics")
if echo "$metrics" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Metrics retrieved${NC}"
    echo "Total requests: $(echo "$metrics" | jq -r '.metrics.requests // 0')"
    echo "Cache size: $(echo "$metrics" | jq -r '.metrics.cacheSize // 0')"
    echo "Supported languages: $(echo "$metrics" | jq -r '.metrics.supportedLanguages | length')"
else
    echo -e "${RED}❌ Metrics failed${NC}"
    echo "$metrics"
fi

# Test 4: Multilingual Chat
echo -e "\n${BLUE}Test 4: Multilingual Chat Integration${NC}"
chat_response=$(curl -s -X POST "$BASE_URL/chatMultilingual" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "मुझे तनाव हो रहा है",
    "moodHistory": ["stressed"],
    "userProgress": {"streak": 1}
  }')

if echo "$chat_response" | jq -e '.response' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Multilingual chat working${NC}"
    echo "Detected language: $(echo "$chat_response" | jq -r '.detectedLanguage')"
    echo "Response: $(echo "$chat_response" | jq -r '.response' | head -c 100)..."
    echo "Total latency: $(echo "$chat_response" | jq -r '.performance.total')ms"
else
    echo -e "${RED}❌ Multilingual chat failed${NC}"
    echo "$chat_response"
fi

echo -e "\n${BLUE}🏁 Quick test completed!${NC}"
echo "For comprehensive testing, run: ./test-streaming-translation.sh"
