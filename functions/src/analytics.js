// BigQuery Analytics - Export and analyze user data
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID || 'mindmend-ai',
});

const DATASET_ID = 'mindmend_analytics';

/**
 * Export mood entry to BigQuery
 */
export const exportMoodEntry = onDocumentCreated({
  document: 'users/{userId}/moodEntries/{entryId}',
  region: 'us-central1' // Moved to bypass asia-south1 CPU quota
}, async (event) => {
  try {
    const moodData = event.data.data();
    const userId = event.params.userId;
    const entryId = event.params.entryId;
    
    const row = {
      entry_id: entryId,
      user_id: userId,
      mood: moodData.mood,
      intensity: moodData.intensity || 0,
      timestamp: moodData.timestamp?.toDate?.() || new Date(),
      language: moodData.language || 'en',
      sentiment_score: moodData.sentimentScore || 0,
      urgency: moodData.urgency || 'low',
      has_crisis_indicators: moodData.hasCrisisIndicators || false,
      input_method: moodData.inputMethod || 'text',
    };
    
    await bigquery
      .dataset(DATASET_ID)
      .table('mood_entries')
      .insert([row]);
    
    console.log(`Exported mood entry ${entryId} to BigQuery`);
  } catch (error) {
    console.error('Error exporting mood entry:', error);
  }
});

/**
 * Export chat message to BigQuery
 */
export const exportChatMessage = onDocumentCreated({
  document: 'chatSessions/{userId}/messages/{messageId}',
  region: 'us-central1'
}, async (event) => {
  try {
    const messageData = event.data.data();
    const userId = event.params.userId;
    const messageId = event.params.messageId;
    
    const row = {
      message_id: messageId,
      user_id: userId,
      role: messageData.role,
      content_length: messageData.content?.length || 0,
      timestamp: messageData.timestamp?.toDate?.() || new Date(),
      language: messageData.language || 'en',
      model_used: messageData.model || 'unknown',
      response_time_ms: messageData.responseTime || 0,
      urgency: messageData.urgency || 'low',
    };
    
    await bigquery
      .dataset(DATASET_ID)
      .table('chat_messages')
      .insert([row]);
    
    console.log(`Exported chat message ${messageId} to BigQuery`);
  } catch (error) {
    console.error('Error exporting chat message:', error);
  }
});

/**
 * Export exercise completion to BigQuery
 */
export const exportExerciseCompletion = onDocumentCreated({
  document: 'exerciseCompletions/{userId}/sessions/{sessionId}',
  region: 'us-central1'
}, async (event) => {
  try {
    const sessionData = event.data.data();
    const userId = event.params.userId;
    const sessionId = event.params.sessionId;
    
    const row = {
      session_id: sessionId,
      user_id: userId,
      exercise_type: sessionData.exerciseType,
      duration_seconds: sessionData.duration || 0,
      completed: sessionData.completed || false,
      start_time: sessionData.startTime?.toDate?.() || new Date(),
      mood_before: sessionData.moodBefore || 'unknown',
      mood_after: sessionData.moodAfter || 'unknown',
      language: sessionData.language || 'en',
    };
    
    await bigquery
      .dataset(DATASET_ID)
      .table('exercise_completions')
      .insert([row]);
    
    console.log(`Exported exercise session ${sessionId} to BigQuery`);
  } catch (error) {
    console.error('Error exporting exercise completion:', error);
  }
});

/**
 * Get analytics dashboard data
 */
export const getAnalyticsDashboard = onRequest({ 
  cors: true,
  timeoutSeconds: 60,
  region: 'us-central1',
}, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Query 1: Mood distribution
    const moodQuery = `
      SELECT 
        mood,
        COUNT(*) as count,
        AVG(sentiment_score) as avg_sentiment
      FROM \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.mood_entries\`
      WHERE timestamp BETWEEN @startDate AND @endDate
      GROUP BY mood
      ORDER BY count DESC
    `;
    
    // Query 2: Language usage
    const languageQuery = `
      SELECT 
        language,
        COUNT(*) as count
      FROM \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.chat_messages\`
      WHERE timestamp BETWEEN @startDate AND @endDate
      GROUP BY language
      ORDER BY count DESC
    `;
    
    // Query 3: Crisis indicators
    const crisisQuery = `
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as crisis_count
      FROM \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.mood_entries\`
      WHERE timestamp BETWEEN @startDate AND @endDate
        AND has_crisis_indicators = true
      GROUP BY date
      ORDER BY date
    `;
    
    // Query 4: Exercise completion rate
    const exerciseQuery = `
      SELECT 
        exercise_type,
        COUNT(*) as total,
        SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed,
        AVG(duration_seconds) as avg_duration
      FROM \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.exercise_completions\`
      WHERE start_time BETWEEN @startDate AND @endDate
      GROUP BY exercise_type
    `;
    
    const options = {
      query: moodQuery,
      params: { 
        startDate: startDate || '2024-01-01',
        endDate: endDate || new Date().toISOString().split('T')[0]
      },
    };
    
    const [moodRows] = await bigquery.query({ ...options, query: moodQuery });
    const [languageRows] = await bigquery.query({ ...options, query: languageQuery });
    const [crisisRows] = await bigquery.query({ ...options, query: crisisQuery });
    const [exerciseRows] = await bigquery.query({ ...options, query: exerciseQuery });
    
    res.json({
      moodDistribution: moodRows,
      languageUsage: languageRows,
      crisisIndicators: crisisRows,
      exerciseStats: exerciseRows,
      period: {
        start: options.params.startDate,
        end: options.params.endDate,
      },
    });
    
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    });
  }
});

