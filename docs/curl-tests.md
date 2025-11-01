# Manual cURL Tests for Streaming Translation

## Setup
```bash
# For local Firebase Functions emulator
export BASE_URL="http://127.0.0.1:5001/mindmend-25dca/asia-south1"

# For production
export BASE_URL="https://asia-south1-mindmend-25dca.cloudfunctions.net"
```

## 1. Basic Translation (Non-streaming)

### English to Hindi
```bash
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you feeling today?",
    "targetLanguage": "hi",
    "streaming": false
  }' | jq '.'
```

### Hindi to English
```bash
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "मैं आज बहुत खुश हूं",
    "targetLanguage": "en", 
    "streaming": false
  }' | jq '.'
```

## 2. Streaming Translation (Server-Sent Events)

### English to Hindi (Streaming)
```bash
curl -N -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling anxious about my exams. Can you help me with breathing exercises?",
    "targetLanguage": "hi",
    "streaming": true
  }' \
  "$BASE_URL/streamingTranslation"
```

### Mental Health Context (English to Tamil)
```bash
curl -N -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I have been experiencing panic attacks and difficulty sleeping. My therapist suggested mindfulness meditation.",
    "targetLanguage": "ta",
    "streaming": true
  }' \
  "$BASE_URL/streamingTranslation"
```

## 3. All Supported Languages

### Test each language
```bash
# Telugu
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mental health is important", "targetLanguage": "te", "streaming": false}' | jq '.translatedText'

# Bengali  
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mental health is important", "targetLanguage": "bn", "streaming": false}' | jq '.translatedText'

# Marathi
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mental health is important", "targetLanguage": "mr", "streaming": false}' | jq '.translatedText'

# Gujarati
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mental health is important", "targetLanguage": "gu", "streaming": false}' | jq '.translatedText'

# Kannada
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mental health is important", "targetLanguage": "kn", "streaming": false}' | jq '.translatedText'

# Malayalam
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mental health is important", "targetLanguage": "ml", "streaming": false}' | jq '.translatedText'

# Punjabi
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{"text": "Mental health is important", "targetLanguage": "pa", "streaming": false}' | jq '.translatedText'
```

## 4. Multilingual Chat Integration

### Chat with Hindi input
```bash
curl -X POST "$BASE_URL/chatMultilingual" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "मुझे तनाव हो रहा है और मैं चिंतित हूं",
    "moodHistory": ["stressed", "anxious"],
    "userProgress": {
      "completedExercises": 5,
      "streak": 3
    }
  }' | jq '.'
```

### Chat with Tamil input
```bash
curl -X POST "$BASE_URL/chatMultilingual" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "எனக்கு மன அழுத்தம் இருக்கிறது",
    "moodHistory": ["sad", "overwhelmed"],
    "userProgress": {
      "completedExercises": 2,
      "streak": 1
    }
  }' | jq '.'
```

## 5. Performance Metrics

### Get current metrics
```bash
curl -X GET "$BASE_URL/streamingTranslationMetrics" | jq '.'
```

### Clear cache
```bash
curl -X POST "$BASE_URL/clearTranslationCache" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
```

## 6. Error Handling Tests

### Invalid language code
```bash
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test message",
    "targetLanguage": "invalid",
    "streaming": false
  }' | jq '.'
```

### Empty text
```bash
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "",
    "targetLanguage": "hi",
    "streaming": false
  }' | jq '.'
```

### Missing parameters
```bash
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
```

## 7. Performance Testing

### Measure latency
```bash
time curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Performance test message",
    "targetLanguage": "hi",
    "streaming": false
  }' | jq '.performance'
```

### Cache hit test (run twice)
```bash
# First request (cache miss)
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Cache test message",
    "targetLanguage": "hi",
    "streaming": false
  }' | jq '.performance'

# Second request (should be cache hit)
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Cache test message", 
    "targetLanguage": "hi",
    "streaming": false
  }' | jq '.performance'
```

## 8. Large Text Translation

### Long mental health content
```bash
curl -N -H "Accept: text/event-stream" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Cognitive Behavioral Therapy (CBT) is a form of psychological treatment that has been demonstrated to be effective for a range of problems including depression, anxiety disorders, alcohol and drug use problems, marital problems, eating disorders, and severe mental illness. Numerous research studies suggest that CBT leads to significant improvement in functioning and quality of life. In many studies, CBT has been demonstrated to be as effective as, or more effective than, other forms of psychological therapy or psychiatric medications. The focus of CBT is on helping people learn to be their own therapists. Through exercises in the session as well as homework exercises outside of sessions, patients/clients are helped to develop coping skills whereby they can learn to change their own thinking, problematic emotions, and behavior.",
    "targetLanguage": "hi",
    "streaming": true
  }' \
  "$BASE_URL/streamingTranslation"
```

## 9. Quick Test Script

Save this as `quick-test.sh`:
```bash
#!/bin/bash
BASE_URL="http://localhost:5001/mindmend-25dca/us-central1"

echo "🧪 Quick Translation Test"
curl -X POST "$BASE_URL/streamingTranslation" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I need help with anxiety",
    "targetLanguage": "hi",
    "streaming": false
  }' | jq '{translatedText, detectedLanguage, confidence, performance}'

echo -e "\n📊 Current Metrics"
curl -X GET "$BASE_URL/streamingTranslationMetrics" | jq '.metrics'
```

## Expected Response Format

### Successful Translation
```json
{
  "success": true,
  "originalText": "Hello, how are you feeling today?",
  "translatedText": "नमस्ते, आज आप कैसा महसूस कर रहे हैं?",
  "detectedLanguage": "en",
  "targetLanguage": "hi",
  "confidence": 0.95,
  "model": "gemma-4b",
  "performance": {
    "languageDetection": 45,
    "translation": 180,
    "total": 225
  }
}
```

### Streaming Events
```
data: {"type": "status", "stage": "detecting_language"}
data: {"type": "language_detected", "language": "en", "confidence": 0.95}
data: {"type": "status", "stage": "translating"}
data: {"type": "chunk", "data": "नमस्ते, आज आप"}
data: {"type": "chunk", "data": "कैसा महसूस कर रहे हैं?"}
data: {"type": "completed", "result": {...}}
```
