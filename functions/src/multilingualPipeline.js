// Gemma 3 Multilingual Pipeline
// Language Detection → Translation → Processing → Response Translation
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-25dca',
  location: process.env.GCP_LOCATION || 'asia-south1', // Mumbai, India
});

// Supported languages
const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

/**
 * Step 1: Detect language using Gemma 3 2B (fast)
 */
export async function detectLanguage(text) {
  try {
    const prompt = `Detect the language of this text. Reply with only the ISO 639-1 code (en, hi, ta, te, bn, mr, gu, kn, ml, pa):
"${text.substring(0, 200)}"

Language code:`;
    
    const result = await geminiFlash.generateContent(prompt);
    const langCode = result.response.text.trim().toLowerCase();
    
    // Validate and return
    return LANGUAGES[langCode] ? langCode : 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

/**
 * Step 2: Translate to English using Gemma 3 9B (if needed)
 */
export async function translateToEnglish(text, sourceLang) {
  if (sourceLang === 'en') return text;
  
  try {
    const gemma9B = vertexAI.preview.getGenerativeModel({
      model: 'gemma-2-9b-it',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    });
    
    const prompt = `Translate this ${LANGUAGES[sourceLang]} text to English. Preserve emotional context and mental health terminology:

${LANGUAGES[sourceLang]} text: "${text}"

English translation:`;
    
    const result = await geminiPro.generateContent(prompt);
    return result.response.text.trim();
  } catch (error) {
    console.error('Translation to English error:', error);
    return text; // Return original if translation fails
  }
}

/**
 * Step 3: Translate from English using Gemini 2.5 Pro (high quality)
 */
export async function translateFromEnglish(text, targetLang) {
  if (targetLang === 'en') return text;
  
  try {
    const prompt = `Translate this English mental health response to ${LANGUAGES[targetLang]}. Maintain empathetic tone and cultural appropriateness for Indian context:

English text: "${text}"

${LANGUAGES[targetLang]} translation:`;
    
    const result = await geminiPro.generateContent(prompt);
    return result.response.text.trim();
  } catch (error) {
    console.error('Translation from English error:', error);
    return text; // Return English if translation fails
  }
}

/**
 * Step 4: Preprocess with Gemma 3 9B (extract intent, emotion)
 */
export async function preprocessInput(text, language) {
  try {
    // Use Gemini 2.5 Flash for preprocessing (fast and efficient)
    const model = geminiFlash;
    
    const prompt = `Analyze this mental health message. Extract:
1. Intent: mood_logging, seeking_help, crisis, casual_chat, exercise_request
2. Emotion: happy, sad, anxious, stressed, angry, neutral
3. Urgency: low, medium, high, critical

Language: ${LANGUAGES[language]}
Message: "${text}"

Respond in JSON format only:`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text.trim();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      intent: 'casual_chat',
      emotion: 'neutral',
      urgency: 'low',
    };
  } catch (error) {
    console.error('Preprocessing error:', error);
    return {
      intent: 'casual_chat',
      emotion: 'neutral',
      urgency: 'low',
    };
  }
}

/**
 * Main Pipeline: Process multilingual input
 */
export async function processMultilingualInput(userInput, userContext = {}) {
  const startTime = Date.now();
  
  try {
    // Step 1: Detect language (Gemma 2B - <50ms)
    const detectedLang = await detectLanguage(userInput);
    console.log(`Language detected: ${detectedLang} (${LANGUAGES[detectedLang]})`);
    
    // Step 2: Preprocess (Gemma 9B - <200ms)
    const preprocessing = await preprocessInput(userInput, detectedLang);
    console.log('Preprocessing:', preprocessing);
    
    // Step 3: Translate to English if needed (Gemma 9B - <200ms)
    const englishText = await translateToEnglish(userInput, detectedLang);
    console.log('English text:', englishText.substring(0, 100));
    
    const processingTime = Date.now() - startTime;
    
    return {
      originalText: userInput,
      englishText,
      detectedLanguage: detectedLang,
      preprocessing,
      processingTime,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('Multilingual pipeline error:', error);
    
    // Fallback: return original text
    return {
      originalText: userInput,
      englishText: userInput,
      detectedLanguage: 'en',
      preprocessing: {
        intent: 'casual_chat',
        emotion: 'neutral',
        urgency: 'low',
      },
      fallback: true,
      error: error.message,
    };
  }
}

export default {
  detectLanguage,
  translateToEnglish,
  translateFromEnglish,
  preprocessInput,
  processMultilingualInput,
};
