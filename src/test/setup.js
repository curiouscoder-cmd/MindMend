// Vitest setup file
import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock environment variables first
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.VITE_FIREBASE_APP_ID = '1:123456789:web:abc123';

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ 
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  })),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  signInWithRedirect: vi.fn(() => Promise.resolve()),
  getRedirectResult: vi.fn(() => Promise.resolve(null)),
  signInAnonymously: vi.fn(() => Promise.resolve({ user: { uid: 'anon-uid', isAnonymous: true } })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  updateProfile: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: 'test-doc-id' })),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({}),
  })),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [],
  })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => vi.fn()),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 })),
  enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
  FieldValue: {
    arrayUnion: vi.fn(val => val),
    serverTimestamp: vi.fn(() => new Date()),
  },
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}));

vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn(() => Promise.resolve('test-token')),
  onMessage: vi.fn(() => vi.fn()),
  isSupported: vi.fn(() => Promise.resolve(true)),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    span: 'span',
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock chart.js
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: [],
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => null,
  Bar: () => null,
  Doughnut: () => null,
}));
