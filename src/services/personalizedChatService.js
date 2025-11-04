/**
 * Personalized Chat Service for Mira
 * Integrates user context, conversation history, and mood patterns
 * Uses Gemini API with enhanced personalization
 */

import { getCurrentUser } from './authService.js';
import { db } from './firebaseConfig.js';
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatContextForPrompt } from './userContextService.js';
import { logChatMessage } from './activityTrackingService.js';
import { searchKnowledgeBase, createTherapistSystemPrompt } from './knowledgeBaseService.js';

// Conversation memory (in-memory cache)
const conversationCache = new Map();
const MAX_HISTORY_LENGTH = 10;

// Response cache for personalized chat (5-minute TTL)
const responseCache = new Map();
const RESPONSE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key from user message
 */
function getCacheKey(userMessage, language = 'en') {
  return `${language}_${userMessage.substring(0, 100).replace(/\s+/g, '_')}`;
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(cacheKey) {
  if (!cacheKey) return null;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_TTL) {
    console.log('💾 Using cached personalized response');
    return cached.response;
  }
  if (cached) {
    responseCache.delete(cacheKey);
  }
  return null;
}

/**
 * Cache response with TTL
 */
function cacheResponse(cacheKey, response) {
  if (!cacheKey) return;
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now()
  });
  // Clean old entries if cache gets too large
  if (responseCache.size > 50) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
}

/**
 * Get user profile data for personalization
 */
