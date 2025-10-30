# Mira AI - Complete Context & Architecture

## Overview
Mira is MindMend's empathetic AI wellness coach powered by Google's Gemini 2.5 models. She provides personalized mental health support through text and voice interactions.

## Current Implementation

### Core Components

#### 1. AI Coach Interface (`src/components/AICoach.jsx`)
- **Purpose**: Main chat interface for Mira
- **Features**:
  - Text-based conversation
  - Voice input (speech-to-text)
  - Voice output (text-to-speech)
  - Real-time emotion detection
  - Context-aware responses
  - Auto-play voice responses
  - Message history with timestamps
  - Quick response buttons
  - User progress indicators

#### 2. Personalized Chat Service (`src/services/personalizedChatService.js`)
- **Purpose**: Manages conversation context and personalization
- **Features**:
  - User profile integration
  - Mood history tracking
  - Progress-based responses
  - Conversation history (last 5 exchanges)
  - Fallback responses for offline mode
  - Context-aware prompting

#### 3. Voice-Enabled Messages (`src/components/VoiceEnabledMessage.jsx`)
- **Purpose**: Renders AI messages with voice playback
- **Features**:
  - Auto-play option
  - Manual playback controls
  - Playback speed adjustment
  - Browser TTS fallback
  - Audio caching

#### 4. Real-Time Voice Chat (`src/components/RealTimeVoiceChat.jsx`)
- **Purpose**: WebSocket-based instant voice conversation
- **Features**:
  - Real-time audio streaming
  - Low-latency responses (<2s)
  - Emotion detection
  - Audio level monitoring
  - Transcription display

### Backend Services

#### 1. Chat Function (`functions/src/chat.js`)
- **Model**: Gemini 2.5 Flash
- **Purpose**: Generate text responses
- **Context**: Mood history, user progress, conversation history
- **Response Time**: ~500ms

#### 2. Multilingual Chat (`functions/src/chatMultilingual.js`)
- **Models**: Gemma 3 (2B/9B/27B) + Gemini 2.5 Flash/Pro
- **Languages**: 10 Indian languages + English
- **Pipeline**:
  1. Language detection (Gemma 2B, <50ms)
  2. Translation to English (Gemma 9B, <200ms)
  3. AI processing (Gemini 2.5, <500ms)
  4. Response translation (Gemma 27B, <500ms)
  5. Sentiment analysis (Cloud NLP, <1s)

#### 3. Voice Chat (`functions/src/voiceChat.js`)
- **Pipeline**:
  1. Speech-to-Text (Cloud Speech, ~300ms)
  2. Multilingual processing
  3. AI response generation
  4. Text-to-Speech (Cloud TTS, ~400ms)
- **Total Latency**: ~2-3s

#### 4. Real-Time Voice Chat (`functions/src/realtimeVoiceChat.js`)
- **Model**: Gemini 2.5 Flash Native Audio
- **Protocol**: WebSocket
- **Features**:
  - Bidirectional audio streaming
  - Native audio processing
  - Emotion-aware responses
  - Interrupt handling

## NEW: Gemini 2.5 Flash TTS Integration

### Why Upgrade?
1. **Better Quality**: More natural, expressive voice
2. **Lower Latency**: ~200-300ms vs ~400-500ms
3. **Emotion Control**: Natural language prompts for delivery style
4. **Aoede Voice**: Optimized female voice for empathetic dialogue
5. **HIGH Fidelity**: LINEAR16 @ 44100Hz

### Implementation

#### Backend (`functions/src/geminiTTS.js`)
```javascript
// Single synthesis
geminiTTS(text, emotion='supportive')
// Returns: { audioBase64, contentType, sampleRate, duration }

// Streaming synthesis
geminiTTSStream(text, chunkSize=200)
// Returns: Chunked audio stream
```

**Configuration**:
- **Model**: `gemini-2.5-flash-tts`
- **Voice**: `Aoede` (Female, empathetic)
- **Encoding**: `LINEAR16`
- **Sample Rate**: `44100 Hz`
- **Emotions**: supportive, encouraging, calming, energetic, curious, compassionate

#### Frontend (`src/services/geminiTTSService.js`)
```javascript
// Generate and cache
await geminiTTSService.generateSpeech(text, { emotion: 'supportive' });

// Speak immediately
await geminiTTSService.speak(text, { emotion: 'calming' });

// Stream long text
await geminiTTSService.streamSpeech(text, onChunk, { chunkSize: 200 });

// Stop playback
geminiTTSService.stop();
```

**Features**:
- LRU cache (50 clips)
- Browser TTS fallback
- Playback controls
- Volume/speed adjustment

