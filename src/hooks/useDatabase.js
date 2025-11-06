// Custom hook for database operations
import { useState, useEffect } from 'react';
import { getMoodHistory as fetchMoodHistory, saveMoodEntry, getAggregatedMetrics } from '../services/firestoreService';
import metricsService from '../services/metricsService';

export const useDatabase = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Firebase is always connected if configured
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Mood operations
  const saveMood = async (moodData) => {
    try {
      const result = await saveMoodEntry(userId, moodData);
      
      // Track metrics
      metricsService.trackMoodEntry(moodData);
      
      return result;
    } catch (error) {
      console.error('Error saving mood:', error);
      throw error;
    }
  };

  const getMoodHistory = async (limit = 30) => {
    try {
      return await fetchMoodHistory(userId, limit);
    } catch (error) {
      console.error('Error getting mood history:', error);
      return [];
    }
  };

  // Exercise operations
  const saveExercise = async (exerciseData) => {
    try {
      // Track metrics (Firebase storage handled by metricsService)
      metricsService.trackExerciseCompletion(exerciseData.exerciseId, exerciseData);
      
      return true;
    } catch (error) {
      console.error('Error saving exercise:', error);
      throw error;
    }
  };

  // Community operations
  const saveForumPost = async (postData) => {
    try {
      // Track metrics
      metricsService.trackCommunityEngagement('post', {
        forumId: postData.forumId,
        isAnonymous: postData.isAnonymous
      });
      
      return true;
    } catch (error) {
      console.error('Error saving forum post:', error);
      throw error;
    }
  };

  const getForumPosts = async (forumId, limit = 20) => {
    try {
      // Forum posts not implemented yet
      return [];
    } catch (error) {
      console.error('Error getting forum posts:', error);
      return [];
    }
  };

  // Analytics
  const getAnalytics = async (timeframe = 'week') => {
    try {
      const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 1;
      return await getAggregatedMetrics(days);
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalUsers: 0,
        dailyActiveUsers: 0,
        completedExercises: 0,
        averageMoodScore: 0,
        engagementRate: 0
      };
    }
  };

  return {
    isConnected,
    isLoading,
    error,
    checkConnection,
    saveMood,
    getMoodHistory,
    saveExercise,
    saveForumPost,
    getForumPosts,
    getAnalytics
  };
};

export default useDatabase;