async function getUserProfile(userId) {
  try {
    if (!db) return { displayName: 'friend' };
    
    const userDoc = await getDocs(
      query(collection(db, 'users'), where('uid', '==', userId), limit(1))
    ).catch(() => null);
    
    if (!userDoc || userDoc.empty) return { displayName: 'friend' };
    return userDoc.docs[0].data();
  } catch (error) {
    console.warn('Could not fetch user profile:', error);
    return { displayName: 'friend' };
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
      limit(5)
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
 * Build personalized system prompt with unified context and professional training
 */
function buildPersonalizedPrompt(userProfile, moodHistory, userProgress, unifiedContext = null, knowledgePassages = []) {
  const userName = userProfile?.displayName?.split(' ')[0] || 'friend';
  const recentMoods = moodHistory?.slice(-3) || [];
  const streak = userProgress?.streak || 0;
  const completedExercises = userProgress?.completedExercises || 0;
  
  // Analyze mood patterns
  const moodSummary = recentMoods.length > 0 
    ? `Recent moods: ${recentMoods.join(' → ')}`
    : 'No recent mood data';
  
  // Include unified context if available
  let contextSection = '';
  if (unifiedContext && unifiedContext.summary) {
    const { summary, cbtEntries, assessments } = unifiedContext;
    contextSection = `
**Full User Context:**
- ${summary.moodTrend}
- ${summary.cbtSummary}
- ${summary.assessmentSummary}
- Engagement: ${summary.engagement.coachMessages} coach conversations, ${summary.engagement.friendMessages} friend chats`;
  }

  // Include professional knowledge if available
  let knowledgeSection = '';
  if (knowledgePassages && knowledgePassages.length > 0) {
    const knowledgeText = knowledgePassages
      .map(p => `**${p.title}**: ${p.content.substring(0, 200)}...`)
      .join('\n\n');
    knowledgeSection = `

**Professional Reference (from "Feeling Good" & CBT Techniques):**
${knowledgeText}`;
  }
  
  // Build context-aware prompt - OPTIMIZED FOR SPEED AND DIRECTNESS
  return `You are Mira, a professional AI mental wellness coach. You provide direct, actionable support.

**User Context:**
- Name: ${userName}
- ${moodSummary}
- Progress: ${completedExercises} exercises, ${streak}-day streak${contextSection}${knowledgeSection}

**CRITICAL RULES:**
1. **BE DIRECT**: Start with action, not acknowledgment
2. **BREVITY**: 2-3 sentences maximum
3. **NO FILLER**: Don't say "I understand", "I hear you", "Main samajh sakta hoon" etc.
4. **ACTION FIRST**: Jump straight to helpful techniques or questions
5. **ONE FOCUS**: Offer ONE specific tool or ask ONE clarifying question

**Examples:**
❌ BAD: "Main samajh sakta hoon. Exam mein fail hone ke baad aisa lagna normal hai..."
✅ GOOD: "Try this: Take 3 deep breaths. What's one small thing you can control right now?"

❌ BAD: "I understand you're feeling overwhelmed. That's completely normal..."
✅ GOOD: "Let's break this down. What's the most urgent thing on your mind?"

**Response Format:**
[Direct action/question] + [One supportive follow-up]

**Safety**: If crisis mentioned, provide:
- AASRA: 91-22-27546669
- Vandrevala Foundation: 1860-2662-345`;
}

/**
 * Generate personalized response using Gemini with full context
 * @param {string} userMessage - User's message
 * @param {Array} moodHistory - User's mood history
 * @param {Object} userProgress - User's progress data
 * @param {Array} conversationContext - Recent conversation messages
 * @param {string} language - Detected language code (en, hi, ta, te, etc.)
 * @returns {Promise<Object>} Response object with personalized message
 */
export async function generatePersonalizedResponse(userMessage, moodHistory = [], userProgress = {}, conversationContext = [], language = 'en') {
  try {
    const currentUser = getCurrentUser();
    const userId = currentUser?.uid || 'anonymous';
    
    // Check cache first for faster response
    const cacheKey = getCacheKey(userMessage, language);
    const cachedResponse = getCachedResponse(cacheKey);
    if (cachedResponse) {
      return {
        response: cachedResponse,
        personalized: true,
        cached: true,
        timestamp: new Date().toISOString()
      };
    }
    
    // Get user profile for personalization
    const userProfile = currentUser ? await getUserProfile(userId) : { displayName: 'friend' };
    
    // Get conversation history
    const history = currentUser ? await getConversationHistory(userId) : conversationContext.slice(-3);
    
    // Fetch unified user context from backend for comprehensive awareness
    let unifiedContext = null;
    let knowledgePassages = [];
    
    if (currentUser) {
      try {
        // Use emulator if running locally, otherwise use deployed functions
        const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL || 
          (window.location.hostname === 'localhost' 
            ? 'http://localhost:5001/mindmend-25dca/us-central1'
            : 'https://us-central1-mindmend-25dca.cloudfunctions.net');
        
        const contextResponse = await fetch(`${FUNCTIONS_URL}/getUserContext`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        if (contextResponse.ok) {
          unifiedContext = await contextResponse.json();
          console.log('📊 Unified context loaded:', {
            moods: unifiedContext.moods?.length || 0,
            cbtEntries: unifiedContext.cbtEntries?.length || 0,
            coachMessages: unifiedContext.coachHistory?.length || 0,
            friendMessages: unifiedContext.friendHistory?.length || 0,
            assessments: unifiedContext.assessments?.length || 0
          });
        } else {
          console.warn('⚠️ Could not fetch unified context from backend');
        }
      } catch (error) {
        console.warn('⚠️ Error fetching unified context:', error);
      }

      // Fetch relevant knowledge passages for professional response
      try {
        knowledgePassages = await searchKnowledgeBase(userMessage, 2);
        if (knowledgePassages.length > 0) {
          console.log('📚 Knowledge passages loaded:', knowledgePassages.length);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching knowledge passages:', error);
      }
    }
    
    // Build personalized system prompt with unified context and professional knowledge
    let systemPrompt = buildPersonalizedPrompt(userProfile, moodHistory, userProgress, unifiedContext, knowledgePassages);
    
    // Add language instruction to system prompt
    const languageInstructions = {
      hi: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE HINDI using Devanagari script (हिंदी). NO English words or Roman script. Keep sentences SHORT (1-2 lines). Be warm and supportive.',
      ta: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE TAMIL using Tamil script (தமிழ்). NO English words. Keep sentences SHORT (1-2 lines). Be warm and supportive.',
      te: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE TELUGU using Telugu script (తెలుగు). NO English words. Keep sentences SHORT (1-2 lines). Be warm and supportive.',
      bn: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE BENGALI using Bengali script (বাংলা). NO English words. Keep sentences SHORT (1-2 lines). Be warm and supportive.',
      gu: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE GUJARATI using Gujarati script (ગુજરાતી). NO English words. Keep sentences SHORT (1-2 lines). Be warm and supportive.',
      kn: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE KANNADA using Kannada script (ಕನ್ನಡ). NO English words. Keep sentences SHORT (1-2 lines). Be warm and supportive.',
      ml: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE MALAYALAM using Malayalam script (മലയാളം). NO English words. Keep sentences SHORT (1-2 lines). Be warm and supportive.',
      pa: '\n\n🌍 LANGUAGE INSTRUCTION: Respond ONLY in PURE PUNJABI using Punjabi script (ਪੰਜਾਬੀ). NO English words. Keep sentences SHORT (1-2 lines). Be warm and supportive.'
    };
    
    if (language && language !== 'en' && languageInstructions[language]) {
      systemPrompt += languageInstructions[language];
    }
    
    // Build conversation messages
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add recent conversation history (last 3 exchanges only)
    const recentHistory = history.slice(-3);
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
    
    // Call Gemini API via Firebase Functions
    // Use emulator if running locally, otherwise use deployed functions
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
          userName: userProfile?.displayName || 'friend',
          moodHistory: moodHistory.slice(-3),
          progress: userProgress
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.response;
    
    // Cache the response for future identical messages
    cacheResponse(cacheKey, aiResponse);
    
    // Save to conversation history and log activity
    if (currentUser) {
      const currentMood = moodHistory && moodHistory.length > 0 ? moodHistory[moodHistory.length - 1] : 'neutral';
      await saveMessage(userId, 'user', userMessage, { mood: currentMood });
      await saveMessage(userId, 'coach', aiResponse, { mood: 'supportive' });
      // Log chat activity
      await logChatMessage('coach', userMessage.length);
    }
    
    return {
      response: aiResponse,
      personalized: true,
      cached: false,
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
