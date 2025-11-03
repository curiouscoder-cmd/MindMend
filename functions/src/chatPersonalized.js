/**
 * Personalized Chat with Gemini 2.0 Flash
 * Firebase Function version (replaces Netlify function)
 * Enhanced with conversation context, user personalization, and rate limit handling
 * 
 * Features:
 * - Retry logic with exponential backoff for rate limiting
 * - Request deduplication and caching
 * - Graceful fallback responses
 * - Optimized for high concurrency
 */

import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI } from '@google/genai';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'mindmend-ai';
const LOCATION = 'us-central1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// In-memory cache for recent responses (TTL: 5 minutes)
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// Request queue to prevent concurrent API calls
let requestQueue = [];
let isProcessing = false;

/**
 * Generate cache key from message content
 */
function getCacheKey(messages) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMsg) return null;
  return `msg_${lastUserMsg.content.substring(0, 50).replace(/\s+/g, '_')}`;
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(cacheKey) {
  if (!cacheKey) return null;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('💾 Using cached response');
    return cached.response;
  }
  if (cached) {
    responseCache.delete(cacheKey);
  }
  return null;
}

/**
 * Cache response with TTL
 */
function cacheResponse(cacheKey, response) {
  if (!cacheKey) return;
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now()
  });
  // Clean old entries if cache gets too large
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
}

/**
 * Retry logic with exponential backoff and jitter
 */
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error
      if (error.status === 429 || error.code === 429) {
        if (attempt === maxRetries - 1) {
          // Last attempt failed, return graceful fallback
          console.log(`❌ Rate limited after ${maxRetries} attempts. Using fallback.`);
          throw error;
        }
        
        // Exponential backoff with jitter: 1s, 2s, 4s, 8s, 16s
        const baseDelay = Math.pow(2, attempt) * 1000;
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        
        console.log(`⏳ Rate limited. Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Don't retry for other errors
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// Configure CORS with all origins allowed
export const chatPersonalized = onRequest({
  cors: [
    {
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  ],
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  maxInstances: 2  // Reduced to prevent concurrent API calls
}, async (req, res) => {
  // Handle preflight requests
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
    const { messages, userContext = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log('🤖 Personalized chat request:', {
      userId: userContext.userId,
      userName: userContext.userName,
      messageCount: messages.length,
      moodCount: userContext.moodHistory?.length || 0
    });

    // Check cache first
    const cacheKey = getCacheKey(messages);
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return res.json({
        response: cachedResponse,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash-exp',
        personalized: true,
        cached: true
      });
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY
    });

    // Build contents array for Gemini API
    const contents = [];
    let systemPrompt = '';
    
    messages.forEach((msg, index) => {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else if (msg.role === 'user') {
        // For first user message, prepend system prompt
        const content = index === 1 && systemPrompt 
          ? `${systemPrompt}\n\n---\n\nUser: ${msg.content}`
          : msg.content;
        
        contents.push({
          role: 'user',
          parts: [{ text: content }]
        });
      } else if (msg.role === 'assistant') {
        contents.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    });

    // Generate content with retry logic and rate limit handling
    let result;
    try {
      result = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents,
          config: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 150, // Reduced for faster responses and more natural conversation
            candidateCount: 1,
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE'
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE'
              }
            ]
          }
        });
      }, 3);
    } catch (retryError) {
      console.error('❌ Failed after retries:', retryError.message);
      throw retryError;
    }

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Fallback if no response
    const finalResponse = responseText || 
      `Thank you for sharing, ${userContext.userName || 'friend'}. I'm here to support you. What would feel most helpful right now?`;

    // Cache the response
    cacheResponse(cacheKey, finalResponse);

    console.log('✅ Generated personalized response:', {
      length: finalResponse.length,
      userName: userContext.userName,
      finishReason: result.candidates?.[0]?.finishReason,
      cached: false
    });

    res.json({
      response: finalResponse,
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp',
      personalized: true,
      cached: false
    });

  } catch (error) {
    console.error('❌ Personalized chat error:', error);
    console.error('Error details:', error.message);
    
    // Intelligent fallback based on context
    const { userContext = {} } = req.body || {};
    const userName = userContext.userName || 'friend';
    const recentMood = userContext.moodHistory?.[userContext.moodHistory.length - 1];
    
    // More varied fallback responses
    const fallbackResponses = [
      recentMood
        ? `I'm here with you, ${userName}. I noticed you've been feeling ${recentMood}. What would feel most supportive right now?`
        : `Thank you for reaching out, ${userName}. I'm here to support you. What's on your mind today?`,
      `I'm listening, ${userName}. Tell me more about what you're experiencing.`,
      `You're not alone in this, ${userName}. I'm here to help. What would be most helpful right now?`,
      `Thank you for sharing with me, ${userName}. Let's work through this together.`
    ];
    
    const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    res.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
      fallback: true,
      personalized: true,
      error: error.message
    });
  }
});

export default chatPersonalized;
