# MindMend AI - Google Cloud Implementation Guide
## Step-by-Step Migration from Supabase/Netlify to Firebase/GCP

---

## 🚀 WEEK 1: FIREBASE FOUNDATION

### Day 1-2: Firebase Project Setup

#### Step 1: Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Google Cloud
firebase login

# Create new project (or use existing)
firebase projects:create mindmend-ai --display-name "MindMend AI"

# Set project
firebase use mindmend-ai
```

#### Step 2: Enable Required APIs
```bash
# Enable via gcloud CLI
gcloud services enable \
  firestore.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudscheduler.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  vision.googleapis.com \
  language.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  bigquery.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com
```

#### Step 3: Initialize Firebase in Project
```bash
cd /Users/greenhacker/Desktop/gitRepos/MindMend

# Initialize Firebase
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage
# - Emulators

# Choose:
# - JavaScript (not TypeScript for consistency)
# - ESLint: Yes
# - Install dependencies: Yes
```

#### Step 4: Install Dependencies
```bash
# Frontend dependencies
npm install firebase

# Functions dependencies
cd functions
npm install @google-cloud/aiplatform \
  @google-cloud/vision \
  @google-cloud/language \
  @google-cloud/speech \
  @google-cloud/text-to-speech \
  @google-cloud/bigquery \
  firebase-admin \
  firebase-functions
cd ..
```

#### Step 5: Configure Environment
```bash
# Create .env.local
cat > .env.local << EOF
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=mindmend-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindmend-ai
VITE_FIREBASE_STORAGE_BUCKET=mindmend-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# GCP Settings
GCP_PROJECT_ID=mindmend-ai
GCP_LOCATION=us-central1
EOF

# Add to .gitignore
echo ".env.local" >> .gitignore
```

---

### Day 3-4: Firebase Authentication

#### Create Auth Service
```javascript
// src/services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
```

```javascript
// src/services/authService.js
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebaseConfig';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signInAnonymous = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
```

#### Create Login Component
```javascript
// src/components/Login.jsx
import React, { useState } from 'react';
import { signInWithGoogle, signInAnonymous } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      onLoginSuccess(user);
    } catch (error) {
      alert('Sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInAnonymous();
      onLoginSuccess(user);
    } catch (error) {
      alert('Anonymous sign-in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky to-mint">
      <div className="bg-white p-8 rounded-2xl shadow-elevated max-w-md w-full">
        <h1 className="text-3xl font-bold text-navy mb-2">Welcome to MindMend</h1>
        <p className="text-gray-600 mb-8">Your AI-powered mental wellness companion</p>
        
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg mb-4 flex items-center justify-center hover:bg-gray-50 transition"
        >
          <img src="/google-icon.svg" alt="Google" className="w-6 h-6 mr-3" />
          Continue with Google
        </button>
        
        <button
          onClick={handleAnonymousSignIn}
          disabled={loading}
          className="w-full bg-ocean text-white py-3 rounded-lg hover:bg-highlight transition"
        >
          Continue Anonymously
        </button>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;
```

#### Update App.jsx
```javascript
// src/App.jsx - Add auth state
import { useState, useEffect } from 'react';
import { onAuthChange } from './services/authService';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean"></div>
    </div>;
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  // Rest of your app...
  return (
    <div className="App">
      {/* Your existing components */}
    </div>
  );
}
```

---

### Day 5-7: Firestore Migration

#### Create Firestore Service
```javascript
// src/services/firestoreService.js
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence enabled in first tab only');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support persistence');
  }
});

// User operations
export const createUserProfile = async (userId, profileData) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    profile: {
      ...profileData,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    },
    progress: {
      completedExercises: 0,
      calmPoints: 0,
      streak: 0,
      level: 1,
      badges: [],
    },
    preferences: {
      notificationsEnabled: true,
      voiceEnabled: true,
      preferredLanguage: 'en',
      theme: 'light',
    },
  });
};

export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const updateUserProgress = async (userId, progressData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    'progress': progressData,
    'profile.lastActive': serverTimestamp(),
  });
};

// Mood entries
export const saveMoodEntry = async (userId, moodData) => {
  const moodRef = doc(collection(db, 'users', userId, 'moodEntries'));
  await setDoc(moodRef, {
    ...moodData,
    timestamp: serverTimestamp(),
  });
  return moodRef.id;
};