/**
 * Get user insights
 */
export const getUserInsights = onRequest({ 
  cors: true,
  timeoutSeconds: 30,
  region: 'us-central1',
}, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Query user's mood trends
    const query = `
      SELECT 
        DATE(timestamp) as date,
        mood,
        AVG(sentiment_score) as avg_sentiment,
        COUNT(*) as entry_count
      FROM \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.mood_entries\`
      WHERE user_id = @userId
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY date, mood
      ORDER BY date DESC
    `;
    
    const [rows] = await bigquery.query({
      query,
      params: { userId },
    });
    
    // Calculate insights
    const totalEntries = rows.reduce((sum, row) => sum + row.entry_count, 0);
    const avgSentiment = rows.reduce((sum, row) => sum + row.avg_sentiment, 0) / rows.length;
    const dominantMood = rows.sort((a, b) => b.entry_count - a.entry_count)[0]?.mood;
    
    res.json({
      userId,
      period: '30 days',
      totalEntries,
      avgSentiment,
      dominantMood,
      moodTrends: rows,
    });
    
  } catch (error) {
    console.error('User insights error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user insights',
      details: error.message 
    });
  }
});

/**
 * Initialize BigQuery tables (run once)
 */
export const initializeBigQuery = onRequest({ 
  cors: true,
  timeoutSeconds: 120,
  region: 'us-central1',
  memory: '256MiB',
}, async (req, res) => {
  try {
    const dataset = bigquery.dataset(DATASET_ID);
    
    // Create dataset if not exists
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
      await bigquery.createDataset(DATASET_ID, {
        location: 'US',
      });
      console.log(`Created dataset ${DATASET_ID}`);
    }
    
    // Create mood_entries table
    const moodSchema = [
      { name: 'entry_id', type: 'STRING' },
      { name: 'user_id', type: 'STRING' },
      { name: 'mood', type: 'STRING' },
      { name: 'intensity', type: 'INTEGER' },
      { name: 'timestamp', type: 'TIMESTAMP' },
      { name: 'language', type: 'STRING' },
      { name: 'sentiment_score', type: 'FLOAT' },
      { name: 'urgency', type: 'STRING' },
      { name: 'has_crisis_indicators', type: 'BOOLEAN' },
      { name: 'input_method', type: 'STRING' },
    ];
    
    await dataset.table('mood_entries').create({ schema: moodSchema }).catch(() => {});
    
    // Create chat_messages table
    const chatSchema = [
      { name: 'message_id', type: 'STRING' },
      { name: 'user_id', type: 'STRING' },
      { name: 'role', type: 'STRING' },
      { name: 'content_length', type: 'INTEGER' },
      { name: 'timestamp', type: 'TIMESTAMP' },
      { name: 'language', type: 'STRING' },
      { name: 'model_used', type: 'STRING' },
      { name: 'response_time_ms', type: 'INTEGER' },
      { name: 'urgency', type: 'STRING' },
    ];
    
    await dataset.table('chat_messages').create({ schema: chatSchema }).catch(() => {});
    
    // Create exercise_completions table
    const exerciseSchema = [
      { name: 'session_id', type: 'STRING' },
      { name: 'user_id', type: 'STRING' },
      { name: 'exercise_type', type: 'STRING' },
      { name: 'duration_seconds', type: 'INTEGER' },
      { name: 'completed', type: 'BOOLEAN' },
      { name: 'start_time', type: 'TIMESTAMP' },
      { name: 'mood_before', type: 'STRING' },
      { name: 'mood_after', type: 'STRING' },
      { name: 'language', type: 'STRING' },
    ];
    
    await dataset.table('exercise_completions').create({ schema: exerciseSchema }).catch(() => {});
    
    console.log('BigQuery tables initialized');
    
    res.json({
      success: true,
      dataset: DATASET_ID,
      tables: ['mood_entries', 'chat_messages', 'exercise_completions'],
    });
    
  } catch (error) {
    console.error('BigQuery initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize BigQuery',
      details: error.message 
    });
  }
});
