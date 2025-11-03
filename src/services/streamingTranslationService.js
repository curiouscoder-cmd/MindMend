/**
 * Hybrid Streaming Translation Service (Client-side)
 * 
 * Architecture:
 * - Primary: Gemma 3 (1B detection, 4B translation) for <2s latency
 * - Fallback: Gemini 2.5 Live API with WebSocket streaming
 * - Real-time chunked responses with confidence-based switching
 * - Optimized for Firebase Functions Gen 2 + offline-first mode
 * 
 * Performance Targets:
 * - First token: <2 seconds
 * - Total latency: <4 seconds
 * - Confidence threshold: >0.85 for Gemma, fallback to Gemini
 */

// Module state for performance tracking and caching
const metrics = {
  totalRequests: 0,
  gemmaSuccessRate: 0,
  averageLatency: 0,
  fallbackRate: 0,
};

// Translation cache for duplicate prevention
const translationCache = new Map();
const cacheTimeout = 5 * 60 * 1000; // 5 minutes

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

// API endpoints for Firebase Functions
// Use environment variable or fallback to Firebase Functions URL
const API_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL || 
  'https://us-central1-mindmend-25dca.cloudfunctions.net';

/**
 * Generate cache key for translation requests
 */
function getCacheKey(text, sourceLang, targetLang) {
  return `${sourceLang}-${targetLang}-${text.substring(0, 100)}`;
}

/**
 * Check translation cache to avoid duplicates
 */
function getCachedTranslation(text, sourceLang, targetLang) {
  const key = getCacheKey(text, sourceLang, targetLang);
  const cached = translationCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < cacheTimeout) {
    return cached.translation;
  }
  
  return null;
}

/**
 * Store translation in cache
 */
function setCachedTranslation(text, sourceLang, targetLang, translation) {
  const key = getCacheKey(text, sourceLang, targetLang);
  translationCache.set(key, {
    translation,
    timestamp: Date.now(),
  });

  // Clean old cache entries
  if (translationCache.size > 1000) {
    const oldestKey = translationCache.keys().next().value;
    translationCache.delete(oldestKey);
  }
}

/**
 * Stream translation with Server-Sent Events
 */
export async function streamTranslation(text, targetLanguage = 'en', onProgress) {
  const startTime = Date.now();
  metrics.totalRequests++;
  
  try {
    // Check cache first
    const cached = getCachedTranslation(text, 'auto', targetLanguage);
    if (cached) {
      if (onProgress) {
        onProgress({
          stage: 'completed',
          translation: cached,
          fromCache: true,
          latency: Date.now() - startTime,
        });
      }
      return {
        originalText: text,
        translatedText: cached,
        fromCache: true,
        latency: Date.now() - startTime,
      };
    }

    // Build query string for GET request
    const params = new URLSearchParams({
      text,
      targetLang: targetLanguage,
      streaming: 'true'
    });
    
    const url = new URL(`${API_BASE_URL}/streamingTranslation`);
    url.search = params.toString();
    
    // Use streaming translation Firebase Function
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (onProgress) {
                onProgress(data);
              }

              if (data.type === 'final') {
                result = data.result;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Cache successful translation
    if (result && result.success) {
      setCachedTranslation(text, result.detectedLanguage, targetLanguage, result.translatedText);
    }

    return result || {
      originalText: text,
      translatedText: text,
      error: 'No result received',
      latency: Date.now() - startTime,
    };

  } catch (error) {
    console.error('Streaming translation error:', error);
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        error: error.message,
      });
    }

    // Fallback to regular translation
    return await translateText(text, targetLanguage);
  }
}

/**
 * Traditional translation (fallback)
 */
export async function translateText(text, targetLanguage = 'en') {
  const startTime = Date.now();
  
  try {
    // Check cache first
    const cached = getCachedTranslation(text, 'auto', targetLanguage);
    if (cached) {
      return {
        originalText: text,
        translatedText: cached,
        fromCache: true,
        latency: Date.now() - startTime,
      };
    }

    // Build query string for GET request
    const params = new URLSearchParams({
      text,
      targetLang: targetLanguage,
      streaming: 'false'
    });
    
    const url = new URL(`${API_BASE_URL}/streamingTranslation`);
    url.search = params.toString();
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Cache successful translation
    if (result.success) {
      setCachedTranslation(text, result.detectedLanguage, targetLanguage, result.translatedText);
    }

    return {
      originalText: text,
      translatedText: result.translatedText || text,
      detectedLanguage: result.detectedLanguage,
      confidence: result.confidence,
      model: result.model,
      performance: result.performance,
      latency: Date.now() - startTime,
    };

  } catch (error) {
    console.error('Translation error:', error);
    return {
      originalText: text,
      translatedText: text,
      error: error.message,
      latency: Date.now() - startTime,
    };
  }
}

/**
 * Get performance metrics
 */
export async function getTranslationMetrics() {
  try {
    const url = new URL(`${API_BASE_URL}/streamingTranslationMetrics`);
    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      ...data.metrics,
      clientCache: {
        size: translationCache.size,
        requests: metrics.totalRequests,
      },
    };
  } catch (error) {
    console.error('Failed to get metrics:', error);
    return {
      ...metrics,
      cacheSize: translationCache.size,
      supportedLanguages: Object.keys(LANGUAGES),
      error: error.message,
    };
  }
}

/**
 * Clear translation cache
 */
export async function clearTranslationCache() {
  try {
    // Clear local cache
    translationCache.clear();
    
    // Clear server cache
    const url = new URL(`${API_BASE_URL}/clearTranslationCache`);
    const response = await fetch(url.toString(), {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('🗑️ Translation cache cleared (client + server)');
    return { success: true };
  } catch (error) {
    console.error('Failed to clear cache:', error);
    // Don't fail completely if server cache clear fails
    console.log('✅ Local cache cleared (server cache clear failed, but continuing)');
    return { success: true, localOnly: true };
  }
}

/**
 * Get supported languages
 */
export function getSupportedLanguages() {
  return LANGUAGES;
}

// Default export with all functions
export default {
  streamTranslation,
  translateText,
  getTranslationMetrics,
  clearTranslationCache,
  getSupportedLanguages,
};
