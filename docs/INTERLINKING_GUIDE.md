# 🔗 MindMend AI - Complete Interlinking Guide

**How to Connect Frontend, Backend, and Google Cloud Services**

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend → Backend Connection](#frontend--backend-connection)
3. [Backend → Google Cloud Services](#backend--google-cloud-services)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Testing the Connections](#testing-the-connections)
6. [Troubleshooting](#troubleshooting)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                           │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Frontend (https://mindmend-25dca.web.app)   │    │
│  │  - 32 Components                                    │    │
│  │  - Services (authService, geminiService, etc.)     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE FUNCTIONS (Backend)                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │  14 Cloud Functions (asia-south1)                  │     │
│  │  - chat, analyzeMood, speechToText, etc.           │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓ API Calls
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE CLOUD SERVICES                          │
│  ┌──────────────┬──────────────┬──────────────────────┐     │
│  │ Vertex AI    │ Cloud Vision │ Cloud NLP            │     │
│  │ (Gemini 2.5) │ (Doodles)    │ (Sentiment)          │     │
│  ├──────────────┼──────────────┼──────────────────────┤     │
│  │ Cloud Speech │ Cloud TTS    │ BigQuery             │     │
│  │ (Voice)      │ (Voice Out)  │ (Analytics)          │     │
│  ├──────────────┼──────────────┼──────────────────────┤     │
│  │ Firestore    │ FCM          │ Firebase Auth        │     │
│  │ (Database)   │ (Notifications)│ (Authentication)   │     │
│  └──────────────┴──────────────┴──────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend → Backend Connection

### 2.1 Configure Functions URL

**File:** `src/services/firebaseConfig.js`

```javascript
// Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mindmend-25dca.firebaseapp.com",
  projectId: "mindmend-25dca",
  storageBucket: "mindmend-25dca.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Functions URL (deployed region)
export const FUNCTIONS_URL = "https://asia-south1-mindmend-25dca.cloudfunctions.net";
```

### 2.2 Create API Service

**File:** `src/services/apiService.js`

```javascript
import { FUNCTIONS_URL } from './firebaseConfig';

// Generic function caller
export async function callFunction(functionName, data) {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Function ${functionName} failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
}

// Specific function wrappers
export const api = {
  // AI Chat
  chat: (message, moodHistory, userProgress) => 
    callFunction('chat', { message, moodHistory, userProgress }),

  // Multilingual Chat
  chatMultilingual: (message, language, moodHistory) =>
    callFunction('chatMultilingual', { message, language, moodHistory }),

  // Mood Analysis
  analyzeMood: (text, context) =>
    callFunction('analyzeMood', { text, context }),

  // Doodle Analysis
  analyzeDoodle: (imageData) =>
    callFunction('analyzeDoodle', { imageData }),

  // Speech to Text
  speechToText: (audioData, language) =>
    callFunction('speechToText', { audioData, language }),

  // Text to Speech
  textToSpeech: (text, language, voice) =>
    callFunction('textToSpeech', { text, language, voice }),

  // Voice Chat
  voiceChat: (audioData, language, context) =>
    callFunction('voiceChat', { audioData, language, context }),

  // Notifications
  sendNotification: (userId, title, body, data) =>
    callFunction('sendNotification', { userId, title, body, data }),

  registerToken: (userId, token) =>
    callFunction('registerToken', { userId, token }),

  // Streaming Translation
  streamingTranslation: (text, targetLanguage) =>
    callFunction('streamingTranslation', { text, targetLanguage, streaming: false }),
};

export default api;
```

### 2.3 Update Components to Use API

**Example: AICoach Component**

**File:** `src/components/AICoach.jsx`

```javascript
import React, { useState } from 'react';
import api from '../services/apiService';

export default function AICoach({ userProgress, moodHistory, currentMood }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call the backend function
      const response = await api.chat(input, moodHistory, userProgress);
      
      const aiMessage = { 
        role: 'assistant', 
        content: response.response || response.message 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Chat UI */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

**Example: DoodleMoodInput Component**

**File:** `src/components/DoodleMoodInput.jsx`

```javascript
import React, { useRef, useState } from 'react';
import api from '../services/apiService';

export default function DoodleMoodInput({ onMoodDetected }) {
  const canvasRef = useRef(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeDoodle = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');

    setAnalyzing(true);
    try {
      // Call Cloud Vision via backend
      const result = await api.analyzeDoodle(imageData);
      
      onMoodDetected({
        mood: result.mood,
        confidence: result.confidence,
        labels: result.labels,
      });
    } catch (error) {
      console.error('Doodle analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={400} height={400} />
      <button onClick={analyzeDoodle} disabled={analyzing}>
        {analyzing ? 'Analyzing...' : 'Analyze Doodle'}
      </button>
    </div>
  );
}
```

---

## 3. Backend → Google Cloud Services

### 3.1 Firebase Functions Already Connected

All your Firebase Functions are already configured to use Google Cloud services:

**File:** `functions/src/chat.js`
```javascript
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: 'mindmend-25dca',
  location: 'asia-south1',
});

// Uses Vertex AI Gemini 2.5
const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
```

**File:** `functions/src/analyzeDoodle.js`
```javascript
const vision = require('@google-cloud/vision');

// Uses Cloud Vision API
const client = new vision.ImageAnnotatorClient();
```

**File:** `functions/src/analyzeMood.js`
```javascript
const language = require('@google-cloud/language');

// Uses Cloud Natural Language API
const client = new language.LanguageServiceClient();
```

### 3.2 Service Connections Map

| Frontend Component | Backend Function | Google Cloud Service |
|-------------------|------------------|---------------------|
| AICoach | `chat` | Vertex AI (Gemini 2.5) |
| DoodleMoodInput | `analyzeDoodle` | Cloud Vision API |
| MoodAnalytics | `analyzeMood` | Cloud Natural Language |
| VoiceInput | `speechToText` | Cloud Speech-to-Text |
| VoiceOutput | `textToSpeech` | Cloud Text-to-Speech |
| ChatMultilingual | `streamingTranslation` | Vertex AI (Gemma 2) |
| Notifications | `sendNotification` | Firebase Cloud Messaging |
| Analytics | BigQuery export | BigQuery |
| Auth | Firebase Auth SDK | Firebase Authentication |
| Database | Firestore SDK | Cloud Firestore |

---

## 4. Environment Variables Setup

### 4.1 Frontend Environment Variables

**File:** `.env.local` (create if doesn't exist)

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=mindmend-25dca.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindmend-25dca
VITE_FIREBASE_STORAGE_BUCKET=mindmend-25dca.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Functions URL
VITE_FUNCTIONS_URL=https://asia-south1-mindmend-25dca.cloudfunctions.net

# FCM VAPID Key (for push notifications)
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

**How to get these values:**

```bash
# Open Firebase Console
open https://console.firebase.google.com/project/mindmend-25dca/settings/general

# Copy the config values from "Your apps" section
```

### 4.2 Backend Environment Variables

**Set via Firebase CLI:**

```bash
# Set GCP project configuration
firebase functions:config:set \
  gcp.project_id="mindmend-25dca" \
  gcp.location="asia-south1"

# Set Gemini API key (if using direct API)
firebase functions:config:set \
  gemini.api_key="your_gemini_api_key"

# Set BigQuery configuration
firebase functions:config:set \
  bigquery.dataset_id="mindmend_analytics"

# Verify configuration
firebase functions:config:get
```

---

## 5. Testing the Connections

### 5.1 Test Frontend → Backend

**Create a test file:** `src/test-api.js`

```javascript
import api from './services/apiService';

async function testConnections() {
  console.log('🧪 Testing API connections...\n');

  // Test 1: Health Check
  try {
    const health = await fetch('https://asia-south1-mindmend-25dca.cloudfunctions.net/healthCheck');
    const data = await health.json();
    console.log('✅ Health Check:', data);
  } catch (error) {
    console.error('❌ Health Check failed:', error);
  }

  // Test 2: AI Chat
  try {
    const chatResponse = await api.chat('Hello, how are you?', [], {});
    console.log('✅ AI Chat:', chatResponse);
  } catch (error) {
    console.error('❌ AI Chat failed:', error);
  }

  // Test 3: Mood Analysis
  try {
    const moodResponse = await api.analyzeMood('I feel anxious today', {});
    console.log('✅ Mood Analysis:', moodResponse);
  } catch (error) {
    console.error('❌ Mood Analysis failed:', error);
  }

  console.log('\n✅ All tests complete!');
}

// Run tests
testConnections();
```

**Run the test:**

```bash
# In browser console or Node.js
node src/test-api.js
```

### 5.2 Test Backend → Google Cloud

**Test each function individually:**

```bash
# Test health check
curl https://asia-south1-mindmend-25dca.cloudfunctions.net/healthCheck

# Test chat function
curl -X POST \
  https://asia-south1-mindmend-25dca.cloudfunctions.net/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello Mira",
    "moodHistory": [],
    "userProgress": {}
  }'

# Test mood analysis
curl -X POST \
  https://asia-south1-mindmend-25dca.cloudfunctions.net/analyzeMood \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I feel very stressed and anxious",
    "context": {}
  }'
```

### 5.3 Monitor Function Logs

```bash
# View all function logs
firebase functions:log

# View specific function logs
firebase functions:log --only chat

# Stream logs in real-time
firebase functions:log --follow
```

---

## 6. Troubleshooting

### Issue 1: CORS Errors

**Problem:** Frontend can't call backend functions

**Solution:** Functions already have CORS enabled, but verify:

```javascript
// In each function file
export const functionName = onRequest({
  cors: true,  // ✅ Make sure this is set
  region: 'asia-south1',
}, async (req, res) => {
  // Function code
});
```

### Issue 2: Authentication Errors

**Problem:** Functions require authentication

**Solution:** Pass Firebase ID token:

```javascript
import { getAuth } from 'firebase/auth';

async function callAuthenticatedFunction(functionName, data) {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();

  const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // Add auth token
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}
```

### Issue 3: Function Timeout

**Problem:** Functions taking too long

**Solution:** Increase timeout in function configuration:

```javascript
export const longRunningFunction = onRequest({
  cors: true,
  timeoutSeconds: 300,  // 5 minutes (default is 60)
  memory: '1GiB',       // Increase memory if needed
}, async (req, res) => {
  // Function code
});
```

### Issue 4: Environment Variables Not Working

**Problem:** Functions can't access config

**Solution:** Use process.env or functions.config():

```javascript
import { defineString } from 'firebase-functions/params';

// Define config parameter
const geminiApiKey = defineString('GEMINI_API_KEY');

// Use in function
export const myFunction = onRequest({}, async (req, res) => {
  const apiKey = geminiApiKey.value();
  // Use apiKey
});
```

---

## 7. Complete Integration Checklist

### Frontend Setup
- [ ] Create `src/services/apiService.js`
- [ ] Update `.env.local` with Firebase config
- [ ] Update components to use API service
- [ ] Test API calls in browser console

### Backend Setup
- [ ] All 14 functions deployed
- [ ] Environment variables configured
- [ ] CORS enabled on all functions
- [ ] Test each function with curl

### Google Cloud Setup
- [ ] Vertex AI API enabled
- [ ] Cloud Vision API enabled
- [ ] Cloud Natural Language API enabled
- [ ] Cloud Speech APIs enabled
- [ ] BigQuery dataset created
- [ ] FCM configured

### Testing
- [ ] Health check works
- [ ] AI chat responds
- [ ] Mood analysis works
- [ ] Doodle analysis works
- [ ] Voice features work
- [ ] Notifications work
- [ ] Database reads/writes work

---

## 8. Quick Reference

### Function URLs

All functions are at: `https://asia-south1-mindmend-25dca.cloudfunctions.net/`

- `healthCheck` - GET - Check if backend is running
- `chat` - POST - AI chat with Gemini
- `chatMultilingual` - POST - Multilingual chat
- `analyzeMood` - POST - Sentiment analysis
- `analyzeDoodle` - POST - Image analysis
- `speechToText` - POST - Voice to text
- `textToSpeech` - POST - Text to voice
- `voiceChat` - POST - End-to-end voice chat
- `sendNotification` - POST - Send FCM notification
- `registerToken` - POST - Register FCM token
- `sendDailyReminder` - Scheduled - Daily reminders
- `onStreakMilestone` - Trigger - Streak achievements
- `onCrisisDetected` - Trigger - Crisis intervention
- `streamingTranslation` - POST - Real-time translation

### Firebase Console Links

- **Project Overview:** https://console.firebase.google.com/project/mindmend-25dca
- **Functions:** https://console.firebase.google.com/project/mindmend-25dca/functions
- **Firestore:** https://console.firebase.google.com/project/mindmend-25dca/firestore
- **Authentication:** https://console.firebase.google.com/project/mindmend-25dca/authentication
- **Hosting:** https://console.firebase.google.com/project/mindmend-25dca/hosting

---

**🎉 Everything is now interlinked and ready to use!**

**Next Steps:**
1. Test the API connections
2. Update your components to use the API service
3. Deploy and test end-to-end
4. Monitor logs for any issues

**Your app is live at:** https://mindmend-25dca.web.app
