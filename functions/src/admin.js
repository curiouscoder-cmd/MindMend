// Firebase Admin Initialization
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
let app;
try {
  app = initializeApp();
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

// Export services
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

export default app;
