// AI-Powered Insights Service using Gemini - Functional Approach
import { GoogleGenAI } from '@google/genai';

// Initialize AI client
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY 
});

// Constants
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'mindmend_insights';

// Cache management using closure
const createCache = () => {
  let cachedInsights = null;
  let lastUpdated = null;

  return {
    get: () => cachedInsights,
    set: (insights) => {
      cachedInsights = insights;
      lastUpdated = Date.now();
    },
    getAge: () => lastUpdated ? Date.now() - lastUpdated : Infinity,
    isValid: () => lastUpdated && (Date.now() - lastUpdated < UPDATE_INTERVAL),
    clear: () => {
      cachedInsights = null;
      lastUpdated = null;
    }
  };
};

const cache = createCache();

// Build context string from user data - Pure function
const buildUserContext = (userData) => {
  const {
    thoughtRecords = [],
    moodHistory = [],
    exercisesCompleted = 0,
    bdiScores = [],
    userStats = {}
  } = userData;

  let context = '';

  // Thought records analysis
  if (thoughtRecords.length > 0) {
    const distortions = thoughtRecords.flatMap(r => r.distortions || []);
    const distortionTypes = distortions.map(d => d.name || d.type);
    const distortionCounts = {};
    distortionTypes.forEach(type => {
      distortionCounts[type] = (distortionCounts[type] || 0) + 1;
    });
    
    context += `- Total thought records: ${thoughtRecords.length}\n`;
    context += `- Common cognitive distortions: ${Object.keys(distortionCounts).slice(0, 3).join(', ')}\n`;
  } else {
    context += `- No thought records yet (new user)\n`;
  }

  // Mood analysis
  if (moodHistory.length > 0) {
    const recentMoods = moodHistory.slice(0, 5).map(m => m.mood || m.id);
    context += `- Recent moods: ${recentMoods.join(', ')}\n`;
    context += `- Total mood entries: ${moodHistory.length}\n`;
  } else {
    context += `- No mood entries yet\n`;
  }

  // Exercise completion
  context += `- Exercises completed: ${exercisesCompleted}\n`;

  // BDI scores
  if (bdiScores.length > 0) {
    const latestScore = bdiScores[bdiScores.length - 1];
    context += `- Latest BDI score: ${latestScore.score} (${latestScore.severity})\n`;
  }

  // User stats
  if (userStats) {
    context += `- AI interactions: ${userStats.aiInteractions || 0}\n`;
    context += `- Session count: ${userStats.totalSessions || 1}\n`;
  }

  return context || '- New user with no activity yet';
};

// Generate AI insights - Async function
const generateAIInsights = async (userData) => {
  try {
    const context = buildUserContext(userData);

    const prompt = `You are a mental health analytics assistant. Analyze this user's mental wellness data and provide brief, actionable insights.

User Data Summary:
${context}

Please provide a JSON response with the following structure (keep responses brief and supportive):
{
  "mostCommonTrigger": "Brief description of the most common trigger (max 3-4 words)",
  "primaryPattern": "Main cognitive pattern observed (max 5 words)",
  "progressSummary": "One sentence about their progress",
  "recommendation": "One actionable suggestion (max 15 words)"
}

Important: Keep all responses concise, supportive, and actionable. If there's insufficient data, provide encouraging starter insights.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    const text = response.text;

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const insights = JSON.parse(jsonMatch[0]);
      
      return {
        ...insights,
        generatedAt: new Date().toISOString(),
        dataPoints: {
          thoughtCount: userData.thoughtRecords?.length || 0,
          moodCount: userData.moodHistory?.length || 0,
          exerciseCount: userData.exercisesCompleted || 0
        }
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return null;
  }
};

// Get fallback insights - Pure function
const getFallbackInsights = (userData) => {
  const { thoughtRecords = [], moodHistory = [] } = userData;

  // Calculate most common trigger from thought records
  let mostCommonTrigger = 'Getting started';
  if (thoughtRecords.length > 0) {
    const triggers = thoughtRecords.map(r => r.trigger).filter(Boolean);
    if (triggers.length > 0) {
      const triggerCounts = {};
      triggers.forEach(t => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
      const sorted = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);
      mostCommonTrigger = sorted[0][0];
    }
  }

  return {
    mostCommonTrigger,
    primaryPattern: thoughtRecords.length > 0 ? 'Building awareness' : 'Starting journey',
    progressSummary: thoughtRecords.length > 0 
      ? `You've recorded ${thoughtRecords.length} thought${thoughtRecords.length > 1 ? 's' : ''} - great progress!`
      : 'Start your journey by recording your first thought.',
    recommendation: 'Continue tracking your thoughts and moods daily.',
    generatedAt: new Date().toISOString(),
    dataPoints: {
      thoughtCount: thoughtRecords.length,
      moodCount: moodHistory.length,
      exerciseCount: 0
    }
  };
};

// Load insights from localStorage
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const age = Date.now() - new Date(parsed.generatedAt).getTime();
      if (age < UPDATE_INTERVAL) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading stored insights:', error);
  }
  return null;
};

// Save insights to localStorage
const saveToStorage = (insights) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(insights));
  } catch (error) {
    console.error('Error saving insights:', error);
  }
};

// Main function to get insights
export const getInsights = async (userData, forceRefresh = false) => {
  // Check memory cache first
  if (!forceRefresh && cache.isValid()) {
    console.log('📊 Using cached insights');
    return cache.get();
  }

  // Try localStorage
  if (!forceRefresh) {
    const stored = loadFromStorage();
    if (stored) {
      cache.set(stored);
      console.log('📊 Using stored insights');
      return stored;
    }
  }

  // Generate new insights
  console.log('🔄 Generating new AI insights...');
  const aiInsights = await generateAIInsights(userData);
  
  if (aiInsights) {
    cache.set(aiInsights);
    saveToStorage(aiInsights);
    console.log('✨ Generated AI insights:', aiInsights);
    return aiInsights;
  }

  // Fallback if AI fails
  const fallback = getFallbackInsights(userData);
  cache.set(fallback);
  saveToStorage(fallback);
  return fallback;
};

// Invalidate cache
export const invalidateCache = () => {
  console.log('🔄 Invalidating insights cache');
  cache.clear();
  localStorage.removeItem(STORAGE_KEY);
};

// Export default object for backward compatibility
export default {
  getInsights,
  invalidateCache
};
