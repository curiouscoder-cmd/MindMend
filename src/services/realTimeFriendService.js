/**
 * Real-time Friend Service
 * Handles real-time conversation with minimal delay
 * Uses Web Speech API + Gemini 2.5 Flash + ElevenLabs
 */

import * as elevenLabsService from './elevenLabsService.js';

// Module state
const audioCache = new Map();
const MAX_CACHE_SIZE = 50;
let recognition = null;
let isListening = false;
let isSpeaking = false;
let shouldAutoRestart = true; // Control auto-restart
let conversationContext = {
  mood: 'neutral',
  topics: [],
  history: []
};

/**
 * Initialize speech recognition
 * @param {Function} onTranscript - Callback when speech is detected
 * @param {Function} onError - Callback for errors
 * @returns {Object} Recognition instance
 */
export const initializeSpeechRecognition = (onTranscript, onError) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('❌ Speech recognition not supported');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  // Configuration for real-time feel
  recognition.continuous = true; // Keep listening
  recognition.interimResults = true; // Get partial results
  recognition.lang = 'en-IN'; // Indian English
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log('🎤 Listening started');
    isListening = true;
  };

  recognition.onend = () => {
    console.log('🎤 Listening ended');
    isListening = false;
    
    // Only auto-restart if not manually stopped (e.g., during speaking)
    if (shouldAutoRestart) {
      setTimeout(() => {
        if (recognition && !isListening && !isSpeaking) {
          try {
            recognition.start();
            console.log('🔄 Auto-restarted listening');
          } catch (e) {
            console.log('Recognition already running or stopped manually');
          }
        }
      }, 100);
    }
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');

    const isFinal = event.results[event.results.length - 1].isFinal;

    if (isFinal) {
      console.log('✅ Final transcript:', transcript);
      if (onTranscript) onTranscript(transcript, true);
    } else {
      // Send interim results for real-time display
      if (onTranscript) onTranscript(transcript, false);
    }
  };

  recognition.onerror = (event) => {
    console.error('❌ Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  return recognition;
};

/**
 * Start listening
 */
export const startListening = () => {
  if (!recognition) {
    console.error('❌ Recognition not initialized');
    return false;
  }

  try {
    recognition.start();
    return true;
  } catch (error) {
    console.error('❌ Error starting recognition:', error);
    return false;
  }
};

/**
 * Stop listening
 */
export const stopListening = () => {
  if (recognition) {
    shouldAutoRestart = false; // Disable auto-restart
    recognition.stop();
  }
};

/**
 * Pause listening temporarily (e.g., during speaking)
 */
export const pauseListening = () => {
  if (recognition) {
    shouldAutoRestart = false; // Disable auto-restart temporarily
    recognition.stop();
  }
};

/**
 * Resume listening after pause
 */
export const resumeListening = () => {
  shouldAutoRestart = true;
  if (recognition && !isListening && !isSpeaking) {
    try {
      recognition.start();
      console.log('🎤 Listening resumed');
    } catch (e) {
      console.log('⚠️ Could not resume:', e);
    }
  } else {
    console.log('🎧 Skipping resume — still speaking or already listening');
  }
};


/**
 * Update conversation context
 * @param {Object} context - Context data
 */
export const updateContext = (context) => {
  conversationContext = {
    ...conversationContext,
    ...context
  };
  console.log('📊 Context updated:', conversationContext);
};

/**
 * Detect mood from text
 * @param {string} text - User input
 * @returns {string} Detected mood
 */
export const detectMood = (text) => {
  const lowerText = text.toLowerCase();

  const moodKeywords = {
    happy: ['happy', 'great', 'awesome', 'excited', 'wonderful', 'amazing', 'fantastic', 'better', 'good', 'fine', 'achha', 'theek'],
    sad: ['sad', 'down', 'depressed', 'upset', 'unhappy', 'crying', 'hurt', 'kharab', 'bura'],
    anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'panic', 'tension'],
    angry: ['angry', 'frustrated', 'annoyed', 'mad', 'furious'],
    tired: ['tired', 'exhausted', 'sleepy', 'drained', 'fatigued'],
    confused: ['confused', 'lost', 'unsure', 'don\'t know', 'samajh', 'nahi'],
    motivated: ['motivated', 'energized', 'pumped', 'ready', 'determined']
  };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return mood;
    }
  }

  return 'neutral';
};

/**
 * Check if user wants to end conversation
 * @param {string} text - User input
 * @returns {boolean} True if user wants to end
 */
export const shouldEndConversation = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for ending phrases
  const endPhrases = [
    'i am fine now',
    'i\'m fine now',
    'feeling better',
    'feel better',
    'thank you',
    'thanks',
    'that\'s all',
    'thats all',
    'bye',
    'goodbye',
    'theek hoon',
    'achha hoon',
    'better feel kar raha',
    'ab theek hai',
    'shukriya',
    'dhanyavaad'
  ];

  return endPhrases.some(phrase => lowerText.includes(phrase));
};

