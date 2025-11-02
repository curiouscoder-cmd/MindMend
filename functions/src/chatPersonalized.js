/**
 * Personalized Chat with Gemini 2.0 Flash
 * Firebase Function version (replaces Netlify function)
 * Enhanced with conversation context and user personalization
 */

import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI } from '@google/genai';

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'mindmend-ai';
const LOCATION = 'us-central1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
  maxInstances: 5
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

    // Generate content with enhanced config
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents,
      config: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
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

    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Fallback if no response
    const finalResponse = responseText || 
      `Thank you for sharing, ${userContext.userName || 'friend'}. I'm here to support you. What would feel most helpful right now?`;

    console.log('✅ Generated personalized response:', {
      length: finalResponse.length,
      userName: userContext.userName,
      finishReason: result.candidates?.[0]?.finishReason
    });

    res.json({
      response: finalResponse,
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp',
      personalized: true
    });

  } catch (error) {
    console.error('❌ Personalized chat error:', error);
    console.error('Error details:', error.message);
    
    // Intelligent fallback based on context
    const { userContext = {} } = req.body || {};
    const userName = userContext.userName || 'friend';
    const recentMood = userContext.moodHistory?.[userContext.moodHistory.length - 1];
    
    const fallbackResponse = recentMood
      ? `I'm here with you, ${userName}. I noticed you've been feeling ${recentMood}. What would feel most supportive right now—talking through it, trying a grounding exercise, or taking a small action step?`
      : `Thank you for reaching out, ${userName}. I'm here to support you. What's on your mind today?`;

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
