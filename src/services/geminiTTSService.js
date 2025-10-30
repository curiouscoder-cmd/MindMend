/**
 * Gemini 2.5 Flash TTS Client Service
 * Handles text-to-speech using Gemini 2.5 Flash TTS with Aoede voice
 * Features: LOW latency, HIGH quality, emotion-aware synthesis
 */

const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'http://localhost:5001/mindmend-ai/asia-south1';

class GeminiTTSService {
  constructor() {
    this.audioCache = new Map();
    this.maxCacheSize = 50; // Cache up to 50 audio clips
    this.currentAudio = null;
  }

  /**
   * Generate speech from text using Gemini 2.5 Flash TTS
   * @param {string} text - Text to synthesize
   * @param {object} options - Configuration options
   * @returns {Promise<string>} Audio URL (blob URL)
   */
  async generateSpeech(text, options = {}) {
    const {
      emotion = 'supportive',
      prompt = '',
      languageCode = 'en-US',
      speakingRate = 1.0,
      useCache = true
    } = options;

    // Check cache first
    const cacheKey = `${text.substring(0, 50)}_${emotion}_${speakingRate}`;
    if (useCache && this.audioCache.has(cacheKey)) {
      console.log('🎵 Using cached audio');
      return this.audioCache.get(cacheKey);
    }

    try {
      console.log('🎙️ Generating speech with Gemini 2.5 Flash TTS...');
      const startTime = Date.now();

      const response = await fetch(`${FUNCTIONS_URL}/geminiTTS`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          prompt,
          emotion,
          languageCode,
          speakingRate
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;
      console.log(`✅ Speech generated in ${duration}ms`);

      // Convert base64 to blob URL
      const audioBlob = this.base64ToBlob(data.audioBase64, 'audio/l16');
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the result
      if (useCache) {
        this.cacheAudio(cacheKey, audioUrl);
      }

      return audioUrl;

    } catch (error) {
      console.error('Gemini TTS Error:', error);
      // Fallback to browser TTS
      return this.fallbackTTS(text);
    }
  }

  /**
   * Stream speech generation for long text
   * @param {string} text - Text to synthesize
   * @param {function} onChunk - Callback for each audio chunk
   * @param {object} options - Configuration options
   */
  async streamSpeech(text, onChunk, options = {}) {
    const {
      emotion = 'supportive',
      chunkSize = 200
    } = options;

    try {
      console.log('🎙️ Streaming speech generation...');

      const response = await fetch(`${FUNCTIONS_URL}/geminiTTSStream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          prompt: this.getEmotionPrompt(emotion),
          chunkSize
        })
      });

      if (!response.ok) {
        throw new Error(`Streaming TTS error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            const audioBlob = this.base64ToBlob(data.audioBase64, 'audio/l16');
            const audioUrl = URL.createObjectURL(audioBlob);
            
            onChunk({
              chunk: data.chunk,
              total: data.total,
              audioUrl,
              text: data.text
            });
          } catch (e) {
            console.warn('Failed to parse chunk:', e);
          }
        }
      }

    } catch (error) {
      console.error('Streaming TTS Error:', error);
      throw error;
    }
  }

  /**
   * Play audio from URL or generate and play
   * @param {string} text - Text to speak
   * @param {object} options - Configuration options
   * @returns {Promise<HTMLAudioElement>}
   */
  async speak(text, options = {}) {
    try {
      // Stop current audio if playing
      this.stop();

      const audioUrl = await this.generateSpeech(text, options);
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = options.volume || 0.8;
      this.currentAudio.playbackRate = options.playbackRate || 1.0;

      await this.currentAudio.play();
      
      return this.currentAudio;

    } catch (error) {
      console.error('Speak error:', error);
      throw error;
    }
  }

  /**
   * Stop current audio playback
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Fallback to browser TTS
   * @param {string} text - Text to speak
   * @returns {Promise<string>}
   */
  fallbackTTS(text) {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') && voice.lang.startsWith('en')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
        resolve('browser_tts');
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Convert base64 to Blob
   * @param {string} base64 - Base64 encoded audio
   * @param {string} mimeType - MIME type
   * @returns {Blob}
   */
  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  /**
   * Cache audio URL
   * @param {string} key - Cache key
   * @param {string} url - Audio URL
   */
  cacheAudio(key, url) {
    // Implement LRU cache
    if (this.audioCache.size >= this.maxCacheSize) {
      const firstKey = this.audioCache.keys().next().value;
      const oldUrl = this.audioCache.get(firstKey);
      URL.revokeObjectURL(oldUrl);
      this.audioCache.delete(firstKey);
    }
    
    this.audioCache.set(key, url);
  }

  /**
   * Get emotion-based prompt
   * @param {string} emotion - Emotion type
   * @returns {string}
   */
  getEmotionPrompt(emotion) {
    const prompts = {
      supportive: 'Say the following in a warm, supportive, and empathetic way',
      encouraging: 'Say the following in an encouraging and uplifting way',
      calming: 'Say the following in a calm, soothing, and gentle way',
      energetic: 'Say the following in an energetic and enthusiastic way',
      curious: 'Say the following in a curious and engaged way',
      compassionate: 'Say the following with deep compassion and understanding'
    };
    
    return prompts[emotion] || prompts.supportive;
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.audioCache.clear();
  }

  /**
   * Get cache statistics
   * @returns {object}
   */
  getCacheStats() {
    return {
      size: this.audioCache.size,
      maxSize: this.maxCacheSize,
      keys: Array.from(this.audioCache.keys())
    };
  }
}

// Create singleton instance
const geminiTTSService = new GeminiTTSService();

export default geminiTTSService;