/**
 * Detect topics from text
 * @param {string} text - User input
 * @returns {Array} Detected topics
 */
export const detectTopics = (text) => {
  const lowerText = text.toLowerCase();
  const topics = [];

  const topicKeywords = {
    work: ['work', 'job', 'office', 'boss', 'colleague', 'career', 'project'],
    family: ['family', 'parents', 'mom', 'dad', 'brother', 'sister', 'home'],
    relationships: ['friend', 'relationship', 'girlfriend', 'boyfriend', 'partner', 'dating'],
    studies: ['study', 'exam', 'college', 'university', 'course', 'assignment', 'test'],
    health: ['health', 'exercise', 'gym', 'fitness', 'sleep', 'diet', 'sick'],
    money: ['money', 'financial', 'salary', 'expense', 'budget', 'debt'],
    future: ['future', 'plan', 'goal', 'dream', 'ambition', 'career']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  }

  return topics;
};

/**
 * Generate friend response using Gemini
 * @param {string} userInput - User's message
 * @param {Object} context - Conversation context
 * @returns {Promise<string>} Friend's response
 */
export const generateFriendResponse = async (userInput, context = {}) => {
  try {
    const mood = detectMood(userInput);
    const topics = detectTopics(userInput);
    
    // Detect if user is speaking Hindi/Hinglish
    const hindiWords = ['mera', 'tera', 'hai', 'nahi', 'nahin', 'kya', 'kaise', 'bahut', 'kharab', 'achha', 'acche', 'theek', 'yaar', 'dost', 'bhai', 'aaj', 'kal', 'gaya', 'karun', 'samajh', 'dimag', 'kam', 'kiya', 'apne', 'aap', 'jabardasti', 'nautanki', 'karti', 'rahti', 'roj', 'kuchh'];
    const lowerInput = userInput.toLowerCase();
    const hindiWordCount = hindiWords.filter(word => lowerInput.includes(word)).length;
    const isHindi = hindiWordCount >= 2; // Reduced threshold to 2 words for better detection

    // Update context
    updateContext({ 
      mood, 
      topics: [...new Set([...conversationContext.topics, ...topics])],
      language: isHindi ? 'hi' : 'en'
    });

    // Create context-aware prompt with language instruction
    // For better pronunciation, use PURE language (no mixing)
    const languageInstruction = isHindi 
      ? `CRITICAL LANGUAGE RULE - MUST FOLLOW:
         - Respond ONLY in PURE HINDI using Devanagari script (हिंदी)
         - ABSOLUTELY NO English words or Roman script
         - Use ONLY: "दोस्त", "यार", "मुझे", "तुम्हें", "क्या", "कैसे", "बहुत", "अच्छा"
         - NEVER use: "dost", "yaar", "friend", "buddy" or ANY English
         - Example CORRECT: "अरे यार, मुझे बहुत दुख हुआ।"
         - Example WRONG: "Oh no, dost!" or "Haan yaar" (NO ROMAN SCRIPT)`
      : `LANGUAGE RULE - REDUCE HINDI WORD FREQUENCY:
         - Respond PRIMARILY in ENGLISH
         - Use "friend", "buddy", "mate" as main words
         - Use "yaar" or "dost" SPARINGLY (max once per 3-4 responses)
         - Vary your vocabulary - don't repeat same words
         - Example GOOD: "Hey friend, I'm sorry to hear that."
         - Example ACCEPTABLE: "I understand, yaar. Tell me more."
         - Example BAD: "Hey yaar, I hear you, dost" (TOO MANY)`;

    const systemPrompt = `You are a supportive, empathetic friend having a real-time voice conversation.

Current Context:
- User mood: ${mood}
- Topics: ${topics.join(', ') || 'general chat'}
- Language: ${isHindi ? 'Hindi/Hinglish' : 'English'}
- Conversation history: ${conversationContext.history.slice(-3).join('; ')}

${languageInstruction}

Guidelines:
1. Keep responses VERY SHORT (1-2 sentences max) for real-time feel
2. Be warm, casual, and supportive like a close friend
3. VARY your vocabulary - use different words each time
4. Use "friend", "buddy", "mate" as primary words
5. Use "yaar" or "dost" OCCASIONALLY (not every response)
6. Ask ONE follow-up question to keep conversation flowing
7. Acknowledge emotions naturally
8. NO markdown, NO formatting - just plain friendly text

${isHindi ? 
  'HINDI EXAMPLES:\n✅ "अरे यार, मुझे बहुत दुख हुआ। क्या हुआ था?"\n✅ "दोस्त, मैं समझ सकता हूँ। तुम्हें कैसा लग रहा है?"\n❌ "Oh no, dost! Kya hua?" (WRONG - mixed)' 
  : 
  'ENGLISH EXAMPLES:\n✅ "Hey friend, I\'m sorry to hear that. What happened?"\n✅ "I understand. How are you feeling?"\n✅ "That sounds tough, yaar. Tell me more." (occasional Hindi OK)\n❌ "Hey yaar, I hear you, dost!" (TOO MANY Hindi words)'}

Respond as a caring friend would in a natural conversation.`;

    // Call Gemini API via Firebase Functions
    const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 
      'http://localhost:5001/mindmend-25dca/us-central1';
    
    console.log('📡 Calling API:', `${FUNCTIONS_URL}/chatPersonalized`);
    
    const response = await fetch(`${FUNCTIONS_URL}/chatPersonalized`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        userContext: {
          language: conversationContext.language || 'en'
        },
        context: conversationContext,
        maxTokens: 100 // Keep responses short
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let friendResponse = data.response || data.message || getFallbackResponse(mood);

    // POST-PROCESSING: Track usage to reduce frequency
    if (!isHindi) {
      // Count occurrences of Hindi words in recent history
      const recentHistory = conversationContext.history.slice(-6).join(' ').toLowerCase();
      const yaarCount = (recentHistory.match(/yaar/g) || []).length;
      const dostCount = (recentHistory.match(/dost/g) || []).length;
      
      // If used too frequently in recent responses, replace this time
      if (yaarCount >= 2 || dostCount >= 2) {
        friendResponse = friendResponse.replace(/\byaar\b/gi, 'friend');
        friendResponse = friendResponse.replace(/\bdost\b/gi, 'buddy');
        console.log('⚠️ Reduced Hindi word frequency');
      }
    }

    // Add to history
    conversationContext.history.push(`User: ${userInput}`, `Friend: ${friendResponse}`);
    if (conversationContext.history.length > 10) {
      conversationContext.history = conversationContext.history.slice(-10);
    }

    return friendResponse;

  } catch (error) {
    console.error('❌ Error generating response:', error);
    return getFallbackResponse(conversationContext.mood);
  }
};

/**
 * Get fallback response based on mood
 * @param {string} mood - Current mood
 * @returns {string} Fallback response
 */
const getFallbackResponse = (mood) => {
  const responses = {
    happy: "That's awesome, yaar! Tell me more!",
    sad: "I'm here for you, dost. Want to talk about it?",
    anxious: "I hear you. Take a deep breath. What's worrying you?",
    angry: "I understand you're upset. Let it out, I'm listening.",
    tired: "You sound exhausted. Want to take a break and chat?",
    confused: "It's okay to feel confused. Let's figure this out together.",
    motivated: "Love the energy! What's got you so pumped?",
    neutral: "I'm here for you. What's on your mind?"
  };

  return responses[mood] || responses.neutral;
};

/**
 * Speak response using ElevenLabs
 * @param {string} text - Text to speak
 * @param {Object} callbacks - onStart, onEnd callbacks
 * @returns {Promise<void>}
 */
export const speakResponse = async (text, callbacks = {}) => {
  try {
    isSpeaking = true;
    shouldAutoRestart = false;

    await elevenLabsService.generateContextAwareSpeech(text, conversationContext, {
      voice: 'rachel',
      useCache: false,
      onStart: () => {
        console.log('🔊 Friend speaking...');
        if (callbacks.onStart) callbacks.onStart();
      },
      onEnd: () => {
        console.log('✅ Friend finished speaking');
        isSpeaking = false;
        shouldAutoRestart = true;

        // 🩵 FIX: Safely resume listening after speech ends
        setTimeout(() => {
          if (!isSpeaking && recognition && !isListening) {
            try {
              recognition.start();
              console.log('🎤 Listening resumed after speaking (via friendService)');
            } catch (e) {
              console.warn('⚠️ Could not restart recognition:', e);
            }
          }
        }, 500); // Reduced delay for faster response

        if (callbacks.onEnd) callbacks.onEnd();
      },
    });
  } catch (error) {
    console.error('❌ Error speaking:', error);
    isSpeaking = false;
    shouldAutoRestart = true;
    setTimeout(() => {
      if (recognition && !isListening) {
        try {
          recognition.start();
          console.log('🎤 Listening resumed after speech error recovery');
        } catch (e) {
          console.warn('⚠️ Could not resume after error:', e);
        }
      }
    }, 800);
    if (callbacks.onEnd) callbacks.onEnd();
  }
};


/**
 * Get conversation state
 * @returns {Object} Current state
 */
export const getState = () => ({
  isListening,
  isSpeaking,
  context: conversationContext
});

/**
 * Reset conversation
 */
export const resetConversation = () => {
  conversationContext = {
    mood: 'neutral',
    topics: [],
    history: []
  };
  console.log('🔄 Conversation reset');
};

// Export default object
export default {
  initializeSpeechRecognition,
  startListening,
  stopListening,
  pauseListening,
  resumeListening,
  updateContext,
  detectMood,
  detectTopics,
  shouldEndConversation,
  generateFriendResponse,
  speakResponse,
  getState,
  resetConversation
};
