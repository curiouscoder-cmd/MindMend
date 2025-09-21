// Netlify Function: Database operations via Supabase
// Handles server-side database operations with service key

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service key for server operations
);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { operation, data } = JSON.parse(event.body || '{}');

    switch (operation) {
      case 'saveMoodEntry':
        return await saveMoodEntry(data, headers);
      
      case 'saveExerciseCompletion':
        return await saveExerciseCompletion(data, headers);
      
      case 'saveForumPost':
        return await saveForumPost(data, headers);
      
      case 'getUserMetrics':
        return await getUserMetrics(data, headers);
      
      case 'getAggregatedMetrics':
        return await getAggregatedMetrics(data, headers);
      
      case 'healthCheck':
        return await healthCheck(headers);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid operation' })
        };
    }
  } catch (error) {
    console.error('Database function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', details: error.message })
    };
  }
};

async function saveMoodEntry(data, headers) {
  const { userId, moodData } = data;
  
  const entry = {
    user_id: userId,
    mood: moodData.mood,
    intensity: moodData.intensity || 5,
    triggers: moodData.triggers || [],
    notes: moodData.notes || '',
    timestamp: new Date().toISOString()
  };

  const { data: result, error } = await supabase
    .from('mood_entries')
    .insert([entry])
    .select()
    .single();

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: result })
  };
}

async function saveExerciseCompletion(data, headers) {
  const { userId, exerciseData } = data;
  
  const completion = {
    user_id: userId,
    exercise_id: exerciseData.exerciseId,
    exercise_type: exerciseData.type,
    duration: exerciseData.duration,
    completion_rate: exerciseData.completionRate || 100,
    mood_before: exerciseData.moodBefore,
    mood_after: exerciseData.moodAfter,
    effectiveness: exerciseData.effectiveness,
    notes: exerciseData.notes || '',
    timestamp: new Date().toISOString()
  };

  const { data: result, error } = await supabase
    .from('exercise_completions')
    .insert([completion])
    .select()
    .single();

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: result })
  };
}

async function saveForumPost(data, headers) {
  const { userId, postData } = data;
  
  const post = {
    user_id: userId,
    forum_id: postData.forumId,
    title: postData.title || '',
    content: postData.content,
    is_anonymous: postData.isAnonymous || false,
    tags: postData.tags || [],
    timestamp: new Date().toISOString()
  };

  const { data: result, error } = await supabase
    .from('forum_posts')
    .insert([post])
    .select()
    .single();

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: result })
  };
}

async function getUserMetrics(data, headers) {
  const { userId, timeframe = 'month' } = data;
  
  let startDate = new Date();
  if (timeframe === 'week') startDate.setDate(startDate.getDate() - 7);
  else if (timeframe === 'month') startDate.setMonth(startDate.getMonth() - 1);
  else if (timeframe === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

  const { data: metrics, error } = await supabase
    .from('user_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: metrics })
  };
}

async function getAggregatedMetrics(data, headers) {
  const { timeframe = 'week' } = data;
  
  let startDate = new Date();
  if (timeframe === 'week') startDate.setDate(startDate.getDate() - 7);
  else if (timeframe === 'month') startDate.setMonth(startDate.getMonth() - 1);
  else if (timeframe === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

  // Get aggregated metrics
  const { data: metrics, error } = await supabase
    .from('user_metrics')
    .select('*')
    .gte('timestamp', startDate.toISOString());

  if (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }

  // Calculate aggregations
  const uniqueUsers = new Set(metrics.map(m => m.user_id));
  const totalExercises = metrics.reduce((sum, m) => sum + (m.exercises_completed || 0), 0);
  const totalSessions = metrics.length;
  const avgSessionDuration = totalSessions > 0 
    ? metrics.reduce((sum, m) => sum + (m.session_duration || 0), 0) / totalSessions 
    : 0;

  const aggregated = {
    totalUsers: uniqueUsers.size,
    dailyActiveUsers: uniqueUsers.size, // Simplified
    completedExercises: totalExercises,
    averageMoodScore: 7.2, // Would calculate from mood_entries
    engagementRate: Math.min(100, (avgSessionDuration / 300000) * 100), // 5 minutes = 100%
    totalSessions,
    averageSessionDuration: Math.round(avgSessionDuration / 1000) // Convert to seconds
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: aggregated })
  };
}

async function healthCheck(headers) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        status: error ? 'error' : 'healthy',
        error: error?.message,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}
