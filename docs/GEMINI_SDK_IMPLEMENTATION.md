# ✅ Gemini SDK (@google/genai) Implementation Complete

## 🎯 What Changed

### Replaced Old Libraries with Official @google/genai SDK

**BEFORE**: Using deprecated/incorrect libraries
- ❌ `@google-cloud/text-to-speech` (wrong for Gemini TTS)
- ❌ `@google-cloud/vertexai` (wrong for Gemini API)
- ❌ `@google/generative-ai` (deprecated)

**AFTER**: Using official @google/genai SDK
- ✅ `@google/genai` v0.3.0 (latest official SDK)

## 📝 Files Updated

### 1. **functions/src/geminiTTS.js** ✅
- **Model**: `gemini-2.5-flash-preview-tts`
- **Voice**: Aoede (Female)
- **Format**: PCM 16-bit @ 24000 Hz
- **API**: Official @google/genai SDK

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-preview-tts',
  contents: [{ parts: [{ text: finalText }] }],
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: 'Aoede'
        }
      }
    }
  }
});
```

### 2. **functions/src/chatPersonalized.js** ✅
- **Model**: `gemini-2.0-flash-exp`
- **API**: Official @google/genai SDK

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY
});

const result = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents,
  config: {
    temperature: 0.9,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 300
  }
});
```

### 3. **functions/package.json** ✅
- Added: `@google/genai: ^0.3.0`
- Kept existing Cloud libraries for other services

### 4. **src/services/geminiTTSService.js** ✅
- Updated to handle PCM audio format (24000 Hz)
- Added WAV header creation for browser playback
- Converts base64 PCM to WAV blob

## 🔧 Key Technical Changes

### Audio Format Change
**BEFORE**: LINEAR16 @ 44100 Hz
**AFTER**: PCM 16-bit @ 24000 Hz (Gemini TTS standard)

### Client-Side Processing
Added WAV header creation in `geminiTTSService.js`:
```javascript
base64ToWavBlob(base64, sampleRate = 24000) {
  // Decode base64 to PCM
  // Create WAV header
  // Combine header + PCM data
  // Return WAV blob for browser playback
}
```

## 🚀 Installation Steps

### Step 1: Install Dependencies
```bash
cd functions
npm install
```

This will install:
- `@google/genai@^0.3.0` (new)
- All existing dependencies

### Step 2: Set Environment Variable
Make sure `.env` or Firebase config has:
```bash
GEMINI_API_KEY=your_api_key_here
```

### Step 3: Restart Emulators
```bash
# Stop current emulators (Ctrl+C)
firebase emulators:start
```

### Step 4: Verify Functions Registered
Check emulator output for:
```
✔ functions[asia-south1-geminiTTS]: http function initialized
✔ functions[asia-south1-geminiTTSStream]: http function initialized
✔ functions[asia-south1-chatPersonalized]: http function initialized
```

### Step 5: Test Endpoints
```bash
# Test TTS
curl -X POST http://127.0.0.1:5001/mindmend-25dca/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, I am Mira!","emotion":"supportive"}'

# Test Chat
curl -X POST http://127.0.0.1:5001/mindmend-25dca/asia-south1/chatPersonalized \
  -H "Content-Type: application/json" \
  -d '{
    "messages":[
      {"role":"system","content":"You are Mira"},
      {"role":"user","content":"I feel anxious"}
    ],
    "userContext":{"userId":"test","userName":"Test"}
  }'
```

## 📊 Expected Response Format

### TTS Response:
```json
{
  "audioBase64": "base64_encoded_pcm_data",
  "contentType": "audio/pcm",
  "sampleRate": 24000,
  "encoding": "PCM_16",
  "bitDepth": 16,
  "channels": 1,
  "duration": 234,
  "model": "gemini-2.5-flash-preview-tts",
  "voice": "Aoede",
  "timestamp": "2025-10-30T11:00:00.000Z"
}
```

### Chat Response:
```json
{
  "response": "I understand you're feeling anxious...",
  "timestamp": "2025-10-30T11:00:00.000Z",
  "model": "gemini-2.0-flash-exp",
  "personalized": true
}
```

## 🎵 Available Voices

Gemini 2.5 Flash TTS supports:
- **Aoede** (Female) - Empathetic, warm
- **Kore** (Female) - Professional
- **Puck** (Male) - Friendly
- **Charon** (Male) - Deep, authoritative
- **Fenrir** (Male) - Energetic
- **Kore** (Female) - Calm, soothing

Currently using: **Aoede** for Mira

## ✅ Verification Checklist

After installation:
- [ ] `npm install` completed without errors
- [ ] Emulators show `geminiTTS` function
- [ ] Emulators show `chatPersonalized` function
- [ ] Test curl commands return valid JSON
- [ ] Frontend connects to emulator
- [ ] Mira responds with Gemini (not fallback)
- [ ] Voice plays with high quality audio
- [ ] Console shows "Gemini 2.5 Flash TTS • Aoede"

## 🐛 Troubleshooting

### Issue: Functions not registered
**Solution**: 
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
firebase emulators:start
```

### Issue: "GEMINI_API_KEY not found"
**Solution**: Add to `.env` or Firebase config:
```bash
firebase functions:config:set gemini.api_key="YOUR_KEY"
```

### Issue: Audio not playing
**Check**:
1. Browser console for errors
2. Network tab shows POST to `/geminiTTS`
3. Response has `audioBase64` field
4. WAV conversion working (check `geminiTTSService.js`)

### Issue: Still using fallback responses
**Check**:
1. `VITE_FUNCTIONS_URL` in `.env.local`
2. Frontend pointing to `http://localhost:5001/mindmend-25dca/asia-south1`
3. Emulator logs show function invocations
4. No CORS errors in console

## 📚 Documentation References

- **@google/genai SDK**: https://github.com/googleapis/js-genai
- **Gemini TTS Docs**: https://ai.google.dev/gemini-api/docs/speech-generation
- **Available Voices**: Listed in Gemini TTS documentation

## 🎉 Summary

✅ **Official SDK**: Using `@google/genai` (not deprecated libraries)
✅ **Correct Models**: `gemini-2.5-flash-preview-tts` and `gemini-2.0-flash-exp`
✅ **Proper Format**: PCM 16-bit @ 24kHz with WAV conversion
✅ **Voice**: Aoede (Female, empathetic)
✅ **Ready to Test**: Install deps and restart emulators

**Next**: Run `npm install` in functions folder and restart emulators!