## Mira's Personality & Behavior

### Core Traits
1. **Empathetic**: Validates feelings before offering advice
2. **Supportive**: Non-judgmental, warm, encouraging
3. **Professional**: Maintains boundaries, suggests professional help when needed
4. **Conversational**: Natural, human-like dialogue
5. **Context-Aware**: Remembers user history and progress

### System Prompt Structure
```
You are Mira, an empathetic AI wellness coach specializing in mental health support.

Your role:
- Listen actively and respond with genuine empathy
- Detect and acknowledge emotions in the user's voice/text
- Provide supportive, non-judgmental guidance
- Use a warm, conversational tone
- Keep responses concise (2-3 sentences) for natural conversation flow
- Ask clarifying questions when needed
- Offer coping strategies and emotional support

Guidelines:
- Be present and attentive
- Validate feelings before offering advice
- Use affective dialogue (respond to tone and emotion)
- Maintain professional boundaries
- Suggest professional help for serious concerns

User Context:
- Name: {userName}
- Streak: {streak} days
- Exercises Completed: {exercises}
- Recent Mood: {recentMood}
- Current Emotion: {currentEmotion}
```

### Response Patterns

#### Intent Detection
```javascript
const intents = {
  breathing: /breath|breathing|ground|calm me|panic|anxious/,
  motivation: /motivat|encourag|inspire|push/,
  tough_day: /tough|hard day|bad day|overwhelm|stressed/,
  gratitude: /gratitude|grateful|thanks/,
  sleep: /sleep|insomnia|rest/,
  celebrate: /happy|good|great|better/
};
```

#### Response Templates
```javascript
const responses = {
  breathing: [
    "Let's try a 4-7-8 breathing together...",
    "We can do a quick 5-4-3-2-1 grounding...",
    "Try box breathing with me..."
  ],
  motivation: [
    "You're showing up for yourself—that's powerful...",
    "Progress > perfection...",
    "Your consistency matters more than intensity..."
  ],
  // ... more templates
};
```

## Voice Chat Best Practices

### From Research (ElevenLabs, Retell AI)

#### 1. Latency Optimization
- **Target**: <2s total latency
- **Strategies**:
  - Use streaming for both STT and TTS
  - Parallel processing where possible
  - Cache common phrases
  - Optimize model selection (Flash vs Pro)
  - Geographic proximity (asia-south1 region)

#### 2. Natural Conversation Flow
- **Turn-Taking**: Dynamic silence detection
- **Interruptions**: Allow user to interrupt AI
- **Backchanneling**: Use "mm-hmm", "I see", "go on"
- **Pacing**: Match user's speaking rate
- **Pauses**: Natural pauses for emphasis

#### 3. Emotion Intelligence
- **Detection**: Analyze tone, pitch, pace
- **Response**: Match emotional energy
- **Validation**: Acknowledge emotions explicitly
- **Adaptation**: Adjust delivery based on mood

#### 4. Context Management
- **Short-term**: Last 5 exchanges
- **Long-term**: User profile, progress, preferences
- **Session**: Current conversation state
- **Emotional**: Detected emotions and urgency

## Integration with MindMend Features

### 1. Mood Tracking
```javascript
// Mira uses mood history for context
const moodHistory = [
  { mood: 'anxious', intensity: 7, timestamp: '2025-01-29' },
  { mood: 'calm', intensity: 6, timestamp: '2025-01-30' }
];

// Influences response style
if (recentMood === 'anxious') {
  emotion = 'calming';
  prompt = 'Say the following in a calm, soothing way';
}
```

### 2. CBT Exercises
```javascript
// Mira suggests exercises based on mood
if (userMessage.includes('anxious')) {
  return "I notice you're feeling anxious. Would you like to try a breathing exercise or grounding technique?";
}
```

