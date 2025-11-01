/**
 * Advanced Gemini Features using @google/genai v1.27.0
 * - Streaming responses
 * - Function calling
 * - Multi-turn chat sessions
 * - File uploads
 * - Context caching
 * - Live sessions (audio/video)
 */

import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * Streaming Chat - Real-time token streaming
 * Lower latency, better UX for long responses
 */
export const streamingChat = onRequest({
  cors: true,
  region: 'us-central1', // Moved to bypass asia-south1 CPU quota
  timeoutSeconds: 120,
  memory: '256MiB'
}, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🌊 Starting streaming chat...');

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Build contents from history
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Stream response
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash-exp',
      contents,
      config: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500
      }
    });

    let fullText = '';
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      
      // Send chunk as SSE
      res.write(`data: ${JSON.stringify({ 
        chunk: chunkText, 
        done: false 
      })}\n\n`);
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ 
      chunk: '', 
      done: true, 
      fullText 
    })}\n\n`);
    
    res.end();

    console.log('✅ Streaming complete');

  } catch (error) {
    console.error('❌ Streaming error:', error);
    res.write(`data: ${JSON.stringify({ 
      error: error.message, 
      done: true 
    })}\n\n`);
    res.end();
  }
});

/**
 * Function Calling - Let Gemini call external functions
 * Use case: Get mood insights, schedule reminders, search exercises
 */
export const functionCallingChat = onRequest({
  cors: true,
  region: 'asia-south1',
  timeoutSeconds: 60,
  memory: '512MiB'
}, async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🔧 Function calling chat...');

    // Define available functions
    const functions = [
      {
        name: 'getMoodInsights',
        description: 'Get mood insights and patterns for a user over a time period',
        parametersJsonSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'The user ID'
            },
            days: {
              type: 'number',
              description: 'Number of days to analyze (default: 7)'
            }
          },
          required: ['userId']
        }
      },
      {
        name: 'suggestExercise',
        description: 'Suggest a CBT exercise based on user mood and needs',
        parametersJsonSchema: {
          type: 'object',
          properties: {
            mood: {
              type: 'string',
              description: 'Current mood (anxious, sad, stressed, etc.)'
            },
            duration: {
              type: 'number',
              description: 'Desired exercise duration in minutes'
            }
          },
          required: ['mood']
        }
      },
      {
        name: 'scheduleReminder',
        description: 'Schedule a wellness reminder for the user',
        parametersJsonSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Reminder message'
            },
            time: {
              type: 'string',
              description: 'Time in HH:MM format'
            },
            frequency: {
              type: 'string',
              enum: ['once', 'daily', 'weekly'],
              description: 'Reminder frequency'
            }
          },
          required: ['message', 'time']
        }
      }
    ];

    // Generate content with function calling
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: message,
      config: {
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO
          }
        },
        tools: [{ functionDeclarations: functions }]
      }
    });

    // Check if model wants to call a function
    const functionCalls = response.functionCalls || [];
    
    if (functionCalls.length > 0) {
      console.log('📞 Function calls requested:', functionCalls);
      
      // Execute functions (mock implementation)
      const functionResults = functionCalls.map(call => {
        let result;
        
        switch (call.name) {
          case 'getMoodInsights':
            result = {
              averageMood: 'calm',
              moodTrend: 'improving',
              topEmotions: ['calm', 'happy', 'focused'],
              recommendation: 'Continue your current practices'
            };
            break;
            
          case 'suggestExercise':
            result = {
              exercise: 'Progressive Muscle Relaxation',
              duration: call.args.duration || 10,
              description: 'A calming exercise to reduce physical tension'
            };
            break;
            
          case 'scheduleReminder':
            result = {
              scheduled: true,
              message: call.args.message,
              time: call.args.time,
              frequency: call.args.frequency || 'once'
            };
            break;
            
          default:
            result = { error: 'Unknown function' };
        }
        
        return {
          functionCall: call,
          functionResponse: result
        };
      });

      return res.json({
        response: response.text || 'I can help you with that.',
        functionCalls: functionResults,
        requiresAction: true
      });
    }

    // Regular text response
    res.json({
      response: response.text,
      functionCalls: [],
      requiresAction: false
    });

  } catch (error) {
    console.error('❌ Function calling error:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
});

/**
 * Multi-turn Chat Session - Stateful conversations
 * Maintains context across multiple messages
 */
export const chatSession = onRequest({
  cors: true,
  region: 'asia-south1',
  timeoutSeconds: 60,
  memory: '512MiB'
}, async (req, res) => {
  try {
    const { message, sessionId, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('💬 Chat session:', sessionId);

    // Create chat session with history
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-exp',
      config: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,
        systemInstruction: {
          parts: [{
            text: `You are Mira, an empathetic AI wellness coach. You provide:
