import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createUserProfile,
  getUserProfile,
  updateUserProgress,
  saveMoodEntry,
  getMoodHistory,
  saveChatMessage,
  getChatHistory,
  createPost,
  getPosts,
  saveExerciseCompletion,
} from '../firestoreService';
import * as firestore from 'firebase/firestore';

// Mock Firestore
vi.mock('firebase/firestore');
vi.mock('../firebaseConfig', () => ({
  db: {},
}));

describe('firestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('creates a new user profile in Firestore', async () => {
      firestore.doc = vi.fn(() => ({ id: 'user-123' }));
      firestore.setDoc = vi.fn(() => Promise.resolve());

      const userId = 'user-123';
      const profileData = {
        displayName: 'Test User',
        email: 'test@example.com',
      };

      const result = await createUserProfile(userId, profileData);

      expect(firestore.setDoc).toHaveBeenCalled();
      expect(result).toBe('user-123');
    });

    it('includes default progress and preferences', async () => {
      firestore.doc = vi.fn(() => ({ id: 'user-123' }));
      firestore.setDoc = vi.fn(() => Promise.resolve());

      await createUserProfile('user-123', {});

      expect(firestore.setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          progress: expect.objectContaining({
            completedExercises: 0,
            calmPoints: 0,
            streak: 0,
            level: 1,
          }),
          preferences: expect.objectContaining({
            notificationsEnabled: true,
            voiceEnabled: true,
          }),
        })
      );
    });
  });

  describe('getUserProfile', () => {
    it('retrieves user profile from Firestore', async () => {
      const mockData = {
        profile: { displayName: 'Test User' },
        progress: { calmPoints: 100 },
      };

      firestore.doc = vi.fn();
      firestore.getDoc = vi.fn(() => Promise.resolve({
        exists: () => true,
        data: () => mockData,
      }));

      const result = await getUserProfile('user-123');

      expect(result).toEqual(mockData);
    });

    it('returns null if user does not exist', async () => {
      firestore.doc = vi.fn();
      firestore.getDoc = vi.fn(() => Promise.resolve({
        exists: () => false,
      }));

      const result = await getUserProfile('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProgress', () => {
    it('updates user progress in Firestore', async () => {
      firestore.doc = vi.fn();
      firestore.updateDoc = vi.fn(() => Promise.resolve());

      const progressData = {
        completedExercises: 10,
        calmPoints: 200,
        streak: 5,
      };

      await updateUserProgress('user-123', progressData);

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          progress: progressData,
        })
      );
    });
  });

  describe('saveMoodEntry', () => {
    it('saves mood entry to Firestore', async () => {
      firestore.collection = vi.fn();
      firestore.addDoc = vi.fn(() => Promise.resolve({ id: 'mood-123' }));

      const moodData = {
        mood: 'happy',
        intensity: 8,
        notes: 'Feeling great!',
      };

      const result = await saveMoodEntry('user-123', moodData);

      expect(firestore.addDoc).toHaveBeenCalled();
      expect(result).toBe('mood-123');
    });

    it('includes timestamp in mood entry', async () => {
      firestore.collection = vi.fn();
      firestore.addDoc = vi.fn(() => Promise.resolve({ id: 'mood-123' }));
      firestore.serverTimestamp = vi.fn(() => 'timestamp');

      await saveMoodEntry('user-123', { mood: 'calm' });

      expect(firestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          timestamp: 'timestamp',
        })
      );
    });
  });

  describe('getMoodHistory', () => {
    it('retrieves mood history from Firestore', async () => {
      const mockMoods = [
        { id: 'mood-1', mood: 'happy', timestamp: new Date() },
        { id: 'mood-2', mood: 'calm', timestamp: new Date() },
      ];

      firestore.collection = vi.fn();
      firestore.query = vi.fn();
      firestore.orderBy = vi.fn();
      firestore.limit = vi.fn();
      firestore.getDocs = vi.fn(() => Promise.resolve({
        docs: mockMoods.map(mood => ({
          id: mood.id,
          data: () => mood,
        })),
      }));

      const result = await getMoodHistory('user-123', 30);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('mood', 'happy');
    });
  });

  describe('saveChatMessage', () => {
    it('saves chat message to Firestore', async () => {
      firestore.collection = vi.fn();
      firestore.addDoc = vi.fn(() => Promise.resolve({ id: 'msg-123' }));

      const messageData = {
        role: 'user',
        content: 'Hello Mira',
      };

      const result = await saveChatMessage('user-123', messageData);

      expect(firestore.addDoc).toHaveBeenCalled();
      expect(result).toBe('msg-123');
    });
  });

  describe('getChatHistory', () => {
    it('retrieves chat history from Firestore', async () => {
      const mockMessages = [
        { id: 'msg-1', role: 'user', content: 'Hello' },
        { id: 'msg-2', role: 'assistant', content: 'Hi there!' },
      ];

      firestore.collection = vi.fn();
      firestore.query = vi.fn();
      firestore.orderBy = vi.fn();
      firestore.limit = vi.fn();
      firestore.getDocs = vi.fn(() => Promise.resolve({
        docs: mockMessages.map(msg => ({
          id: msg.id,
          data: () => msg,
        })),
      }));

      const result = await getChatHistory('user-123', 50);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('user');
    });
  });

  describe('createPost', () => {
    it('creates community post in Firestore', async () => {
      firestore.collection = vi.fn();
      firestore.addDoc = vi.fn(() => Promise.resolve({ id: 'post-123' }));

      const postData = {
        title: 'My Journey',
        content: 'Sharing my story...',
        authorId: 'user-123',
      };

      const result = await createPost(postData);

      expect(firestore.addDoc).toHaveBeenCalled();
      expect(result).toBe('post-123');
    });

    it('initializes likes and reply count', async () => {
      firestore.collection = vi.fn();
      firestore.addDoc = vi.fn(() => Promise.resolve({ id: 'post-123' }));

      await createPost({ title: 'Test', content: 'Content' });

      expect(firestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          likes: 0,
          replyCount: 0,
        })
      );
    });
  });

  describe('getPosts', () => {
    it('retrieves posts for a forum', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Post 1', content: 'Content 1' },
        { id: 'post-2', title: 'Post 2', content: 'Content 2' },
      ];

      firestore.collection = vi.fn();
      firestore.query = vi.fn();
      firestore.where = vi.fn();
      firestore.orderBy = vi.fn();
      firestore.limit = vi.fn();
      firestore.getDocs = vi.fn(() => Promise.resolve({
        docs: mockPosts.map(post => ({
          id: post.id,
          data: () => post,
        })),
      }));

      const result = await getPosts('general', 20);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Post 1');
    });
  });

  describe('saveExerciseCompletion', () => {
    it('saves exercise completion to Firestore', async () => {
      firestore.collection = vi.fn();
      firestore.addDoc = vi.fn(() => Promise.resolve({ id: 'session-123' }));

      const exerciseData = {
        exerciseType: 'breathing',
        duration: 300,
        completed: true,
      };

      const result = await saveExerciseCompletion('user-123', exerciseData);

      expect(firestore.addDoc).toHaveBeenCalled();
      expect(result).toBe('session-123');
    });
  });
});
