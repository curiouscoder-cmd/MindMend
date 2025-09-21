// Custom hook for database operations
import { useState, useEffect } from 'react';
import databaseService from '../services/databaseService';
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
      const health = await databaseService.healthCheck();
      setIsConnected(health.status === 'healthy');
      setError(health.error);
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
      const result = await databaseService.saveMoodEntry(userId, moodData);
      
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
      return await databaseService.getMoodHistory(userId, limit);
    } catch (error) {
      console.error('Error getting mood history:', error);
      return [];
    }
  };

  // Exercise operations
  const saveExercise = async (exerciseData) => {
    try {
      const result = await databaseService.saveExerciseCompletion(userId, exerciseData);
      
      // Track metrics
      metricsService.trackExerciseCompletion(exerciseData.exerciseId, exerciseData);
      
      return result;
    } catch (error) {
      console.error('Error saving exercise:', error);
      throw error;
    }
  };

  // Community operations
  const saveForumPost = async (postData) => {
    try {
      const result = await databaseService.saveForumPost(userId, postData);
      
      // Track metrics
      metricsService.trackCommunityEngagement('post', {
        forumId: postData.forumId,
        isAnonymous: postData.isAnonymous
      });
      
      return result;
    } catch (error) {
      console.error('Error saving forum post:', error);
      throw error;
    }
  };

  const getForumPosts = async (forumId, limit = 20) => {
    try {
      return await databaseService.getForumPosts(forumId, limit);
    } catch (error) {
      console.error('Error getting forum posts:', error);
      return [];
    }
  };

  // Analytics
  const getAnalytics = async (timeframe = 'week') => {
    try {
      return await databaseService.getAggregatedMetrics(timeframe);
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
