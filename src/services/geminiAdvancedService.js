/**
 * Advanced Gemini Features Client Service
 * Connects frontend to advanced Gemini capabilities
 */

const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 
  'http://localhost:5001/mindmend-25dca/asia-south1';

class GeminiAdvancedService {
  /**
   * Streaming Chat - Real-time token streaming
   * @param {string} message - User message
   * @param {Array} history - Chat history
   * @param {Function} onChunk - Callback for each chunk
   * @returns {Promise<string>} Full response
   */
  async streamingChat(message, history = [], onChunk) {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/streamingChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      if (!response.ok) {
        throw new Error(`Streaming failed: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk && onChunk) {
                onChunk(data.chunk);
              }

              fullText += data.chunk || '';

              if (data.done) {
                return fullText;
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', e);
            }
          }
        }
      }

      return fullText;

    } catch (error) {
      console.error('Streaming chat error:', error);
      throw error;
    }
  }

  /**
   * Function Calling Chat - Let Gemini call functions
   * @param {string} message - User message
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Response with function calls
   */
  async functionCallingChat(message, userId) {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/functionCallingChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId })
      });

      if (!response.ok) {
        throw new Error(`Function calling failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Function calling error:', error);
      throw error;
    }
  }

  /**
   * Chat Session - Stateful multi-turn conversations
   * @param {string} message - User message
   * @param {string} sessionId - Session ID
   * @param {Array} history - Chat history
   * @returns {Promise<Object>} Response
   */
  async chatSession(message, sessionId, history = []) {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/chatSession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId, history })
      });

      if (!response.ok) {
        throw new Error(`Chat session failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Chat session error:', error);
      throw error;
    }
  }

  /**
   * Multimodal Analysis - Analyze images with text
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} text - Optional text prompt
   * @param {string} mimeType - Image MIME type
   * @returns {Promise<Object>} Analysis result
   */
  async multimodalAnalysis(imageBase64, text = '', mimeType = 'image/jpeg') {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/multimodalAnalysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, text, mimeType })
      });

      if (!response.ok) {
        throw new Error(`Multimodal analysis failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Multimodal analysis error:', error);
      throw error;
    }
  }

  /**
   * Cached Chat - Reduce costs with context caching
   * @param {string} message - User message
   * @param {string} userId - User ID
   * @param {boolean} useCache - Whether to use caching
   * @returns {Promise<Object>} Response
   */
  async cachedChat(message, userId, useCache = true) {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/cachedChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, userId, useCache })
      });

      if (!response.ok) {
        throw new Error(`Cached chat failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Cached chat error:', error);
      throw error;
    }
  }

  /**
   * Structured Output - Get JSON responses
   * @param {string} text - Input text
   * @param {string} outputType - Type of structured output
   * @returns {Promise<Object>} Structured data
   */
  async structuredOutput(text, outputType = 'moodAnalysis') {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/structuredOutput`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, outputType })
      });

      if (!response.ok) {
        throw new Error(`Structured output failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Structured output error:', error);
      throw error;
    }
  }

  /**
   * Get structured mood insights
   * @param {string} journalEntry - User's journal entry
   * @returns {Promise<Object>} Structured mood data
   */
  async getMoodInsights(journalEntry) {
    try {
      const prompt = `Analyze this journal entry and provide mood insights: "${journalEntry}"`;
      return await this.structuredOutput(prompt, 'moodAnalysis');

    } catch (error) {
      console.error('Mood insights error:', error);
      throw error;
    }
  }

  /**
   * Get exercise recommendation
   * @param {string} mood - Current mood
   * @param {number} duration - Desired duration
   * @returns {Promise<Object>} Exercise recommendation
   */
  async getExerciseRecommendation(mood, duration = 10) {
    try {
      const prompt = `Recommend a CBT exercise for someone feeling ${mood}, duration: ${duration} minutes`;
      return await this.structuredOutput(prompt, 'exerciseRecommendation');

    } catch (error) {
      console.error('Exercise recommendation error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const geminiAdvancedService = new GeminiAdvancedService();

export default geminiAdvancedService;
