/**
 * API Service - Connects Frontend to Firebase Functions
 * Base URL: https://asia-south1-mindmend-25dca.cloudfunctions.net
 */

const FUNCTIONS_URL = "https://asia-south1-mindmend-25dca.cloudfunctions.net";

/**
 * Generic function caller with error handling
 */
export async function callFunction(functionName, data = {}) {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Function ${functionName} failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
}

/**
 * API endpoints for all backend functions
 */
export const api = {
  // AI Chat Functions
  chat: async (message, moodHistory = [], userProgress = {}) => {
    const response = await callFunction('chat', { 
      message, 
      moodHistory, 
      userProgress 
    });
    return response;
  },

  chatMultilingual: async (message, language = 'en', moodHistory = []) => {
    const response = await callFunction('chatMultilingual', { 
      message, 
      language, 
      moodHistory 
    });
    return response;
  },

  // Mood Analysis
  analyzeMood: async (text, context = {}) => {
    const response = await callFunction('analyzeMood', { 
      text, 
      context 
    });
    return response;
  },

  // Doodle Analysis (Cloud Vision)
  analyzeDoodle: async (imageData) => {
    const response = await callFunction('analyzeDoodle', { 
      imageData 
    });
    return response;
  },

  // Voice Features
  speechToText: async (audioData, language = 'en') => {
    const response = await callFunction('speechToText', { 
      audioData, 
      language 
    });
    return response;
  },

  textToSpeech: async (text, language = 'en', voice = 'default') => {
    const response = await callFunction('textToSpeech', { 
      text, 
      language, 
      voice 
    });
    return response;
  },

  voiceChat: async (audioData, language = 'en', context = {}) => {
    const response = await callFunction('voiceChat', { 
      audioData, 
      language, 
      context 
    });
    return response;
  },

  // Translation
  streamingTranslation: async (text, targetLanguage = 'en') => {
    const response = await callFunction('streamingTranslation', { 
      text, 
      targetLanguage,
      streaming: false 
    });
    return response;
  },

  // Notifications (FCM)
  sendNotification: async (userId, title, body, data = {}) => {
    const response = await callFunction('sendNotification', { 
      userId, 
      title, 
      body, 
      data 
    });
    return response;
  },

  registerToken: async (userId, token) => {
    const response = await callFunction('registerToken', { 
      userId, 
      token 
    });
    return response;
  },

  // Analytics
  getAnalyticsDashboard: async (userId, timeRange = '30d') => {
    const response = await callFunction('getAnalyticsDashboard', { 
      userId, 
      timeRange 
    });
    return response;
  },

  getUserInsights: async (userId) => {
    const response = await callFunction('getUserInsights', { 
      userId 
    });
    return response;
  },

  // Health Check
  healthCheck: async () => {
    const response = await fetch(`${FUNCTIONS_URL}/healthCheck`);
    return await response.json();
  },
};

export default api;
