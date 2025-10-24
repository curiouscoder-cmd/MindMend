// Gemini 2.5 Chat Function
import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-25dca',
  location: 'asia-south1', // Mumbai, India
});

export const chat = onRequest({ 
  cors: true,
  timeoutSeconds: 60,
  memory: '512MiB',
  region: 'asia-south1',
}, async (req, res) => {
  try {
    const { message, moodHistory = [], userProgress = {}, language = 'en' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Choose model based on complexity and urgency
    const isComplex = message.length > 500;
    const hasCrisisKeywords = /suicide|self-harm|kill myself|end it all/i.test(message);
    const modelName = isComplex || hasCrisisKeywords ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    console.log(`Using model: ${modelName} for message length: ${message.length}`);
    
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
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    });
    
    // Build context-aware prompt
    const systemPrompt = `You are Mira, an empathetic AI mental wellness coach for Indian youth.

User Context:
- Recent moods: ${moodHistory.slice(-5).join(', ') || 'none'}
- Completed exercises: ${userProgress.completedExercises || 0}
- Current streak: ${userProgress.streak || 0} days
- Calm points: ${userProgress.calmPoints || 0}
- Language preference: ${language}

Guidelines:
- Be warm, empathetic, and culturally sensitive to Indian context
- Use evidence-based CBT (Cognitive Behavioral Therapy) techniques
- Keep responses concise (2-3 sentences max)
- Suggest specific exercises when appropriate
- If detecting crisis/high urgency, prioritize immediate coping strategies
- Acknowledge academic/social pressures common in India
- Use simple, accessible language
- Avoid medical diagnosis or prescribing medication

${hasCrisisKeywords ? '⚠️ CRISIS DETECTED: Provide immediate support, grounding techniques, and crisis hotline information.' : ''}

User message: "${message}"

Your empathetic response:`;
    
    const result = await model.generateContent(systemPrompt);
    const response = result.response.text;
    
    console.log(`Response generated successfully with ${modelName}`);
    
    res.json({
      response,
      model: modelName,
      timestamp: new Date().toISOString(),
      urgency: hasCrisisKeywords ? 'critical' : 'normal',
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    // Fallback response
    const fallbackResponse = "I'm here to support you. I'm having a technical issue right now, but your wellbeing matters. If you're in crisis, please reach out to AASRA at 9820466726 or iCall at 9152987821.";
    
    res.status(500).json({ 
      error: 'Failed to generate response',
      fallback: fallbackResponse,
      details: error.message 
    });
  }
});
