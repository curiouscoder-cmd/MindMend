// Streaming Multilingual Pipeline (Gemini-only)
// Gemini 2.5 Flash for detection/translation; Gemini Live optional
// Real-time streaming with <2s latency target
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-25dca',
  location: process.env.GCP_LOCATION || 'asia-south1', // Mumbai, India
});

console.log(`🌍 Vertex AI initialized: ${process.env.GCP_PROJECT_ID || 'mindmend-25dca'} @ ${process.env.GCP_LOCATION || 'asia-south1'}`);

// Gemini models
const geminiLive = vertexAI.preview.getGenerativeModel({
  model: 'gemini-live-2.5-flash',
  generationConfig: {
    maxOutputTokens: 512,
    temperature: 0.3,
  },
});

// Primary Gemini Flash (regular)
const geminiFlash = vertexAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    maxOutputTokens: 300,
    temperature: 0.2,
  },
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
 * Step 1: Language detection using Gemini 2.5 Flash (<100ms target)
 */
export async function detectLanguage(text) {
  const startTime = Date.now();
  
  try {
    const prompt = `Language detection. Reply only with ISO code (en/hi/ta/te/bn/mr/gu/kn/ml/pa):
"${text.substring(0, 100)}"
Code:`;
    
    // Gemini 2.5 Flash detection
    const result = await geminiFlash.generateContent(prompt);
    const responseText = result.response?.text() || '';
    const langCode = responseText.trim().toLowerCase().match(/\b(en|hi|ta|te|bn|mr|gu|kn|ml|pa)\b/)?.[0] || 'en';
    
    const latency = Date.now() - startTime;
    console.log(`🔍 Gemini detection: ${langCode} (${latency}ms)`);
    
    return {
      language: langCode,
      confidence: 0.95,
      latency,
      model: 'gemini-2.5-flash',
    };
  } catch (error) {
    console.error('Language detection failed:', error);
    return {
      language: 'en',
      confidence: 0.50,
      latency: Date.now() - startTime,
      model: 'default',
    };
  }
}

/**
 * Step 2: Streaming translation to English using Gemini 2.5 with confidence monitoring
 */
export async function translateToEnglish(text, sourceLang, onProgress) {
  if (sourceLang === 'en') return { translation: text, confidence: 1.0, latency: 0, model: 'passthrough' };
  
  const startTime = Date.now();
  
  try {
    const prompt = `Translate this ${LANGUAGES[sourceLang]} text to English. Preserve emotional context and mental health terminology:

"${text}"

English translation:`;
    
    // Gemini 2.5 translation
    const result = await geminiFlash.generateContent(prompt);
    const translation = result.response?.text()?.trim() || text;
    
    const latency = Date.now() - startTime;
    const confidence = calculateTranslationConfidence(text, translation, sourceLang, 'en');
    
    console.log(`🌐 Gemini translation: ${sourceLang}→en (${latency}ms, confidence: ${confidence})`);
    
    if (onProgress) {
      onProgress({
        stage: 'translation_chunk',
        text: translation,
        confidence,
        latency,
      });
    }
    
    // Auto-fallback if confidence too low
    if (confidence < 0.85) {
      console.log('⚠️ Low confidence, using Gemini fallback...');
      return await translateToEnglishFallback(text, sourceLang, onProgress);
    }
    
    return { translation, confidence, latency, model: 'gemini-2.5-flash' };
    
  } catch (error) {
    console.error('Translation failed:', error);
    return await translateToEnglishFallback(text, sourceLang, onProgress);
  }
}

/**
 * Fallback translation using Gemini Live API
 */
export async function translateToEnglishFallback(text, sourceLang, onProgress) {
  const startTime = Date.now();
  
  try {
    const prompt = `Translate this ${LANGUAGES[sourceLang]} text to English. Maintain empathetic tone for mental health context:

"${text}"

English translation:`;
    
    const result = await geminiLive.generateContent(prompt);
    const translation = result.response?.text()?.trim() || text;
    
    const latency = Date.now() - startTime;
    console.log(`🔄 Gemini Live fallback: ${sourceLang}→en (${latency}ms)`);
    
    if (onProgress) {
      onProgress({
        stage: 'fallback_translation',
        text: translation,
        confidence: 0.95,
        latency,
      });
    }
    
    return { translation, confidence: 0.95, latency, model: 'gemini-live-fallback' };
    
  } catch (error) {
    console.error('Fallback translation failed:', error);
    return { translation: text, confidence: 0.50, latency: Date.now() - startTime, model: 'error-passthrough' };
  }
}

/**
 * Calculate translation confidence based on various factors
 */
function calculateTranslationConfidence(originalText, translation, sourceLang, targetLang) {
  let confidence = 0.85; // Base confidence
  
  // Penalize if translation is identical to original (likely failed)
  if (originalText === translation && sourceLang !== targetLang) {
    confidence -= 0.3;
  }
  
  // Penalize very short translations for long input
  if (originalText.length > 100 && translation.length < originalText.length * 0.3) {
    confidence -= 0.2;
  }
  
  // Boost confidence for common language pairs
  const commonPairs = ['en-hi', 'hi-en', 'en-ta', 'ta-en'];
  if (commonPairs.includes(`${sourceLang}-${targetLang}`)) {
    confidence += 0.05;
  }
  
  return Math.max(0.5, Math.min(1.0, confidence));
}

/**
 * Step 3: Streaming translation from English using Gemini 2.5
 */
