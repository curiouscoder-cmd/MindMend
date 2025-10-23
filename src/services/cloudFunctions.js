// Firebase Cloud Functions Client
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'http://localhost:5001/mindmend-ai/us-central1';

/**
 * Call Gemini 2.5 chat function (English only)
 */
export const callChatFunction = async (message, moodHistory = [], userProgress = {}, language = 'en') => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, moodHistory, userProgress, language }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat function error:', error);
    throw error;
  }
};

/**
 * Call multilingual chat with Gemma 3 + Gemini 2.5 pipeline
 */
export const callMultilingualChat = async (message, moodHistory = [], userProgress = {}) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/chatMultilingual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, moodHistory, userProgress }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Multilingual chat error:', error);
    throw error;
  }
};

/**
 * Analyze mood with Cloud Natural Language
 */
export const analyzeMoodText = async (text, language = 'en') => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/analyzeMood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Mood analysis error:', error);
    throw error;
  }
};

/**
 * Analyze doodle with Cloud Vision
 */
export const analyzeDoodleImage = async (imageBase64) => {
  try {
    const response = await fetch(`${FUNCTIONS_URL}/analyzeDoodle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Doodle analysis error:', error);
    throw error;
  }
};

export default {
  callChatFunction,
  callMultilingualChat,
  analyzeMoodText,
  analyzeDoodleImage,
};
