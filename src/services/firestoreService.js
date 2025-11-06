// Firestore Database Service
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
  addDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

// User operations
export const createUserProfile = async (userId, profileData) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    profile: {
      displayName: profileData.displayName || 'Anonymous',
      email: profileData.email || null,
      photoURL: profileData.photoURL || null,
      preferredLanguage: 'en',
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
      theme: 'light',
    },
  });
  return userRef.id;
};

export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const updateUserProgress = async (userId, progressData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    progress: progressData,
    'profile.lastActive': serverTimestamp(),
  });
};

// Mood entries
export const saveMoodEntry = async (userId, moodData) => {
  const moodRef = collection(db, 'users', userId, 'moodEntries');
  const docRef = await addDoc(moodRef, {
    ...moodData,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getMoodHistory = async (userId, days = 30) => {
  const moodRef = collection(db, 'users', userId, 'moodEntries');
  const q = query(moodRef, orderBy('timestamp', 'desc'), limit(days));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

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
  const messageRef = collection(db, 'chatSessions', userId, 'messages');
  const docRef = await addDoc(messageRef, {
    ...messageData,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getChatHistory = async (userId, limitCount = 50) => {
  const messagesRef = collection(db, 'chatSessions', userId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Community posts
export const createPost = async (postData) => {
  const postRef = collection(db, 'community', 'posts');
  const docRef = await addDoc(postRef, {
    ...postData,
    timestamp: serverTimestamp(),
    likes: 0,
    replyCount: 0,
  });
  return docRef.id;
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
  const sessionRef = collection(db, 'exerciseCompletions', userId, 'sessions');
  const docRef = await addDoc(sessionRef, {
    ...exerciseData,
    startTime: serverTimestamp(),
  });
  return docRef.id;
};

// Metrics tracking
export const saveUserMetrics = async (userId, metricsData) => {
  const metricsRef = collection(db, 'users', userId, 'metrics');
  const docRef = await addDoc(metricsRef, {
    ...metricsData,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserMetrics = async (userId, days = 30) => {
  const metricsRef = collection(db, 'users', userId, 'metrics');
  const q = query(metricsRef, orderBy('timestamp', 'desc'), limit(days));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAggregatedMetrics = async (days = 7) => {
  // This would require a more complex query or cloud function
  // For now, return empty aggregated data
  return {
    totalUsers: 0,
    dailyActiveUsers: 0,
    completedExercises: 0,
    averageMoodScore: 0,
    engagementRate: 0
  };
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
  saveUserMetrics,
  getUserMetrics,
  getAggregatedMetrics,
};
