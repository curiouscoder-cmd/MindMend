/**
 * Personalized Chat Service for Mira
 * Integrates user context, conversation history, and mood patterns
 * Uses Gemini API with enhanced personalization
 */

import { getCurrentUser } from './authService.js';
import { db } from './firebaseConfig.js';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

// Conversation memory (in-memory cache)
const conversationCache = new Map();
const MAX_HISTORY_LENGTH = 10;

/**
 * Get user profile data for personalization
 */
async function getUserProfile(userId) {
  try {
    if (!db) return null;
    
    const userDoc = await getDocs(
      query(collection(db, 'users'), where('uid', '==', userId), limit(1))
    );
    
    if (userDoc.empty) return null;
    return userDoc.docs[0].data();
  } catch (error) {
    console.warn('Could not fetch user profile:', error);
    return null;
  }
}

/**
 * Get recent conversation history
 */
async function getConversationHistory(userId) {
  // Check cache first
  if (conversationCache.has(userId)) {
    return conversationCache.get(userId);
  }
  
  try {
    if (!db) return [];
    
    const messagesQuery = query(
      collection(db, 'chatSessions', userId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(MAX_HISTORY_LENGTH)
    );
    
    const snapshot = await getDocs(messagesQuery);
    const history = snapshot.docs
      .map(doc => doc.data())
      .reverse(); // Oldest first
    
    conversationCache.set(userId, history);
    return history;
  } catch (error) {
    console.warn('Could not fetch conversation history:', error);
    return [];
  }
}

/**
 * Save message to conversation history
 */
async function saveMessage(userId, role, content, metadata = {}) {
  try {
    if (!db) return;
    
    const message = {
      role,
      content,
      timestamp: new Date(),
      ...metadata
    };
    
    await addDoc(collection(db, 'chatSessions', userId, 'messages'), message);
    
    // Update cache
    const cached = conversationCache.get(userId) || [];
    cached.push(message);
    if (cached.length > MAX_HISTORY_LENGTH) {
      cached.shift();
    }
    conversationCache.set(userId, cached);
  } catch (error) {
    console.warn('Could not save message:', error);
  }
}

/**
 * Build personalized system prompt
 */
function buildPersonalizedPrompt(userProfile, moodHistory, userProgress) {
  const userName = userProfile?.displayName || 'friend';
  const recentMoods = moodHistory?.slice(-5) || [];
  const streak = userProgress?.streak || 0;
  const completedExercises = userProgress?.completedExercises || 0;
  
  // Analyze mood patterns
  const moodSummary = recentMoods.length > 0 
    ? `Recent mood pattern: ${recentMoods.join(' → ')}`
    : 'No recent mood data';
  
  // Build context-aware prompt
  return `You are Mira, an empathetic AI mental wellness coach specializing in Cognitive Behavioral Therapy (CBT) techniques.

**User Context:**
- Name: ${userName}
- ${moodSummary}
- Progress: ${completedExercises} CBT exercises completed, ${streak}-day streak
- Primary audience: Young adults in India dealing with academic and social pressure

**Your Personality:**
- Warm, supportive, and non-judgmental
- Use evidence-based CBT and mindfulness techniques
- Culturally sensitive to Indian context
- Conversational and relatable (like talking to a supportive friend)

**Guidelines:**
1. **Personalization**: Reference their name, acknowledge their progress, and connect to their mood patterns
2. **Empathy First**: Validate feelings before offering solutions
3. **Actionable Advice**: Provide specific, practical CBT techniques they can use right now
4. **Brevity**: Keep responses concise (2-4 sentences) but meaningful
5. **Safety**: If self-harm/suicide is mentioned, immediately provide crisis resources:
   - AASRA: 91-22-27546669
   - Vandrevala Foundation: 1860-2662-345
6. **Encourage Growth**: Celebrate small wins and progress
7. **Cultural Awareness**: Use language and examples relevant to Indian youth

**Response Style:**
- Start with empathy and validation
- Offer 1-2 specific techniques or insights
- End with encouragement or a gentle question
- Use "you" and "your" to make it personal
- Avoid clinical jargon; be conversational`;
}

/**
 * Generate personalized AI response using Gemini
 */
export async function generatePersonalizedResponse(
  userMessage,
  moodHistory = [],
  userProgress = {},
  conversationContext = []
) {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.uid || 'anonymous';
    
    // Get user profile for personalization
    const userProfile = currentUser ? await getUserProfile(userId) : null;
    
    // Get conversation history
    const history = currentUser ? await getConversationHistory(userId) : conversationContext;
    
    // Build personalized system prompt
    const systemPrompt = buildPersonalizedPrompt(userProfile, moodHistory, userProgress);
    
    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add recent conversation history (last 5 exchanges)
    const recentHistory = history.slice(-5);
    recentHistory.forEach(msg => {
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
    
    // Call Gemini API via backend
    const response = await fetch('/.netlify/functions/chat-personalized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        userContext: {
          userId,
          userName: userProfile?.displayName || 'friend',
          moodHistory: moodHistory.slice(-5),
          progress: userProgress
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.response;
    
    // Save to conversation history
    if (currentUser) {
      await saveMessage(userId, 'user', userMessage, { mood: moodHistory[moodHistory.length - 1] });
      await saveMessage(userId, 'coach', aiResponse);
    }
    
    return {
      response: aiResponse,
      personalized: true,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Personalized chat error:', error);
    
    // Fallback to basic response with context awareness
    return {
      response: generateContextualFallback(userMessage, moodHistory),
      personalized: false,
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate contextual fallback response
 */
function generateContextualFallback(message, moodHistory) {
  const text = message.toLowerCase();
  const recentMood = moodHistory[moodHistory.length - 1];
  
  // Crisis detection
  if (/suicid|kill myself|end it all|want to die/i.test(text)) {
    return "I'm really concerned about what you're sharing. Please reach out for immediate help: AASRA (91-22-27546669) or Vandrevala Foundation (1860-2662-345). You don't have to face this alone. Would you like me to help you find more resources?";
  }
  
  // Intent-based responses with mood awareness
  const intents = {
    breathing: [
      `I can sense you need to ground yourself${recentMood ? ` after feeling ${recentMood}` : ''}. Let's try 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8. Ready to try together?`,
      "When anxiety rises, our breath is the anchor. Try box breathing with me: 4 counts in, hold 4, out 4, hold 4. Shall we do 3 rounds?"
    ],
    motivation: [
      `${recentMood === 'low' || recentMood === 'sad' ? "I know it's tough right now, but " : ""}you're showing up for yourself—that's powerful. What's one tiny step you can take in the next 10 minutes?`,
      "Progress isn't linear, and that's okay. What would a 1% improvement look like for you today?"
    ],
    tough_day: [
      `${recentMood ? `Feeling ${recentMood} is valid, and ` : ''}I'm here with you. Would you like to vent for a moment, or try a quick reset exercise?`,
      "Some days are heavier than others. Let's break this down: what's one gentle next step we can take together?"
    ],
    gratitude: [
      "Beautiful practice. What's one small thing today that brought you even a moment of peace or comfort?",
      "Gratitude can shift our perspective. Want to try a quick 3-line gratitude note? 1) What happened 2) Why it mattered 3) How it felt."
    ],
    sleep: [
      "Sleep struggles are so common. Try this tonight: dim lights 30 min before bed, 4-7-8 breathing, and write down tomorrow's top priority. Want more wind-down tips?",
      "Let's prepare your mind for rest: 4 slow breaths, release jaw and shoulder tension, then imagine placing worries in a box you'll open tomorrow."
    ],
    celebrate: [
      `${recentMood === 'happy' || recentMood === 'good' ? "I love seeing this shift! " : ""}What contributed to this feeling? Let's note it so we can create more of these moments.`,
      "That's wonderful! Take 10 seconds to really savor this feeling. What does it feel like in your body right now?"
    ]
  };
  
  // Detect intent
  let intent = 'general';
  if (/breath|breathing|ground|calm|panic|anxious/i.test(text)) intent = 'breathing';
  else if (/motivat|encourag|inspire|push|lazy/i.test(text)) intent = 'motivation';
  else if (/tough|hard day|bad day|overwhelm|stressed/i.test(text)) intent = 'tough_day';
  else if (/gratitude|grateful|thanks|appreciate/i.test(text)) intent = 'gratitude';
  else if (/sleep|insomnia|rest|tired|exhausted/i.test(text)) intent = 'sleep';
  else if (/happy|good|great|better|excited/i.test(text)) intent = 'celebrate';
  
  const responses = intents[intent] || [
    `Thank you for sharing${recentMood ? ` how you're feeling (${recentMood})` : ''}. What would feel most supportive right now—listening, a grounding tool, or a small next step?`,
    "I'm here with you. Would you like to unpack this more, try a quick practice, or set a gentle intention?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Clear conversation cache (useful for logout)
 */
export function clearConversationCache(userId) {
  if (userId) {
    conversationCache.delete(userId);
  } else {
    conversationCache.clear();
  }
}

export default {
  generatePersonalizedResponse,
  clearConversationCache
};
