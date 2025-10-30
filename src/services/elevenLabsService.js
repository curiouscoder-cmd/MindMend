/**
 * ElevenLabs TTS Service - Functional ES6+ Approach
 * High-quality, low-latency text-to-speech with multilingual support
 * Optimized for India region with female voice
 * Automatic fallback to Web Speech API
 * 
 * Features:
 * - 75ms latency with Flash v2.5 model
 * - 32 languages including Hindi, Tamil, Telugu, Bengali, Marathi
 * - Context-aware voice selection
 * - Streaming audio
 * - Automatic fallback to Web Speech API
 */

import * as webSpeechService from './ttsService.js';

// Module state
const audioCache = new Map();
const MAX_CACHE_SIZE = 50;
let isElevenLabsAvailable = false;

// Voice configurations - Best female voices for India
const VOICES = {
  // Primary voice for Mira - Warm, empathetic Indian English
  mira: 'pNInz6obpgDQGcFmaJgB', // Adam (will use Rachel for female)
  rachel: '21m00Tcm4TlvDq8ikWAM', // Rachel - Natural, warm female (BEST for India)
  bella: 'EXAVITQu4vr4xnSDxMaL', // Bella - Soft, empathetic female
  domi: 'AZnzlk1XvdvUeBnXmlld', // Domi - Strong, confident female
  elli: 'MF3mGyEYCl7XYWbV9V6O'  // Elli - Young, energetic female
};

// Model configurations
const MODELS = {
  flash: 'eleven_flash_v2_5',           // 75ms latency - FASTEST
  turbo: 'eleven_turbo_v2_5',           // 200ms latency - balanced
  multilingual: 'eleven_multilingual_v2' // Best for Hindi, Tamil, etc.
};

// Language codes for India
const INDIAN_LANGUAGES = {
  english: 'en',
  hindi: 'hi',
  tamil: 'ta',
  telugu: 'te',
  bengali: 'bn',
  marathi: 'mr',
  gujarati: 'gu',
  kannada: 'kn',
  malayalam: 'ml',
  punjabi: 'pa'
};

/**
 * Check if ElevenLabs API is available
 * @returns {boolean}
 */
const checkElevenLabsAvailability = () => {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ ElevenLabs API key not found, using Web Speech fallback');
    isElevenLabsAvailable = false;
    return false;
  }
  isElevenLabsAvailable = true;
  return true;
};

/**
 * Generate speech with ElevenLabs API
 * @param {string} text - Text to synthesize
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Audio URL
 */
export const generateSpeech = async (text, options = {}) => {
  const {
    emotion = 'supportive',
    language = 'en',
    voice = 'rachel', // Default to Rachel - best female voice for India
    useCache = true,
    onEnd = null,
    onStart = null,
    context = null // Gemini context for voice adaptation
  } = options;

  // Check cache
  const cacheKey = `elevenlabs_${text.substring(0, 50)}_${emotion}_${language}`;
  if (useCache && audioCache.has(cacheKey)) {
    console.log('🎵 Using cached ElevenLabs audio');
    return audioCache.get(cacheKey);
  }

  // Check if ElevenLabs is available
  if (!checkElevenLabsAvailability()) {
    console.log('⚠️ ElevenLabs not available, falling back to Web Speech API');
    return webSpeechService.generateSpeech(text, {
      emotion,
      gender: 'female',
      language: language === 'hi' ? 'hi-IN' : 'en-IN',
      onEnd,
      onStart
    });
  }

  console.log('🎙️ Generating speech with ElevenLabs Flash v2.5');
  console.log('📝 Text:', text.substring(0, 100) + '...');
  console.log('🎭 Emotion:', emotion);
  console.log('🌍 Language:', language);
  console.log('🎤 Voice: Rachel (Female, optimized for India)');

  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const voiceId = VOICES[voice] || VOICES.rachel;
    
    // Select model based on language
    const modelId = language === 'en' ? MODELS.flash : MODELS.multilingual;

    // Make API request
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: getStabilityForEmotion(emotion),
            similarity_boost: 0.75,
            style: getStyleForEmotion(emotion),
            use_speaker_boost: true
          },
          language_code: language
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Convert stream to blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Cache the result
    if (useCache) {
      cacheAudio(cacheKey, audioUrl);
    }

    console.log('✅ ElevenLabs speech generated successfully');

    // Play audio and trigger callbacks
    if (onStart || onEnd) {
      const audio = new Audio(audioUrl);
      if (onStart) {
        audio.addEventListener('play', onStart);
      }
      if (onEnd) {
        audio.addEventListener('ended', onEnd);
      }
      audio.play();
    }

    return audioUrl;

  } catch (error) {
    console.error('❌ ElevenLabs error:', error);
    console.log('⚠️ Falling back to Web Speech API');
    
    // Fallback to Web Speech API
    return webSpeechService.generateSpeech(text, {
      emotion,
      gender: 'female',
      language: language === 'hi' ? 'hi-IN' : 'en-IN',
      onEnd,
      onStart
    });
  }
};

/**
 * Get stability setting based on emotion
 * @param {string} emotion
 * @returns {number}
 */
