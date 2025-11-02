/**
 * Unified User Context Service
 * Aggregates data from all working features for comprehensive AI awareness
 * - Mood history and trends
 * - CBT entries (thoughts, distortions, rational responses)
 * - AI Coach conversation history
 * - Friend conversation history
 * - Assessment results (BDI, etc.)
 * - Crisis support usage
 * - User preferences and language
 */

import { db } from './firebaseConfig.js';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

/**
 * Get comprehensive user context for AI services
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Unified context object
 */
export const getUnifiedUserContext = async (userId) => {
  if (!userId) {
    console.warn('⚠️ No userId provided to getUnifiedUserContext');
    return getEmptyContext();
  }

  try {
    const [moods, cbtEntries, coachHistory, friendHistory, assessments, preferences] = await Promise.all([
      getMoodHistory(userId),
      getCBTEntries(userId),
      getCoachConversationHistory(userId),
      getFriendConversationHistory(userId),
      getAssessmentResults(userId),
      getUserPreferences(userId)
    ]);

    return {
      userId,
      timestamp: new Date().toISOString(),
      moods,
      cbtEntries,
      coachHistory,
      friendHistory,
      assessments,
      preferences,
      summary: generateContextSummary({
        moods,
        cbtEntries,
        coachHistory,
        friendHistory,
        assessments,
        preferences
      })
    };
  } catch (error) {
    console.error('❌ Error fetching unified context:', error);
    return getEmptyContext();
  }
};

/**
 * Get recent mood history (last 30 days)
 */
const getMoodHistory = async (userId) => {
  try {
    const moods = [];
    const q = query(
      collection(db, 'users', userId, 'moods'),
      orderBy('timestamp', 'desc'),
      limit(30)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      moods.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return moods.reverse(); // Chronological order
  } catch (error) {
    console.warn('⚠️ Error fetching mood history:', error);
    return [];
  }
};

/**
 * Get CBT entries (Triple-Column Technique)
 */
const getCBTEntries = async (userId) => {
  try {
    const entries = [];
    const q = query(
      collection(db, 'users', userId, 'cbtEntries'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      entries.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return entries;
  } catch (error) {
    console.warn('⚠️ Error fetching CBT entries:', error);
    return [];
  }
};

/**
 * Get AI Coach conversation history
 */
const getCoachConversationHistory = async (userId) => {
  try {
    const messages = [];
    const q = query(
      collection(db, 'users', userId, 'coachConversations'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return messages;
  } catch (error) {
    console.warn('⚠️ Error fetching coach history:', error);
    return [];
  }
};

/**
 * Get Friend conversation history
 */
const getFriendConversationHistory = async (userId) => {
  try {
    const messages = [];
    const q = query(
      collection(db, 'users', userId, 'friendConversations'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return messages;
  } catch (error) {
    console.warn('⚠️ Error fetching friend history:', error);
    return [];
  }
};

/**
 * Get assessment results (BDI, etc.)
 */
const getAssessmentResults = async (userId) => {
  try {
    const results = [];
    const q = query(
      collection(db, 'users', userId, 'assessments'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      results.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return results;
  } catch (error) {
    console.warn('⚠️ Error fetching assessments:', error);
    return [];
  }
};

/**
 * Get user preferences (language, notification settings, etc.)
 */
const getUserPreferences = async (userId) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('uid', '==', userId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return {};
    const userData = snapshot.docs[0].data();
    return {
      preferredLanguage: userData.preferredLanguage || 'en',
      notificationsEnabled: userData.notificationsEnabled !== false,
      theme: userData.theme || 'light',
      displayName: userData.displayName,
      email: userData.email,
      createdAt: userData.createdAt
    };
  } catch (error) {
    console.warn('⚠️ Error fetching user preferences:', error);
    return {};
  }
};

/**
 * Generate summary of user context for AI prompts
 */
const generateContextSummary = ({
  moods,
  cbtEntries,
  coachHistory,
  friendHistory,
  assessments,
  preferences
}) => {
  const recentMoods = moods.slice(-7); // Last 7 days
  const moodTrend = recentMoods.length > 0 
    ? recentMoods.map(m => m.mood || m.id).join(', ')
    : 'No data';

  const recentCBT = cbtEntries.slice(0, 3);
  const cbtSummary = recentCBT.length > 0
    ? `Recent thoughts: ${recentCBT.map(e => e.automaticThought?.substring(0, 50)).join('; ')}`
    : 'No CBT entries yet';

  const latestAssessment = assessments[0];
  const assessmentSummary = latestAssessment
    ? `Latest ${latestAssessment.type}: Score ${latestAssessment.score} (${latestAssessment.severity || 'N/A'})`
    : 'No assessments yet';

  const coachEngagement = coachHistory.length;
  const friendEngagement = friendHistory.length;

  return {
    moodTrend,
    cbtSummary,
    assessmentSummary,
    engagement: {
      coachMessages: coachEngagement,
      friendMessages: friendEngagement,
      totalCBTEntries: cbtEntries.length
    },
    preferredLanguage: preferences.preferredLanguage || 'en',
    userSince: preferences.createdAt
  };
};

/**
 * Get empty context (fallback)
 */
const getEmptyContext = () => ({
  userId: null,
  timestamp: new Date().toISOString(),
  moods: [],
  cbtEntries: [],
  coachHistory: [],
  friendHistory: [],
  assessments: [],
  preferences: {},
  summary: {
    moodTrend: 'No data',
    cbtSummary: 'No CBT entries yet',
    assessmentSummary: 'No assessments yet',
    engagement: {
      coachMessages: 0,
      friendMessages: 0,
      totalCBTEntries: 0
    },
    preferredLanguage: 'en'
  }
});

/**
 * Format context for AI prompts (concise version)
 */
export const formatContextForPrompt = (context) => {
  if (!context || !context.summary) return '';

  const { summary, moods, cbtEntries, assessments } = context;
  const recentMoods = moods.slice(-3);
  const recentCBT = cbtEntries.slice(0, 2);

  let prompt = `User Context:\n`;
  prompt += `- Mood Trend (last 7 days): ${summary.moodTrend}\n`;
  
  if (recentMoods.length > 0) {
    prompt += `- Current Mood: ${recentMoods[recentMoods.length - 1].mood || 'Unknown'}\n`;
  }

  if (recentCBT.length > 0) {
    prompt += `- Recent Thoughts: ${recentCBT.map(e => e.automaticThought?.substring(0, 40)).join('; ')}\n`;
  }

  if (assessments.length > 0) {
    prompt += `- Latest Assessment: ${summary.assessmentSummary}\n`;
  }

  prompt += `- Engagement: ${summary.engagement.coachMessages} coach messages, ${summary.engagement.friendMessages} friend messages\n`;
  prompt += `- Preferred Language: ${summary.preferredLanguage}\n`;

  return prompt;
};

export default {
  getUnifiedUserContext,
  formatContextForPrompt,
  getMoodHistory,
  getCBTEntries,
  getCoachConversationHistory,
  getFriendConversationHistory,
  getAssessmentResults,
  getUserPreferences
};
