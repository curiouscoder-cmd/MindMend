/**
 * Activity Tracking Service
 * Logs all user activities to Firestore for AI context awareness
 * Tracks: navigation, assessments, CBT, chat, mood, exercises, etc.
 */

import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getCurrentUser } from './authService';

/**
 * Activity types
 */
export const ACTIVITY_TYPES = {
  NAVIGATION: 'navigation',
  ASSESSMENT: 'assessment',
  CBT: 'cbt',
  MOOD: 'mood',
  CHAT: 'chat',
  EXERCISE: 'exercise',
  CRISIS: 'crisis',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  VOICE: 'voice'
};

/**
 * Log an activity to Firestore
 * @param {string} type - Activity type (from ACTIVITY_TYPES)
 * @param {string} action - Specific action (e.g., "completed", "started", "viewed")
 * @param {Object} metadata - Additional data about the activity
 */
export const logActivity = async (type, action, metadata = {}) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser?.uid || !db) {
      console.warn('⚠️ Cannot log activity: user not authenticated or db not available');
      return;
    }

    const activity = {
      type,
      action,
      metadata,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
      userId: currentUser.uid
    };

    await addDoc(collection(db, 'users', currentUser.uid, 'activities'), activity);
    console.log(`📊 Activity logged: ${type} - ${action}`);
  } catch (error) {
    console.error('❌ Error logging activity:', error);
  }
};

/**
 * Get recent activities
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of activities to fetch (default 50)
 * @returns {Promise<Array>} Array of activities
 */
export const getRecentActivities = async (userId, limitCount = 50) => {
  try {
    if (!userId || !db) return [];

    const q = query(
      collection(db, 'users', userId, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return activities.reverse(); // Chronological order
  } catch (error) {
    console.warn('⚠️ Error fetching activities:', error.message);
    return [];
  }
};

/**
 * Get activities by type
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity to filter
 * @param {number} limitCount - Number of activities to fetch
 * @returns {Promise<Array>} Array of activities
 */
export const getActivitiesByType = async (userId, activityType, limitCount = 20) => {
  try {
    if (!userId || !db) return [];

    const q = query(
      collection(db, 'users', userId, 'activities'),
      where('type', '==', activityType),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const activities = [];
    snapshot.forEach(doc => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return activities.reverse(); // Chronological order
  } catch (error) {
    console.warn(`⚠️ Error fetching ${activityType} activities:`, error.message);
    return [];
  }
};

/**
 * Generate activity summary for AI context
 * @param {Array} activities - Array of activities
 * @returns {Object} Summary object
 */
export const generateActivitySummary = (activities) => {
  if (!activities || activities.length === 0) {
    return {
      totalActivities: 0,
      activityTypes: {},
      recentActions: [],
      engagement: 'low'
    };
  }

  // Count activities by type
  const activityTypes = {};
  activities.forEach(activity => {
    activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
  });

  // Get recent actions (last 5)
  const recentActions = activities.slice(-5).map(a => ({
    type: a.type,
    action: a.action,
    time: a.createdAt
  }));

  // Determine engagement level
  const totalActivities = activities.length;
  let engagement = 'low';
  if (totalActivities > 20) engagement = 'high';
  else if (totalActivities > 10) engagement = 'moderate';

  return {
    totalActivities,
    activityTypes,
    recentActions,
    engagement,
    lastActivity: activities[activities.length - 1]?.createdAt
  };
};

/**
 * Log navigation
 */
export const logNavigation = (page, metadata = {}) => {
  logActivity(ACTIVITY_TYPES.NAVIGATION, `navigated_to_${page}`, {
    page,
    ...metadata
  });
};

/**
 * Log assessment completion
 */
export const logAssessmentCompletion = (assessmentType, score, severity, metadata = {}) => {
  logActivity(ACTIVITY_TYPES.ASSESSMENT, 'completed', {
    assessmentType,
    score,
    severity,
    ...metadata
  });
};

/**
 * Log CBT entry
 */
export const logCBTEntry = (thoughtType, distortions = [], metadata = {}) => {
  logActivity(ACTIVITY_TYPES.CBT, 'entry_created', {
    thoughtType,
    distortionCount: distortions.length,
    distortions,
    ...metadata
  });
};

/**
 * Log mood entry
 */
export const logMoodEntry = (mood, intensity, metadata = {}) => {
  logActivity(ACTIVITY_TYPES.MOOD, 'logged', {
    mood,
    intensity,
    ...metadata
  });
};

/**
 * Log chat message
 */
export const logChatMessage = (chatType, messageLength, metadata = {}) => {
  logActivity(ACTIVITY_TYPES.CHAT, 'message_sent', {
    chatType, // 'coach' or 'friend'
    messageLength,
    ...metadata
  });
};

/**
 * Log exercise completion
 */
export const logExerciseCompletion = (exerciseType, duration, metadata = {}) => {
  logActivity(ACTIVITY_TYPES.EXERCISE, 'completed', {
    exerciseType,
    duration,
    ...metadata
  });
};

/**
 * Log crisis intervention
 */
export const logCrisisIntervention = (interventionType, metadata = {}) => {
  logActivity(ACTIVITY_TYPES.CRISIS, 'accessed', {
    interventionType,
    ...metadata
  });
};

/**
 * Log voice interaction
 */
export const logVoiceInteraction = (voiceType, duration, metadata = {}) => {
  logActivity(ACTIVITY_TYPES.VOICE, 'interaction', {
    voiceType, // 'speech_to_text', 'text_to_speech', etc.
    duration,
    ...metadata
  });
};

/**
 * Get weekly activity summary
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Weekly summary
 */
export const getWeeklyActivitySummary = async (userId) => {
  try {
    const activities = await getRecentActivities(userId, 100);
    
    // Filter activities from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyActivities = activities.filter(a => {
      const actDate = new Date(a.createdAt);
      return actDate >= sevenDaysAgo;
    });

    // Count by type
    const summary = {
      totalActivities: weeklyActivities.length,
      byType: {},
      byDay: {},
      mostActive: null,
      engagement: 'low'
    };

    weeklyActivities.forEach(activity => {
      // Count by type
      summary.byType[activity.type] = (summary.byType[activity.type] || 0) + 1;

      // Count by day
      const date = new Date(activity.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      summary.byDay[date] = (summary.byDay[date] || 0) + 1;
    });

    // Find most active day
    summary.mostActive = Object.entries(summary.byDay).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Determine engagement
    if (summary.totalActivities > 50) summary.engagement = 'high';
    else if (summary.totalActivities > 20) summary.engagement = 'moderate';

    return summary;
  } catch (error) {
    console.error('❌ Error getting weekly summary:', error);
    return null;
  }
};

export default {
  logActivity,
  logNavigation,
  logAssessmentCompletion,
  logCBTEntry,
  logMoodEntry,
  logChatMessage,
  logExerciseCompletion,
  logCrisisIntervention,
  logVoiceInteraction,
  getRecentActivities,
  getActivitiesByType,
  generateActivitySummary,
  getWeeklyActivitySummary,
  ACTIVITY_TYPES
};
