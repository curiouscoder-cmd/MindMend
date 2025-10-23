#!/bin/bash

echo "🧪 Testing MindMend Firebase Functions Locally"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FUNCTIONS_URL="http://localhost:5001/mindmend-ai/us-central1"

echo "📝 Note: Make sure Firebase emulators are running!"
echo "   Run: firebase emulators:start"
echo ""
sleep 2

# Test 1: Chat Function (Basic)
echo "${YELLOW}Test 1: Basic Chat Function${NC}"
curl -X POST "${FUNCTIONS_URL}/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am feeling anxious",
    "moodHistory": ["anxious", "stressed"],
    "userProgress": {"completedExercises": 5, "streak": 3}
  }' \
  2>/dev/null | jq '.' || echo "${RED}❌ Failed${NC}"
echo ""

# Test 2: Mood Analysis
echo "${YELLOW}Test 2: Mood Analysis (Cloud NLP)${NC}"
curl -X POST "${FUNCTIONS_URL}/analyzeMood" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling very happy today!",
    "language": "en"
  }' \
  2>/dev/null | jq '.' || echo "${RED}❌ Failed${NC}"
echo ""

# Test 3: Multilingual Chat
echo "${YELLOW}Test 3: Multilingual Chat (Gemma 3 + Gemini 2.5)${NC}"
curl -X POST "${FUNCTIONS_URL}/chatMultilingual" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "मुझे चिंता हो रही है",
    "moodHistory": [],
    "userProgress": {}
  }' \
  2>/dev/null | jq '.' || echo "${RED}❌ Failed${NC}"
echo ""

# Test 4: FCM Token Registration
echo "${YELLOW}Test 4: FCM Token Registration${NC}"
curl -X POST "${FUNCTIONS_URL}/registerToken" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "token": "test-fcm-token-abc"
  }' \
  2>/dev/null | jq '.' || echo "${RED}❌ Failed${NC}"
echo ""

echo "${GREEN}✅ Tests Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check Firebase Emulator UI: http://localhost:4000"
echo "2. Check Firestore data"
echo "3. Check Functions logs"
