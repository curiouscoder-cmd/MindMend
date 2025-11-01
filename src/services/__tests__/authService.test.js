import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  signInWithGoogle, 
  signInAnonymous, 
  logout, 
  getCurrentUser,
  isAuthenticated 
} from '../authService';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth');
vi.mock('../firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('successfully signs in with Google', async () => {
      const mockUser = {
        uid: '123',
        displayName: 'Test User',
        email: 'test@example.com',
      };

      firebaseAuth.signInWithPopup = vi.fn().mockResolvedValue({
        user: mockUser,
      });

      const result = await signInWithGoogle();

      expect(result).toEqual(mockUser);
      expect(firebaseAuth.signInWithPopup).toHaveBeenCalledTimes(1);
    });

    it('handles popup blocked error', async () => {
      const error = new Error('Popup blocked');
      error.code = 'auth/popup-blocked';

      firebaseAuth.signInWithPopup = vi.fn().mockRejectedValue(error);
      firebaseAuth.signInWithRedirect = vi.fn().mockResolvedValue();

      await expect(signInWithGoogle()).rejects.toThrow();
    });

    it('handles general auth errors', async () => {
      const error = new Error('Network error');
      firebaseAuth.signInWithPopup = vi.fn().mockRejectedValue(error);

      await expect(signInWithGoogle()).rejects.toThrow('Network error');
    });
  });

  describe('signInAnonymous', () => {
    it('successfully signs in anonymously', async () => {
      const mockUser = {
        uid: '456',
        isAnonymous: true,
      };

      firebaseAuth.signInAnonymously = vi.fn().mockResolvedValue({
        user: mockUser,
      });

      const result = await signInAnonymous();

      expect(result).toEqual(mockUser);
      expect(firebaseAuth.signInAnonymously).toHaveBeenCalledTimes(1);
    });

    it('handles anonymous sign-in errors', async () => {
      const error = new Error('Anonymous auth disabled');
      firebaseAuth.signInAnonymously = vi.fn().mockRejectedValue(error);

      await expect(signInAnonymous()).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('successfully signs out user', async () => {
      firebaseAuth.signOut = vi.fn().mockResolvedValue();

      await logout();

      expect(firebaseAuth.signOut).toHaveBeenCalledTimes(1);
    });

    it('handles sign-out errors', async () => {
      const error = new Error('Sign out failed');
      firebaseAuth.signOut = vi.fn().mockRejectedValue(error);

      await expect(logout()).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('returns current user when authenticated', () => {
      const mockUser = { uid: '123', displayName: 'Test' };
      const authService = require('../authService');
      authService.auth.currentUser = mockUser;

      const user = getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('returns null when not authenticated', () => {
      const authService = require('../authService');
      authService.auth.currentUser = null;

      const user = getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when user is authenticated', () => {
      const authService = require('../authService');
      authService.auth.currentUser = { uid: '123' };

      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when user is not authenticated', () => {
      const authService = require('../authService');
      authService.auth.currentUser = null;

      expect(isAuthenticated()).toBe(false);
    });
  });
});
