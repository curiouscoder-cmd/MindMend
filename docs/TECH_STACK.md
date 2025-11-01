# MindMend AI - Complete Tech Stack

## 🏗️ Architecture

**Type**: Serverless, Cloud-Native, AI-First
**Deployment**: Firebase Hosting + Cloud Functions
**Database**: Firestore (NoSQL) + BigQuery (Analytics)

---

## 🎨 Frontend

### Core Framework
- **React 19** - UI library
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animations

### State Management
- React Hooks (useState, useEffect, useContext)
- Custom hooks for Firestore

### Key Libraries
- `firebase` - Firebase SDK
- `lucide-react` - Icons
- `date-fns` - Date utilities

---

## ⚡ Backend (Firebase Functions Gen 2)

### Runtime
- **Node.js 20**
- **ES Modules** (Pure ESM)
- **Serverless** (Auto-scaling)

### Functions (20+)
1. **Chat Functions**
   - `chat` - Basic Gemini 2.5 chat
   - `chatMultilingual` - Gemma 3 + Gemini 2.5 pipeline
   - `voiceChat` - End-to-end voice pipeline

2. **Analysis Functions**
   - `analyzeMood` - Cloud Natural Language
   - `analyzeDoodle` - Cloud Vision
   - `speechToText` - Cloud Speech-to-Text
   - `textToSpeech` - Cloud Text-to-Speech

3. **Notification Functions**
   - `sendNotification` - Send push notifications
   - `registerToken` - Register FCM tokens
   - `sendDailyReminder` - Scheduled reminders
   - `onStreakMilestone` - Firestore trigger
   - `onCrisisDetected` - Firestore trigger

4. **Analytics Functions**
   - `exportMoodEntry` - BigQuery export
   - `exportChatMessage` - BigQuery export
   - `exportExerciseCompletion` - BigQuery export
   - `getAnalyticsDashboard` - Dashboard data
   - `getUserInsights` - User analytics
   - `initializeBigQuery` - Setup tables

---

## 🤖 AI/ML Stack

### Vertex AI Models

#### Gemini 2.5 (Google)
- **gemini-2.5-flash** - Fast responses (<500ms)
  - Use case: Normal conversations
  - Cost: $0.075 per 1M tokens
  
- **gemini-2.5-pro** - Complex reasoning (<2s)
  - Use case: Crisis detection, complex queries
  - Cost: $1.25 per 1M tokens

#### Gemma 3 (Google)
- **gemma-2-2b-it** - Language detection (<50ms)
  - Use case: Detect user's language
  - Cost: $0.10 per 1M tokens
  
- **gemma-2-9b-it** - Translation & preprocessing (<200ms)
  - Use case: Translate to/from English, extract intent
  - Cost: $0.20 per 1M tokens
  
- **gemma-2-27b-it** - High-quality translation (<500ms)
  - Use case: Translate AI responses to local language
  - Cost: $0.27 per 1M tokens

### Cloud AI APIs

#### Cloud Vision API
- Image analysis for doodle mood detection
- Color analysis, label detection, face detection
- Cost: $1.50 per 1000 images

#### Cloud Natural Language API
- Sentiment analysis
- Entity recognition
- Multilingual support
- Cost: $1.00 per 1000 documents

#### Cloud Speech-to-Text
- 10 Indian languages support
- Auto language detection
- Enhanced models
- Cost: $0.024 per minute

#### Cloud Text-to-Speech
- WaveNet voices (premium quality)
- 10 Indian languages
- Female voices for all languages
- Cost: $16 per 1M characters

---

## 🗄️ Database & Storage

### Cloud Firestore
- **Type**: NoSQL, Document-based
- **Features**:
  - Real-time sync
  - Offline persistence
  - Security rules
  - Automatic indexing

**Collections**:
```
users/{userId}
  ├── profile
  ├── progress
  ├── preferences
  └── moodEntries/{entryId}

chatSessions/{userId}/messages/{messageId}

exerciseCompletions/{userId}/sessions/{sessionId}

community/posts/{postId}
  └── replies/{replyId}

crisisInterventions/{interventionId}
```

### BigQuery
- **Type**: Data warehouse
- **Features**:
  - Petabyte-scale analytics
  - SQL queries
  - Real-time insights
  - ML integration

**Tables**:
- `mood_entries` - All mood logs
- `chat_messages` - All conversations
- `exercise_completions` - All exercises

### Cloud Storage
- User uploads (doodles, voice recordings)
- Profile pictures
- Generated content

---

## 🔐 Authentication & Security

### Firebase Authentication
- Google Sign-In
- Anonymous authentication
- Session management
- Token refresh

### Security Features
- Firestore security rules
- HTTPS only
- CORS configuration
- Rate limiting
- Input validation

---

