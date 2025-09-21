// Serverless API endpoints for Netlify functions
const API_BASE_URL = '/.netlify/functions';

// Mental health context for all interactions
const MENTAL_HEALTH_CONTEXT = `
You are Mira, an empathetic AI mental wellness coach specializing in Cognitive Behavioral Therapy (CBT) techniques. 
You are designed to support young adults in India dealing with academic and social pressure.

Guidelines:
- Always be supportive, non-judgmental, and empathetic
- Use evidence-based CBT techniques and mindfulness practices
- Keep responses concise but meaningful (2-3 sentences max for chat)
- Never provide medical diagnosis or replace professional therapy
- If someone mentions self-harm or suicide, immediately suggest professional help
- Use culturally sensitive language appropriate for Indian youth
- Focus on practical, actionable advice
- Encourage professional help when needed

Current conversation context: Mental wellness support chat
`;

export class GeminiService {
  static async generateChatResponse(userMessage, moodHistory = [], userProgress = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          moodHistory,
          userProgress
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Chat API Error:', error);
      // Fallback to local responses if API fails
      return this.getFallbackResponse(userMessage);
    }
  }

  static async analyzeMoodPattern(moodHistory, journalEntries = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/mood-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodHistory,
          journalEntries
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Mood analysis error:', error);
      return {
        patterns: "I notice some variation in your mood patterns. This is completely normal.",
        recommendation: "Try the 5-4-3-2-1 grounding technique when feeling overwhelmed.",
        insight: "You're taking positive steps by tracking your mental wellness journey."
      };
    }
  }

  static async generatePersonalizedExercise(currentMood, userHistory = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/personalized-exercise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentMood,
          userHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.exercise;
    } catch (error) {
      console.error('Exercise generation error:', error);
      return this.getFallbackExercise(currentMood);
    }
  }

  static async detectEmotionalState(textInput) {
    try {
      const response = await fetch(`${API_BASE_URL}/emotion-detection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textInput
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.emotion;
    } catch (error) {
      console.error('Emotion detection error:', error);
      return {
        primaryEmotion: "neutral",
        stressLevel: 5,
        urgency: "low",
        suggestedAction: "Take a few deep breaths and practice mindfulness"
      };
    }
  }

  static async generateEmotionalTwin(moodHistory, personalityTraits = {}, userProgress = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/emotional-twin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moodHistory,
          personalityTraits,
          userProgress
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.twin;
    } catch (error) {
      console.error('Emotional twin error:', error);
      return {
        twinPersonality: "A resilient individual working on their mental wellness journey",
        strengths: ["Self-awareness", "Commitment to growth"],
        growthAreas: ["Stress management", "Emotional regulation"],
        motivationalMessage: "You're making great progress on your wellness journey!",
        avatar: "🌱"
      };
    }
  }

  static getFallbackResponse(userMessage) {
    const responses = {
      anxious: "I understand you're feeling anxious. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8. You're not alone in this.",
      sad: "It's okay to feel sad sometimes. Your feelings are valid. Would you like to try a gentle self-compassion exercise?",
      stressed: "Stress can be overwhelming. Let's break things down into smaller, manageable steps. What's one small thing you can do right now?",
      default: "Thank you for sharing. I'm here to support you. What would feel most helpful right now?"
    };

    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) return responses.anxious;
    if (lowerMessage.includes('sad') || lowerMessage.includes('down')) return responses.sad;
    if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) return responses.stressed;
    return responses.default;
  }

  static getFallbackExercise(mood) {
    const exercises = {
      anxious: {
        title: "5-4-3-2-1 Grounding Technique",
        duration: "5 minutes",
        steps: [
          "Name 5 things you can see around you",
          "Name 4 things you can touch",
          "Name 3 things you can hear",
          "Name 2 things you can smell",
          "Name 1 thing you can taste"
        ],
        outcome: "Feel more grounded and present in the moment"
      },
      sad: {
        title: "Self-Compassion Practice",
        duration: "10 minutes",
        steps: [
          "Place your hand on your heart",
          "Acknowledge: 'This is a moment of suffering'",
          "Remember: 'Suffering is part of human experience'",
          "Offer yourself kindness: 'May I be kind to myself'"
        ],
        outcome: "Develop a more compassionate relationship with yourself"
      },
      stressed: {
        title: "Progressive Muscle Relaxation",
        duration: "15 minutes",
        steps: [
          "Start with your toes, tense for 5 seconds then relax",
          "Move up to your calves, repeat the process",
          "Continue with thighs, abdomen, arms, and face",
          "Notice the difference between tension and relaxation"
        ],
        outcome: "Release physical tension and mental stress"
      },
      happy: {
        title: "Gratitude Amplification",
        duration: "8 minutes",
        steps: [
          "Write down 3 things you're grateful for today",
          "For each item, write why you're grateful",
          "Visualize how these positive things impact your life",
          "Share your gratitude with someone you care about"
        ],
        outcome: "Amplify positive emotions and strengthen relationships"
      }
    };

    return exercises[mood] || exercises.happy;
  }
}

export default GeminiService;
