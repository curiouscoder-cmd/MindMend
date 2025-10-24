# MindMend AI - Google-Native Stack Migration
## Gemini 2.5 + Gemma 3 + Firestore Complete Modernization

---

## 📊 IMPLEMENTATION STATUS

| Component | Current | Target | Priority | Impact |
|-----------|---------|--------|----------|--------|
| **AI Models** |
| Chat AI | Gemini 1.5 Flash | Gemini 2.5 Flash/Pro | P0 | ⭐⭐⭐⭐⭐ |
| Multilingual | None | Gemma 3 (2B/9B/27B) | P1 | ⭐⭐⭐⭐⭐ |
| Multimodal | Basic | Gemini 2.5 Pro | P0 | ⭐⭐⭐⭐⭐ |
| **Database** |
| Primary DB | Supabase SQL | Firestore NoSQL | P0 | ⭐⭐⭐⭐⭐ |
| Real-time | Supabase | Firestore listeners | P0 | ⭐⭐⭐⭐⭐ |
| **Backend** |
| Functions | Netlify (9) | Firebase Gen 2 | P0 | ⭐⭐⭐⭐⭐ |
| Long-running | None | Cloud Run | P2 | ⭐⭐⭐⭐ |
| **Google Services** |
| Vision | None | Cloud Vision API | P1 | ⭐⭐⭐⭐ |
| NLP | None | Cloud Natural Language | P1 | ⭐⭐⭐⭐⭐ |
| Speech | Web API | Cloud STT/TTS | P1 | ⭐⭐⭐⭐ |
| Auth | None | Firebase Auth | P0 | ⭐⭐⭐⭐⭐ |
| Push | None | FCM | P2 | ⭐⭐⭐⭐ |
| Analytics | Custom | BigQuery + GA4 | P2 | ⭐⭐⭐⭐⭐ |
| Secrets | .env | Secret Manager | P1 | ⭐⭐⭐⭐ |
| CI/CD | None | Cloud Build | P2 | ⭐⭐⭐⭐ |

---

## 🧩 FIRESTORE SCHEMA

### Core Collections

```javascript
// users/{userId}
{
  profile: {
    displayName: string,
    email: string,
    preferredLanguage: string, // en, hi, ta, te, bn, mr, gu
    createdAt: timestamp,
    personalityTraits: {}
  },
  progress: {
    completedExercises: number,
    calmPoints: number,
    streak: number,
    level: number,
    badges: []
  },
  // Subcollection: moodEntries/{entryId}
}

// exercises/{exerciseId}
{
  type: string,
  title: { en: string, hi: string, ta: string },
  description: { en: string, hi: string },
  instructions: [{ en: string, hi: string }],
  duration: number,
  difficulty: string,
  effectiveness: number
}

// chatSessions/{userId}/messages/{messageId}
{
  role: string, // user, assistant
  content: string,
  contentMultilingual: { en: string, hi: string },
  timestamp: timestamp,
  model: string, // gemini-2.5-flash, gemma-3-2b
  sentiment: {},
  urgency: string // normal, high, critical
}

// community/posts/{postId}
{
  forumId: string,
  authorId: string, // anonymized
  content: string,
  language: string,
  timestamp: timestamp,
  likes: number,
  sentiment: {},
  // Subcollection: replies/{replyId}
}

// crisisInterventions/{interventionId}
{
  userId: string,
  triggerType: string,
  urgencyLevel: string,
  detectedBy: string, // gemini-2.5, cloud-nlp
  timestamp: timestamp,
  outcome: string
}
```

### Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      match /moodEntries/{entryId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    match /exercises/{exerciseId} {
      allow read: if isAuthenticated();
    }
    
    match /chatSessions/{userId}/messages/{messageId} {
      allow read, write: if isOwner(userId);
    }
    
    match /community/posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      
      match /replies/{replyId} {
        allow read, write: if isAuthenticated();
      }
    }
  }
}
```

---

## 🧠 GEMMA 3 → GEMINI 2.5 PIPELINE

### Architecture Flow

```
User Input (Hindi/English/Regional)
    ↓
[Gemma 3 2B] Language Detection (<50ms)
    ↓
[Gemma 3 9B] Preprocessing + Translation (<200ms)
    ↓
[Gemini 2.5 Flash] Fast responses (<500ms)
OR
[Gemini 2.5 Pro] Complex/Crisis (<2s)
    ↓
[Gemma 3 27B] Response Translation (<500ms)
    ↓
[Cloud NLP] Sentiment + Crisis Detection (<1s)
    ↓
