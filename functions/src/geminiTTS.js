/**
 * Gemini 2.5 Flash TTS Integration
 * Model: gemini-2.5-flash-tts
 * Voice: Aoede (Female)
 * Audio Encoding: LINEAR16 (PCM 16-bit)
 * Sample Rate: 44100 Hz
 */

import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI client with correct configuration
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  // Use beta API for preview models like TTS
  apiVersion: 'v1beta'
});

/**
 * Gemini 2.5 Flash TTS - High-quality, low-latency text-to-speech
 * @param {string} text - Text to synthesize
 * @param {string} voiceName - Voice name (Aoede, Kore, Puck, etc.)
 * @param {string} stylePrompt - Optional style prompt for delivery
 * @returns {Promise<Buffer>} Audio buffer (LINEAR16 @ 44100Hz)
 */
export async function synthesizeSpeech(text, voiceName = 'Aoede', stylePrompt = '') {
  try {
    // Add style prompt if provided
    const finalText = stylePrompt ? `${stylePrompt}: ${text}` : text;

    console.log('🎙️ Synthesizing speech with Gemini 2.5 Flash TTS');
    console.log('📝 Text:', finalText.substring(0, 100));
    console.log('🎭 Voice:', voiceName);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-tts', // Correct model ID
      contents: finalText,
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName // Aoede (Female)
            }
          },
          // Audio encoding configuration
          audioEncoding: 'LINEAR16',
          sampleRateHertz: 44100
        }
      }
    });

    // Extract audio data from response
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      throw new Error('No audio data in response');
    }

    // Convert base64 to buffer
    return Buffer.from(audioData, 'base64');
  } catch (error) {
    console.error('Gemini TTS Error:', error);
    throw new Error(`TTS synthesis failed: ${error.message}`);
  }
}

/**
 * Firebase Function: Gemini TTS Endpoint
 * Converts text to speech using Gemini 2.5 Flash TTS
 */
export const geminiTTS = onRequest({
  cors: true,
  timeoutSeconds: 60,
  memory: '512MiB',
  region: 'asia-south1',
}, async (req, res) => {
  try {
    const { 
      text, 
      prompt = '', 
      emotion = 'supportive',
      languageCode = 'en-US',
      speakingRate = 1.0 
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('🎙️ Gemini TTS Request:', { 
      textLength: text.length, 
      emotion, 
      prompt: prompt || 'default' 
    });

    // Emotion-based prompts for natural conversation
    const emotionPrompts = {
      supportive: 'Say the following in a warm, supportive, and empathetic way',
      encouraging: 'Say the following in an encouraging and uplifting way',
      calming: 'Say the following in a calm, soothing, and gentle way',
      energetic: 'Say the following in an energetic and enthusiastic way',
      curious: 'Say the following in a curious and engaged way',
      compassionate: 'Say the following with deep compassion and understanding'
    };

    const stylePrompt = prompt || emotionPrompts[emotion] || emotionPrompts.supportive;

    const startTime = Date.now();
    const audioContent = await synthesizeSpeech(text, 'Aoede', stylePrompt);

    const duration = Date.now() - startTime;
    console.log(`✅ TTS generated in ${duration}ms`);

    // Return as base64 for easy client-side handling
    const audioBase64 = audioContent.toString('base64');

    res.json({
      audioBase64,
      contentType: 'audio/l16',
      sampleRate: 44100,
      channels: 1,
      encoding: 'LINEAR16',
      model: 'gemini-2.5-flash-tts',
      voice: 'Aoede',
      emotion
    });

  } catch (error) {
    console.error('Gemini TTS Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message 
    });
  }
});

/**
 * Streaming TTS for real-time voice chat
 * Uses chunked responses for lower latency
 */
export const geminiTTSStream = onRequest({
  cors: true,
  timeoutSeconds: 120,
  memory: '512MiB',
  region: 'asia-south1',
}, async (req, res) => {
  try {
    const { 
      text, 
      prompt = 'Say the following in a warm and empathetic way',
      chunkSize = 200 // Characters per chunk
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Split text into chunks for streaming
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }

    console.log(`🎙️ Streaming TTS: ${chunks.length} chunks`);

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Stream each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const audioContent = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: chunk }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede'
              }
            }
          }
        }
      });

      const audioData = audioContent.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      const audioBase64 = Buffer.from(audioData, 'base64').toString('base64');
      
      res.write(JSON.stringify({
        chunk: i + 1,
        total: chunks.length,
        audioBase64,
        text: chunk
      }) + '\n');
    }

    res.end();

  } catch (error) {
    console.error('Streaming TTS Error:', error);
    res.status(500).json({ 
      error: 'Failed to stream speech',
      details: error.message 
    });
  }
});

export default {
  synthesizeSpeech,
  geminiTTS,
  geminiTTSStream
};
