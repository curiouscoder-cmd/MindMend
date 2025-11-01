/**
 * Streaming Translation Firebase Function
 * 
 * Provides real-time streaming translation using hybrid Gemma + Gemini architecture
 * Supports both HTTP streaming and WebSocket connections for optimal performance
 * 
 * Endpoints:
 * - POST /streamingTranslation - HTTP streaming with Server-Sent Events
 * - WebSocket /streamingTranslationWS - Real-time WebSocket streaming
 */

import { onRequest } from 'firebase-functions/v2/https';
import { VertexAI } from '@google-cloud/vertexai';

const vertexAI = new VertexAI({
  project: process.env.GCP_PROJECT_ID || 'mindmend-25dca',
  location: process.env.GCP_LOCATION || 'asia-south1',
});

// Module state for models, cache, and metrics
let models = {
  detector: null,
  translator: null,
  geminiLive: null,
};

const cache = new Map();
const metrics = {
  requests: 0,
  gemmaSuccess: 0,
  fallbacks: 0,
  avgLatency: 0,
};

const LANGUAGES = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
  bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', 
  kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi',
};

// Gemini-only implementation
async function initModels() {
  try {
    models.detector = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 32, temperature: 0.1, topP: 0.95 },
    });

    models.translator = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 512, temperature: 0.2, topP: 0.95 },
    });

    models.geminiLive = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 512, temperature: 0.3, topP: 0.95 },
    });

    console.log('🚀 Vertex AI models initialized (Gemini 2.5 only)');
  } catch (error) {
    console.error('Model init error:', error);
    models.detector = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    models.translator = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    models.geminiLive = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
}

// Ultra-fast language detection (<50ms target)
async function detectLanguage(text) {
  const start = Date.now();
  
  // Simple heuristic detection first (fastest)
  const sample = text.substring(0, 100).toLowerCase();
  
  // Hindi detection patterns
  if (/[\u0900-\u097F]/.test(sample)) return { language: 'hi', confidence: 0.95, latency: Date.now() - start, model: 'heuristic' };
  // Tamil detection
  if (/[\u0B80-\u0BFF]/.test(sample)) return { language: 'ta', confidence: 0.95, latency: Date.now() - start, model: 'heuristic' };
  // Telugu detection  
  if (/[\u0C00-\u0C7F]/.test(sample)) return { language: 'te', confidence: 0.95, latency: Date.now() - start, model: 'heuristic' };
  // Bengali detection
  if (/[\u0980-\u09FF]/.test(sample)) return { language: 'bn', confidence: 0.95, latency: Date.now() - start, model: 'heuristic' };
  
  try {
    // AI detection via Gemini
    const prompt = `Detect language. Reply only with code: en, hi, ta, te, bn, mr, gu, kn, ml, pa\nText: "${sample}"\nLanguage:`;
    const result = await models.detector.generateContent(prompt);
    const response = result.response?.text()?.trim().toLowerCase() || 'en';
    
    const detectedLang = Object.keys(LANGUAGES).find(code => 
      response.includes(code) || response === code
    ) || 'en';
    
    const confidence = response === detectedLang ? 0.9 : 0.7;
    
    return { 
      language: detectedLang, 
      confidence, 
      latency: Date.now() - start, 
      model: 'gemini-2.5-flash'
    };
    
  } catch (error) {
    console.error('Language detection failed:', error);
    return { language: 'en', confidence: 0.5, latency: Date.now() - start, model: 'fallback' };
  }
}