## 📊 Analytics & Monitoring

### Firebase Analytics
- User engagement
- Feature usage
- Conversion tracking

### BigQuery Analytics
- Custom queries
- Trend analysis
- User insights
- Performance metrics

### Cloud Monitoring
- Function performance
- Error tracking
- Uptime monitoring
- Alerts

---

## 🔔 Notifications

### Firebase Cloud Messaging (FCM)
- Push notifications
- Background messages
- Foreground messages
- Multi-device support

**Notification Types**:
- Daily wellness reminders
- Streak milestones
- Crisis support alerts
- Custom messages

---

## 🌍 Multilingual Support

### Supported Languages (10)
1. English (en)
2. Hindi (hi) - हिंदी
3. Tamil (ta) - தமிழ்
4. Telugu (te) - తెలుగు
5. Bengali (bn) - বাংলা
6. Marathi (mr) - मराठी
7. Gujarati (gu) - ગુજરાતી
8. Kannada (kn) - ಕನ್ನಡ
9. Malayalam (ml) - മലയാളം
10. Punjabi (pa) - ਪੰਜਾਬੀ

### Translation Pipeline
```
User Input (any language)
    ↓
Gemma 2B: Detect language (<50ms)
    ↓
Gemma 9B: Translate to English (<200ms)
    ↓
Gemma 9B: Extract intent/emotion (<200ms)
    ↓
Gemini 2.5: Generate response (<500ms)
    ↓
Gemma 27B: Translate to user's language (<500ms)
    ↓
Response in user's language
```

**Total Pipeline**: <1.5s (Flash) / <3s (Pro)

---

## 🎯 Performance Targets

### Response Times
- Text chat: <500ms (Flash) / <2s (Pro)
- Voice chat: <3s total
- Mood analysis: <1s
- Doodle analysis: <2s
- Language detection: <50ms

### Scalability
- Auto-scaling functions
- Firestore: 1M+ concurrent connections
- BigQuery: Petabyte-scale
- Global CDN

---

## 💰 Cost Optimization

### Strategies
1. **Smart Model Selection**
   - Flash for normal queries
   - Pro only for crisis/complex

2. **Caching**
   - Firestore offline persistence
   - Browser caching
   - CDN caching

3. **Batch Operations**
   - BigQuery batch inserts
   - Bulk notifications

4. **Free Tiers**
   - Firebase: 50K reads/day
   - Functions: 2M invocations/month
   - BigQuery: 1TB queries/month

---

## 🔧 Development Tools

### Build & Dev
- Vite (dev server)
- ESLint (linting)
- Prettier (formatting)
- Firebase Emulators (local testing)

### Testing
- Firebase Functions Test
- Jest (unit tests)
- Playwright (E2E tests)

### CI/CD
- GitHub Actions
- Firebase Hosting
- Automated deployments

---

## 📦 Dependencies

### Frontend
```json
{
  "react": "^19.0.0",
  "firebase": "^11.1.0",
  "framer-motion": "^11.0.0",
  "tailwindcss": "^3.4.0"
}
```

### Backend (Functions)
```json
{
  "@google-cloud/aiplatform": "^3.28.0",
  "@google-cloud/vision": "^4.3.2",
  "@google-cloud/language": "^6.3.2",
  "@google-cloud/speech": "^6.7.0",
  "@google-cloud/text-to-speech": "^5.4.0",
  "@google-cloud/bigquery": "^7.3.0",
  "firebase-admin": "^12.0.0",
  "firebase-functions": "^5.0.0"
}
```

---

## 🏆 Hackathon Highlights

### Google Cloud Services (12)
1. ✅ Firebase Authentication
2. ✅ Cloud Firestore
3. ✅ Cloud Storage
4. ✅ Firebase Functions Gen 2
5. ✅ Vertex AI (Gemini 2.5)
6. ✅ Vertex AI (Gemma 3)
7. ✅ Cloud Vision
8. ✅ Cloud Natural Language
9. ✅ Cloud Speech-to-Text
10. ✅ Cloud Text-to-Speech
11. ✅ Firebase Cloud Messaging
12. ✅ BigQuery

### Innovation Points
- 🌍 10 Indian languages support
- 🎤 Voice-enabled multilingual chat
- 🎨 Doodle mood analysis
- 🚨 AI-powered crisis detection
- 📊 Real-time analytics
- 🔔 Smart notifications

---

## 📈 Scalability

**Current Capacity**: 10K+ concurrent users
**Database**: Unlimited (Firestore auto-scales)
**Functions**: Auto-scaling (0 to 1000s instances)
**Cost at Scale**: ~$200-400/month for 10K users

---

**Total Lines of Code**: ~8,000+
**Functions**: 20+
**Components**: 30+
**Services**: 12
**Languages**: 10
