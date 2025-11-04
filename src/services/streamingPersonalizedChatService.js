import { getCurrentUser } from './authService.js';
import { logChatMessage } from './activityTrackingService.js';

/**
 * Generate streaming personalized response
 * @param {string} userMessage - User's message
 * @param {Array} moodHistory - User's mood history
 * @param {Object} userProgress - User's progress data
 * @param {Array} conversationContext - Recent conversation messages
 * @param {string} language - Detected language
 * @param {Function} onChunk - Callback for each text chunk
 * @returns {Promise<Object>} Response object
 */
export async function generateStreamingPersonalizedResponse(
  userMessage,
  moodHistory = [],
  userProgress = {},
  conversationContext = [],
  language = 'en',
  onChunk = null
) {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.uid || 'anonymous';
    
    // Build messages array
    const messages = [
      {
        role: 'system',
        content: buildSystemPrompt(language)
      }
    ];
    
    // Add recent conversation history
    conversationContext.slice(-3).forEach(msg => {
      messages.push({
        role: msg.role === 'coach' ? 'assistant' : 'user',
        content: msg.content
      });
    });
    
    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });
    
    // Call streaming API
    const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 
      (window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/mindmend-25dca/us-central1'
        : 'https://us-central1-mindmend-25dca.cloudfunctions.net');
    
    const response = await fetch(`${FUNCTIONS_URL}/chatPersonalized`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        userContext: {
          userId,
          userName: currentUser?.displayName || 'friend',
          moodHistory: moodHistory.slice(-3),
          progress: userProgress
        },
        stream: true // Enable streaming
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Read the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            if (data.text && onChunk) {
              fullResponse += data.text;
              onChunk(data.text, fullResponse);
            }
            
            if (data.done) {
              // Stream complete
              if (data.fullResponse) {
                fullResponse = data.fullResponse;
              }
            }
          } catch (parseError) {
            console.error('Error parsing SSE data:', parseError);
          }
        }
      }
    }
    
    // Log activity
    if (currentUser) {
      await logChatMessage('coach', userMessage.length);
    }
    
    return {
      response: fullResponse,
      personalized: true,
      streamed: true,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Streaming error:', error);
    throw error;
  }
}

/**
 * Build system prompt based on language
 */
function buildSystemPrompt(language) {
  const basePrompt = `You are Mira, a compassionate AI mental health coach. You provide empathetic, evidence-based support.

Guidelines:
- Be warm, supportive, and non-judgmental
- Keep responses concise (2-4 sentences)
- Ask ONE follow-up question
- Use active listening techniques
- Avoid medical advice or diagnosis
- Focus on emotional support and coping strategies`;

  const languageInstructions = {
    hi: '\n\n🌍 RESPOND IN PURE HINDI (हिंदी) using Devanagari script. NO English words.',
    ta: '\n\n🌍 RESPOND IN PURE TAMIL (தமிழ்) using Tamil script. NO English words.',
    te: '\n\n🌍 RESPOND IN PURE TELUGU (తెలుగు) using Telugu script. NO English words.',
    bn: '\n\n🌍 RESPOND IN PURE BENGALI (বাংলা) using Bengali script. NO English words.',
    en: '\n\n🌍 RESPOND IN NATURAL ENGLISH. Be conversational and warm.'
  };

  return basePrompt + (languageInstructions[language] || languageInstructions.en);
}

export default {
  generateStreamingPersonalizedResponse
};
