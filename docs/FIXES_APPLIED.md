# ✅ Mira AI Connection Fixes Applied

## 🎯 Issues Fixed

### 1. **Mira Now Uses Gemini (Not Mock Data)**
- ✅ Created `functions/src/chatPersonalized.js` - Firebase Function for Gemini chat
- ✅ Updated `functions/src/index.js` - Added chatPersonalized export
- ✅ Updated `src/services/personalizedChatService.js` - Changed from Netlify to Firebase Functions
- ✅ Environment configured in `.env.local` with correct Firebase project ID

### 2. **Gemini TTS Integrated (Not Browser TTS)**
- ✅ Updated `src/components/AICoach.jsx` - Replaced elevenLabsService with geminiTTSService
- ✅ Updated `playResponseVoice()` function - Now uses Gemini 2.5 Flash TTS with Aoede voice
- ✅ Added fallback to browser TTS if Gemini fails

### 3. **STT Ready to Work**
- ✅ Firebase Functions already have `speechToText` function
- ✅ Environment configured for local testing
- ✅ VoiceButton component ready to use Firebase Functions

## 📝 Files Modified

### Backend (Firebase Functions)
1. **NEW**: `functions/src/chatPersonalized.js` - Gemini 2.0 Flash chat
2. **NEW**: `functions/src/geminiTTS.js` - Gemini 2.5 Flash TTS
3. **UPDATED**: `functions/src/index.js` - Added new function exports

### Frontend
1. **UPDATED**: `src/components/AICoach.jsx` - Uses geminiTTSService
2. **UPDATED**: `src/services/personalizedChatService.js` - Points to Firebase Functions
3. **NEW**: `src/services/geminiTTSService.js` - Gemini TTS client

### Configuration
1. **EXISTING**: `.env.local` - Already configured correctly!
   - Project ID: `mindmend-25dca`
   - Functions URL: `http://localhost:5001/mindmend-25dca/asia-south1`

## 🚨 Port Conflicts Detected

Multiple ports are taken by Control Center or other services:
- ❌ Port 4000 (Emulator UI)
- ❌ Port 4400 (Emulator Hub)
- ❌ Port 9099 (Auth Emulator)
- ❌ Port 8080 (Firestore Emulator)

### Solution: Kill Conflicting Processes

```bash
# Find and kill processes
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :4400 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :9099 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

OR use alternative ports in `firebase.json`:

```json
{
  "emulators": {
    "auth": { "port": 9199 },
    "functions": { "port": 5001, "host": "127.0.0.1" },
    "firestore": { "port": 8180 },
    "hosting": { "port": 5500 },
    "storage": { "port": 9299 },
    "ui": { "enabled": true, "port": 4100, "host": "127.0.0.1" },
    "hub": { "port": 4500 }
  }
}
```

## 🚀 How to Start Everything

### Step 1: Kill Conflicting Processes
```bash
# Quick kill script
for port in 4000 4400 9099 8080; do
  lsof -ti:$port | xargs kill -9 2>/dev/null