Response (User's Language)
```

### Model Selection

| Use Case | Model | Latency | Reason |
|----------|-------|---------|--------|
| Language detect | Gemma 3 2B | <50ms | Lightweight |
| Translation | Gemma 3 9B | <200ms | Quality balance |
| Chat | Gemini 2.5 Flash | <500ms | Fast, accurate |
| Crisis/Complex | Gemini 2.5 Pro | <2s | Best quality |
| Cultural adapt | Gemma 3 27B | <500ms | Nuanced |

---

## 🔧 FIREBASE FUNCTIONS (Gen 2)

### Function List

```javascript
// functions/src/index.js
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';

// 1. Multilingual Chat
export const chat = onRequest({ cors: true }, async (req, res) => {
  // Gemma 3 → Gemini 2.5 pipeline
});

// 2. Mood Analysis
export const analyzeMood = onRequest({ cors: true }, async (req, res) => {
  // Cloud NLP + Gemini 2.5
});

// 3. Doodle Analysis
export const analyzeDoodle = onRequest({ cors: true }, async (req, res) => {
  // Cloud Vision API
});

// 4. Voice Transcription
export const transcribeVoice = onRequest({ cors: true }, async (req, res) => {
  // Cloud Speech-to-Text
});

// 5. Crisis Detection
export const detectCrisis = onDocumentCreated('chatSessions/{userId}/messages/{messageId}', 
  async (event) => {
    // Real-time crisis monitoring
  }
);

// 6. Daily Check-in Notifications
export const dailyCheckIn = onSchedule('every day 09:00', async () => {
  // FCM push notifications
});

// 7. BigQuery Export
export const exportToBigQuery = onSchedule('every 1 hours', async () => {
  // Analytics export
});

// 8. Exercise Recommendation
export const recommendExercise = onRequest({ cors: true }, async (req, res) => {
  // Gemini 2.5 personalized suggestions
});

// 9. Community Moderation
export const moderatePost = onDocumentCreated('community/posts/{postId}', 
  async (event) => {
    // Cloud NLP content moderation
  }
);
```

---

## 🔀 BRANCH & PR WORKFLOW

### Branch Structure

```
main (production)
  └── develop (staging)
      ├── feature/firestore-migration
      ├── feature/firebase-auth
      ├── feature/gemini-2-5-upgrade
      ├── feature/gemma-3-multilingual
      ├── feature/cloud-vision-doodles
      ├── feature/cloud-nlp-sentiment
      ├── feature/cloud-speech
      ├── feature/fcm-push
      ├── feature/bigquery-export
      ├── feature/cloud-run-websocket
      └── feature/ci-cd-pipeline
```

### PR Naming Convention

```
feat: add Firebase Authentication with Google Sign-In
feat: migrate database from Supabase to Firestore
feat: integrate Gemini 2.5 Flash for chat responses
feat: add Gemma 3 multilingual pipeline (Hindi support)
feat: implement Cloud Vision API for doodle analysis
feat: add Cloud Natural Language for crisis detection
feat: integrate Cloud Speech-to-Text for voice input
feat: add FCM push notifications
feat: set up BigQuery analytics export
feat: deploy Cloud Run service for WebSocket
feat: configure Cloud Build CI/CD pipeline
fix: resolve Firestore security rules issue
refactor: optimize Gemini 2.5 prompts for mental health
docs: update README with Google Cloud setup
```

### GitHub CLI Workflow

```bash
# Create feature branch
git checkout -b feature/firestore-migration

# Make changes, commit
git add .
git commit -m "feat: migrate users collection to Firestore"

# Push and create PR
git push -u origin feature/firestore-migration
gh pr create --title "feat: migrate database to Firestore NoSQL" \
  --body "Migrates from Supabase PostgreSQL to Firestore with new schema" \
  --base develop

# After review, merge
gh pr merge --squash --delete-branch
```

---

## 🗓️ 4-WEEK TIMELINE

### Week 1: Foundation (Firebase + Firestore)

**Days 1-2: Firebase Setup**
- [ ] Create Firebase project
- [ ] Enable APIs (Auth, Firestore, Functions, Storage, FCM)
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Initialize: `firebase init`
- [ ] Configure `.firebaserc` and `firebase.json`

**Days 3-4: Firebase Authentication**
- [ ] Implement auth service
- [ ] Add Google Sign-In
- [ ] Add anonymous auth
- [ ] Update all components with auth state
- [ ] Branch: `feature/firebase-auth`

**Days 5-7: Firestore Migration**
- [ ] Design Firestore schema
- [ ] Create migration script from Supabase
- [ ] Implement Firestore service
- [ ] Update all components to use Firestore
- [ ] Set up security rules
- [ ] Branch: `feature/firestore-migration`

**Deliverable**: Users can sign in, data stored in Firestore
**GCP Impact**: ⭐⭐⭐⭐⭐

---

### Week 2: AI Upgrade (Gemini 2.5 + Gemma 3)

**Days 1-2: Firebase Functions Gen 2**
- [ ] Set up Functions project
- [ ] Migrate 9 Netlify functions
- [ ] Deploy to Firebase
- [ ] Update frontend API calls
- [ ] Branch: `feature/firebase-functions`

**Days 3-4: Gemini 2.5 Integration**
- [ ] Upgrade to Vertex AI SDK
- [ ] Implement Gemini 2.5 Flash for chat
- [ ] Implement Gemini 2.5 Pro for crisis
- [ ] Optimize prompts for mental health
- [ ] Branch: `feature/gemini-2-5-upgrade`

**Days 5-7: Gemma 3 Multilingual**
- [ ] Integrate Gemma 3 2B (language detection)
- [ ] Integrate Gemma 3 9B (translation)
- [ ] Integrate Gemma 3 27B (cultural adaptation)
- [ ] Build multilingual pipeline
- [ ] Test Hindi, Tamil, Telugu
- [ ] Branch: `feature/gemma-3-multilingual`

**Deliverable**: Multilingual AI chat with Gemini 2.5 + Gemma 3
**GCP Impact**: ⭐⭐⭐⭐⭐

---

### Week 3: Advanced AI Services

**Days 1-2: Cloud Vision API**
- [ ] Enable Cloud Vision API
- [ ] Implement doodle analysis function
- [ ] Extract colors, shapes, emotions
- [ ] Update DoodleMoodInput component
- [ ] Branch: `feature/cloud-vision-doodles`

**Days 3-4: Cloud Natural Language**
- [ ] Enable Cloud NLP API
- [ ] Implement sentiment analysis
- [ ] Add crisis keyword detection
- [ ] Real-time monitoring
- [ ] Branch: `feature/cloud-nlp-sentiment`

**Days 5-7: Cloud Speech APIs**
- [ ] Enable Cloud Speech-to-Text
- [ ] Enable Cloud Text-to-Speech
- [ ] Replace Web Speech API
- [ ] Add multilingual voice support
- [ ] Branch: `feature/cloud-speech`

**Deliverable**: Multimodal AI (text, voice, doodle) with advanced analysis
**GCP Impact**: ⭐⭐⭐⭐⭐

---

### Week 4: Production & Analytics

**Days 1-2: FCM Push Notifications**
- [ ] Set up FCM
- [ ] Implement notification service
- [ ] Create scheduled functions
- [ ] Test on devices
- [ ] Branch: `feature/fcm-push`

**Days 3-4: BigQuery Analytics**
- [ ] Create BigQuery dataset
- [ ] Set up export functions
- [ ] Create analytics dashboard
- [ ] Build SQL queries
- [ ] Branch: `feature/bigquery-export`

**Days 5-6: Cloud Run + CI/CD**
- [ ] Create Cloud Run service (WebSocket)
- [ ] Set up Cloud Build
- [ ] Configure GitHub Actions
- [ ] Deploy pipeline
- [ ] Branch: `feature/cloud-run-cicd`

**Day 7: Final Testing & Demo**
- [ ] E2E testing
- [ ] Performance optimization
- [ ] Demo video recording
- [ ] Documentation update

**Deliverable**: Production-ready app with full Google Cloud stack
**GCP Impact**: ⭐⭐⭐⭐⭐

---

## 🧪 TESTING CHECKLIST

### Week 1 Validation
- [ ] Firebase Auth: Users can sign in with Google
- [ ] Firestore: Data persists correctly
- [ ] Security rules: Unauthorized access blocked
- [ ] Offline: Firestore offline mode works

### Week 2 Validation
- [ ] Gemini 2.5 Flash: Chat responses <500ms
- [ ] Gemini 2.5 Pro: Crisis detection accurate
- [ ] Gemma 3: Hindi translation quality good
- [ ] Pipeline: End-to-end multilingual flow works

### Week 3 Validation
- [ ] Cloud Vision: Doodle mood detection accurate
- [ ] Cloud NLP: Sentiment scores correct
- [ ] Cloud STT: Voice transcription accurate
- [ ] Multimodal: All input methods work

### Week 4 Validation
- [ ] FCM: Notifications delivered
- [ ] BigQuery: Data exported correctly
- [ ] Cloud Run: WebSocket connections stable
- [ ] CI/CD: Automated deployment works

---

## 📈 EXPECTED HACKATHON SCORE

| Category | Current | Target | Improvement |
|----------|---------|--------|-------------|
| Innovation | 15/25 | 24/25 | +9 |
| Technical | 12/25 | 25/25 | +13 |
| GCP Integration | 5/25 | 25/25 | +20 |
| Social Impact | 20/25 | 24/25 | +4 |
| **TOTAL** | **52/100** | **98/100** | **+46** |

---

**Next Step**: Begin Week 1 with Firebase project setup
