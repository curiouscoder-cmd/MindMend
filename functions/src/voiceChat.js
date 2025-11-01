// Voice Chat - Speech-to-Text + Multilingual Chat + Text-to-Speech
import { onRequest } from 'firebase-functions/v2/https';
import speech from '@google-cloud/speech';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { processMultilingualInput, translateFromEnglish } from './multilingualPipeline.js';
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-25dca',
  location: 'asia-south1', // Mumbai, India
});

export const voiceChat = onRequest({ 
  cors: true,
  timeoutSeconds: 120,
  memory: '512MiB',
  region: 'us-central1',
}, async (req, res) => {
  try {
    const { audioContent, moodHistory = [], userProgress = {} } = req.body;
    
    if (!audioContent) {
      return res.status(400).json({ error: 'Audio content is required' });
    }
    
    console.log('=== Voice Chat Pipeline Started ===');
    const pipelineStart = Date.now();
    
    // Step 1: Speech-to-Text
    const speechClient = new speech.SpeechClient();
    const speechConfig = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-IN',
      alternativeLanguageCodes: ['hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN'],
      enableAutomaticPunctuation: true,
      model: 'latest_long',
      useEnhanced: true,
    };
    
    console.log('Step 1: Speech-to-Text...');
    const sttStart = Date.now();
    const [speechResponse] = await speechClient.recognize({
      config: speechConfig,
      audio: { content: audioContent },
    });
    
    const transcription = speechResponse.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    const sttTime = Date.now() - sttStart;
    console.log(`Speech-to-Text: ${sttTime}ms - "${transcription}"`);
    
    if (!transcription) {
      return res.status(400).json({ error: 'Could not transcribe audio' });
    }
    
    // Step 2: Process with multilingual pipeline
    console.log('Step 2: Multilingual processing...');
    const processed = await processMultilingualInput(transcription, { moodHistory, userProgress });
    
    // Step 3: Generate response with Gemini
    console.log('Step 3: Generating AI response...');
    const isUrgent = processed.preprocessing.urgency === 'critical' || processed.preprocessing.urgency === 'high';
    const modelName = isUrgent ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    const model = vertexAI.preview.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 256, // Shorter for voice
      },
    });
    
    const systemPrompt = `You are Mira, an empathetic AI mental wellness coach. Respond in 1-2 short sentences suitable for voice output.

User emotion: ${processed.preprocessing.emotion}
Urgency: ${processed.preprocessing.urgency}
Message: "${processed.englishText}"

Your brief, empathetic response:`;
    
    const geminiStart = Date.now();
    const result = await model.generateContent(systemPrompt);
    const englishResponse = result.response.text();
    const geminiTime = Date.now() - geminiStart;
    console.log(`Gemini response: ${geminiTime}ms`);
    
    // Step 4: Translate response
    console.log('Step 4: Translating response...');
    const localizedResponse = await translateFromEnglish(englishResponse, processed.detectedLanguage);
    
    // Step 5: Text-to-Speech
    console.log('Step 5: Text-to-Speech...');
    const ttsClient = new TextToSpeechClient();
    
    const voiceConfig = {
      'en': { languageCode: 'en-IN', name: 'en-IN-Wavenet-D' },
      'hi': { languageCode: 'hi-IN', name: 'hi-IN-Wavenet-D' },
      'ta': { languageCode: 'ta-IN', name: 'ta-IN-Wavenet-A' },
      'te': { languageCode: 'te-IN', name: 'te-IN-Standard-A' },
      'bn': { languageCode: 'bn-IN', name: 'bn-IN-Wavenet-A' },
      'mr': { languageCode: 'mr-IN', name: 'mr-IN-Wavenet-A' },
      'gu': { languageCode: 'gu-IN', name: 'gu-IN-Wavenet-A' },
      'kn': { languageCode: 'kn-IN', name: 'kn-IN-Wavenet-A' },
      'ml': { languageCode: 'ml-IN', name: 'ml-IN-Wavenet-A' },
      'pa': { languageCode: 'pa-IN', name: 'pa-IN-Wavenet-A' },
    };
    
    const voice = voiceConfig[processed.detectedLanguage] || voiceConfig['en'];
    
    const ttsStart = Date.now();
    const [ttsResponse] = await ttsClient.synthesizeSpeech({
      input: { text: localizedResponse },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95,
        pitch: 0,
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    });
    
    const audioResponse = ttsResponse.audioContent.toString('base64');
    const ttsTime = Date.now() - ttsStart;
    console.log(`Text-to-Speech: ${ttsTime}ms`);
    
    const totalTime = Date.now() - pipelineStart;
    console.log(`=== Total voice pipeline: ${totalTime}ms ===`);
    
    res.json({
      transcription,
      response: localizedResponse,
      responseEnglish: englishResponse,
      audioResponse,
      detectedLanguage: processed.detectedLanguage,
      preprocessing: processed.preprocessing,
      model: modelName,
      performance: {
        speechToText: sttTime,
        preprocessing: processed.processingTime,
        gemini: geminiTime,
        textToSpeech: ttsTime,
        total: totalTime,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Voice chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process voice chat',
      details: error.message 
    });
  }
});