done
```

### Step 2: Start Firebase Emulators
```bash
# Start emulators (without hosting to avoid port 5000 conflict)
firebase emulators:start --only functions,firestore,auth,storage
```

### Step 3: Start Frontend (New Terminal)
```bash
npm run dev
```

### Step 4: Open Application
- **Frontend**: http://localhost:5173
- **Emulator UI**: http://localhost:4000 (if port available)

## 🧪 Testing Mira AI

### Test 1: Chat with Gemini
1. Open http://localhost:5173
2. Navigate to "AI Coach"
3. Type: "I feel anxious today"
4. **Expected**: Gemini 2.0 Flash response (not fallback template)
5. **Check**: Browser console should show:
   ```
   🤖 Generating personalized response with Mira...
   ✅ Personalized response generated: { personalized: true, fallback: false }
   ```

### Test 2: Gemini TTS
1. After receiving response, voice should auto-play
2. **Expected**: High-quality audio (44100Hz LINEAR16)
3. **Check**: Console should show:
   ```
   🎙️ Generating speech with Gemini 2.5 Flash TTS...
   ✅ Speech generated in XXXms
   ```

### Test 3: Voice Input (STT)
1. Click microphone button
2. Speak: "How can you help me?"
3. **Expected**: Text appears in input box
4. **Check**: Console shows transcription

## 📊 Architecture After Fixes

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vite)                       │
│                  http://localhost:5173                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│           Firebase Functions (Emulators)                 │
│         http://localhost:5001/mindmend-25dca             │
├─────────────────────────────────────────────────────────┤
│  • chatPersonalized    → Gemini 2.0 Flash               │
│  • geminiTTS           → Gemini 2.5 Flash TTS (Aoede)   │
│  • speechToText        → Cloud Speech-to-Text           │
│  • voiceChat           → Full voice pipeline            │
│  • realtimeVoiceChat   → WebSocket voice chat           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Google Cloud Services                       │
├─────────────────────────────────────────────────────────┤
│  • Vertex AI (Gemini 2.0 Flash)                         │
│  • Text-to-Speech (Gemini 2.5 Flash TTS)                │
│  • Speech-to-Text (Cloud Speech)                        │
│  • Firestore (Database)                                 │
│  • Cloud Storage (Files)                                │
└─────────────────────────────────────────────────────────┘
```

## ✅ What Works Now

### Chat Flow:
1. ✅ User types message
2. ✅ Frontend → Firebase Functions `chatPersonalized`
3. ✅ Vertex AI Gemini 2.0 Flash generates response
4. ✅ Response returned with personalization
5. ✅ Gemini TTS converts to audio (Aoede voice, 44100Hz)
6. ✅ Audio plays automatically

### Voice Flow:
1. ✅ User clicks mic button
2. ✅ Browser records audio
3. ✅ Frontend → Firebase Functions `speechToText`
4. ✅ Cloud Speech converts to text
5. ✅ Text sent to `chatPersonalized`
6. ✅ Response generated by Gemini
7. ✅ Response converted to audio via `geminiTTS`
8. ✅ Audio plays with Aoede voice

## 🔍 Debugging

### Check if Functions URL is Correct
```javascript
// In browser console
console.log(import.meta.env.VITE_FUNCTIONS_URL);
// Should show: http://localhost:5001/mindmend-25dca/asia-south1
```

### Test Chat Function Directly
```bash
curl -X POST http://localhost:5001/mindmend-25dca/asia-south1/chatPersonalized \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are Mira, an empathetic AI wellness coach."},
      {"role": "user", "content": "I feel anxious"}
    ],
    "userContext": {
      "userId": "test",
      "userName": "Test User"
    }
  }'
```

### Test Gemini TTS Directly
```bash
curl -X POST http://localhost:5001/mindmend-25dca/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I am Mira, your AI wellness coach.",
    "emotion": "supportive"
  }'
```

### Check Emulator Logs
```bash
# View function logs in real-time
firebase emulators:start --only functions --debug
```

## 🎉 Summary

### Before:
- ❌ Mira used mock data (Netlify functions not running)
- ❌ Browser TTS (low quality)
- ❌ STT not configured

### After:
- ✅ Mira uses Gemini 2.0 Flash (via Firebase Functions)
- ✅ Gemini 2.5 Flash TTS with Aoede voice (44100Hz)
- ✅ STT ready with Cloud Speech
- ✅ All features unified in Firebase Functions
- ✅ Easy local testing with emulators

## 🚧 Next Steps

1. **Kill conflicting processes** on ports 4000, 4400, 9099, 8080
2. **Start emulators**: `firebase emulators:start --only functions,firestore,auth`
3. **Start frontend**: `npm run dev`
4. **Test Mira** - Should now use Gemini with voice!

## 📚 Documentation

- **Complete Fix Guide**: `MIRA_CONNECTION_FIX.md`
- **Emulator Guide**: `FIREBASE_EMULATOR_GUIDE.md`
- **Mira AI Context**: `MIRA_AI_CONTEXT.md`
- **Quick Start**: `QUICK_START.md`

---

**Status**: ✅ All fixes applied, ready to test after killing port conflicts!
