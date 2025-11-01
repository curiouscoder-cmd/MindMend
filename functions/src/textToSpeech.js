// Cloud Text-to-Speech API - Multilingual Voice Output
import { onRequest } from 'firebase-functions/v2/https';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Voice configurations for different languages
const VOICE_CONFIG = {
  'en': { languageCode: 'en-IN', name: 'en-IN-Wavenet-D', ssmlGender: 'FEMALE' },
  'hi': { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D', ssmlGender: 'FEMALE' },
  'ta': { languageCode: 'ta-IN', name: 'ta-IN-Wavenet-A', ssmlGender: 'FEMALE' },
  'te': { languageCode: 'te-IN', name: 'te-IN-Standard-A', ssmlGender: 'FEMALE' },
  'bn': { languageCode: 'bn-IN', name: 'bn-IN-Wavenet-A', ssmlGender: 'FEMALE' },
  'mr': { languageCode: 'mr-IN', name: 'mr-IN-Wavenet-A', ssmlGender: 'FEMALE' },
  'gu': { languageCode: 'gu-IN', name: 'gu-IN-Wavenet-A', ssmlGender: 'FEMALE' },
  'kn': { languageCode: 'kn-IN', name: 'kn-IN-Wavenet-A', ssmlGender: 'FEMALE' },
  'ml': { languageCode: 'ml-IN', name: 'ml-IN-Wavenet-A', ssmlGender: 'FEMALE' },
  'pa': { languageCode: 'pa-IN', name: 'pa-IN-Wavenet-A', ssmlGender: 'FEMALE' },
};

export const textToSpeech = onRequest({ 
  cors: true,
  timeoutSeconds: 30,
  memory: '256MiB',
  region: 'us-central1', // Moved to bypass asia-south1 CPU quota
}, async (req, res) => {
  try {
    const { text, languageCode = 'en', voiceGender = 'FEMALE', speakingRate = 1.0 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const client = new TextToSpeechClient();
    
    // Get voice config for language
    const voiceConfig = VOICE_CONFIG[languageCode] || VOICE_CONFIG['en'];
    
    const request = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch: 0,
        volumeGainDb: 0,
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    };
    
    console.log(`Generating speech for ${languageCode}: "${text.substring(0, 50)}..."`);
    const startTime = Date.now();
    
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');
    
    const processingTime = Date.now() - startTime;
    console.log(`Speech generated in ${processingTime}ms`);
    
    res.json({
      audioContent,
      languageCode,
      voiceName: voiceConfig.name,
      processingTime,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message 
    });
  }
});
