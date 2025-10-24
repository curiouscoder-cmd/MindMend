# MindMend AI - Complete Deployment Guide

## 🚀 Quick Start (15 minutes)

### Prerequisites
- Node.js 20+
- Firebase CLI
- Google Cloud account
- GitHub account

---

## Step 1: Firebase Project Setup (5 min)

### 1.1 Create Firebase Project
```bash
# Go to https://console.firebase.google.com
# Click "Add project"
# Project name: mindmend-ai
# Enable Google Analytics: Yes
```

### 1.2 Enable Firebase Services
```bash
# In Firebase Console:
# 1. Authentication → Enable Google & Anonymous
# 2. Firestore Database → Create (test mode, asia-south1)
# 3. Storage → Get started
# 4. Cloud Messaging → Get VAPID key
```

### 1.3 Get Firebase Config
```bash
# Project Settings → Your apps → Web
# Copy the config object
```

---

## Step 2: Google Cloud Setup (5 min)

### 2.1 Enable APIs
```bash
gcloud config set project mindmend-ai

# Enable all required APIs
gcloud services enable \
  aiplatform.googleapis.com \
  vision.googleapis.com \
  language.googleapis.com \
  speech.googleapis.com \
  texttospeech.googleapis.com \
  bigquery.googleapis.com \
  cloudmessaging.googleapis.com
```

### 2.2 Create Service Account
```bash
gcloud iam service-accounts create mindmend-functions \
  --display-name="MindMend Functions"

# Grant permissions
gcloud projects add-iam-policy-binding mindmend-ai \
  --member="serviceAccount:mindmend-functions@mindmend-ai.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding mindmend-ai \
  --member="serviceAccount:mindmend-functions@mindmend-ai.iam.gserviceaccount.com" \
  --role="roles/bigquery.dataEditor"
```

---

## Step 3: Local Setup (3 min)

### 3.1 Clone & Install
```bash
git clone https://github.com/curiouscoder-cmd/MindMend.git
cd MindMend
npm install
cd functions && npm install && cd ..
```

### 3.2 Configure Environment
```bash
# Create .env.local
cp .env.example .env.local

# Edit .env.local with your Firebase config
nano .env.local
```

**Required Variables:**
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=mindmend-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindmend-ai
VITE_FIREBASE_STORAGE_BUCKET=mindmend-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
VITE_FIREBASE_VAPID_KEY=BNx...
VITE_FUNCTIONS_URL=https://asia-south1-mindmend-ai.cloudfunctions.net

GCP_PROJECT_ID=mindmend-ai
GCP_LOCATION=asia-south1
```

### 3.3 Update Service Worker
```bash
# Edit public/firebase-messaging-sw.js
# Replace YOUR_* placeholders with your Firebase config
```

---

## Step 4: Firebase Functions Deployment (2 min)

### 4.1 Login & Initialize
```bash
firebase login
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage

# Choose existing project: mindmend-ai
# Functions language: JavaScript
# Hosting directory: dist
```

### 4.2 Deploy Functions
```bash
cd functions
npm install
cd ..

# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:chatMultilingual,functions:voiceChat
```

### 4.3 Initialize BigQuery
```bash
# Call the initialization endpoint once
curl -X POST https://asia-south1-mindmend-ai.cloudfunctions.net/initializeBigQuery
```

---

## Step 5: Frontend Deployment

### Option A: Firebase Hosting (Recommended)
```bash
npm run build
firebase deploy --only hosting
```

### Option B: Netlify
```bash
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## Step 6: Testing (5 min)

### 6.1 Test Authentication
```bash
npm run dev
# Visit http://localhost:5173
# Click "Continue with Google"
# Verify login works
```

### 6.2 Test AI Chat
```bash
# In the app:
# 1. Go to AI Coach
# 2. Send message: "I'm feeling anxious"
# 3. Verify response in English
# 4. Send message in Hindi: "मुझे चिंता हो रही है"
# 5. Verify Hindi response
```

### 6.3 Test Voice Chat
```bash
# 1. Click microphone icon
# 2. Allow microphone access
# 3. Speak: "I need help with stress"
# 4. Verify transcription and voice response
```

### 6.4 Test Notifications
```bash
# 1. Allow notifications when prompted
# 2. Check browser console for FCM token
# 3. Send test notification:
curl -X POST https://asia-south1-mindmend-ai.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "Test Notification",
    "body": "This is a test"
  }'
```

---

## Step 7: Production Checklist

### Security
- [ ] Update Firestore rules to production mode
- [ ] Enable App Check
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Enable Secret Manager for API keys

### Performance
- [ ] Enable Cloud CDN
- [ ] Set up caching headers
- [ ] Optimize images
- [ ] Enable compression

### Monitoring
- [ ] Set up Cloud Monitoring alerts
- [ ] Enable Error Reporting
- [ ] Configure logging
- [ ] Set up uptime checks

### Compliance
- [ ] Add Privacy Policy
- [ ] Add Terms of Service
- [ ] GDPR compliance (if EU users)
- [ ] Add cookie consent

---

## Architecture Overview

```
User Device
    ↓
Firebase Auth → Login/Signup
    ↓
React App (Vite)
    ↓
Firebase Functions (Gen 2)
    ├── chatMultilingual → Gemma 3 + Gemini 2.5
    ├── voiceChat → Speech-to-Text + AI + Text-to-Speech
    ├── analyzeMood → Cloud NLP
    ├── analyzeDoodle → Cloud Vision
    └── notifications → FCM
    ↓
Firestore (Database)
    ↓
BigQuery (Analytics)
```

---

## Cost Estimates (Monthly)

**Free Tier Usage** (< 1000 users):
- Firebase Auth: Free
- Firestore: Free (1GB storage, 50K reads)
- Functions: Free (2M invocations)
- Vertex AI: ~$10-20
- Cloud Speech/TTS: ~$5-10
- BigQuery: Free (1TB queries)

**Total**: ~$15-30/month for < 1000 users

**Scaling** (10K users):
- Firebase: ~$25
- Vertex AI: ~$100-200
- Cloud Speech/TTS: ~$50-100
- BigQuery: ~$20

**Total**: ~$195-345/month for 10K users

---

## Troubleshooting

### Functions not deploying
```bash
# Check Node version
node --version  # Should be 20+

# Clear cache
rm -rf node_modules functions/node_modules
npm install
cd functions && npm install
```

### CORS errors
```bash
# Update functions to include CORS
# Already configured in all functions with: cors: true
```

### BigQuery errors
```bash
# Verify dataset exists
bq ls --project_id=mindmend-ai

# Create manually if needed
bq mk --dataset mindmend-ai:mindmend_analytics
```

### Voice not working
```bash
# Check microphone permissions
# Verify HTTPS (required for getUserMedia)
# Check browser console for errors
```

---

## Support & Resources

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Firebase Console**: https://console.firebase.google.com
- **GCP Console**: https://console.cloud.google.com

---

## Next Steps

1. ✅ Complete deployment
2. ✅ Test all features
3. ✅ Monitor logs for 24 hours
4. ✅ Set up alerts
5. ✅ Launch! 🚀

---

**Deployment Time**: ~30 minutes total
**Difficulty**: Medium
**Prerequisites**: Firebase account, GCP account
