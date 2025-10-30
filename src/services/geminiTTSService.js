/**
 * Gemini 2.5 Flash TTS Client Service
 * Handles text-to-speech using Gemini 2.5 Flash TTS with Aoede voice
 * Features: LOW latency, HIGH quality, emotion-aware synthesis
 */

// Get functions URL from environment
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 'http://127.0.0.1:5001/mindmend-25dca/asia-south1';

console.log('🔧 Gemini TTS Service initialized with URL:', FUNCTIONS_URL);

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
      console.log('📍 URL:', `${FUNCTIONS_URL}/geminiTTS`);
      console.log('📝 Text:', text.substring(0, 50) + '...');
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

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TTS API error:', response.status, errorText);
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;
      console.log(`✅ Speech generated in ${duration}ms`);

      // Convert base64 PCM to WAV blob for browser playback
      // Sample rate: 44100Hz (from Gemini TTS)
      const audioBlob = this.base64ToWavBlob(data.audioBase64, data.sampleRate || 44100);
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the result
      if (useCache) {
        this.cacheAudio(cacheKey, audioUrl);
      }

      return audioUrl;

    } catch (error) {
      console.error('❌ Gemini TTS Error:', error);
      console.error('⚠️ Falling back to browser TTS');
      console.error('💡 Check that Firebase emulators are running on:', FUNCTIONS_URL);
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
   * Convert base64 PCM to WAV blob with proper headers
   * @param {string} base64 - Base64 encoded PCM audio
   * @param {number} sampleRate - Sample rate (44100Hz for Gemini TTS)
   * @returns {Blob} WAV audio blob
   */
  base64ToWavBlob(base64, sampleRate = 44100) {
    // Decode base64 to PCM data
    const pcmData = atob(base64);
    const pcmBytes = new Uint8Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      pcmBytes[i] = pcmData.charCodeAt(i);
    }

    // Create WAV header
    const numChannels = 1; // Mono
    const bitsPerSample = 16; // LINEAR16
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmBytes.length;
    const fileSize = 36 + dataSize;

    // Create WAV file buffer
    const wavBuffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(wavBuffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Copy PCM data
    const wavBytes = new Uint8Array(wavBuffer);
    wavBytes.set(pcmBytes, 44);

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  /**
   * Helper to write string to DataView
   * @param {DataView} view - DataView to write to
   * @param {number} offset - Offset position
   * @param {string} string - String to write
   */
  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
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
