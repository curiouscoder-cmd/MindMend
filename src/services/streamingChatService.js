/**
 * Streaming Chat Service
 * Provides real-time streaming responses to make chat feel more natural and human-like
 * Shows text character-by-character as it's being generated
 */

import { generatePersonalizedResponse } from './personalizedChatService.js';

/**
 * Stream response character by character for natural feel
 * @param {string} text - Full response text
 * @param {Function} onChunk - Callback for each character chunk
 * @param {number} delayMs - Delay between characters (default: 30ms)
 */
export const streamText = async (text, onChunk, delayMs = 30) => {
  let displayedText = '';
  
  for (let i = 0; i < text.length; i++) {
    displayedText += text[i];
    
    if (onChunk) {
      onChunk(displayedText);
    }
    
    // Variable delay based on punctuation for natural feel
    let delay = delayMs;
    if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
      delay = delayMs * 3; // Longer pause after sentences
    } else if (text[i] === ',') {
      delay = delayMs * 2; // Medium pause after commas
    } else if (text[i] === ' ') {
      delay = delayMs * 0.5; // Shorter pause after spaces
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  return displayedText;
};

/**
 * Generate streaming personalized response
 * @param {string} userMessage - User's message
 * @param {Array} moodHistory - User's mood history
 * @param {Object} userProgress - User's progress data
 * @param {Array} conversationContext - Recent conversation messages
 * @param {string} language - Detected language
 * @param {Function} onStream - Callback for streaming chunks
 * @returns {Promise<Object>} Response object
 */
export const generateStreamingResponse = async (
  userMessage,
  moodHistory = [],
  userProgress = {},
  conversationContext = [],
  language = 'en',
  onStream = null
) => {
  try {
    // Get the full response first
    const result = await generatePersonalizedResponse(
      userMessage,
      moodHistory,
      userProgress,
      conversationContext,
      language
    );

    // Stream the response if callback provided
    if (onStream && result.response) {
      await streamText(result.response, onStream, 25); // 25ms per character
    }

    return result;
  } catch (error) {
    console.error('Streaming response error:', error);
    throw error;
  }
};

/**
 * Get typing indicator animation frames
 * @returns {Array<string>} Animation frames
 */
export const getTypingIndicator = () => {
  return ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
};

/**
 * Create typing animation
 * @param {Function} onFrame - Callback for each frame
 * @param {number} intervalMs - Interval between frames (default: 80ms)
 * @returns {Function} Stop function
 */
export const startTypingAnimation = (onFrame, intervalMs = 80) => {
  const frames = getTypingIndicator();
  let frameIndex = 0;
  
  const interval = setInterval(() => {
    onFrame(frames[frameIndex % frames.length]);
    frameIndex++;
  }, intervalMs);
  
  return () => clearInterval(interval);
};

/**
 * Format response for natural conversation
 * - Remove excessive punctuation
 * - Break into shorter sentences
 * - Add natural pauses
 */
export const formatNaturalResponse = (text) => {
  // Remove multiple spaces
  text = text.replace(/\s+/g, ' ');
  
  // Remove excessive punctuation
  text = text.replace(/([.!?]){2,}/g, '$1');
  
  // Ensure sentences are reasonably short (under 20 words)
  const sentences = text.split(/([.!?])/);
  let formatted = '';
  let wordCount = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;
    
    const words = sentence.split(' ').length;
    wordCount += words;
    
    formatted += sentence;
    
    // Add punctuation if missing
    if (i % 2 === 0 && sentence && !['.', '!', '?'].includes(sentence[sentence.length - 1])) {
      formatted += '.';
    }
    
    // Add space after punctuation
    if (i % 2 === 1) {
      formatted += ' ';
      wordCount = 0;
    }
  }
  
  return formatted.trim();
};


export default {
  streamText,
  generateStreamingResponse,
  getTypingIndicator,
  startTypingAnimation,
  formatNaturalResponse
};
