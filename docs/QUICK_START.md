# MindMend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 22+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase account (free tier works)

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install functions dependencies
cd functions && npm install && cd ..
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Update with your Firebase config
# Get config from: https://console.firebase.google.com/
```

### Step 3: Start Firebase Emulators
```bash
# Option A: Use the script
./scripts/start-emulators.sh

# Option B: Manual start
firebase emulators:start
```

### Step 4: Start Frontend
```bash
# In a new terminal
npm run dev
```

### Step 5: Open Application
- **Frontend**: http://localhost:5173
- **Emulator UI**: http://localhost:4000

## 🎯 Test Key Features

### 1. Test Mira AI Chat
1. Navigate to "AI Coach" in the app
2. Type: "I feel anxious today"
3. Mira should respond with empathetic support
4. Click voice button to hear response

### 2. Test Gemini TTS
```bash
# Run automated tests
./scripts/test-gemini-tts.sh
```

Or test manually:
```bash
curl -X POST http://localhost:5001/mindmend-ai/asia-south1/geminiTTS \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, I am Mira!",
    "emotion": "supportive"
  }'
```

### 3. Test Voice Chat
1. Click "Real-Time Voice" button in AI Coach
2. Allow microphone access
3. Speak: "How can you help me?"
4. Listen to Mira's voice response

### 4. Test Mood Tracking
1. Navigate to "Mood Tracker"
2. Select a mood (e.g., "Happy")
3. Add intensity and note
4. Save entry
5. View in Emulator UI: http://localhost:4000/firestore

## 📊 Monitor with Emulator UI

### Authentication
- **URL**: http://localhost:4000/auth
- **View**: All test users
- **Actions**: Create, delete users

### Firestore
- **URL**: http://localhost:4000/firestore
- **View**: All collections and documents
- **Actions**: Add, edit, delete data

### Functions
- **URL**: http://localhost:4000/functions
- **View**: Function logs and execution times
- **Actions**: Monitor performance

### Storage
- **URL**: http://localhost:4000/storage
- **View**: Uploaded files (doodles, avatars)
- **Actions**: Upload, download, delete

## 🔧 Common Issues

### Port Already in Use
```bash
# Find and kill process
lsof -i :5001
kill -9 <PID>
```

### Functions Not Updating
```bash
# Restart emulators
# Press Ctrl+C, then:
firebase emulators:start
```

### No Audio Playback
1. Check browser console for errors
2. Verify microphone permissions
3. Test with: `./scripts/test-gemini-tts.sh`
4. Check Emulator UI function logs

### Firestore Connection Failed
1. Verify emulators are running
2. Check `.env.local` has `VITE_USE_EMULATORS=true`
3. Clear browser cache
4. Restart frontend

## 📚 Next Steps

### Learn More
- [Firebase Emulator Guide](./FIREBASE_EMULATOR_GUIDE.md) - Complete testing guide
- [Mira AI Context](./MIRA_AI_CONTEXT.md) - AI architecture and features
- [API Documentation](./docs/API.md) - All endpoints and usage

### Deploy to Production
```bash
# Build frontend
npm run build

# Deploy functions
firebase deploy --only functions

# Deploy firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

### Advanced Features
- Set up CI/CD with GitHub Actions
- Configure BigQuery for analytics
- Enable FCM push notifications
- Add custom domain

## 🎓 Tutorials

### Add New Feature
1. Create component in `src/components/`
2. Add route in `src/App.jsx`
3. Create backend function in `functions/src/`
4. Export in `functions/src/index.js`
5. Test with emulators
6. Deploy

### Customize Mira's Voice
```javascript
// In functions/src/geminiTTS.js
const emotionPrompts = {
  supportive: 'Say the following in a warm way',
  custom: 'Say the following in YOUR_CUSTOM_STYLE'
};
```

### Add New Language
```javascript
// In functions/src/chatMultilingual.js
const supportedLanguages = [
  'en', 'hi', 'ta', 'te', 'YOUR_LANGUAGE'
];
```

## 💡 Pro Tips

1. **Use Emulator Data Export**: Save test data for reuse
   ```bash
   firebase emulators:start --export-on-exit=./test-data
   ```

2. **Hot Reload Functions**: Functions auto-reload on save

3. **Debug with Logs**: Check Emulator UI for detailed logs

4. **Test Offline**: Disconnect network to test offline mode

5. **Performance Testing**: Use Artillery for load testing
   ```bash
   npm install -g artillery
   artillery run artillery-test.yml
   ```

## 🆘 Get Help

- **Documentation**: Check `/docs` folder
- **Emulator Logs**: http://localhost:4000
- **Firebase Console**: https://console.firebase.google.com
- **Issues**: Check GitHub issues

## ✅ Checklist

Before deploying to production:
- [ ] All tests pass
- [ ] Emulator testing complete
- [ ] Environment variables configured
- [ ] Firebase project created
- [ ] Firestore rules tested
- [ ] Functions tested
- [ ] Frontend builds successfully
- [ ] Performance optimized
- [ ] Security rules verified
- [ ] Backup strategy in place

---

**Happy Coding! 🎉**

Need help? Check the full guides:
- [Firebase Emulator Guide](./FIREBASE_EMULATOR_GUIDE.md)
- [Mira AI Context](./MIRA_AI_CONTEXT.md)
