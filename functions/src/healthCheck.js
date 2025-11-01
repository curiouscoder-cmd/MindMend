// Health Check Function - Test emulator setup
import { onRequest } from 'firebase-functions/v2/https';

export const healthCheck = onRequest({ 
  cors: true,
  region: 'asia-south1'
}, (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'MindMend Functions are running!',
    environment: process.env.NODE_ENV || 'development',
    functions: [
      'chat',
      'chatMultilingual',
      'voiceChat',
      'analyzeMood',
      'analyzeDoodle',
      'speechToText',
      'textToSpeech',
      'sendNotification',
      'registerToken',
      'exportMoodEntry',
      'getAnalyticsDashboard'
    ]
  });
});
