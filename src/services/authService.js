// Firebase Authentication Service
// Handles user authentication for MindMend AI

import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebaseConfig.js';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google (popup method)
 * @returns {Promise<User>} Firebase user object
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('✅ Google sign-in successful:', user.displayName);
    
    return user;
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    
    // Handle specific errors
    if (error.code === 'auth/popup-blocked') {
      console.log('🔄 Popup blocked, trying redirect method...');
      return signInWithGoogleRedirect();
    }
    
    throw error;
  }
};

/**
 * Sign in with Google (redirect method - fallback for mobile)
 * @returns {Promise<void>}
 */
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('❌ Google redirect sign-in error:', error);
    throw error;
  }
};

/**
 * Get redirect result after redirect sign-in
 * Call this on app initialization
 * @returns {Promise<User|null>}
 */
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('✅ Google redirect sign-in successful:', result.user.displayName);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('❌ Google redirect result error:', error);
    throw error;
  }
};

/**
 * Sign in anonymously (for privacy-conscious users)
 * Falls back to localStorage-based session if anonymous auth is disabled
 * @returns {Promise<User>} Firebase user object or mock user object
 */
export const signInAnonymous = async () => {
  try {
    const result = await signInAnonymously(auth);
    const user = result.user;
    
    console.log('✅ Anonymous sign-in successful:', user.uid);
    
    return user;
  } catch (error) {
    console.error('❌ Anonymous sign-in error:', error);
    
    // Check if error is due to anonymous auth being disabled
    if (error.code === 'auth/admin-restricted-operation' || 
        error.code === 'auth/operation-not-allowed') {
      console.log('⚠️ Anonymous authentication is disabled in Firebase Console');
      console.log('📝 To enable: Firebase Console > Authentication > Sign-in method > Anonymous > Enable');
      
      // Fallback: Create a mock user session with localStorage
      const mockUserId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const mockUser = {
        uid: mockUserId,
        isAnonymous: true,
        displayName: 'Guest User',
        email: null,
        photoURL: null,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        }
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('mindmend_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mindmend_session_id', mockUserId);
      
      console.log('✅ Using localStorage-based session (fallback):', mockUserId);
      return mockUser;
    }
    
    throw error;
  }
};

/**
 * Update user profile (display name, photo URL)
 * @param {Object} profileData - { displayName, photoURL }
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (profileData) => {
  try {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    await updateProfile(auth.currentUser, profileData);
    console.log('✅ User profile updated:', profileData);
  } catch (error) {
    console.error('❌ Profile update error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Clear localStorage for guest/mock users
    localStorage.removeItem('mindmend_mock_user');
    localStorage.removeItem('mindmend_session_id');
    
    // Sign out from Firebase
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error);
    // Even if Firebase signout fails, clear localStorage
    localStorage.removeItem('mindmend_mock_user');
    localStorage.removeItem('mindmend_session_id');
    throw error;
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Called with user object when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('👤 User authenticated:', user.displayName || user.uid);
      callback(user);
    } else {
      console.log('👤 User signed out');
      callback(null);
    }
  });
};

/**
 * Get current user
 * @returns {User|null} Current Firebase user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

/**
 * Get user ID token (for API calls)
 * @returns {Promise<string>} ID token
 */
export const getUserToken = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const token = await auth.currentUser.getIdToken();
    return token;
  } catch (error) {
    console.error('❌ Error getting user token:', error);
    throw error;
  }
};

// Export auth instance for direct access if needed
export { auth };

export default {
  signInWithGoogle,
  signInWithGoogleRedirect,
  getGoogleRedirectResult,
  signInAnonymous,
  updateUserProfile,
  logout,
  onAuthChange,
  getCurrentUser,
  isAuthenticated,
  getUserToken,
};
