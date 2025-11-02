/**
 * Knowledge Base Service
 * Manages professional psychology knowledge from "Feeling Good" and other sources
 * Provides context-aware responses based on therapeutic techniques
 */

import { db } from './firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Search knowledge base for relevant passages
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Relevant passages
 */
export const searchKnowledgeBase = async (query, limit = 3) => {
  try {
    if (!query || !db) return [];

    // Simple keyword matching - can be enhanced with embeddings later
    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 3);
    
    if (keywords.length === 0) return [];

    // Fetch all knowledge base entries (in production, use full-text search)
    const snapshot = await getDocs(
      collection(db, 'knowledge_base')
    );

    const results = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const content = (data.content || '').toLowerCase();
      const title = (data.title || '').toLowerCase();
      
      // Score based on keyword matches
      let score = 0;
      keywords.forEach(keyword => {
        if (title.includes(keyword)) score += 3;
        if (content.includes(keyword)) score += 1;
      });

      if (score > 0) {
        results.push({
          id: doc.id,
          ...data,
          relevanceScore: score
        });
      }
    });

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(({ relevanceScore, ...rest }) => rest);

  } catch (error) {
    console.warn('⚠️ Error searching knowledge base:', error.message);
    return [];
  }
};

/**
 * Get knowledge base entry by topic
 * @param {string} topic - Topic name
 * @returns {Promise<Object>} Knowledge entry
 */
export const getKnowledgeByTopic = async (topic) => {
  try {
    if (!topic || !db) return null;

    const q = query(
      collection(db, 'knowledge_base'),
      where('topic', '==', topic)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.warn('⚠️ Error fetching knowledge by topic:', error.message);
    return null;
  }
};

/**
 * Format knowledge passages for AI prompt
 * @param {Array} passages - Knowledge passages
 * @returns {string} Formatted text
 */
export const formatKnowledgeForPrompt = (passages) => {
  if (!passages || passages.length === 0) {
    return '';
  }

  const formatted = passages
    .map(p => `**${p.title}** (from "${p.source || 'Feeling Good'}"):\n${p.content}`)
    .join('\n\n---\n\n');

  return `\n\n## Professional Reference Material:\n${formatted}`;
};

/**
 * Get therapeutic techniques from knowledge base
 * @param {string} issue - User's issue/concern
 * @returns {Promise<Object>} Relevant techniques
 */
export const getTherapeuticTechniques = async (issue) => {
  try {
    const techniques = await searchKnowledgeBase(issue, 5);
    
    if (techniques.length === 0) {
      return {
        techniques: [],
        recommendation: 'Consider exploring CBT techniques or speaking with a professional therapist.'
      };
    }

    return {
      techniques,
      recommendation: `Based on "${techniques[0].source || 'Feeling Good'}", here are relevant approaches:`
    };
  } catch (error) {
    console.error('❌ Error getting therapeutic techniques:', error);
    return {
      techniques: [],
      recommendation: 'Consider exploring professional therapeutic resources.'
    };
  }
};

/**
 * Add knowledge entry to database
 * @param {Object} entry - Knowledge entry
 * @returns {Promise<string>} Document ID
 */
export const addKnowledgeEntry = async (entry) => {
  try {
    if (!db) throw new Error('Database not available');

    const docRef = await addDoc(collection(db, 'knowledge_base'), {
      ...entry,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });

    console.log('✅ Knowledge entry added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding knowledge entry:', error);
    throw error;
  }
};

/**
 * Get all knowledge topics
 * @returns {Promise<Array>} List of topics
 */
export const getAllKnowledgeTopics = async () => {
  try {
    if (!db) return [];

    const snapshot = await getDocs(collection(db, 'knowledge_base'));
    const topics = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      topics.push({
        id: doc.id,
        topic: data.topic,
        title: data.title,
        source: data.source
      });
    });

    return topics;
  } catch (error) {
    console.warn('⚠️ Error fetching knowledge topics:', error.message);
    return [];
  }
};

/**
 * Create professional therapist system prompt
 * @param {Array} knowledgePassages - Relevant knowledge
 * @returns {string} System prompt
 */
export const createTherapistSystemPrompt = (knowledgePassages = []) => {
  const knowledgeContext = formatKnowledgeForPrompt(knowledgePassages);

  return `You are a compassionate and professional psychotherapist trained in Cognitive Behavioral Therapy (CBT) and evidence-based therapeutic techniques from "Feeling Good" by David D. Burns and other established psychological practices.

Your approach:
1. **Empathy First**: Always validate the user's feelings and experiences
2. **CBT Framework**: Help identify automatic thoughts, cognitive distortions, and develop rational responses
3. **Evidence-Based**: Reference established therapeutic techniques and research
4. **Practical**: Provide actionable strategies and exercises
5. **Professional Boundaries**: Recognize when professional help is needed and encourage seeking it
6. **Non-Judgmental**: Create a safe, accepting space for exploration

Key Principles:
- Depression and anxiety often stem from distorted thinking patterns
- By identifying and challenging these patterns, people can feel better
- Small behavioral changes can lead to significant mood improvements
- Self-compassion and realistic thinking are essential

Your Techniques:
- Thought Records (Triple Column Technique)
- Behavioral Activation
- Cognitive Restructuring
- Mood Monitoring
- Exposure Therapy (when appropriate)
- Problem-Solving Strategies
- Self-Compassion Exercises

Communication Style:
- Use clear, accessible language
- Ask clarifying questions
- Provide psychoeducation when helpful
- Encourage self-reflection
- Celebrate progress and effort
- Be honest about limitations

${knowledgeContext}

Remember: While you provide therapeutic support, you are not a substitute for professional mental health treatment. Always encourage users to seek professional help when needed.`;
};

/**
 * Generate therapy-focused response prompt
 * @param {string} userMessage - User's message
 * @param {Array} knowledgePassages - Relevant knowledge
 * @returns {string} Enhanced prompt
 */
export const enhancePromptWithTherapyContext = (userMessage, knowledgePassages = []) => {
  const knowledgeContext = formatKnowledgeForPrompt(knowledgePassages);

  return `Based on the user's message and therapeutic knowledge, provide a professional, evidence-based response.

User's concern: "${userMessage}"

${knowledgeContext}

Respond as a professional therapist would:
1. Acknowledge and validate their feelings
2. Help them understand the underlying patterns
3. Suggest practical, evidence-based strategies
4. Encourage self-reflection and growth
5. Maintain professional boundaries`;
};

export default {
  searchKnowledgeBase,
  getKnowledgeByTopic,
  formatKnowledgeForPrompt,
  getTherapeuticTechniques,
  addKnowledgeEntry,
  getAllKnowledgeTopics,
  createTherapistSystemPrompt,
  enhancePromptWithTherapyContext
};