export const getMoodHistory = async (userId, days = 30) => {
  const moodRef = collection(db, 'users', userId, 'moodEntries');
  const q = query(
    moodRef,
    orderBy('timestamp', 'desc'),
    limit(days)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time mood listener
export const subscribeMoodEntries = (userId, callback) => {
  const moodRef = collection(db, 'users', userId, 'moodEntries');
  const q = query(moodRef, orderBy('timestamp', 'desc'), limit(10));
  
  return onSnapshot(q, (snapshot) => {
    const moods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(moods);
  });
};

// Chat messages
export const saveChatMessage = async (userId, messageData) => {
  const messageRef = doc(collection(db, 'chatSessions', userId, 'messages'));
  await setDoc(messageRef, {
    ...messageData,
    timestamp: serverTimestamp(),
  });
  return messageRef.id;
};

export const getChatHistory = async (userId, limitCount = 50) => {
  const messagesRef = collection(db, 'chatSessions', userId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Community posts
export const createPost = async (postData) => {
  const postRef = doc(collection(db, 'community', 'posts'));
  await setDoc(postRef, {
    ...postData,
    timestamp: serverTimestamp(),
    likes: 0,
    replyCount: 0,
  });
  return postRef.id;
};

export const getPosts = async (forumId, limitCount = 20) => {
  const postsRef = collection(db, 'community', 'posts');
  const q = query(
    postsRef,
    where('forumId', '==', forumId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Exercise completions
export const saveExerciseCompletion = async (userId, exerciseData) => {
  const sessionRef = doc(collection(db, 'exerciseCompletions', userId, 'sessions'));
  await setDoc(sessionRef, {
    ...exerciseData,
    startTime: serverTimestamp(),
  });
  return sessionRef.id;
};

export default {
  createUserProfile,
  getUserProfile,
  updateUserProgress,
  saveMoodEntry,
  getMoodHistory,
  subscribeMoodEntries,
  saveChatMessage,
  getChatHistory,
  createPost,
  getPosts,
  saveExerciseCompletion,
};
```

#### Migration Script
```javascript
// scripts/migrateToFirestore.js
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function migrateUsers() {
  const { data: users } = await supabase.from('users').select('*');
  
  for (const user of users) {
    await db.collection('users').doc(user.id).set({
      profile: {
        displayName: user.display_name,
        email: user.email,
        createdAt: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
      },
      progress: {
        completedExercises: user.completed_exercises || 0,
        calmPoints: user.calm_points || 0,
        streak: user.streak || 0,
        level: user.level || 1,
      },
    });
  }
  console.log(`Migrated ${users.length} users`);
}

async function migrateMoodEntries() {
  const { data: moods } = await supabase.from('mood_entries').select('*');
  
  for (const mood of moods) {
    await db.collection('users').doc(mood.user_id)
      .collection('moodEntries').doc(mood.id).set({
        mood: mood.mood,
        intensity: mood.intensity,
        triggers: mood.triggers || [],
        timestamp: admin.firestore.Timestamp.fromDate(new Date(mood.created_at)),
      });
  }
  console.log(`Migrated ${moods.length} mood entries`);
}

async function migrate() {
  await migrateUsers();
  await migrateMoodEntries();
  console.log('Migration complete!');
}

migrate();
```

---

## 🧠 WEEK 2: AI UPGRADE

### Day 1-2: Firebase Functions Setup

#### Initialize Functions
```javascript
// functions/src/index.js
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
});

// Import function modules
import { chat } from './chat.js';
import { analyzeMood } from './analyzeMood.js';
import { analyzeDoodle } from './analyzeDoodle.js';
import { transcribeVoice } from './transcribeVoice.js';
import { detectCrisis } from './detectCrisis.js';

export { 
  chat, 
  analyzeMood, 
  analyzeDoodle, 
  transcribeVoice,
  detectCrisis 
};
```

### Day 3-4: Gemini 2.5 Integration

```javascript
// functions/src/chat.js
import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/aiplatform';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: 'us-central1',
});

export const chat = onRequest({ 
  cors: true,
  secrets: ['VERTEX_AI_KEY']
}, async (req, res) => {
  try {
    const { message, moodHistory, userProgress, language = 'en' } = req.body;
    
    // Choose model based on complexity
    const modelName = message.length > 500 || moodHistory?.some(m => m === 'crisis')
      ? 'gemini-2.5-pro'
      : 'gemini-2.5-flash';
    
    const model = vertexAI.preview.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 512,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });
    
    const prompt = `You are Mira, an empathetic AI mental wellness coach for Indian youth.

User Context:
- Recent moods: ${moodHistory?.slice(-5).join(', ') || 'none'}
- Completed exercises: ${userProgress?.completedExercises || 0}
- Current streak: ${userProgress?.streak || 0} days
- Language: ${language}

Guidelines:
- Be warm, empathetic, culturally sensitive to Indian context
- Use evidence-based CBT techniques
- Keep responses concise (2-3 sentences)
- Suggest specific exercises when appropriate
- If detecting crisis, prioritize immediate coping strategies

User: "${message}"

Response:`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({
      response,
      model: modelName,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});
```

### Day 5-7: Gemma 3 Multilingual Pipeline

```javascript
// functions/src/services/multilingualPipeline.js
import { VertexAI } from '@google-cloud/aiplatform';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: 'us-central1',
});

const LANGUAGES = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
  bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati',
};

export async function detectLanguage(text) {
  const gemma2B = vertexAI.preview.getGenerativeModel({
    model: 'gemma-3-2b-it',
    generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
  });
  
  const result = await gemma2B.generateContent(
    `Detect language. Reply only with code (en/hi/ta/te/bn/mr/gu): "${text}"`
  );
  
  const lang = result.response.text().trim().toLowerCase();
  return LANGUAGES[lang] ? lang : 'en';
}

export async function translateToEnglish(text, sourceLang) {
  if (sourceLang === 'en') return text;
  
  const gemma9B = vertexAI.preview.getGenerativeModel({
    model: 'gemma-3-9b-it',
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
  });
  
  const result = await gemma9B.generateContent(
    `Translate ${LANGUAGES[sourceLang]} to English. Preserve emotional context:\n"${text}"`
  );
  
  return result.response.text().trim();
}

export async function translateFromEnglish(text, targetLang) {
  if (targetLang === 'en') return text;
  
  const gemma27B = vertexAI.preview.getGenerativeModel({
    model: 'gemma-3-27b-it',
    generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
  });
  
  const result = await gemma27B.generateContent(
    `Translate to ${LANGUAGES[targetLang]}. Maintain empathetic tone:\n"${text}"`
  );
  
  return result.response.text().trim();
}

export async function processMultilingual(userInput, userContext) {
  const language = await detectLanguage(userInput);
  const englishInput = await translateToEnglish(userInput, language);
  
  // Process with Gemini 2.5 (in English)
  // ... (call Gemini here)
  
  const localizedResponse = await translateFromEnglish(englishResponse, language);
  
  return { response: localizedResponse, language };
}
```

---

## ☁️ WEEK 3: ADVANCED AI SERVICES

### Cloud Vision API for Doodles

```javascript
// functions/src/analyzeDoodle.js
import { onRequest } from 'firebase-functions/v2/https';
import vision from '@google-cloud/vision';

export const analyzeDoodle = onRequest({ cors: true }, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const client = new vision.ImageAnnotatorClient();
    
    const [result] = await client.annotateImage({
      image: { content: imageBase64 },
      features: [
        { type: 'IMAGE_PROPERTIES' },
        { type: 'LABEL_DETECTION' },
        { type: 'FACE_DETECTION' },
      ],
    });
    
    const colors = result.imagePropertiesAnnotation.dominantColors.colors;
    const labels = result.labelAnnotations?.map(l => l.description) || [];
    
    // Mood analysis from colors
    const avgBrightness = colors.reduce((sum, c) => 
      sum + (c.color.red + c.color.green + c.color.blue) / 3, 0
    ) / colors.length;
    
    const warmColors = colors.filter(c => c.color.red > c.color.blue).length;
    const coolColors = colors.filter(c => c.color.blue > c.color.red).length;
    
    let mood = 'calm';
    if (avgBrightness > 180 && warmColors > coolColors) mood = 'happy';
    else if (avgBrightness < 80) mood = 'sad';
    else if (coolColors > warmColors) mood = 'anxious';
    
    res.json({
      mood,
      labels,
      confidence: 0.85,
      analysis: {
        brightness: avgBrightness,
        warmColors,
        coolColors,
      },
    });
    
  } catch (error) {
    console.error('Doodle analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
```

### Cloud Natural Language for Sentiment

```javascript
// functions/src/analyzeMood.js
import { onRequest } from 'firebase-functions/v2/https';
import language from '@google-cloud/language';

export const analyzeMood = onRequest({ cors: true }, async (req, res) => {
  try {
    const { text, language: lang = 'en' } = req.body;
    const client = new language.LanguageServiceClient();
    
    const [result] = await client.analyzeSentiment({
      document: { content: text, type: 'PLAIN_TEXT', language: lang },
    });
    
    const sentiment = result.documentSentiment;
    
    // Crisis detection
    const crisisKeywords = {
      en: ['suicide', 'kill myself', 'end it all', 'self-harm'],
      hi: ['आत्महत्या', 'मरना चाहता', 'खुद को नुकसान'],
    };
    
    const keywords = crisisKeywords[lang] || crisisKeywords.en;
    const hasCrisis = keywords.some(k => text.toLowerCase().includes(k));
    
    res.json({
      score: sentiment.score,
      magnitude: sentiment.magnitude,
      urgency: hasCrisis ? 'critical' : 
               sentiment.score < -0.6 ? 'high' :
               sentiment.score < -0.3 ? 'medium' : 'low',
      hasCrisisIndicators: hasCrisis,
    });
    
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
```

---

## 📱 WEEK 4: PRODUCTION READY

### FCM Push Notifications

```javascript
// functions/src/scheduledNotifications.js
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';

export const dailyCheckIn = onSchedule('every day 09:00', async () => {
  const db = getFirestore();
  const messaging = getMessaging();
  
  const usersSnapshot = await db.collection('users')
    .where('preferences.notificationsEnabled', '==', true)
    .get();
  
  const messages = [];
  
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    const fcmToken = userData.fcmToken;
    const lang = userData.preferences?.preferredLanguage || 'en';
    
    if (fcmToken) {
      messages.push({
        token: fcmToken,
        notification: {
          title: lang === 'hi' ? '🌅 सुप्रभात!' : '🌅 Good morning!',
          body: lang === 'hi' ? 'आज आप कैसा महसूस कर रहे हैं?' : 'How are you feeling today?',
        },
        data: { type: 'daily_checkin' },
      });
    }
  }
  
  if (messages.length > 0) {
    await messaging.sendEach(messages);
    console.log(`Sent ${messages.length} notifications`);
  }
});
```

### BigQuery Export

```javascript
// functions/src/exportToBigQuery.js
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { BigQuery } from '@google-cloud/bigquery';
import { getFirestore } from 'firebase-admin/firestore';

export const exportMetrics = onSchedule('every 1 hours', async () => {
  const db = getFirestore();
  const bigquery = new BigQuery();
  const dataset = bigquery.dataset('mindmend_analytics');
  
  // Export user sessions
  const sessionsSnapshot = await db.collectionGroup('sessions')
    .where('startTime', '>', new Date(Date.now() - 3600000))
    .get();
  
  const rows = sessionsSnapshot.docs.map(doc => ({
    user_id: doc.ref.parent.parent.id,
    session_id: doc.id,
    timestamp: doc.data().startTime.toDate(),
    duration: doc.data().duration || 0,
    features_used: doc.data().featuresUsed || [],
    language: doc.data().language || 'en',
  }));
  
  if (rows.length > 0) {
    await dataset.table('user_sessions').insert(rows);
    console.log(`Exported ${rows.length} sessions to BigQuery`);
  }
});
```

---

## 🔧 CI/CD PIPELINE

### Cloud Build Configuration

```yaml
# cloudbuild.yaml
steps:
  # Install dependencies
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['ci']
  
  # Run tests
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['test']
  
  # Build frontend
  - name: 'node:20'
    entrypoint: 'npm'
    args: ['run', 'build']
  
  # Deploy to Firebase Hosting
  - name: 'gcr.io/PROJECT_ID/firebase'
    args: ['deploy', '--only', 'hosting']
  
  # Deploy Functions
  - name: 'gcr.io/PROJECT_ID/firebase'
    args: ['deploy', '--only', 'functions']

timeout: '1200s'
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Firebase
      if: github.ref == 'refs/heads/main'
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: mindmend-ai
```

---

**Next**: Start with Day 1 Firebase setup
