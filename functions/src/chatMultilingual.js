// Multilingual Chat with Gemma 3 + Gemini 2.5 Pipeline
import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/aiplatform';
import { 
  processMultilingualInput, 
  translateFromEnglish 
} from './multilingualPipeline.js';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-ai',
  location: 'us-central1',
});

export const chatMultilingual = onRequest({ 
  cors: true,
  timeoutSeconds: 90,
  memory: '1GiB',
}, async (req, res) => {
  try {
    const { message, moodHistory = [], userProgress = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('=== Multilingual Chat Pipeline Started ===');
    const pipelineStart = Date.now();
    
    // Step 1: Process input with Gemma 3 pipeline
    const processed = await processMultilingualInput(message, { moodHistory, userProgress });
    console.log(`Pipeline processing: ${processed.processingTime}ms`);
    
    // Step 2: Choose Gemini model based on urgency
    const isUrgent = processed.preprocessing.urgency === 'critical' || processed.preprocessing.urgency === 'high';
    const isComplex = processed.englishText.length > 500;
    const modelName = isUrgent || isComplex ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    console.log(`Using ${modelName} for urgency: ${processed.preprocessing.urgency}`);
    
    // Step 3: Generate response with Gemini 2.5
    const model = vertexAI.preview.getGenerativeModel({
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
- Language: ${processed.detectedLanguage}
- Recent moods: ${moodHistory.slice(-5).join(', ') || 'none'}
- Completed exercises: ${userProgress.completedExercises || 0}
- Current streak: ${userProgress.streak || 0} days
- Detected emotion: ${processed.preprocessing.emotion}
- Intent: ${processed.preprocessing.intent}
- Urgency: ${processed.preprocessing.urgency}

Guidelines:
- Be warm, empathetic, culturally sensitive to Indian context
- Use evidence-based CBT techniques
- Keep responses concise (2-3 sentences)
- Suggest specific exercises when appropriate
- If urgency is high/critical, prioritize immediate coping strategies
- Acknowledge academic/social pressures common in India

${isUrgent ? '⚠️ HIGH URGENCY: Provide immediate support, grounding techniques, and crisis resources.' : ''}

User message (translated to English): "${processed.englishText}"

Your empathetic response in English:`;
    
    const geminiStart = Date.now();
    const result = await model.generateContent(systemPrompt);
    const englishResponse = result.response.text();
    const geminiTime = Date.now() - geminiStart;
    
    console.log(`Gemini ${modelName} response: ${geminiTime}ms`);
    
    // Step 4: Translate response back to user's language
    const translationStart = Date.now();
    const localizedResponse = await translateFromEnglish(englishResponse, processed.detectedLanguage);
    const translationTime = Date.now() - translationStart;
    
    console.log(`Translation: ${translationTime}ms`);
    
    const totalTime = Date.now() - pipelineStart;
    console.log(`=== Total pipeline time: ${totalTime}ms ===`);
    
    res.json({
      response: localizedResponse,
      responseEnglish: englishResponse,
      detectedLanguage: processed.detectedLanguage,
      preprocessing: processed.preprocessing,
      model: modelName,
      performance: {
        preprocessing: processed.processingTime,
        gemini: geminiTime,
        translation: translationTime,
        total: totalTime,
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
