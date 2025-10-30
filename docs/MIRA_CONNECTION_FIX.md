# Mira AI Connection Issues - Root Cause & Fix

## 🔍 Issues Identified

### 1. **Mira Using Mock Data Instead of Gemini**
**Root Cause**: 
- `personalizedChatService.js` calls Netlify function at `/.netlify/functions/chat-personalized`
- This is a **Netlify deployment URL**, not Firebase Functions
- You're running Firebase emulators, but Mira is trying to reach Netlify
- The app is in **hybrid mode**: Firebase Functions backend + Netlify frontend deployment

### 2. **Browser TTS Instead of Gemini TTS**
**Root Cause**:
- `AICoach.jsx` line 186: `await api.textToSpeech(text)`
- `apiService.js` points to Firebase Functions URL (production)
- New Gemini TTS functions not integrated into `AICoach.jsx`
- Still using old `elevenLabsService` import (line 10)

### 3. **STT Not Working**
**Root Cause**:
- `VoiceButton` component calls Firebase Functions for STT
- Firebase emulators running but frontend not configured to use them
- Missing environment variable: `VITE_USE_EMULATORS=true`

## 🎯 Architecture Confusion

### Current Setup (Hybrid):
```
Frontend (Vite) → Netlify Functions (chat-personalized)
                → Firebase Functions (TTS, STT, voice chat)
```

### What You Need (Unified):
```
Frontend (Vite) → Firebase Functions (ALL features)
                → Firebase Emulators (local testing)
```

## ✅ Solution

### Option A: Use Firebase Functions Only (Recommended)

#### Step 1: Create Firebase Function for Chat
Create `functions/src/chatPersonalized.js`:

```javascript
import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-ai',
  location: 'asia-south1'
});

export const chatPersonalized = onRequest({
  cors: true,
  region: 'asia-south1',
  timeoutSeconds: 60,
  memory: '512MiB'
}, async (req, res) => {
  try {
    const { messages, userContext = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp'
    });

    // Build contents
    const contents = [];
    let systemPrompt = '';
    
    messages.forEach((msg, index) => {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else if (msg.role === 'user') {
        const content = index === 1 && systemPrompt 
          ? `${systemPrompt}\n\n---\n\nUser: ${msg.content}`
          : msg.content;
        
        contents.push({
          role: 'user',
          parts: [{ text: content }]
        });
      } else if (msg.role === 'assistant') {
        contents.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300
      }
    });

    const response = result.response;
    const responseText = response.candidates[0].content.parts[0].text;

    res.json({
      response: responseText,
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp',
      personalized: true
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      details: error.message
    });
  }
});
```

#### Step 2: Update `functions/src/index.js`
```javascript
import { chatPersonalized } from './chatPersonalized.js';

export {
  // ... existing exports
  chatPersonalized,
  geminiTTS,
  geminiTTSStream
};
```

#### Step 3: Update `personalizedChatService.js`
```javascript
// Line 184: Change from Netlify to Firebase
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 
  'http://localhost:5001/mindmend-ai/asia-south1';

const response = await fetch(`${FUNCTIONS_URL}/chatPersonalized`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages,
    userContext: {
      userId,
      userName: userProfile?.displayName || 'friend',
      moodHistory: moodHistory.slice(-5),
      progress: userProgress
    }
  })
});
```

#### Step 4: Update `AICoach.jsx` to Use Gemini TTS
```javascript
// Line 10: Replace elevenLabsService with geminiTTSService
import geminiTTSService from '../services/geminiTTSService';

// Line 181-192: Update playResponseVoice
const playResponseVoice = async (text) => {
  if (!autoPlayVoice || isPlayingVoice) return;
  
  try {
    setIsPlayingVoice(true);
    await geminiTTSService.speak(text, { 
      emotion: 'supportive',
      volume: 0.8 
    });
  } catch (error) {
    console.error('TTS error:', error);
  } finally {
    setIsPlayingVoice(false);
  }
};
```

#### Step 5: Create `.env.local` for Emulators
```bash
# Firebase Emulator Configuration
VITE_FUNCTIONS_URL=http://localhost:5001/mindmend-ai/asia-south1
VITE_USE_EMULATORS=true

# Firebase Config (your actual values)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=mindmend-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindmend-ai
VITE_FIREBASE_STORAGE_BUCKET=mindmend-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Keep existing keys
VITE_GEMINI_API_KEY=AIzaSyC60pOrk5Qi_x9m6yj9fTd8SzJXY85mlNg
VITE_ELEVENLABS_API_KEY=sk_79800de5202e7be13ffa03f8711e9ab398d804d9d0011681
```

