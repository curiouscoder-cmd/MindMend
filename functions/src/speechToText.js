// Cloud Speech-to-Text API - Multilingual Voice Input
import { onRequest } from 'firebase-functions/v2/https';
import speech from '@google-cloud/speech';

export const speechToText = onRequest({ 
  cors: true,
  timeoutSeconds: 60,
  memory: '256MiB',
  region: 'us-central1',
}, async (req, res) => {
  try {

      res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }
  
    const { audioContent, languageCode = 'en-IN' } = req.body;
    
    if (!audioContent) {
      return res.status(400).json({ error: 'Audio content is required' });
    }
    
    const client = new speech.SpeechClient();
    
    // Configure recognition
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode,
      alternativeLanguageCodes: [
        'en-IN',  // English (India)
        'hi-IN',  // Hindi
        'ta-IN',  // Tamil
        'te-IN',  // Telugu
        'bn-IN',  // Bengali
        'mr-IN',  // Marathi
        'gu-IN',  // Gujarati
        'kn-IN',  // Kannada
        'ml-IN',  // Malayalam
        'pa-IN',  // Punjabi
      ],
      enableAutomaticPunctuation: true,
      model: 'latest_long',
      useEnhanced: true,
    };
    
    const audio = {
      content: audioContent,
    };
    
    const request = {
      config,
      audio,
    };
    
    console.log(`Processing speech in ${languageCode}...`);
    const startTime = Date.now();
    
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    const processingTime = Date.now() - startTime;
    console.log(`Speech processed in ${processingTime}ms`);
    
    // Detect confidence and language
    const confidence = response.results[0]?.alternatives[0]?.confidence || 0;
    const detectedLanguage = response.results[0]?.languageCode || languageCode;
    
    res.json({
      transcription,
      confidence,
      detectedLanguage,
      processingTime,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ 
      error: 'Failed to transcribe audio',
      details: error.message 
    });
  }
});