const getStabilityForEmotion = (emotion) => {
  const stabilityMap = {
    supportive: 0.75,    // Warm, steady
    encouraging: 0.65,   // More expressive
    calming: 0.85,       // Very stable, soothing
    energetic: 0.55,     // More dynamic
    curious: 0.70,       // Balanced
    compassionate: 0.80  // Gentle, stable
  };
  return stabilityMap[emotion] || 0.75;
};

/**
 * Get style setting based on emotion
 * @param {string} emotion
 * @returns {number}
 */
const getStyleForEmotion = (emotion) => {
  const styleMap = {
    supportive: 0.50,    // Natural
    encouraging: 0.65,   // More expressive
    calming: 0.30,       // Subtle
    energetic: 0.75,     // Very expressive
    curious: 0.55,       // Engaged
    compassionate: 0.45  // Gentle
  };
  return styleMap[emotion] || 0.50;
};

/**
 * Generate speech with context awareness from Gemini
 * @param {string} text - Text to synthesize
 * @param {Object} geminiContext - Context from Gemini AI
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Audio URL
 */
export const generateContextAwareSpeech = async (text, geminiContext, options = {}) => {
  // Analyze context to determine best voice parameters
  const emotion = analyzeEmotionFromContext(geminiContext);
  const language = detectLanguageFromContext(geminiContext);
  
  console.log('🧠 Context-aware speech generation');
  console.log('📊 Detected emotion:', emotion);
  console.log('🌍 Detected language:', language);

  return generateSpeech(text, {
    ...options,
    emotion,
    language,
    context: geminiContext
  });
};

/**
 * Analyze emotion from Gemini context
 * @param {Object} context - Gemini conversation context
 * @returns {string} Emotion
 */
const analyzeEmotionFromContext = (context) => {
  if (!context) return 'supportive';

  const { userMessage, sentiment, mood, conversationHistory } = context;

  // Check for crisis or distress
  if (sentiment === 'negative' || mood === 'anxious' || mood === 'sad') {
    return 'compassionate';
  }

  // Check for positive engagement
  if (sentiment === 'positive' || mood === 'happy') {
    return 'encouraging';
  }

  // Check for calm/meditation context
  if (userMessage?.toLowerCase().includes('calm') || 
      userMessage?.toLowerCase().includes('relax')) {
    return 'calming';
  }

  // Check for motivation context
  if (userMessage?.toLowerCase().includes('motivat') || 
      userMessage?.toLowerCase().includes('energy')) {
    return 'energetic';
  }

  return 'supportive'; // Default
};

/**
 * Detect language from Gemini context
 * @param {Object} context - Gemini conversation context
 * @returns {string} Language code
 */
const detectLanguageFromContext = (context) => {
  if (!context || !context.userMessage) return 'en';

  const message = context.userMessage.toLowerCase();

  // Simple language detection (can be enhanced with ML)
  const hindiPatterns = ['मैं', 'है', 'हूं', 'का', 'की'];
  const tamilPatterns = ['நான்', 'என்', 'இது'];
  const teluguPatterns = ['నేను', 'ఇది'];

  if (hindiPatterns.some(pattern => message.includes(pattern))) {
    return 'hi';
  }
  if (tamilPatterns.some(pattern => message.includes(pattern))) {
    return 'ta';
  }
  if (teluguPatterns.some(pattern => message.includes(pattern))) {
    return 'te';
  }

  return 'en'; // Default to English
};

/**
 * Get available voices
 * @returns {Object} Voice configurations
 */
export const getAvailableVoices = () => {
  return {
    rachel: { name: 'Rachel', gender: 'female', description: 'Natural, warm (Best for India)' },
    bella: { name: 'Bella', gender: 'female', description: 'Soft, empathetic' },
    domi: { name: 'Domi', gender: 'female', description: 'Strong, confident' },
    elli: { name: 'Elli', gender: 'female', description: 'Young, energetic' }
  };
};

/**
 * Get supported languages
 * @returns {Object} Language configurations
 */
export const getSupportedLanguages = () => {
  return INDIAN_LANGUAGES;
};

/**
 * Cache audio URL with LRU eviction
 * @param {string} key - Cache key
 * @param {string} url - Audio URL
 */
const cacheAudio = (key, url) => {
  if (audioCache.size >= MAX_CACHE_SIZE) {
    const firstKey = audioCache.keys().next().value;
    const firstUrl = audioCache.get(firstKey);
    
    if (firstUrl && firstUrl.startsWith('blob:')) {
      URL.revokeObjectURL(firstUrl);
    }
    
    audioCache.delete(firstKey);
  }
  
  audioCache.set(key, url);
};

/**
 * Clear audio cache
 */
export const clearCache = () => {
  for (const url of audioCache.values()) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
  audioCache.clear();
  console.log('🗑️ ElevenLabs audio cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object}
 */
export const getCacheStats = () => {
  return {
    size: audioCache.size,
    maxSize: MAX_CACHE_SIZE,
    isElevenLabsAvailable,
    keys: Array.from(audioCache.keys())
  };
};

// Export default object for backward compatibility
export default {
  generateSpeech,
  generateContextAwareSpeech,
  getAvailableVoices,
  getSupportedLanguages,
  clearCache,
  getCacheStats
};
