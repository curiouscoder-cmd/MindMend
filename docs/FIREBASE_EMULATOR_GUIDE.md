# Firebase Emulator Setup & Testing Guide

## Overview
This guide shows you how to test the entire MindMend application locally using Firebase Emulators before deploying to production.

## What are Firebase Emulators?
Firebase Emulators allow you to test your app locally with:
- **Authentication Emulator** (port 9099) - Test user sign-in/sign-up
- **Firestore Emulator** (port 8080) - Test database operations
- **Functions Emulator** (port 5001) - Test Cloud Functions
- **Storage Emulator** (port 9199) - Test file uploads
- **Hosting Emulator** (port 5000) - Test the frontend
- **Emulator UI** (port 4000) - Visual dashboard for all emulators

## Prerequisites
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

## Configuration

Your `firebase.json` is already configured with emulators:
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "functions": { "port": 5001, "host": "127.0.0.1" },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5000 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000, "host": "127.0.0.1" }
  }
}
```

## Starting the Emulators

### Option 1: Start All Emulators
```bash
# From project root
firebase emulators:start
```

### Option 2: Start Specific Emulators
```bash
# Only functions and firestore
firebase emulators:start --only functions,firestore

# Only auth and functions
firebase emulators:start --only auth,functions
```

### Option 3: Start with Import/Export
```bash
# Export data on shutdown
firebase emulators:start --export-on-exit=./emulator-data

# Import existing data on startup
firebase emulators:start --import=./emulator-data
```

## Environment Setup

### 1. Update `.env` for Local Development
Create `.env.local` for emulator configuration:

```bash
# Firebase Emulator URLs
VITE_FUNCTIONS_URL=http://localhost:5001/mindmend-ai/asia-south1
VITE_USE_EMULATORS=true

# Firebase Config (use your actual project config)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindmend-ai
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 2. Connect Frontend to Emulators
Update `src/services/firebase.js`:

```javascript
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Connect to emulators in development
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app, 'asia-south1');
  const storage = getStorage(app);

  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);

  console.log('🔧 Connected to Firebase Emulators');
}
```

## Testing Workflow

### Step 1: Start Emulators
```bash
# Terminal 1: Start emulators
firebase emulators:start
```

You should see:
```
✔  All emulators ready! It is now safe to connect your app.
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! View status and logs at             │
│    http://localhost:4000                                     │
└─────────────────────────────────────────────────────────────┘

┌───────────┬────────────────┬─────────────────────────────────┐
│ Emulator  │ Host:Port      │ View in Emulator UI             │
├───────────┼────────────────┼─────────────────────────────────┤
│ Auth      │ localhost:9099 │ http://localhost:4000/auth      │
│ Functions │ localhost:5001 │ http://localhost:4000/functions │
│ Firestore │ localhost:8080 │ http://localhost:4000/firestore │
│ Storage   │ localhost:9199 │ http://localhost:4000/storage   │
│ Hosting   │ localhost:5000 │ n/a                             │
└───────────┴────────────────┴─────────────────────────────────┘
```

### Step 2: Start Frontend
```bash
# Terminal 2: Start Vite dev server
npm run dev
```

### Step 3: Open Emulator UI
Open browser to: **http://localhost:4000**

## Testing Features

### 1. Test Authentication
```javascript
// Sign up a test user
import { createUserWithEmailAndPassword } from 'firebase/auth';

const testSignup = async () => {
  const email = 'test@example.com';
  const password = 'testpass123';
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  console.log('Test user created:', userCredential.user.uid);
};
```

**Verify in Emulator UI:**
- Go to http://localhost:4000/auth
- See your test user listed

### 2. Test Firestore Operations
```javascript
// Add a mood entry
import { collection, addDoc } from 'firebase/firestore';

const testMoodEntry = async () => {
  const moodRef = collection(db, 'users', userId, 'moodEntries');
  
  const entry = await addDoc(moodRef, {
    mood: 'happy',
    intensity: 8,
    note: 'Testing emulator',
    timestamp: new Date()
  });
  
  console.log('Mood entry created:', entry.id);
};
```

**Verify in Emulator UI:**
- Go to http://localhost:4000/firestore
- Navigate to `users/{userId}/moodEntries`
- See your test data

### 3. Test Cloud Functions

#### Test Gemini TTS
```javascript
const testGeminiTTS = async () => {
  const response = await fetch('http://localhost:5001/mindmend-ai/asia-south1/geminiTTS', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hello, I am Mira, your AI wellness coach.',
      emotion: 'supportive'
    })
  });
  
  const data = await response.json();
  console.log('TTS Response:', data);
  
  // Play audio
  const audioBlob = base64ToBlob(data.audioBase64, 'audio/l16');
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  await audio.play();
};
```

#### Test Chat Function
```javascript
const testChat = async () => {
  const response = await fetch('http://localhost:5001/mindmend-ai/asia-south1/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'I feel anxious today',
      moodHistory: [],
      userProgress: {}
    })
  });
  
  const data = await response.json();
  console.log('AI Response:', data.response);
};
```

**Verify in Emulator UI:**
- Go to http://localhost:4000/functions
- See function invocation logs
- Check execution time and status

### 4. Test Storage Operations
```javascript
// Upload a doodle
import { ref, uploadBytes } from 'firebase/storage';

const testUpload = async (file) => {
  const storageRef = ref(storage, `doodles/${userId}/${Date.now()}.png`);
  const snapshot = await uploadBytes(storageRef, file);
  console.log('Uploaded:', snapshot.metadata.fullPath);
};
```

**Verify in Emulator UI:**
- Go to http://localhost:4000/storage
- See uploaded files