### Option B: Keep Netlify Functions (Quick Fix)

If you want to keep using Netlify functions for now:

#### Step 1: Start Netlify Dev Server
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start Netlify dev server (runs functions locally)
netlify dev
```

#### Step 2: Update Environment
```bash
# .env.local
VITE_NETLIFY_FUNCTIONS_URL=http://localhost:8888/.netlify/functions
VITE_FUNCTIONS_URL=http://localhost:5001/mindmend-ai/asia-south1
```

#### Step 3: Update `personalizedChatService.js`
```javascript
const NETLIFY_URL = import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || 
  '/.netlify/functions';

const response = await fetch(`${NETLIFY_URL}/chat-personalized`, {
  // ... rest of code
});
```

## 🚀 Recommended Steps (Firebase Only)

### 1. Install Dependencies
```bash
cd functions
npm install @google-cloud/vertexai
cd ..
```

### 2. Create Files
- `functions/src/chatPersonalized.js` (see above)
- `.env.local` (see above)

### 3. Update Existing Files
- `functions/src/index.js` - Add chatPersonalized export
- `src/services/personalizedChatService.js` - Change URL
- `src/components/AICoach.jsx` - Use geminiTTSService

### 4. Start Everything
```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start frontend
npm run dev
```

### 5. Test
1. Open http://localhost:5173
2. Go to AI Coach
3. Type: "I feel anxious"
4. Should see:
   - ✅ Gemini response (not fallback)
   - ✅ Voice playback with Gemini TTS
   - ✅ Logs in emulator UI

## 🔧 Quick Debug Commands

### Check if Emulators Running
```bash
curl http://localhost:5001
# Should return: "OK" or Firebase Functions info
```

### Test Chat Function
```bash
curl -X POST http://localhost:5001/mindmend-ai/asia-south1/chatPersonalized \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are Mira"},
      {"role": "user", "content": "Hello"}
    ]
  }'
```

### Test Gemini TTS
```bash
curl -X POST http://localhost:5001/mindmend-ai/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "emotion": "supportive"}'
```

### Check Environment Variables
```bash
# In browser console
console.log(import.meta.env.VITE_FUNCTIONS_URL);
console.log(import.meta.env.VITE_USE_EMULATORS);
```

## 📊 Expected Behavior After Fix

### Chat Flow:
1. User types message
2. Frontend → Firebase Functions `chatPersonalized`
3. Gemini 2.0 Flash generates response
4. Response returned to frontend
5. Gemini TTS converts to audio
6. Audio plays automatically

### Voice Flow:
1. User clicks mic button
2. Browser records audio
3. Frontend → Firebase Functions `speechToText`
4. Cloud Speech converts to text
5. Text sent to `chatPersonalized`
6. Response generated
7. Response converted to audio via `geminiTTS`
8. Audio plays

## ✅ Verification Checklist

After implementing fixes:
- [ ] Firebase emulators running (check http://localhost:4000)
- [ ] Frontend using correct FUNCTIONS_URL
- [ ] Chat generates Gemini responses (not fallback)
- [ ] Voice playback uses Gemini TTS (not browser TTS)
- [ ] STT works (mic button transcribes correctly)
- [ ] Logs show in Emulator UI
- [ ] No CORS errors in console
- [ ] No "fallback" in response logs

## 🆘 Common Issues

### Issue: "Failed to fetch"
**Solution**: Check VITE_FUNCTIONS_URL in `.env.local`

### Issue: "CORS error"
**Solution**: Ensure `cors: true` in Firebase Function config

### Issue: Still using fallback
**Solution**: Check Emulator UI logs for actual error

### Issue: No audio playback
**Solution**: Check browser console, verify Gemini TTS function deployed

### Issue: STT not working
**Solution**: Check microphone permissions, verify speechToText function

## 📝 Summary

**Problem**: Hybrid architecture causing confusion
**Solution**: Unify on Firebase Functions + Emulators
**Benefits**: 
- Single backend
- Easy local testing
- Production-ready
- All features in one place

**Next**: Follow "Recommended Steps" above to fix all issues.
