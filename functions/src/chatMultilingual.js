// Multilingual Chat with Hybrid Streaming Translation
import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';
import { 
  processStreaming,
  translateStreaming,
  detectLanguage,
} from './streamingTranslation.js';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-25dca',
  location: 'asia-south1', // Mumbai, India
});

export const chatMultilingual = onRequest({ 
  cors: true,
  timeoutSeconds: 90,
  memory: '1GiB',
  region: 'asia-south1',
}, async (req, res) => {
  try {
    const { message, moodHistory = [], userProgress = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('=== Multilingual Chat Pipeline Started ===');
    const pipelineStart = Date.now();
    
    // Step 1: Streaming language detection and translation
    const streamingCallback = (data) => {
      console.log(`Streaming update: ${data.type}`, data);
    };
    
    const processed = await processStreaming(message, 'en', streamingCallback);
    console.log(`Streaming processing: ${processed.performance?.total || 0}ms`);
    
    // Step 2: Choose Gemini model based on message complexity and detected urgency
    const isComplex = message.length > 500;
    const modelName = isComplex ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    console.log(`Using ${modelName} for message length: ${message.length}`);
    
    // Step 3: Generate response with Gemini 2.5
    const model = vertexAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 512,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });
    
    const systemPrompt = `You are Mira, an empathetic AI mental wellness coach for Indian youth.

User Context:
- Language: ${processed.detectedLanguage || 'en'}
- Recent moods: ${moodHistory.slice(-5).join(', ') || 'none'}
- Completed exercises: ${userProgress.completedExercises || 0}
- Current streak: ${userProgress.streak || 0} days
- Translation confidence: ${processed.confidence || 0.9}
- Model used: ${processed.model || 'hybrid'}

Guidelines:
- Be warm, empathetic, culturally sensitive to Indian context
- Use evidence-based CBT techniques
- Keep responses concise (2-3 sentences)
- Suggest specific exercises when appropriate
- Acknowledge academic/social pressures common in India

User message (translated to English): "${processed.translatedText || processed.originalText}"

Your empathetic response in English:`;
    
    const geminiStart = Date.now();
    const result = await model.generateContent(systemPrompt);
    const englishResponse = result.response?.text || result.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand you need support.';
    const geminiTime = Date.now() - geminiStart;
    
    console.log(`Gemini ${modelName} response: ${geminiTime}ms`);
    
    // Step 4: Translate response back to user's language using streaming
    const translationStart = Date.now();
    const responseTranslation = await translateStreaming(
      englishResponse, 
      'en', 
      processed.detectedLanguage || 'en',
      (data) => console.log('Response translation chunk:', data)
    );
    const translationTime = Date.now() - translationStart;
    
    console.log(`Streaming translation: ${translationTime}ms`);
    
    const totalTime = Date.now() - pipelineStart;
    console.log(`=== Total pipeline time: ${totalTime}ms ===`);
    
    res.json({
      response: responseTranslation.translation || englishResponse,
      responseEnglish: englishResponse,
      detectedLanguage: processed.detectedLanguage || 'en',
      confidence: processed.confidence || 0.9,
      model: modelName,
      translationModel: responseTranslation.model || 'passthrough',
      performance: {
        languageDetection: processed.performance?.languageDetection || 0,
        inputTranslation: processed.performance?.translation || 0,
        gemini: geminiTime,
        responseTranslation: translationTime,
        total: totalTime,
      },
      streaming: {
        enabled: true,
        cacheHit: responseTranslation.fromCache || false,
        fallbackUsed: responseTranslation.model?.includes('fallback') || false,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Multilingual chat error:', error);
    
    // Fallback response
    const fallbackResponse = "I'm here to support you. I'm having a technical issue right now, but your wellbeing matters. If you're in crisis, please reach out to AASRA at 9820466726.";
    
    res.status(500).json({ 
      error: 'Failed to generate response',
      fallback: fallbackResponse,
      details: error.message 
    });
  }
});
