/**
 * Gemini 2.5 Flash TTS Integration
 * Uses Google Cloud Text-to-Speech with Gemini 2.5 Flash TTS model
 * Voice: Aoede (Female)
 * Audio Encoding: LINEAR16
 * Sample Rate: 44100 Hz
 */

import { onRequest } from 'firebase-functions/v2/https';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const ttsClient = new TextToSpeechClient();

/**
 * Gemini 2.5 Flash TTS - High-quality, low-latency text-to-speech
 * @param {string} text - Text to synthesize
 * @param {string} prompt - Style prompt for delivery (optional)
 * @param {object} options - Additional configuration
 * @returns {Promise<Buffer>} Audio buffer
 */
export async function synthesizeSpeech(text, prompt = '', options = {}) {
  const {
    languageCode = 'en-US',
    voiceName = 'Aoede', // Female voice optimized for empathetic dialogue
    audioEncoding = 'LINEAR16',
    sampleRateHertz = 44100,
    speakingRate = 1.0,
    pitch = 0.0,
    volumeGainDb = 0.0,
    effectsProfileId = ['small-bluetooth-speaker-class-device']
  } = options;

  try {
    const request = {
      input: {
        text: text,
        ...(prompt && { prompt: prompt })
      },
      voice: {
        languageCode: languageCode,
        name: voiceName,
        model_name: 'gemini-2.5-flash-tts'
      },
      audioConfig: {
        audioEncoding: audioEncoding,
        sampleRateHertz: sampleRateHertz,
        speakingRate: speakingRate,
        pitch: pitch,
        volumeGainDb: volumeGainDb,
        effectsProfileId: effectsProfileId
      }
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent;
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

    const finalPrompt = prompt || emotionPrompts[emotion] || emotionPrompts.supportive;

    const startTime = Date.now();
    const audioContent = await synthesizeSpeech(text, finalPrompt, {
      languageCode,
      voiceName: 'Aoede',
      audioEncoding: 'LINEAR16',
      sampleRateHertz: 44100,
      speakingRate: speakingRate,
      pitch: 0.0,
      volumeGainDb: 0.0,
      effectsProfileId: ['small-bluetooth-speaker-class-device']
    });

    const duration = Date.now() - startTime;
    console.log(`✅ TTS generated in ${duration}ms`);

    // Return as base64 for easy client-side handling
    const audioBase64 = audioContent.toString('base64');

    res.json({
      audioBase64,
      contentType: 'audio/l16',
      sampleRate: 44100,
      encoding: 'LINEAR16',
      duration: duration,
      model: 'gemini-2.5-flash-tts',
      voice: 'Aoede',
      timestamp: new Date().toISOString()
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
      const audioContent = await synthesizeSpeech(chunk, prompt, {
        voiceName: 'Aoede',
        audioEncoding: 'LINEAR16',
        sampleRateHertz: 44100
      });

      const audioBase64 = audioContent.toString('base64');
      
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
