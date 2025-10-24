// Firebase Functions Entry Point
import './admin.js'; // Initialize Firebase Admin first
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

// Set global options
setGlobalOptions({
  region: 'asia-south1', // Mumbai, India region
  maxInstances: 10,
});

// Import function modules
import { healthCheck } from './healthCheck.js';
import { chat } from './chat.js';
import { chatMultilingual } from './chatMultilingual.js';
import { analyzeMood } from './analyzeMood.js';
import { analyzeDoodle } from './analyzeDoodle.js';
import { speechToText } from './speechToText.js';
import { textToSpeech } from './textToSpeech.js';
import { voiceChat } from './voiceChat.js';
import { 
  sendNotification, 
  registerToken, 
  sendDailyReminder,
  onStreakMilestone,
  onCrisisDetected 
} from './notifications.js';
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

// Export functions
export { 
  healthCheck,
  chat,
  chatMultilingual,
  analyzeMood, 
  analyzeDoodle,
  speechToText,
  textToSpeech,
  voiceChat,
  sendNotification,
  registerToken,
  sendDailyReminder,
  onStreakMilestone,
  onCrisisDetected,
  exportMoodEntry,
  exportChatMessage,
  exportExerciseCompletion,
  getAnalyticsDashboard,
  getUserInsights,
  initializeBigQuery,
  streamingTranslation,
  streamingTranslationMetrics,
  clearTranslationCache
};
