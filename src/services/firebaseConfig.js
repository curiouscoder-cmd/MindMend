// Firebase Configuration and Initialization
// This file sets up Firebase services for MindMend AI

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let messaging;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Enable offline persistence for Firestore
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence enabled in first tab only');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Browser doesn\'t support offline persistence');
    }
  });
  
  // Initialize Firebase Cloud Messaging (only if supported)
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
      console.log('✅ Firebase Cloud Messaging initialized');
    } else {
      console.warn('⚠️ Firebase Cloud Messaging not supported in this browser');
    }
  });
  
  // Initialize Analytics (only in production)
  if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  }
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Export Firebase services
export { app, auth, db, storage, messaging, analytics };

// Export configuration for debugging (development only)
if (import.meta.env.DEV) {
  console.log('🔧 Firebase Config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
  });
}
