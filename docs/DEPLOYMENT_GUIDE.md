# MindMend AI - Complete Deployment Guide

## Prerequisites

### 1. Install Required Tools

```bash
# Node.js 22+ (already installed: v24.6.0)
node --version

# Firebase CLI
npm install -g firebase-tools

# Verify installation
firebase --version
```

### 2. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Verify you're logged in
firebase projects:list

# Should show: mindmend-25dca (current project)
```

---

## Quick Deployment (Automated)

### Option 1: One-Command Deployment

```bash
# Run the automated deployment script
./deploy.sh
```

This script will:
1. ✅ Install all dependencies
2. ✅ Run tests
3. ✅ Build the frontend
4. ✅ Deploy Firebase Functions
5. ✅ Deploy Firestore rules/indexes
6. ✅ Deploy to Firebase Hosting

---

## Manual Deployment (Step-by-Step)

### Step 1: Install Dependencies

```bash
# Frontend dependencies
npm install

# Functions dependencies
cd functions
npm install
cd ..
```

### Step 2: Build Frontend

```bash
# Build optimized production bundle
npm run build

# Verify build
ls -lh dist/

# Expected output:
# - dist/index.html
# - dist/assets/*.js (code-split chunks)
# - dist/assets/*.css
```

### Step 3: Deploy Firebase Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:chat,functions:analyzeMood

# Verify deployment
firebase functions:list
```

**Expected Functions (14 total):**
- healthCheck
- chat
- chatMultilingual
- analyzeMood
- analyzeDoodle
- speechToText
- textToSpeech
- voiceChat
- sendNotification
- registerToken
- sendDailyReminder
- onStreakMilestone
- onCrisisDetected
- streamingTranslation

### Step 4: Deploy Firestore Rules & Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Verify rules
firebase firestore:rules:list
```

### Step 5: Deploy Frontend to Hosting

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your app will be live at:
# https://mindmend-25dca.web.app
# https://mindmend-25dca.firebaseapp.com
```

---

## Environment Variables

### Required Variables

Create `.env.local` file (already exists):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=mindmend-25dca.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mindmend-25dca
VITE_FIREBASE_STORAGE_BUCKET=mindmend-25dca.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Functions URL
VITE_FUNCTIONS_URL=https://asia-south1-mindmend-25dca.cloudfunctions.net

# FCM VAPID Key
VITE_FIREBASE_VAPID_KEY=your_vapid_key

# Optional: Legacy API Keys
VITE_GEMINI_API_KEY=your_gemini_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Functions Environment Variables

```bash
# Set Firebase Functions config
firebase functions:config:set \
  gcp.project_id="mindmend-25dca" \
  gcp.location="asia-south1"

# Verify config
firebase functions:config:get
```

---

## Post-Deployment Verification

### 1. Test Frontend

```bash
# Open the deployed app
open https://mindmend-25dca.web.app

# Test checklist:
# ✓ Login with Google works
# ✓ Anonymous login works
# ✓ Mood tracking (text/voice/doodle)
# ✓ AI chat with Mira
# ✓ CBT exercises
# ✓ Community forums
# ✓ Crisis mode
# ✓ Offline mode
```

### 2. Test Firebase Functions

```bash
# Test health check
curl https://asia-south1-mindmend-25dca.cloudfunctions.net/healthCheck

# Expected response:
# {"status":"healthy","timestamp":"..."}

# Test chat function
curl -X POST \
  https://asia-south1-mindmend-25dca.cloudfunctions.net/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Mira","moodHistory":[],"userProgress":{}}'
```

### 3. Monitor Logs

```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only chat

# Stream logs in real-time
firebase functions:log --follow
```

### 4. Check Firestore

```bash
# Open Firestore console
open https://console.firebase.google.com/project/mindmend-25dca/firestore

# Verify collections:
# ✓ users
# ✓ chatSessions
# ✓ community/posts
# ✓ exerciseCompletions
# ✓ crisisInterventions
```

