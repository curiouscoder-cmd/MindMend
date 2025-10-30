# 🔑 TTS Authentication Fix

## 🎯 Root Cause
**Error**: `"Request had insufficient authentication scopes"`

The Gemini API key doesn't have permission for TTS (Text-to-Speech).

## ✅ Solution

### Option 1: Get New API Key with TTS Enabled (Recommended)

1. **Go to Google AI Studio**:
   https://aistudio.google.com/apikey

2. **Create New API Key**:
   - Click "Create API Key"
   - Select your project or create new
   - **Important**: Make sure TTS is enabled for this key

3. **Copy the API Key**

4. **Update `.env.local`**:
   ```bash
   GEMINI_API_KEY=your_new_api_key_here
   ```

5. **Restart Frontend**:
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

### Option 2: Use Existing Key (If TTS is Already Enabled)

The current key in `.env.local` is:
```
GEMINI_API_KEY=AIzaSyC60pOrk5Qi_x9m6yj9fTd8SzJXY85mlNg
```

**Test if it has TTS access**:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=AIzaSyC60pOrk5Qi_x9m6yj9fTd8SzJXY85mlNg" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts":[{"text": "Hello"}]}],
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {
        "voiceConfig": {
          "prebuiltVoiceConfig": {"voiceName": "Aoede"}
        }
      }
    }
  }'
```

**If you get 403 error**: Key doesn't have TTS access → Use Option 1
**If you get 200 response**: Key works → Problem is elsewhere

## 🔧 Alternative: Use Firebase Functions with Service Account

Instead of API key, use service account authentication (more secure):

### Step 1: Update `geminiTTS.js` to use service account

```javascript
import { GoogleGenAI } from '@google/genai';
import { GoogleAuth } from 'google-auth-library';

// Use service account for authentication
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/generative-language']
});

const ai = new GoogleGenAI({
  auth: auth
});
```

### Step 2: Set up service account

1. Go to Google Cloud Console
2. IAM & Admin → Service Accounts
3. Create service account with "Generative Language" permissions
4. Download JSON key
5. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

## 🚀 Quick Fix (Temporary)

While waiting for new API key, use browser TTS (already working as fallback).

Or test with a different Gemini model that doesn't require special scopes:

### Update `geminiTTS.js` to use regular Gemini:

```javascript
// Temporary workaround - use regular Gemini for text generation
// Then use browser TTS for audio
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp', // Regular model
  contents: text
});

// Use browser TTS for now
return this.fallbackTTS(response.text);
```

## 📊 Verify API Key Permissions

Check what your API key can access:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

Look for `gemini-2.5-flash-preview-tts` in the list. If it's there, your key has access.

## ✅ After Getting New Key

1. Update `.env.local` with new key
2. Restart frontend (`npm run dev`)
3. Restart emulators (`firebase emulators:start`)
4. Test Mira again
5. Check console logs - should see:
   ```
   📡 Response status: 200
   ✅ Speech generated in XXXms
   ```

## 🎯 Summary

**Problem**: API key lacks TTS permissions
**Solution**: Get new API key from https://aistudio.google.com/apikey with TTS enabled
**Alternative**: Use service account authentication (more complex but more secure)
**Temporary**: Browser TTS works as fallback (current behavior)

---

**Next Step**: Get new API key with TTS enabled from Google AI Studio!
