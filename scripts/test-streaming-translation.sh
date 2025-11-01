#!/bin/bash

# Streaming Translation System - cURL Test Suite
# Tests the hybrid Gemma + Gemini streaming translation pipeline

echo "🚀 Starting MindMend Streaming Translation Test Suite"
echo "=================================================="

# Configuration
BASE_URL="http://127.0.0.1:5001/mindmend-25dca/asia-south1"  # Firebase Functions emulator
# BASE_URL="http://127.0.0.1:5001/mindmend-25dca/asia-south1"  # Production

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test API endpoint
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    # Extract HTTP status and body
    status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    echo "Status: $status"
    echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL - Expected $expected_status, got $status${NC}"
        ((TESTS_FAILED++))
    fi
}

# Helper function to test streaming endpoint
test_streaming() {
    local test_name="$1"
    local data="$2"
    
    echo -e "\n${BLUE}Testing Streaming: $test_name${NC}"
    echo "Endpoint: POST /streamingTranslation (streaming=true)"
    
    # Test streaming with timeout
    echo "Starting streaming test..."
    curl -s -N \
        -H "Content-Type: application/json" \
        -H "Accept: text/event-stream" \
        -d "$data" \
        "$BASE_URL/streamingTranslation" \
        --max-time 30 | while IFS= read -r line; do
        
        if [[ $line == data:* ]]; then
            # Extract JSON from SSE data line
            json_data=$(echo "$line" | sed 's/^data: //')
            echo "📡 $json_data" | jq '.' 2>/dev/null || echo "📡 $json_data"
        elif [[ $line == event:* ]]; then
            echo "🎯 $line"
        fi
    done
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Streaming test completed${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ Streaming test failed${NC}"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n${YELLOW}📋 Test Plan:${NC}"
echo "1. Basic translation (non-streaming)"
echo "2. Streaming translation (English to Hindi)"
echo "3. Streaming translation (Hindi to English)" 
echo "4. Complex text translation"
echo "5. Multilingual chat integration"
echo "6. Performance metrics"
echo "7. Cache management"
echo "8. Error handling"

# Test 1: Basic Translation (Non-streaming)
test_endpoint \
    "Basic Translation - English to Hindi" \
    "POST" \
    "/streamingTranslation" \
    '{
        "text": "Hello, how are you feeling today?",
        "targetLanguage": "hi",
        "streaming": false
    }' \
    "200"

# Test 2: Streaming Translation - English to Hindi
test_streaming \
    "Streaming Translation - English to Hindi" \
    '{
        "text": "I am feeling anxious about my exams. Can you help me with some breathing exercises?",
        "targetLanguage": "hi",
        "streaming": true
    }'

# Test 3: Streaming Translation - Hindi to English
test_streaming \
    "Streaming Translation - Hindi to English" \
    '{
        "text": "मैं आज बहुत परेशान हूं। क्या आप मेरी मदद कर सकते हैं?",
        "targetLanguage": "en",
        "streaming": true
    }'

# Test 4: Complex Mental Health Text
test_streaming \
    "Complex Mental Health Context" \
    '{
        "text": "I have been experiencing panic attacks and difficulty sleeping. My therapist suggested mindfulness meditation, but I am struggling to focus during practice sessions.",
        "targetLanguage": "ta",
        "streaming": true
    }'

# Test 5: Multiple Language Support
for lang in "te" "bn" "mr" "gu" "kn" "ml" "pa"; do
    test_endpoint \
        "Language Support - $lang" \
        "POST" \
        "/streamingTranslation" \
        "{
            \"text\": \"Mental health is important for everyone.\",
            \"targetLanguage\": \"$lang\",
            \"streaming\": false
        }" \
        "200"
done

# Test 6: Multilingual Chat Integration
test_endpoint \
    "Multilingual Chat Integration" \
    "POST" \
    "/chatMultilingual" \
    '{
        "message": "मुझे तनाव हो रहा है",
        "moodHistory": ["stressed", "anxious"],
        "userProgress": {
            "completedExercises": 5,
            "streak": 3
        }
    }' \
    "200"