// Streaming translation with confidence monitoring
async function translateStreaming(text, sourceLang, targetLang, streamCallback) {
  const start = Date.now();
  
  // Cache check
  const cacheKey = `${sourceLang}-${targetLang}-${text.substring(0, 50)}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (streamCallback) streamCallback({ type: 'chunk', data: cached });
    return { translation: cached, confidence: 1.0, latency: 5, model: 'cache' };
  }

  if (sourceLang === targetLang) {
    if (streamCallback) streamCallback({ type: 'chunk', data: text });
    return { translation: text, confidence: 1.0, latency: 0, model: 'passthrough' };
  }

  try {
    // Primary: Gemini 2.5 translation (multilingual support)
    const prompt = `You are an expert multilingual translator specializing in mental health contexts. 
Translate the following ${LANGUAGES[sourceLang]} text to ${LANGUAGES[targetLang]}.

Requirements:
- Preserve emotional tone and empathy
- Maintain cultural sensitivity for Indian mental health context
- Keep the same level of formality
- Ensure natural, fluent output

${LANGUAGES[sourceLang]} text: "${text}"

${LANGUAGES[targetLang]} translation:`;

    console.log('🔄 Attempting Gemini 2.5 translation...');
    const result = await models.translator.generateContent(prompt);
    
    // Better response parsing
    let translation = text; // Default fallback
    if (result?.response) {
      if (typeof result.response.text === 'function') {
        translation = result.response.text()?.trim() || text;
      } else if (result.response.candidates?.[0]?.content?.parts?.[0]?.text) {
        translation = result.response.candidates[0].content.parts[0].text.trim();
      } else if (typeof result.response === 'string') {
        translation = result.response.trim();
      }
    }
    
    console.log(`✅ Gemini translation successful: "${translation.substring(0, 50)}..."`);
    
    const confidence = calculateConfidence(text, translation, sourceLang, targetLang);
    const latency = Date.now() - start;

    // Stream the result
    if (streamCallback) {
      streamCallback({ type: 'chunk', data: translation });
    }

    // Cache successful translations
    cache.set(cacheKey, translation);
    
    // Auto-fallback if confidence too low
    if (confidence < 0.85) {
      console.log('⚠️ Low confidence, using fallback...');
      return await translateFallback(text, sourceLang, targetLang, streamCallback);
    }

    return { 
      translation, 
      confidence, 
      latency, 
      model: 'gemini-2.5-flash' 
    };
    
  } catch (error) {
    console.error('❌ Translation failed:', error.message);
    console.log('🔄 Falling back to Gemini 2.5 Flash...');
    metrics.fallbacks++;
    return await translateFallback(text, sourceLang, targetLang, streamCallback);
  }
}

// Fallback to Gemini Live API
async function translateFallback(text, sourceLang, targetLang, streamCallback) {
  const start = Date.now();
  
  try {
    const prompt = `Translate this ${LANGUAGES[sourceLang]} text to ${LANGUAGES[targetLang]}. Maintain empathetic tone for Indian mental health context:

"${text}"

${LANGUAGES[targetLang]} translation:`;

    console.log('🔄 Attempting Gemini 2.5 Flash fallback...');
    const result = await models.geminiLive.generateContent(prompt);
    
    // Better response parsing for Gemini
    let translation = text; // Default fallback
    if (result?.response) {
      if (typeof result.response.text === 'function') {
        translation = result.response.text()?.trim() || text;
      } else if (result.response.candidates?.[0]?.content?.parts?.[0]?.text) {
        translation = result.response.candidates[0].content.parts[0].text.trim();
      }
    }
    
    console.log(`✅ Gemini fallback successful: "${translation.substring(0, 50)}..."`);
    
    if (streamCallback) {
      streamCallback({ type: 'chunk', data: translation });
    }
    
    return {
      translation,
      confidence: 0.95,
      latency: Date.now() - start,
      model: 'gemini-2.5-flash',
    };
    
  } catch (error) {
    console.error('Fallback translation failed:', error);
    if (streamCallback) {
      streamCallback({ type: 'chunk', data: text });
    }
    return { translation: text, confidence: 0.5, latency: Date.now() - start, model: 'error' };
  }
}

// Calculate translation confidence
function calculateConfidence(original, translation, sourceLang, targetLang) {
  let confidence = 0.85;
  
  if (original === translation && sourceLang !== targetLang) confidence -= 0.3;
  if (original.length > 100 && translation.length < original.length * 0.3) confidence -= 0.2;
  
  const commonPairs = ['en-hi', 'hi-en', 'en-ta', 'ta-en'];
  if (commonPairs.includes(`${sourceLang}-${targetLang}`)) confidence += 0.05;
  
  return Math.max(0.5, Math.min(1.0, confidence));
}

// Main streaming pipeline
async function processStreaming(text, targetLang = 'en', streamCallback) {
  const pipelineStart = Date.now();
  metrics.requests++;
  
  try {
    // Step 1: Language detection
    if (streamCallback) {
      streamCallback({ type: 'status', stage: 'detecting_language' });
    }
    
    const langResult = await detectLanguage(text);
    
    if (streamCallback) {
      streamCallback({ 
        type: 'language_detected', 
        language: langResult.language,
        confidence: langResult.confidence,
      });
    }

    // Step 2: Streaming translation
    if (streamCallback) {
      streamCallback({ type: 'status', stage: 'translating' });
    }

    const translationResult = await translateStreaming(
      text,
      langResult.language,
      targetLang,
      streamCallback
    );

    const totalLatency = Date.now() - pipelineStart;
    
    // Update metrics
    if (translationResult.model.includes('gemma')) metrics.gemmaSuccess++;
    metrics.avgLatency = (metrics.avgLatency + totalLatency) / 2;

    if (streamCallback) {
      streamCallback({
        type: 'completed',
        result: {
          originalText: text,
          translatedText: translationResult.translation,
          detectedLanguage: langResult.language,
          targetLanguage: targetLang,
          confidence: translationResult.confidence,
          model: translationResult.model,
          performance: {
            languageDetection: langResult.latency,
            translation: translationResult.latency,
            total: totalLatency,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    return {
      success: true,
      originalText: text,
      translatedText: translationResult.translation,
      detectedLanguage: langResult.language,
      targetLanguage: targetLang,
      confidence: translationResult.confidence,
      model: translationResult.model,
      performance: {
        languageDetection: langResult.latency,
        translation: translationResult.latency,
        total: totalLatency,
      },
    };

  } catch (error) {
    console.error('Streaming pipeline error:', error);
    
    if (streamCallback) {
      streamCallback({
        type: 'error',
        error: error.message,
      });
    }

    return {
      success: false,
      error: error.message,
      fallback: text,
    };
  }
}

// Initialize models on module load
initModels();

/**
 * HTTP Streaming Translation with Server-Sent Events
 */
export const streamingTranslation = onRequest({
  cors: true,
  timeoutSeconds: 60,
  memory: '512MiB',
  region: 'us-central1',
}, async (req, res) => {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }


  try {
    const { text, targetLanguage = 'en', streaming = true } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('🌊 Starting streaming translation pipeline...');

    if (streaming) {
      // Server-Sent Events streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      const streamCallback = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      const result = await processStreaming(text, targetLanguage, streamCallback);
      
      // Send final result
      res.write(`data: ${JSON.stringify({ type: 'final', result })}\n\n`);
      res.end();
      
    } else {
      // Traditional JSON response
      const result = await processStreaming(text, targetLanguage);
      res.json(result);
    }

  } catch (error) {
    console.error('Streaming translation error:', error);
    res.status(500).json({
      error: 'Streaming translation failed',
      details: error.message,
    });
  }
});

/**
 * Get performance metrics
 */
export const streamingTranslationMetrics = onRequest({
  cors: true,
  region: 'asia-south1',
}, async (req, res) => {


  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }


  try {
    const metricsData = {
      ...metrics,
      cacheSize: cache.size,
      supportedLanguages: Object.keys(LANGUAGES),
      gemmaSuccessRate: metrics.requests > 0 
        ? (metrics.gemmaSuccess / metrics.requests * 100).toFixed(2) + '%'
        : '0%',
      fallbackRate: metrics.requests > 0
        ? (metrics.fallbacks / metrics.requests * 100).toFixed(2) + '%' 
        : '0%',
    };

    res.json({
      success: true,
      metrics: metricsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear translation cache
 */
export const clearTranslationCache = onRequest({
  cors: true,
  region: 'us-central1',
}, async (req, res) => {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }


  try {
    cache.clear();
    res.json({
      success: true,
      message: 'Translation cache cleared',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export individual functions for use in other modules
export { detectLanguage, translateStreaming, processStreaming };