- Supportive, non-judgmental responses
- Evidence-based CBT techniques
- Personalized wellness recommendations
- Crisis support when needed

Remember user context and build on previous conversations.`
          }]
        }
      },
      history: history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });

    // Send message
    const response = await chat.sendMessage(message);

    res.json({
      response: response.text,
      sessionId,
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp'
    });

  } catch (error) {
    console.error('❌ Chat session error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

/**
 * Multimodal Input - Text + Images
 * Analyze mood from doodles, photos, etc.
 */
export const multimodalAnalysis = onRequest({
  cors: true,
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB'
}, async (req, res) => {
  try {
    const { text, imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image is required' });
    }

    console.log('🖼️ Multimodal analysis...');

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: text || 'Analyze this image and describe the mood or emotions it conveys.' },
            {
              inlineData: {
                data: imageBase64,
                mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    });

    res.json({
      analysis: response.text,
      timestamp: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp'
    });

  } catch (error) {
    console.error('❌ Multimodal analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      details: error.message 
    });
  }
});

/**
 * Context Caching - Reduce costs for repeated prompts
 * Cache system instructions and user history
 */
export const cachedChat = onRequest({
  cors: true,
  region: 'asia-south1',
  timeoutSeconds: 60,
  memory: '512MiB'
}, async (req, res) => {
  try {
    const { message, userId, useCache = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('💾 Cached chat for user:', userId);

    // Create or get cache
    let cacheId = null;
    
    if (useCache) {
      try {
        // Create cache with system instructions
        const cache = await ai.caches.create({
          model: 'gemini-2.0-flash-exp',
          contents: [{
            role: 'user',
            parts: [{
              text: `System: You are Mira, an empathetic AI wellness coach specialized in CBT techniques and mental health support.`
            }]
          }],
          ttlSeconds: 3600 // Cache for 1 hour
        });
        
        cacheId = cache.name;
        console.log('✅ Cache created:', cacheId);
      } catch (cacheError) {
        console.warn('⚠️ Cache creation failed, continuing without cache:', cacheError.message);
      }
    }

    // Generate content (with or without cache)
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: message,
      ...(cacheId && { cachedContent: cacheId }),
      config: {
        temperature: 0.9,
        maxOutputTokens: 300
      }
    });

    res.json({
      response: response.text,
      cached: !!cacheId,
      cacheId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cached chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

/**
 * JSON Mode - Structured output
 * Get structured mood analysis, exercise recommendations, etc.
 */
export const structuredOutput = onRequest({
  cors: true,
  region: 'asia-south1',
  timeoutSeconds: 60,
  memory: '512MiB'
}, async (req, res) => {
  try {
    const { text, outputType = 'moodAnalysis' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('📋 Structured output:', outputType);

    const schemas = {
      moodAnalysis: {
        type: 'object',
        properties: {
          primaryMood: { type: 'string' },
          intensity: { type: 'number', minimum: 1, maximum: 10 },
          emotions: { type: 'array', items: { type: 'string' } },
          triggers: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        },
        required: ['primaryMood', 'intensity', 'emotions']
      },
      exerciseRecommendation: {
        type: 'object',
        properties: {
          exerciseName: { type: 'string' },
          duration: { type: 'number' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          steps: { type: 'array', items: { type: 'string' } },
          benefits: { type: 'array', items: { type: 'string' } }
        },
        required: ['exerciseName', 'duration', 'steps']
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: text,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schemas[outputType] || schemas.moodAnalysis
      }
    });

    const structuredData = JSON.parse(response.text);

    res.json({
      data: structuredData,
      type: outputType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Structured output error:', error);
    res.status(500).json({ 
      error: 'Failed to generate structured output',
      details: error.message 
    });
  }
});

export default {
  streamingChat,
  functionCallingChat,
  chatSession,
  multimodalAnalysis,
  cachedChat,
  structuredOutput
};
