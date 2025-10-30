/**
 * Real-Time Voice Chat with Gemini Live API
 * WebSocket-based instant voice conversation
 * Uses native audio for natural, emotion-aware dialogue
 */

import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI, Modality } from '@google/genai';
import WebSocket from 'ws';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Use native audio model for best quality and emotion awareness
const MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';

/**
 * WebSocket endpoint for real-time voice chat
 */
export const realtimeVoiceChat = onRequest({
  cors: true,
  timeoutSeconds: 540, // 9 minutes for long conversations
  memory: '512MiB',
  region: 'asia-south1',
}, async (req, res) => {
  // Upgrade HTTP to WebSocket
  if (req.headers.upgrade !== 'websocket') {
    return res.status(400).json({ error: 'WebSocket upgrade required' });
  }

  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', async (ws) => {
    console.log('✅ Client connected to real-time voice chat');

    let geminiSession = null;
    const audioQueue = [];
    let isProcessing = false;

    try {
      // Initialize Gemini Live API session
      const config = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are Mira, an empathetic AI wellness coach specializing in mental health support.

Your role:
- Listen actively and respond with genuine empathy
- Detect and acknowledge emotions in the user's voice
- Provide supportive, non-judgmental guidance
- Use a warm, conversational tone
- Keep responses concise (2-3 sentences) for natural conversation flow
- Ask clarifying questions when needed
- Offer coping strategies and emotional support

Guidelines:
- Be present and attentive
- Validate feelings before offering advice
- Use affective dialogue (respond to tone and emotion)
- Maintain professional boundaries
- Suggest professional help for serious concerns`,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Aoede' // Warm, empathetic voice
            }
          }
        }
      };

      geminiSession = await ai.live.connect({
        model: MODEL,
        callbacks: {
          onopen: () => {
            console.log('🎤 Gemini Live session opened');
            ws.send(JSON.stringify({ type: 'session_ready' }));
          },
          
          onmessage: (message) => {
            handleGeminiMessage(message, ws);
          },
          
          onerror: (error) => {
            console.error('Gemini error:', error);
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: error.message 
            }));
          },
          
          onclose: () => {
            console.log('Gemini session closed');
          }
        },
        config
      });

      // Handle incoming messages from client
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);

          switch (message.type) {
            case 'audio_chunk':
              // Forward audio to Gemini Live API
              if (geminiSession && message.audio) {
                const audioData = Buffer.from(message.audio).toString('base64');
                
                geminiSession.sendRealtimeInput({
                  audio: {
                    data: audioData,
                    mimeType: 'audio/pcm;rate=16000'
                  }
                });
              }
              break;

            case 'text_input':
              // Handle text input (optional)
              if (geminiSession && message.text) {
                geminiSession.sendRealtimeInput({
                  text: message.text
                });
              }
              break;

            case 'end_turn':
              // Signal end of user's turn
              if (geminiSession) {
                geminiSession.endTurn();
              }
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log('Client disconnected');
        if (geminiSession) {
          geminiSession.close();
        }
      });

    } catch (error) {
      console.error('Session initialization error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to initialize session' 
      }));
      ws.close();
    }
  });

  // Upgrade connection
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
});

/**
 * Handle messages from Gemini Live API
 */
function handleGeminiMessage(message, ws) {
  try {
    // Handle different message types
    if (message.serverContent) {
      const content = message.serverContent;

      // Audio response
      if (content.modelTurn && content.modelTurn.parts) {
        content.modelTurn.parts.forEach(part => {
          if (part.inlineData && part.inlineData.mimeType.startsWith('audio/')) {
            // Send audio chunk to client
            ws.send(JSON.stringify({
              type: 'audio_chunk',
              audio: part.inlineData.data,
              mimeType: part.inlineData.mimeType
            }));
          }

          if (part.text) {
            // Send text transcription
            ws.send(JSON.stringify({
              type: 'text_response',
              text: part.text
            }));
          }
        });
      }

      // Turn complete
      if (content.turnComplete) {
        ws.send(JSON.stringify({
          type: 'turn_complete'
        }));
      }

      // Interruption
      if (content.interrupted) {
        ws.send(JSON.stringify({
          type: 'interrupted'
        }));
      }
    }

    // User transcription
    if (message.toolCall) {
      // Handle tool calls if needed
      console.log('Tool call:', message.toolCall);
    }

  } catch (error) {
    console.error('Error handling Gemini message:', error);
  }
}

/**
 * Health check endpoint
 */
export const realtimeVoiceChatHealth = onRequest({
  cors: true,
  region: 'asia-south1',
}, async (req, res) => {
  res.json({
    status: 'healthy',
    service: 'realtime-voice-chat',
    model: MODEL,
    features: [
      'WebSocket streaming',
      'Native audio',
      'Emotion-aware dialogue',
      'Low latency (<500ms)',
      'Bidirectional audio'
    ],
    timestamp: new Date().toISOString()
  });
});
