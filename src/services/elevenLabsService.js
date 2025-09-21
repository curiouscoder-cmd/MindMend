// ElevenLabs Text-to-Speech Integration for MindMend AI
// Provides voice synthesis for AI coach responses and guided exercises

class ElevenLabsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.defaultVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam voice (default)
    
    // Voice configurations for different personas
    this.voiceConfig = {
      // AI Coach Mira - Warm, professional female voice
      mira: {
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella voice
        settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      },
      // Dr. Maya - Professional therapist
      dr_maya: {
        voiceId: 'ThT5KcBeYPX3keUQqHPh', // Dorothy voice
        settings: {
          stability: 0.8,
          similarity_boost: 0.7,
          style: 0.3,
          use_speaker_boost: true
        }
      },
      // Arjun - Young male student
      arjun: {
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice
        settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.6,
          use_speaker_boost: true
        }
      },
      // Priya - Professional female
      priya: {
        voiceId: 'XrExE9yKIg1WjnnlVkGX', // Matilda voice
        settings: {
          stability: 0.7,
          similarity_boost: 0.75,
          style: 0.4,
          use_speaker_boost: true
        }
      },
      // Rohit - Casual male voice
      rohit: {
        voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel voice
        settings: {
          stability: 0.65,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true
        }
      },
      // Guided meditation voice - Calm, soothing
      meditation: {
        voiceId: 'AZnzlk1XvdvUeBnXmlld', // Domi voice
        settings: {
          stability: 0.9,
          similarity_boost: 0.6,
          style: 0.2,
          use_speaker_boost: false
        }
      }
    };
    
    // Audio cache for frequently used phrases
    this.audioCache = new Map();
    this.isEnabled = !!this.apiKey;
  }

  // Check if online (serverless function holds the API key securely)
  isAvailable() {
    return navigator.onLine;
  }

  // Get available voices from ElevenLabs
  async getAvailableVoices() {
    if (!this.isAvailable()) return [];
    
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch voices');
      
      const data = await response.json();
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  // Generate speech from text using serverless proxy
  async generateSpeech(text, persona = 'mira', options = {}) {
    // Check cache first
    const cacheKey = `${persona}_${text.substring(0, 50)}`;
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey);
    }

    if (!this.isAvailable()) {
      return this.fallbackTTS(text);
    }

    try {
      const voiceConfig = this.voiceConfig[persona] || this.voiceConfig.mira;
      const payload = {
        text,
        persona,
        model: options.model || 'eleven_monolingual_v1',
        voiceSettings: { ...voiceConfig.settings, ...(options.voiceSettings || {}) }
      };

      const resp = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error(`TTS function error: ${resp.status}`);
      }

      const data = await resp.json();
      if (!data?.audioBase64) {
        throw new Error('Missing audio data');
      }

      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.contentType || 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      this.audioCache.set(cacheKey, audioUrl);
      return audioUrl;
    } catch (error) {
      console.warn('TTS serverless failed, falling back to browser TTS:', error);
      return this.fallbackTTS(text);
    }
  }

  // Fallback to browser's built-in TTS
  fallbackTTS(text) {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // Try to use a pleasant voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.lang.startsWith('en')
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

  // Play audio from URL or use TTS
  async playAudio(audioUrl, onEnd = null) {
    if (audioUrl === 'browser_tts') {
      // Browser TTS is already playing
      return;
    }
    
    if (!audioUrl) return;

    try {
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      
      if (onEnd) {
        audio.addEventListener('ended', onEnd);
      }
      
      await audio.play();
      return audio;
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  // Generate guided exercise audio
  async generateGuidedExercise(exercise, persona = 'meditation') {
    const steps = exercise.steps;
    const audioUrls = [];
    
    // Introduction
    const intro = `Welcome to the ${exercise.title}. This exercise will take about ${exercise.duration}. Let's begin by finding a comfortable position.`;
    audioUrls.push(await this.generateSpeech(intro, persona));
    
    // Each step with pauses
    for (let i = 0; i < steps.length; i++) {
      const stepText = `Step ${i + 1}: ${steps[i]}. Take your time with this.`;
      audioUrls.push(await this.generateSpeech(stepText, persona));
      
      // Add pause instruction except for last step
      if (i < steps.length - 1) {
        const pauseText = "Now, let's pause for a moment before moving to the next step.";
        audioUrls.push(await this.generateSpeech(pauseText, persona));
      }
    }
    
    // Conclusion
    const conclusion = `Excellent work completing the ${exercise.title}. Notice how you feel right now. You can return to this exercise whenever you need it.`;
    audioUrls.push(await this.generateSpeech(conclusion, persona));
    
    return audioUrls;
  }

  // Generate AI coach response with voice
  async generateCoachResponse(text, emotion = 'supportive') {
    // Adjust voice settings based on emotion
    const emotionSettings = {
      supportive: { stability: 0.8, style: 0.3 },
      encouraging: { stability: 0.7, style: 0.6 },
      calming: { stability: 0.9, style: 0.2 },
      energetic: { stability: 0.6, style: 0.7 }
    };
    
    const settings = emotionSettings[emotion] || emotionSettings.supportive;
    
    return await this.generateSpeech(text, 'mira', {
      voiceSettings: settings
    });
  }

  // Generate group therapy session audio
  async generateGroupResponse(text, participantId) {
    const persona = this.voiceConfig[participantId] ? participantId : 'mira';
    return await this.generateSpeech(text, persona);
  }

  // Preload common phrases for better performance
  async preloadCommonPhrases() {
    const commonPhrases = [
      "Hello, I'm Mira, your AI wellness coach. How are you feeling today?",
      "That sounds really challenging. You're not alone in feeling this way.",
      "Let's try a breathing exercise together. Are you ready?",
      "You're doing great. Take your time with this.",
      "How did that exercise feel for you?",
      "Remember, healing is a journey, and you're taking important steps.",
      "I'm here to support you whenever you need it."
    ];
    
    for (const phrase of commonPhrases) {
      await this.generateSpeech(phrase, 'mira');
    }
  }

  // Clear audio cache to free memory
  clearCache() {
    this.audioCache.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.audioCache.clear();
  }

  // Get usage statistics
  getUsageStats() {
    return {
      cachedAudios: this.audioCache.size,
      isEnabled: this.isEnabled,
      isOnline: navigator.onLine,
      voicePersonas: Object.keys(this.voiceConfig).length
    };
  }
}

// Create singleton instance
const elevenLabsService = new ElevenLabsService();

// Preload common phrases when service is initialized
if (elevenLabsService.isAvailable()) {
  elevenLabsService.preloadCommonPhrases().catch(console.error);
}

export default elevenLabsService;
