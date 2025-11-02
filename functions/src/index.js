// Firebase Functions Entry Point
import './admin.js'; // Initialize Firebase Admin first
import { setGlobalOptions } from 'firebase-functions/v2';

// Set global options
setGlobalOptions({
  region: 'asia-south1', // Mumbai, India region
  maxInstances: 10,
});

// Import function modules
import { chat } from './chat.js';
import { chatMultilingual } from './chatMultilingual.js';
import { analyzeMood } from './analyzeMood.js';
import { speechToText } from './speechToText.js';
import { textToSpeech } from './textToSpeech.js';
import {
  exportMoodEntry,
  exportChatMessage,
  exportExerciseCompletion,
  getAnalyticsDashboard,
  getUserInsights,
  initializeBigQuery
} from './analytics.js';
import {
  streamingTranslation,
  streamingTranslationMetrics,
  clearTranslationCache
} from './streamingTranslation.js';
import { chatPersonalized } from './chatPersonalized.js';
import { getUserContext } from './getUserContext.js';


// Export functions
export { 
  chat,
  chatPersonalized,
  getUserContext,
  chatMultilingual,
  analyzeMood,
  speechToText,
  textToSpeech,
  streamingTranslation,
  streamingTranslationMetrics,
  clearTranslationCache,
  exportMoodEntry,
  exportChatMessage,
  exportExerciseCompletion,
  getAnalyticsDashboard,
  getUserInsights,
  initializeBigQuery,
};
