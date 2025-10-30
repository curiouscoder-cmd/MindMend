#!/bin/bash

# Test Gemini 2.5 Flash TTS
# This script tests the new TTS endpoint

echo "🎙️ Testing Gemini 2.5 Flash TTS..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if emulators are running
if ! curl -s http://localhost:5001 > /dev/null; then
    echo -e "${RED}❌ Firebase emulators not running!${NC}"
    echo "Start emulators with: ./scripts/start-emulators.sh"
    exit 1
fi

echo -e "${GREEN}✅ Emulators are running${NC}"
echo ""

# Test 1: Basic TTS
echo -e "${BLUE}Test 1: Basic TTS${NC}"
RESPONSE=$(curl -s -X POST \
  http://localhost:5001/mindmend-ai/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I am Mira, your AI wellness coach. How are you feeling today?",
    "emotion": "supportive"
  }')

if echo "$RESPONSE" | grep -q "audioBase64"; then
    echo -e "${GREEN}✅ Basic TTS test passed${NC}"
    echo "Model: $(echo $RESPONSE | jq -r '.model')"
    echo "Voice: $(echo $RESPONSE | jq -r '.voice')"
    echo "Duration: $(echo $RESPONSE | jq -r '.duration')ms"
else
    echo -e "${RED}❌ Basic TTS test failed${NC}"
    echo "$RESPONSE"
fi

echo ""

# Test 2: Different Emotions
echo -e "${BLUE}Test 2: Different Emotions${NC}"
EMOTIONS=("supportive" "encouraging" "calming" "energetic" "curious" "compassionate")

for emotion in "${EMOTIONS[@]}"; do
    echo -n "Testing emotion: $emotion... "
    RESPONSE=$(curl -s -X POST \
      http://localhost:5001/mindmend-ai/asia-south1/geminiTTS \
      -H "Content-Type: application/json" \
      -d "{
        \"text\": \"This is a test with $emotion emotion.\",
        \"emotion\": \"$emotion\"
      }")
    
    if echo "$RESPONSE" | grep -q "audioBase64"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
done

echo ""

# Test 3: Long Text
echo -e "${BLUE}Test 3: Long Text${NC}"
LONG_TEXT="I understand that you're going through a difficult time. It's completely normal to feel overwhelmed sometimes. Remember, you're not alone in this journey. Taking small steps each day can make a big difference. Would you like to try a breathing exercise together?"

RESPONSE=$(curl -s -X POST \
  http://localhost:5001/mindmend-ai/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$LONG_TEXT\",
    \"emotion\": \"compassionate\"
  }")

if echo "$RESPONSE" | grep -q "audioBase64"; then
    echo -e "${GREEN}✅ Long text test passed${NC}"
    echo "Duration: $(echo $RESPONSE | jq -r '.duration')ms"
else
    echo -e "${RED}❌ Long text test failed${NC}"
fi

echo ""

# Test 4: Speaking Rate
echo -e "${BLUE}Test 4: Speaking Rate${NC}"
RATES=("0.8" "1.0" "1.2")

for rate in "${RATES[@]}"; do
    echo -n "Testing rate: $rate... "
    RESPONSE=$(curl -s -X POST \
      http://localhost:5001/mindmend-ai/asia-south1/geminiTTS \
      -H "Content-Type: application/json" \
      -d "{
        \"text\": \"Testing speaking rate at $rate speed.\",
        \"emotion\": \"supportive\",
        \"speakingRate\": $rate
      }")
    
    if echo "$RESPONSE" | grep -q "audioBase64"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
done

echo ""

# Test 5: Error Handling
echo -e "${BLUE}Test 5: Error Handling${NC}"
echo -n "Testing empty text... "
RESPONSE=$(curl -s -X POST \
  http://localhost:5001/mindmend-ai/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d '{"text": ""}')

if echo "$RESPONSE" | grep -q "error"; then
    echo -e "${GREEN}✅ Error handling works${NC}"
else
    echo -e "${RED}❌ Error handling failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Open Emulator UI: http://localhost:4000/functions"
echo "2. Check function logs for detailed output"
echo "3. Test in the frontend: npm run dev"
