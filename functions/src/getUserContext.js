/**
 * Get Unified User Context
 * Fetches all user data server-side for AI services
 * Uses service account permissions to access all collections
 */

import { onRequest } from 'firebase-functions/v2/https';
import { db } from './admin.js';

export const getUserContext = onRequest({
  cors: [
    {
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  ],
  region: 'us-central1',
  timeoutSeconds: 30,
  memory: '512MiB'
}, async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    return res.status(204).send('');
  }

  // Set CORS headers for regular requests
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Credentials', 'true');

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log('📊 Fetching unified context for user:', userId);

    // Fetch all user data in parallel
    const [moods, cbtEntries, coachHistory, friendHistory, assessments, preferences, activities] = await Promise.all([
      getMoodHistory(userId),
      getCBTEntries(userId),
      getCoachConversationHistory(userId),
      getFriendConversationHistory(userId),
      getAssessmentResults(userId),
      getUserPreferences(userId),
      getRecentActivities(userId)
    ]);

    const context = {
      userId,
      timestamp: new Date().toISOString(),
      moods,
      cbtEntries,
      coachHistory,
      friendHistory,
      assessments,
      preferences,
      activities,
      summary: generateContextSummary({
        moods,
        cbtEntries,
        coachHistory,
        friendHistory,
        assessments,
        preferences,
        activities
      })
    };

    console.log('✅ Context fetched:', {
      moods: moods.length,
      cbtEntries: cbtEntries.length,
      coachMessages: coachHistory.length,
      friendMessages: friendHistory.length,
      assessments: assessments.length,
      activities: activities.length
    });

    return res.status(200).json(context);

  } catch (error) {
    console.error('❌ Error fetching user context:', error);
    return res.status(500).json({
      error: 'Failed to fetch user context',
      details: error.message
    });
  }
});

/**
 * Get recent mood history (last 30 days)
 */
const getMoodHistory = async (userId) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('moods')
      .orderBy('timestamp', 'desc')
      .limit(30)
      .get();

    const moods = [];
    snapshot.forEach(doc => {
      moods.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return moods.reverse(); // Chronological order
  } catch (error) {
    console.warn('⚠️ Error fetching mood history:', error.message);
    return [];
  }
};

/**
 * Get CBT entries
 */
const getCBTEntries = async (userId) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('cbtEntries')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const entries = [];
    snapshot.forEach(doc => {
      entries.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return entries.reverse(); // Chronological order
  } catch (error) {
    console.warn('⚠️ Error fetching CBT entries:', error.message);
    return [];
  }
};

/**
 * Get coach conversation history
 */
const getCoachConversationHistory = async (userId) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('coachConversations')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return messages.reverse(); // Chronological order
  } catch (error) {
    console.warn('⚠️ Error fetching coach history:', error.message);
    return [];
  }
};

/**
 * Get friend conversation history
 */
const getFriendConversationHistory = async (userId) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('friendConversations')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return messages.reverse(); // Chronological order
  } catch (error) {
    console.warn('⚠️ Error fetching friend history:', error.message);
    return [];
  }
};

/**
 * Get assessment results
 */
const getAssessmentResults = async (userId) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('assessments')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const assessments = [];
    snapshot.forEach(doc => {
      assessments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return assessments;
  } catch (error) {
    console.warn('⚠️ Error fetching assessments:', error.message);
    return [];
  }
};

/**
 * Get user preferences
 */
const getUserPreferences = async (userId) => {
  try {
    const doc = await db
      .collection('users')
      .doc(userId)
      .collection('preferences')
      .doc('settings')
      .get();

    if (doc.exists) {
      return doc.data();
    }
    return {};
  } catch (error) {
    console.warn('⚠️ Error fetching user preferences:', error.message);
    return {};
  }
};

/**
 * Get recent activities
 */
const getRecentActivities = async (userId) => {
  try {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('activities')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

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
 * Generate context summary for AI prompts
 */
const generateContextSummary = ({ moods, cbtEntries, coachHistory, friendHistory, assessments, preferences, activities }) => {
  // Mood trend
  const recentMoods = moods.slice(-7);
  const moodTrend = recentMoods.length > 0
    ? recentMoods.map(m => m.mood || 'neutral').join(' → ')
    : 'No mood data';

  // CBT summary
  const latestCBT = cbtEntries[cbtEntries.length - 1];
  const cbtSummary = latestCBT
    ? `Recent thought: "${latestCBT.automaticThought}". Distortions: ${latestCBT.distortions?.join(', ') || 'none'}`
    : 'No CBT entries yet';

  // Assessment summary
  const latestAssessment = assessments[0];
  const assessmentSummary = latestAssessment
    ? `Latest ${latestAssessment.type || 'Assessment'}: Score ${latestAssessment.score} (${latestAssessment.severity || 'unknown'})`
    : 'No assessments completed';

  // Activity summary
  const activityTypes = {};
  activities.forEach(a => {
    activityTypes[a.type] = (activityTypes[a.type] || 0) + 1;
  });

  const recentActivities = activities.slice(-5).map(a => `${a.type}: ${a.action}`).join(', ');
  const activitySummary = recentActivities || 'No recent activities';

  // Engagement metrics
  const engagement = {
    coachMessages: coachHistory.length,
    friendMessages: friendHistory.length,
    totalCBTEntries: cbtEntries.length,
    totalMoodEntries: moods.length,
    totalAssessments: assessments.length,
    totalActivities: activities.length,
    activityTypes
  };

  return {
    moodTrend,
    cbtSummary,
    assessmentSummary,
    activitySummary,
    recentActivities: activities.slice(-10),
    engagement,
    preferredLanguage: preferences?.preferredLanguage || 'en'
  };
};
