# Firebase Quick Start

## 1. Create Firebase Project
```bash
# Go to: https://console.firebase.google.com
# Click "Add project" → Name: mindmend-ai
```

## 2. Get Config
```bash
# Firebase Console → Project Settings → Your apps → Web
# Copy the config object
```

## 3. Create .env.local
```bash
cp .env.example .env.local
# Paste your Firebase config
```

## 4. Enable Services
- Authentication (Google + Anonymous)
- Firestore Database (test mode)
- Cloud Storage

## 5. Initialize
```bash
./firebase-setup.sh
# OR
firebase login
firebase init
```

## 6. Test
```bash
npm run dev
# Visit http://localhost:5173
# Try signing in!
```

## Files Created
- `src/services/firebaseConfig.js` - Firebase init
- `src/services/authService.js` - Authentication
- `src/services/firestoreService.js` - Database
- `src/components/Login.jsx` - Login UI
- `src/hooks/useFirestore.js` - Custom hooks
- `firestore.rules` - Security rules
- `firestore.indexes.json` - Database indexes

## Next: Week 1 Day 2
- Firebase Functions setup
- Gemini 2.5 integration
- Multilingual pipeline