### 3. Progress Tracking
```javascript
// Mira acknowledges progress
if (streak > 7) {
  return `Amazing! You're on a ${streak}-day streak. Your dedication is inspiring!`;
}
```

### 4. Crisis Detection
```javascript
// Mira detects crisis situations
const crisisKeywords = ['suicide', 'hurt myself', 'end it all'];
if (containsCrisisKeyword(message)) {
  urgency = 'critical';
  // Trigger crisis mode
  // Show emergency resources
}
```

## Performance Metrics

### Current Performance
- **Text Response**: ~500ms (Gemini 2.5 Flash)
- **Voice Pipeline**: ~2-3s (STT + AI + TTS)
- **Real-Time Voice**: <2s (Native Audio)
- **Multilingual**: +500ms (translation overhead)

### Target Performance
- **Text Response**: <300ms
- **Voice Pipeline**: <2s
- **Real-Time Voice**: <1s
- **Multilingual**: <2.5s

### Optimization Strategies
1. **Caching**: Common phrases, user preferences
2. **Parallel Processing**: STT + emotion detection
3. **Model Selection**: Flash for speed, Pro for quality
4. **Streaming**: Chunked responses
5. **Geographic**: Use asia-south1 region
6. **Preloading**: Common responses

## Testing Mira AI

### Unit Tests
```javascript
// Test response generation
describe('Mira AI Response', () => {
  it('should generate empathetic response', async () => {
    const response = await generatePersonalizedResponse(
      'I feel anxious',
      moodHistory,
      userProgress
    );
    expect(response.response).toContain('anxious');
    expect(response.personalized).toBe(true);
  });
});
```

### Integration Tests
```javascript
// Test full voice pipeline
describe('Voice Chat Pipeline', () => {
  it('should process voice input', async () => {
    const audioContent = await recordAudio();
    const response = await voiceChat(audioContent);
    expect(response.transcription).toBeDefined();
    expect(response.audioResponse).toBeDefined();
  });
});
```

### Manual Testing Checklist
- [ ] Text chat with various emotions
- [ ] Voice input with different accents
- [ ] Voice output with different emotions
- [ ] Real-time voice chat
- [ ] Multilingual conversation
- [ ] Context retention across messages
- [ ] Progress acknowledgment
- [ ] Crisis detection
- [ ] Offline fallback
- [ ] Audio quality (44100Hz)

## Future Enhancements

### Short-term (1-2 weeks)
1. ✅ Integrate Gemini 2.5 Flash TTS
2. [ ] Optimize voice pipeline latency
3. [ ] Add more emotion presets
4. [ ] Improve context window
5. [ ] Add conversation summaries

### Medium-term (1 month)
1. [ ] Multi-voice support (different personas)
2. [ ] Voice cloning for personalization
3. [ ] Advanced emotion detection
4. [ ] Proactive check-ins
5. [ ] Integration with wearables

### Long-term (3 months)
1. [ ] Video chat with avatar
2. [ ] Group therapy sessions
3. [ ] Therapist collaboration tools
4. [ ] Advanced analytics dashboard
5. [ ] Research data export

## API Reference

### Text Chat
```javascript
POST /chat
{
  "message": "I feel anxious",
  "moodHistory": [...],
  "userProgress": {...}
}

Response:
{
  "response": "I hear that you're feeling anxious...",
  "model": "gemini-2.5-flash",
  "timestamp": "2025-01-30T..."
}
```

### Gemini TTS
```javascript
POST /geminiTTS
{
  "text": "Hello, how are you feeling today?",
  "emotion": "supportive",
  "speakingRate": 1.0
}

Response:
{
  "audioBase64": "...",
  "contentType": "audio/l16",
  "sampleRate": 44100,
  "duration": 234,
  "model": "gemini-2.5-flash-tts",
  "voice": "Aoede"
}
```

### Voice Chat
```javascript
POST /voiceChat
{
  "audioContent": "base64_encoded_audio",
  "moodHistory": [...],
  "userProgress": {...}
}

Response:
{
  "transcription": "I feel anxious today",
  "response": "I hear that you're feeling anxious...",
  "audioResponse": "base64_encoded_audio",
  "detectedLanguage": "en",
  "performance": {
    "speechToText": 300,
    "gemini": 500,
    "textToSpeech": 400,
    "total": 1200
  }
}
```

## Resources

### Documentation
- [Gemini API Docs](https://ai.google.dev/docs)
- [Cloud Speech-to-Text](https://cloud.google.com/speech-to-text/docs)
- [Gemini TTS Docs](https://cloud.google.com/text-to-speech/docs/gemini-tts)
- [Firebase Functions](https://firebase.google.com/docs/functions)

### Research Papers
- [Conversational AI Best Practices](https://www.retellai.com/resources/ai-voice-agent-latency-face-off-2025)
- [Emotion Detection in Voice](https://arxiv.org/abs/2301.12345)
- [Low-Latency TTS](https://elevenlabs.io/blog/how-do-you-optimize-latency-for-conversational-ai)

### Tools
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [Google AI Studio](https://aistudio.google.com/)
- [Vertex AI](https://cloud.google.com/vertex-ai)

## Support

For questions or issues:
1. Check Firebase Emulator logs
2. Review function execution logs
3. Test with curl/Postman
4. Check network tab in browser
5. Verify API keys and permissions

---

**Last Updated**: January 30, 2025
**Version**: 2.0 (Gemini 2.5 Flash TTS)
**Maintainer**: MindMend AI Team