## Complete Feature Testing Checklist

### Authentication Features
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google (requires production)
- [ ] Password reset
- [ ] Sign out
- [ ] Anonymous authentication

### Mira AI Coach Features
- [ ] Send text message to Mira
- [ ] Receive AI response
- [ ] Voice input (speech-to-text)
- [ ] Voice output (Gemini TTS)
- [ ] Real-time voice chat
- [ ] Emotion detection
- [ ] Context-aware responses

### Mood Tracking Features
- [ ] Create text mood entry
- [ ] Create voice mood entry
- [ ] Create doodle mood entry
- [ ] View mood history
- [ ] Mood analytics
- [ ] Mood trends

### CBT Exercises
- [ ] Browse exercises
- [ ] Start exercise
- [ ] Complete exercise
- [ ] Track progress
- [ ] Receive feedback

### Community Features
- [ ] Create post
- [ ] View posts
- [ ] Comment on posts
- [ ] Like posts
- [ ] Report posts

### Crisis Mode
- [ ] Trigger crisis detection
- [ ] View crisis resources
- [ ] Emergency contacts
- [ ] Hotline numbers

## Advanced Testing

### Load Testing Functions
```bash
# Install artillery
npm install -g artillery

# Create test script: artillery-test.yml
config:
  target: 'http://localhost:5001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Test Gemini TTS'
    flow:
      - post:
          url: '/mindmend-ai/asia-south1/geminiTTS'
          json:
            text: 'Test message'
            emotion: 'supportive'

# Run load test
artillery run artillery-test.yml
```

### Integration Testing
```javascript
// tests/integration/mira-chat.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Mira AI Chat Integration', () => {
  beforeAll(async () => {
    // Start emulators programmatically
    // Or ensure they're running
  });

  it('should generate AI response', async () => {
    const response = await fetch('http://localhost:5001/mindmend-ai/asia-south1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I feel anxious',
        moodHistory: [],
        userProgress: {}
      })
    });

    const data = await response.json();
    expect(data.response).toBeDefined();
    expect(data.response.length).toBeGreaterThan(0);
  });

  it('should generate TTS audio', async () => {
    const response = await fetch('http://localhost:5001/mindmend-ai/asia-south1/geminiTTS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello world',
        emotion: 'supportive'
      })
    });

    const data = await response.json();
    expect(data.audioBase64).toBeDefined();
    expect(data.model).toBe('gemini-2.5-flash-tts');
    expect(data.voice).toBe('Aoede');
  });
});
```

## Data Management

### Export Emulator Data
```bash
# Export all data
firebase emulators:export ./emulator-data

# This creates:
# - auth_export/
# - firestore_export/
# - storage_export/
```

### Import Emulator Data
```bash
# Import previously exported data
firebase emulators:start --import=./emulator-data
```

### Seed Test Data
Create `functions/seed-data.js`:

```javascript
import admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

async function seedData() {
  // Create test user
  const userRef = db.collection('users').doc('test-user-123');
  await userRef.set({
    displayName: 'Test User',
    email: 'test@example.com',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    progress: {
      streak: 5,
      completedExercises: 10,
      totalPoints: 500
    }
  });

  // Create mood entries
  const moodRef = userRef.collection('moodEntries');
  await moodRef.add({
    mood: 'happy',
    intensity: 8,
    note: 'Feeling great today!',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('✅ Test data seeded');
}

seedData();
```

Run seeding:
```bash
# With emulators running
node functions/seed-data.js
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or change port in firebase.json
```

### Emulators Not Connecting
1. Check `.env.local` has correct URLs
2. Verify `connectAuthEmulator` is called before any auth operations
3. Clear browser cache and reload
4. Check console for connection errors

### Functions Not Updating
```bash
# Restart emulators to reload functions
# Ctrl+C to stop, then restart
firebase emulators:start
```

### Data Not Persisting
```bash
# Use export-on-exit flag
firebase emulators:start --export-on-exit=./emulator-data
```

## Production Deployment

After testing locally:

```bash
# Deploy functions
firebase deploy --only functions

# Deploy firestore rules
firebase deploy --only firestore:rules

# Deploy storage rules
firebase deploy --only storage

# Deploy everything
firebase deploy
```

## Best Practices

1. **Always test locally first** - Never deploy untested code
2. **Use separate test data** - Don't mix test and production data
3. **Export data regularly** - Save your test scenarios
4. **Test edge cases** - Try invalid inputs, network failures
5. **Monitor emulator logs** - Watch for errors and warnings
6. **Use environment variables** - Keep config separate
7. **Test offline mode** - Disconnect network and test
8. **Performance test** - Use artillery for load testing
9. **Security rules test** - Verify rules work as expected
10. **Clean up after tests** - Clear test data between runs

## Quick Reference

### Common Commands
```bash
# Start all emulators
firebase emulators:start

# Start with data export
firebase emulators:start --export-on-exit=./data

# Start with data import
firebase emulators:start --import=./data

# Start specific emulators
firebase emulators:start --only functions,firestore

# Deploy to production
firebase deploy

# View logs
firebase functions:log
```

### Emulator URLs
- **Emulator UI**: http://localhost:4000
- **Auth**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Functions**: http://localhost:5001
- **Storage**: http://localhost:9199
- **Hosting**: http://localhost:5000

## Next Steps

1. Start emulators: `firebase emulators:start`
2. Open Emulator UI: http://localhost:4000
3. Start frontend: `npm run dev`
4. Test all features using the checklist above
5. Export test data for future use
6. Deploy to production when ready

Happy testing! 🚀