export async function translateFromEnglish(text, targetLang, onProgress) {
  if (targetLang === 'en') return { translation: text, confidence: 1.0, latency: 0, model: 'passthrough' };
  
  const startTime = Date.now();
  
  try {
    const prompt = `Translate this English mental health response to ${LANGUAGES[targetLang]}. Maintain empathetic tone and cultural appropriateness for Indian context:

"${text}"

${LANGUAGES[targetLang]} translation:`;
    
    // Gemini 2.5 translation
    const result = await geminiFlash.generateContent(prompt);
    const translation = result.response?.text()?.trim() || text;
    
    const latency = Date.now() - startTime;
    const confidence = calculateTranslationConfidence(text, translation, 'en', targetLang);
    
    console.log(`🌐 Gemini translation: en→${targetLang} (${latency}ms, confidence: ${confidence})`);
    
    if (onProgress) {
      onProgress({
        stage: 'response_translation',
        text: translation,
        confidence,
        latency,
      });
    }
    
    // Auto-fallback if confidence too low
    if (confidence < 0.85) {
      console.log('⚠️ Low confidence, using Gemini fallback...');
      return await translateFromEnglishFallback(text, targetLang, onProgress);
    }
    
    return { translation, confidence, latency, model: 'gemini-2.5-flash' };
    
  } catch (error) {
    console.error('Translation failed:', error);
    return await translateFromEnglishFallback(text, targetLang, onProgress);
  }
}

/**
 * Fallback translation from English using Gemini Live API
 */
export async function translateFromEnglishFallback(text, targetLang, onProgress) {
  const startTime = Date.now();
  
  try {
    const prompt = `Translate this English mental health response to ${LANGUAGES[targetLang]}. Maintain empathetic tone and cultural appropriateness for Indian context:

"${text}"

${LANGUAGES[targetLang]} translation:`;
    
    const result = await geminiLive.generateContent(prompt);
    const translation = result.response?.text()?.trim() || text;
    
    const latency = Date.now() - startTime;
    console.log(`🔄 Gemini Live fallback: en→${targetLang} (${latency}ms)`);
    
    if (onProgress) {
      onProgress({
        stage: 'fallback_response_translation',
        text: translation,
        confidence: 0.95,
        latency,
      });
    }
    
    return { translation, confidence: 0.95, latency, model: 'gemini-live-fallback' };
    
  } catch (error) {
    console.error('Fallback translation failed:', error);
    return { translation: text, confidence: 0.50, latency: Date.now() - startTime, model: 'error-passthrough' };
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
    const responseText = (result.response?.text || result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
    
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
 * Main Streaming Pipeline: Process multilingual input with real-time progress
 */
export async function processMultilingualInput(userInput, userContext = {}, onProgress) {
  const startTime = Date.now();
  
  try {
    if (onProgress) {
      onProgress({ stage: 'started', timestamp: new Date().toISOString() });
    }
    
    // Step 1: Ultra-fast language detection (Gemma 1B - <50ms)
    if (onProgress) onProgress({ stage: 'detecting_language' });
    const langResult = await detectLanguage(userInput);
    console.log(`Language detected: ${langResult.language} (${LANGUAGES[langResult.language]})`);
    
    if (onProgress) {
      onProgress({ 
        stage: 'language_detected', 
        language: langResult.language,
        confidence: langResult.confidence,
        latency: langResult.latency,
      });
    }
    
    // Step 2: Parallel preprocessing and translation
    if (onProgress) onProgress({ stage: 'preprocessing' });
    
    const [preprocessingResult, translationResult] = await Promise.allSettled([
      preprocessInput(userInput, langResult.language),
      translateToEnglish(userInput, langResult.language, onProgress),
    ]);
    
    const preprocessing = preprocessingResult.status === 'fulfilled' 
      ? preprocessingResult.value 
      : { intent: 'casual_chat', emotion: 'neutral', urgency: 'low' };
    
    const translation = translationResult.status === 'fulfilled'
      ? translationResult.value
      : { translation: userInput, confidence: 0.5, latency: 0, model: 'error' };
    
    console.log('Preprocessing:', preprocessing);
    console.log('English text:', translation.translation.substring(0, 100));
    
    const processingTime = Date.now() - startTime;
    
    const result = {
      originalText: userInput,
      englishText: translation.translation,
      detectedLanguage: langResult.language,
      preprocessing,
      performance: {
        languageDetection: langResult.latency,
        translation: translation.latency,
        total: processingTime,
      },
      models: {
        languageDetection: langResult.model,
        translation: translation.model,
      },
      confidence: {
        language: langResult.confidence,
        translation: translation.confidence,
      },
      timestamp: new Date().toISOString(),
    };
    
    if (onProgress) {
      onProgress({ stage: 'completed', result });
    }
    
    return result;
    
  } catch (error) {
    console.error('Multilingual pipeline error:', error);
    
    const fallbackResult = {
      originalText: userInput,
      englishText: userInput,
      detectedLanguage: 'en',
      preprocessing: {
        intent: 'casual_chat',
        emotion: 'neutral',
        urgency: 'low',
      },
      performance: {
        total: Date.now() - startTime,
      },
      fallback: true,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
    
    if (onProgress) {
      onProgress({ stage: 'error', error: error.message, fallback: fallbackResult });
    }
    
    return fallbackResult;
  }
}

export default {
  detectLanguage,
  translateToEnglish,
  translateFromEnglish,
  preprocessInput,
  processMultilingualInput,
};
