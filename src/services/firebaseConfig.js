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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ABC123',
};

console.log('🔧 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isDev: import.meta.env.DEV
});

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
  
  // Connect to emulators in development (optional - won't block if emulators not running)
  if (import.meta.env.DEV && window.location.hostname === 'localhost') {
    // Try to connect to emulators, but don't block if they're not running
    setTimeout(() => {
      import('firebase/auth').then(({ connectAuthEmulator }) => {
        try {
          connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
          console.log('🔧 Connected to Auth emulator');
        } catch (e) {
          console.log('ℹ️ Auth emulator not available');
        }
      }).catch(() => {});
      
      import('firebase/firestore').then(({ connectFirestoreEmulator }) => {
        try {
          connectFirestoreEmulator(db, '127.0.0.1', 8080);
          console.log('🔧 Connected to Firestore emulator');
        } catch (e) {
          console.log('ℹ️ Firestore emulator not available');
        }
      }).catch(() => {});
      
      import('firebase/storage').then(({ connectStorageEmulator }) => {
        try {
          connectStorageEmulator(storage, '127.0.0.1', 9199);
          console.log('🔧 Connected to Storage emulator');
        } catch (e) {
          console.log('ℹ️ Storage emulator not available');
        }
      }).catch(() => {});
    }, 100);
  }
  
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
