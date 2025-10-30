# 🔧 FINAL FIX - Mira TTS Not Working

## 🎯 Root Cause
Frontend is trying to connect to Firebase Functions but getting browser TTS fallback.

## ✅ Fixes Applied

### 1. Updated geminiTTSService.js
- Fixed FUNCTIONS_URL to use 127.0.0.1 (matches emulator)
- Added detailed console logging
- Better error messages

### 2. Updated VoiceEnabledMessage.jsx
- Added detailed logging for debugging
- Shows exactly what's happening

### 3. Environment Check
- `.env.local` has correct URL: `http://localhost:5001/mindmend-25dca/asia-south1`
- Emulators running on: `http://127.0.0.1:5001`

## 🚀 Testing Steps

### Step 1: Restart Everything

```bash
# Terminal 1: Start emulators
firebase emulators:start --only functions,firestore,auth,storage

# Wait for this line:
# ✔ functions[asia-south1-geminiTTS]: http function initialized

# Terminal 2: Start frontend
npm run dev
```

### Step 2: Open Browser Console

1. Open http://localhost:5173 (or whatever port Vite shows)
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Clear console

### Step 3: Test Mira

1. Navigate to AI Coach
2. Type: "Hello Mira"
3. Watch console for these logs:

**Expected Success Logs:**
```
🔧 Gemini TTS Service initialized with URL: http://127.0.0.1:5001/mindmend-25dca/asia-south1
🔊 VoiceEnabledMessage: Starting playback
📝 Message: Hello Mira...
🎭 Emotion: supportive
🎙️ Generating new audio...
🎙️ Generating speech with Gemini 2.5 Flash TTS...
📍 URL: http://127.0.0.1:5001/mindmend-25dca/asia-south1/geminiTTS
📡 Response status: 200
✅ Speech generated in 234ms
✅ Audio generated: Success
```

**If You See Fallback:**
```
❌ Gemini TTS Error: Failed to fetch
⚠️ Falling back to browser TTS
💡 Check that Firebase emulators are running on: http://127.0.0.1:5001/mindmend-25dca/asia-south1
```

## 🐛 Troubleshooting

### Issue: "Failed to fetch"

**Check 1: Emulators Running?**
```bash
curl http://127.0.0.1:5001/mindmend-25dca/asia-south1/geminiTTS
# Should return: {"error":"Cannot GET /mindmend-25dca/asia-south1/geminiTTS"}
# (This is OK - means emulator is running)
```

**Check 2: Test TTS Directly**
```bash
curl -X POST http://127.0.0.1:5001/mindmend-25dca/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello test","emotion":"supportive"}'
```

**Expected Response:**
```json
{
  "audioBase64": "...",
  "contentType": "audio/pcm",
  "sampleRate": 24000,
  "model": "gemini-2.5-flash-preview-tts",
  "voice": "Aoede"
}
```

### Issue: CORS Error

**Check Network Tab:**
1. Open DevTools > Network tab
2. Try playing voice
3. Look for request to `geminiTTS`
4. Check if it shows CORS error

**Fix:** Emulator should have CORS enabled (already configured)

### Issue: Still Using Browser TTS

**Check Console Logs:**
- If you see "⚠️ Falling back to browser TTS" - emulator not reachable
- If you see "✅ Audio generated: Success" but still browser TTS - WAV conversion issue

**Fix WAV Conversion:**
Check if `base64ToWavBlob` function exists in geminiTTSService.js

## 📊 Debug Checklist

- [ ] Emulators running (check terminal output)
- [ ] Frontend running (npm run dev)
- [ ] Browser console open
- [ ] Console shows initialization log with correct URL
- [ ] Network tab shows POST to /geminiTTS
- [ ] Response status is 200
- [ ] Response has audioBase64 field
- [ ] No CORS errors
- [ ] Audio plays (not browser TTS)

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Console shows "✅ Speech generated in XXXms"
- ✅ Audio sounds high-quality (not robotic browser voice)
- ✅ UI shows "Gemini 2.5 Flash TTS • Aoede"
- ✅ Green dot indicator
- ✅ Playback speed controls work
- ✅ No "browser_tts" in logs

## 💡 Quick Test

Run this in browser console after page loads:
```javascript
// Check if service is initialized
console.log('Functions URL:', import.meta.env.VITE_FUNCTIONS_URL);

// Test TTS directly
fetch('http://127.0.0.1:5001/mindmend-25dca/asia-south1/geminiTTS', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Test', emotion: 'supportive' })
})
.then(r => r.json())
.then(d => console.log('TTS Test:', d))
.catch(e => console.error('TTS Test Failed:', e));
```

## 🔄 If Still Not Working

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard reload** (Ctrl+Shift+R)
3. **Restart emulators** (Ctrl+C, then restart)
4. **Restart frontend** (Ctrl+C, then npm run dev)
5. **Check .env.local** is being loaded (console.log in code)

## 📝 Environment Variables

Make sure `.env.local` has:
```bash
VITE_FUNCTIONS_URL=http://localhost:5001/mindmend-25dca/asia-south1
```

And restart frontend after any .env changes!

---

**Status**: Fixes applied, ready to test!
**Next**: Restart emulators + frontend, then test with console open
