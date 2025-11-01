/**
 * Modern TTS Service - Functional ES6+ Approach
 * Uses Web Speech API for high-quality text-to-speech
 * 
 * Note: Gemini TTS is not yet supported in @google/genai SDK
 * See: https://ai.google.dev/gemini-api/docs/speech-generation
 */

// Module state
const audioCache = new Map();
const MAX_CACHE_SIZE = 50;
let currentAudio = null;

/**
 * Get available voices sorted by quality
 * @returns {Promise<SpeechSynthesisVoice[]>}
 */
export const getAvailableVoices = () => {
  return new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
    } else {
      // Voices load asynchronously in some browsers
      speechSynthesis.onvoiceschanged = () => {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      };
    }
  });
};

/**
 * Select best quality voice for given criteria
 * @param {string} gender - 'female' or 'male'
 * @param {string} language - Language code (e.g., 'en-US')
 * @returns {Promise<SpeechSynthesisVoice|null>}
 */
export const selectBestVoice = async (gender = 'female', language = 'en-US') => {
  const voices = await getAvailableVoices();
  
  // Priority order for quality
  const priorities = [
    // Google voices (highest quality)
    (v) => v.name.includes('Google') && v.lang.startsWith(language.split('-')[0]),
    // Microsoft voices
    (v) => v.name.includes('Microsoft') && v.lang.startsWith(language.split('-')[0]),
    // Apple voices
    (v) => v.name.includes('Samantha') || v.name.includes('Alex'),
    // Any local voice matching language
    (v) => v.localService && v.lang.startsWith(language.split('-')[0]),
    // Any voice matching language
    (v) => v.lang.startsWith(language.split('-')[0]),
    // Fallback to any voice
    (v) => true
  ];

  // Try each priority level
  for (const priorityFn of priorities) {
    const matchingVoices = voices.filter(priorityFn);
    
    if (matchingVoices.length > 0) {
      // Filter by gender if possible
      const genderMatched = matchingVoices.filter(v => {
        const name = v.name.toLowerCase();
        if (gender === 'female') {
          return name.includes('female') || name.includes('woman') || 
                 name.includes('samantha') || name.includes('zira') ||
                 name.includes('susan') || name.includes('karen');
        } else {
          return name.includes('male') || name.includes('man') || 
                 name.includes('david') || name.includes('alex');
        }
      });
      
      return genderMatched.length > 0 ? genderMatched[0] : matchingVoices[0];
    }
  }
  
  return voices[0] || null;
};

/**
 * Generate speech from text using Web Speech API
 * @param {string} text - Text to synthesize
 * @param {Object} options - Configuration options
 * @param {Function} options.onEnd - Callback when speech ends
 * @param {Function} options.onStart - Callback when speech starts
 * @returns {Promise<string>} Audio URL or 'browser_tts' identifier
 */
export const generateSpeech = async (text, options = {}) => {
  const {
    emotion = 'supportive',
    gender = 'female',
    language = 'en-US',
    rate = 0.95,
    pitch = 1.0,
    volume = 0.9,
    useCache = true,
    onEnd = null,
    onStart = null
  } = options;

  // Check cache
  const cacheKey = `${text.substring(0, 50)}_${emotion}_${rate}`;
  if (useCache && audioCache.has(cacheKey)) {
    console.log('🎵 Using cached audio');
    return audioCache.get(cacheKey);
  }

  console.log('🎙️ Generating speech with Web Speech API');
  console.log('📝 Text:', text.substring(0, 100) + '...');
  console.log('🎭 Emotion:', emotion);

  return new Promise(async (resolve) => {
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech Synthesis not supported');
      resolve(null);
      return;
    }

    // Select best voice
    const voice = await selectBestVoice(gender, language);
    
    if (!voice) {
      console.error('❌ No suitable voice found');
      resolve(null);
      return;
    }

    console.log('🎤 Selected voice:', voice.name);

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = language;
    
    // Adjust rate based on emotion
    const emotionRates = {
      supportive: 0.95,
      encouraging: 1.0,
      calming: 0.85,
      energetic: 1.1,
      curious: 1.0,
      compassionate: 0.9
    };
    utterance.rate = emotionRates[emotion] || rate;
    
    // Adjust pitch based on emotion
    const emotionPitches = {
      supportive: 1.0,
      encouraging: 1.1,
      calming: 0.95,
      energetic: 1.15,
      curious: 1.05,
      compassionate: 0.98
    };
    utterance.pitch = emotionPitches[emotion] || pitch;
    
    utterance.volume = volume;

    // Handle events
    utterance.onstart = () => {
      console.log('▶️ Speech started');
      if (onStart) onStart();
    };

    utterance.onend = () => {
      console.log('✅ Speech synthesis complete');
      const audioId = 'browser_tts';
      
      // Cache the result
      if (useCache) {
        cacheAudio(cacheKey, audioId);
      }
      
      // Call onEnd callback
      if (onEnd) onEnd();
      
      resolve(audioId);
    };

    utterance.onerror = (event) => {
      console.error('❌ Speech synthesis error:', event.error);
      if (onEnd) onEnd();
      resolve(null);
    };

    // Speak
    speechSynthesis.speak(utterance);
  });
};

/**
 * Stop current speech
 */
export const stopSpeech = () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
};

/**
 * Pause current speech
 */
export const pauseSpeech = () => {
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
  if (currentAudio) {
    currentAudio.pause();
  }
};

/**
 * Resume paused speech
 */
export const resumeSpeech = () => {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
  }
  if (currentAudio) {
    currentAudio.play();
  }
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
    
    // Revoke object URL if it's a blob URL
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
  // Revoke all blob URLs
  for (const url of audioCache.values()) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
  audioCache.clear();
  console.log('🗑️ Audio cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object}
 */
export const getCacheStats = () => {
  return {
    size: audioCache.size,
    maxSize: MAX_CACHE_SIZE,
    keys: Array.from(audioCache.keys())
  };
};

// Export default object for backward compatibility
export default {
  generateSpeech,
  stopSpeech,
  pauseSpeech,
  resumeSpeech,
  getAvailableVoices,
  selectBestVoice,
  clearCache,
  getCacheStats
};