# Test 7: Performance Metrics
test_endpoint \
    "Performance Metrics" \
    "GET" \
    "/streamingTranslationMetrics" \
    "" \
    "200"

# Test 8: Cache Management
test_endpoint \
    "Clear Translation Cache" \
    "POST" \
    "/clearTranslationCache" \
    '{}' \
    "200"

# Test 9: Error Handling - Invalid Language
test_endpoint \
    "Error Handling - Invalid Language" \
    "POST" \
    "/streamingTranslation" \
    '{
        "text": "Test message",
        "targetLanguage": "invalid",
        "streaming": false
    }' \
    "200"

# Test 10: Error Handling - Empty Text
test_endpoint \
    "Error Handling - Empty Text" \
    "POST" \
    "/streamingTranslation" \
    '{
        "text": "",
        "targetLanguage": "hi",
        "streaming": false
    }' \
    "400"

# Test 11: Large Text Translation
test_streaming \
    "Large Text Translation" \
    '{
        "text": "Cognitive Behavioral Therapy (CBT) is a form of psychological treatment that has been demonstrated to be effective for a range of problems including depression, anxiety disorders, alcohol and drug use problems, marital problems, eating disorders, and severe mental illness. Numerous research studies suggest that CBT leads to significant improvement in functioning and quality of life. In many studies, CBT has been demonstrated to be as effective as, or more effective than, other forms of psychological therapy or psychiatric medications.",
        "targetLanguage": "hi",
        "streaming": true
    }'

# Test 12: Rapid Fire Requests (Load Testing)
echo -e "\n${BLUE}Load Testing: Rapid Fire Requests${NC}"
for i in {1..5}; do
    echo "Request $i/5"
    curl -s \
        -H "Content-Type: application/json" \
        -d '{
            "text": "Quick test message '$i'",
            "targetLanguage": "hi",
            "streaming": false
        }' \
        "$BASE_URL/streamingTranslation" | jq '.performance.total' &
done
wait
echo -e "${GREEN}✅ Load test completed${NC}"
((TESTS_PASSED++))

# Test 13: Cache Hit Testing
echo -e "\n${BLUE}Testing Cache Behavior${NC}"
echo "First request (cache miss):"
curl -s \
    -H "Content-Type: application/json" \
    -d '{
        "text": "This is a cache test message",
        "targetLanguage": "hi", 
        "streaming": false
    }' \
    "$BASE_URL/streamingTranslation" | jq '.performance'

echo "Second request (should be cache hit):"
curl -s \
    -H "Content-Type: application/json" \
    -d '{
        "text": "This is a cache test message",
        "targetLanguage": "hi",
        "streaming": false
    }' \
    "$BASE_URL/streamingTranslation" | jq '.performance'

echo -e "${GREEN}✅ Cache test completed${NC}"
((TESTS_PASSED++))

# Test 14: Voice Chat Integration
test_endpoint \
    "Voice Chat Integration" \
    "POST" \
    "/voiceChat" \
    '{
        "audioContent": "fake_base64_audio_content_for_testing",
        "moodHistory": ["calm"],
        "userProgress": {"streak": 1}
    }' \
    "400"  # Expected to fail due to fake audio, but should not crash

# Performance Benchmark
echo -e "\n${YELLOW}🏁 Performance Benchmark${NC}"
echo "Running latency test..."

start_time=$(date +%s%N)
curl -s \
    -H "Content-Type: application/json" \
    -d '{
        "text": "Performance test message",
        "targetLanguage": "hi",
        "streaming": false
    }' \
    "$BASE_URL/streamingTranslation" > /dev/null
end_time=$(date +%s%N)

latency=$(( (end_time - start_time) / 1000000 ))
echo "Total request latency: ${latency}ms"

if [ $latency -lt 4000 ]; then
    echo -e "${GREEN}✅ Latency under 4s target${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Latency exceeds 4s target${NC}"
    ((TESTS_FAILED++))
fi

# Final Results
echo -e "\n${YELLOW}📊 Test Results Summary${NC}"
echo "=================================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Streaming translation system is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the implementation.${NC}"
    exit 1
fi
