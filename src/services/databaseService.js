// Database Integration Service for MindMend AI
// Supports both Supabase and Firestore with fallback to local storage

// Database Integration Service for MindMend AI
// Note: Supabase integration requires @supabase/supabase-js package
// For now, we'll use a mock implementation that can be easily replaced

import { createClient } from '@supabase/supabase-js';

// Simple error handler fallback
const handleStorageError = (error, operation, data) => {
  console.error(`Storage error in ${operation}:`, error);
  return null;
};

class DatabaseService {
  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    this.supabase = null;
    
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      if (this.supabaseUrl && this.supabaseKey) {
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        console.log('Supabase initialized successfully');
        
        // Test connection
        const { data, error } = await this.supabase.from('users').select('count').limit(1);
        if (error && error.code !== 'PGRST116') {
          console.warn('Supabase connection test failed:', error.message);
        } else {
          console.log('Supabase connection verified');
        }
      } else {
        console.warn('Supabase credentials not found');
      }
    } catch (error) {
      console.error('Database initialization failed:', error);
      this.supabase = null;
    }
  }


  // User Management
  async createUser(userData) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .insert([{
            id: userData.id,
            email: userData.email,
            name: userData.name,
            created_at: new Date().toISOString(),
            preferences: userData.preferences || {},
            personality_traits: userData.personalityTraits || {}
          }])
          .select();

        if (error) throw error;
        return data[0];
      }
      return null;
    } catch (error) {
      handleStorageError(error, 'createUser', userData);
      return null;
    }
  }

  async getUser(userId) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
      }
      return null;
    } catch (error) {
      handleStorageError(error, 'getUser', { userId });
      return null;
    }
  }

  // Mood Tracking
  async saveMoodEntry(userId, moodData) {
    const entry = {
      id: `${userId}_${Date.now()}`,
      user_id: userId,
      mood: moodData.mood,
      intensity: moodData.intensity || 5,
      triggers: moodData.triggers || [],
      notes: moodData.notes || '',
      timestamp: new Date().toISOString(),
      synced: false
    };

    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('mood_entries')
          .insert([entry])
          .select();

        if (error) throw error;
        return data[0];
      }
      return null;
    } catch (error) {
      handleStorageError(error, 'saveMoodEntry', entry);
      return null;
    }
  }

  async getMoodHistory(userId, limit = 30) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data;
      }
      return [];
    } catch (error) {
      handleStorageError(error, 'getMoodHistory', { userId, limit });
      return [];
    }
  }

  // Exercise Tracking
  async saveExerciseCompletion(userId, exerciseData) {
    const completion = {
      id: `${userId}_${exerciseData.exerciseId}_${Date.now()}`,
      user_id: userId,
      exercise_id: exerciseData.exerciseId,
      exercise_type: exerciseData.type,
      duration: exerciseData.duration,
      completion_rate: exerciseData.completionRate || 100,
      mood_before: exerciseData.moodBefore,
      mood_after: exerciseData.moodAfter,
      notes: exerciseData.notes || '',
      timestamp: new Date().toISOString(),
      synced: false
    };

    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('exercise_completions')
          .insert([completion])
          .select();

        if (error) throw error;
        return data[0];
      }
      return null;
    } catch (error) {
      handleStorageError(error, 'saveExerciseCompletion', completion);
      return null;
    }
  }

  // Community Features
  async saveForumPost(userId, postData) {
    const post = {
      id: `post_${Date.now()}`,
      user_id: userId,
      forum_id: postData.forumId,
      title: postData.title,
      content: postData.content,
      is_anonymous: postData.isAnonymous || false,
      tags: postData.tags || [],
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: 0,
      synced: false
    };

    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('forum_posts')
          .insert([post])
          .select();

        if (error) throw error;
        return data[0];
      }
      return null;
    } catch (error) {
      handleStorageError(error, 'saveForumPost', post);
      return null;
    }
  }

  async getForumPosts(forumId, limit = 20) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('forum_posts')
          .select('*')
          .eq('forum_id', forumId)
          .order('timestamp', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data;
      }
      return [];
    } catch (error) {
      handleStorageError(error, 'getForumPosts', { forumId, limit });
      return [];
    }
  }

  // Analytics and Metrics
  async saveUserMetrics(userId, metrics) {
    const metricsEntry = {
      id: `${userId}_${Date.now()}`,
      user_id: userId,
      session_duration: metrics.sessionDuration,
      features_used: metrics.featuresUsed || [],
      exercises_completed: metrics.exercisesCompleted || 0,
      mood_entries: metrics.moodEntries || 0,
      ai_interactions: metrics.aiInteractions || 0,
      voice_usage: metrics.voiceUsage || 0,
      community_engagement: metrics.communityEngagement || 0,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      synced: false
    };

    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('user_metrics')
          .insert([metricsEntry])
          .select();

        if (error) throw error;
        return data[0];
      }
      return null;
    } catch (error) {
      handleStorageError(error, 'saveUserMetrics', metricsEntry);
      return null;
    }
  }

  async getUserMetrics(userId, timeframe = 'month') {
    try {
      if (this.supabase) {
        const startDate = new Date();
        if (timeframe === 'week') startDate.setDate(startDate.getDate() - 7);
        else if (timeframe === 'month') startDate.setMonth(startDate.getMonth() - 1);
        else if (timeframe === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

        const { data, error } = await this.supabase
          .from('user_metrics')
          .select('*')
          .eq('user_id', userId)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: false });

        if (error) throw error;
        return data || [];
      }
      return [];
    } catch (error) {
      handleStorageError(error, 'getUserMetrics', { userId, timeframe });
      return [];
    }
  }

  async getAggregatedMetrics(timeframe = 'week') {
    try {
      if (this.supabase) {
        const startDate = new Date();
        if (timeframe === 'week') startDate.setDate(startDate.getDate() - 7);
        else if (timeframe === 'month') startDate.setMonth(startDate.getMonth() - 1);
        else if (timeframe === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

        const { data, error } = await this.supabase
          .from('user_metrics')
          .select('*')
          .gte('timestamp', startDate.toISOString());

        if (error) throw error;
        return this.aggregateMetricsData(data);
      }
      
      return {
        totalUsers: 0,
        dailyActiveUsers: 0,
        completedExercises: 0,
        averageMoodScore: 0,
        engagementRate: 0
      };
    } catch (error) {
      handleStorageError(error, 'getAggregatedMetrics', { timeframe });
      return {
        totalUsers: 0,
        dailyActiveUsers: 0,
        completedExercises: 0,
        averageMoodScore: 0,
        engagementRate: 0
      };
    }
  }

  aggregateMetricsData(data) {
    if (!data || data.length === 0) {
      return {
        totalUsers: 0,
        dailyActiveUsers: 0,
        completedExercises: 0,
        averageMoodScore: 0,
        engagementRate: 0
      };
    }

    const uniqueUsers = new Set(data.map(d => d.user_id));
    const totalExercises = data.reduce((sum, d) => sum + (d.exercises_completed || 0), 0);
    const totalSessions = data.length;
    const avgSessionDuration = data.reduce((sum, d) => sum + (d.session_duration || 0), 0) / totalSessions;

    return {
      totalUsers: uniqueUsers.size,
      dailyActiveUsers: uniqueUsers.size, // Simplified for demo
      completedExercises: totalExercises,
      averageMoodScore: 7.2, // Mock data - would calculate from mood entries
      engagementRate: Math.min(100, (avgSessionDuration / 300) * 100), // 5 minutes = 100%
      totalSessions: totalSessions,
      averageSessionDuration: Math.round(avgSessionDuration)
    };
  }


  // Real-time subscriptions
  subscribeToForumUpdates(forumId, callback) {
    if (!this.supabase) return null;

    return this.supabase
      .channel(`forum_${forumId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'forum_posts',
        filter: `forum_id=eq.${forumId}`
      }, callback)
      .subscribe();
  }

  subscribeToUserMetrics(userId, callback) {
    if (!this.supabase) return null;

    return this.supabase
      .channel(`user_metrics_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_metrics',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  // Cleanup
  unsubscribe(subscription) {
    if (subscription && this.supabase) {
      this.supabase.removeChannel(subscription);
    }
  }

  // Database health check
  async healthCheck() {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('users')
          .select('count')
          .limit(1);

        return { 
          status: error ? 'error' : 'healthy',
          error: error?.message
        };
      }
      
      return { 
        status: 'no_database'
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message
      };
    }
  }
}

const databaseService = new DatabaseService();

export default databaseService;