### 5. Verify BigQuery

```bash
# Open BigQuery console
open https://console.cloud.google.com/bigquery?project=mindmend-25dca

# Verify dataset: mindmend_analytics
# Verify tables:
# ✓ mood_entries
# ✓ chat_messages
# ✓ exercise_completions
```

---

## Rollback Procedure

### Rollback Hosting

```bash
# List previous deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

### Rollback Functions

```bash
# Functions don't support automatic rollback
# Redeploy previous version from git:

git checkout <previous-commit>
firebase deploy --only functions
git checkout main
```

---

## Troubleshooting

### Issue: Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Issue: Functions Deployment Fails

```bash
# Check Node.js version in functions
cd functions
node --version  # Should be 22+

# Update dependencies
npm install
npm audit fix

# Try deploying one function at a time
firebase deploy --only functions:healthCheck
```

### Issue: Firestore Rules Fail

```bash
# Validate rules locally
firebase firestore:rules:validate

# If validation fails, check firestore.rules file
# Common issues:
# - Syntax errors
# - Missing semicolons
# - Invalid field references
```

### Issue: Hosting Shows Old Version

```bash
# Clear browser cache
# Or use incognito mode

# Force cache invalidation
firebase hosting:channel:deploy preview --expires 1h
```

---

## Performance Optimization

### 1. Enable CDN Caching

Already configured in `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [{
          "key": "Cache-Control",
          "value": "max-age=31536000"
        }]
      }
    ]
  }
}
```

### 2. Monitor Performance

```bash
# View hosting metrics
open https://console.firebase.google.com/project/mindmend-25dca/hosting

# Check function performance
open https://console.firebase.google.com/project/mindmend-25dca/functions

# Monitor costs
open https://console.firebase.google.com/project/mindmend-25dca/usage
```

---

## CI/CD Setup (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:run
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: mindmend-25dca
```

---

## Monitoring & Alerts

### Set Up Alerts

```bash
# Install Firebase CLI extensions
firebase ext:install firebase/firestore-bigquery-export

# Set up error reporting
firebase crashlytics:enable
```

### Monitor Key Metrics

1. **Function Invocations**: Should be < 2M/month (free tier)
2. **Firestore Reads**: Should be < 50K/day (free tier)
3. **Hosting Bandwidth**: Should be < 10GB/month (free tier)
4. **BigQuery Storage**: Should be < 10GB (free tier)

---

## Cost Management

### Free Tier Limits

- **Hosting**: 10GB storage, 360MB/day bandwidth
- **Functions**: 2M invocations, 400K GB-seconds
- **Firestore**: 1GB storage, 50K reads, 20K writes/day
- **BigQuery**: 10GB storage, 1TB queries/month

### Monitor Usage

```bash
# Check current usage
firebase projects:list

# View detailed usage
open https://console.firebase.google.com/project/mindmend-25dca/usage
```

---

## Security Checklist

- [x] Firestore security rules deployed
- [x] Firebase Auth enabled
- [x] HTTPS only (enforced by Firebase)
- [x] Environment variables secured
- [x] API keys restricted
- [x] CORS configured
- [x] Rate limiting (implement in functions)

---

## Support & Resources

- **Firebase Console**: https://console.firebase.google.com/project/mindmend-25dca
- **Firebase Documentation**: https://firebase.google.com/docs
- **Vertex AI Documentation**: https://cloud.google.com/vertex-ai/docs
- **Support**: Firebase Support (paid plans only)

---

## Quick Commands Reference

```bash
# Deploy everything
./deploy.sh

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore

# View logs
firebase functions:log --follow

# Open consoles
firebase open hosting
firebase open functions
firebase open firestore

# Check status
firebase projects:list
firebase functions:list
firebase hosting:channel:list
```

---

**Last Updated:** October 30, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
