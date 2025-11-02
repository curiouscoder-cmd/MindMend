import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
let genAI = null;

const initializeAI = () => {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ VITE_GEMINI_API_KEY is not set');
      return null;
    }
    
    try {
      genAI = new GoogleGenAI({ apiKey: apiKey });
      console.log('✅ Gemini AI initialized for thought challenger');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      return null;
    }
  }
  return genAI;
};

// System instruction for thought challenging
const THOUGHT_CHALLENGER_SYSTEM = `You are a compassionate CBT therapist specializing in the Triple-Column Technique and Socratic questioning.

Your role is to:
1. Help users identify and challenge negative automatic thoughts
2. Generate dynamic, personalized questions based on their specific thought
3. Guide them toward more balanced, realistic thinking
4. Provide evidence-based CBT techniques

Key principles:
- Be warm, non-judgmental, and supportive
- Ask questions that help users examine their thoughts from different angles
- Adapt questions to the specific thought and distortion type
- Focus on evidence, alternative perspectives, and realistic thinking
- Use the Triple-Column Technique: Automatic Thought → Evidence For/Against → Balanced Thought`;

/**
 * Generate dynamic thought-challenging questions based on user's automatic thought
 * @param {string} automaticThought - The negative automatic thought
 * @param {array} distortions - Identified cognitive distortions
 * @returns {object} - Dynamic questions tailored to the thought
 */
export const generateDynamicQuestions = async (automaticThought, distortions = []) => {
  try {
    const ai = initializeAI();
    
    if (!ai) {
      return {
        questions: getDefaultQuestions(automaticThought, distortions),
        isLocal: true
      };
    }

    const distortionList = distortions && distortions.length > 0
      ? distortions.map(d => d.name || d.type).join(', ')
      : 'General negative thinking';

    const prompt = `Generate 5 powerful Socratic questions to help challenge this automatic negative thought.

Automatic Thought: "${automaticThought}"
Identified Distortions: ${distortionList}

Requirements:
1. Each question should be specific to THIS thought (not generic)
2. Questions should help examine the thought from different angles
3. Include questions about: evidence, alternatives, consequences, self-compassion, and perspective
4. Questions should be open-ended and thought-provoking
5. Avoid leading questions - let the user discover insights

Format your response as a JSON object with this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "The actual question text",
      "purpose": "Why this question helps (brief explanation)",
      "category": "evidence|alternatives|consequences|self-compassion|perspective"
    }
  ],
  "tripleColumnTip": "A brief tip about using the Triple-Column Technique for this specific thought"
}

Provide ONLY the JSON, no markdown or code blocks.`;

    console.log('🤖 Generating dynamic questions with Gemini AI...');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: THOUGHT_CHALLENGER_SYSTEM,
      contents: prompt,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    let text = result.text.trim();
    text = text.replace(/```json\n?/g, '');
    text = text.replace(/```\n?/g, '');
    text = text.trim();

    const analysis = JSON.parse(text);

    console.log('✅ Dynamic questions generated:', analysis);

    return {
      questions: analysis.questions || [],
      tripleColumnTip: analysis.tripleColumnTip || '',
      isLocal: false
    };

  } catch (error) {
    console.error('❌ Error generating dynamic questions:', error);
    return {
      questions: getDefaultQuestions(automaticThought, distortions),
      isLocal: true,
      error: error.message
    };
  }
};

/**
 * Get default questions if AI is unavailable
 */
const getDefaultQuestions = (thought, distortions) => {
  return [
    {
      id: 1,
      question: 'What evidence do I have that supports this thought?',
      purpose: 'Examine factual basis for the thought',
      category: 'evidence'
    },
    {
      id: 2,
      question: 'What evidence contradicts or goes against this thought?',
      purpose: 'Look for counter-evidence',
      category: 'evidence'
    },
    {
      id: 3,
      question: 'What would I tell a good friend who had this same thought?',
      purpose: 'Access self-compassion and perspective',
      category: 'self-compassion'
    },
    {
      id: 4,
      question: 'What is another way I could look at this situation?',
      purpose: 'Generate alternative perspectives',
      category: 'alternatives'
    },
    {
      id: 5,
      question: 'What is the worst that could realistically happen, and could I handle it?',
      purpose: 'Reality-test catastrophic thinking',
      category: 'consequences'
    }
  ];
};

/**
 * Generate a balanced thought based on user's answers
 * @param {string} automaticThought - Original negative thought
 * @param {object} userAnswers - User's answers to the questions
 * @param {array} distortions - Identified distortions
 * @returns {object} - Balanced thought and explanation
 */
export const generateBalancedThought = async (automaticThought, userAnswers, distortions = []) => {
  try {
    const ai = initializeAI();
    
    if (!ai) {
      return {
        balancedThought: 'Consider the evidence you found and create a more balanced perspective.',
        explanation: 'Unable to generate AI suggestion. Use your answers to create a balanced thought.',
        isLocal: true
      };
    }

    const distortionList = distortions && distortions.length > 0
      ? distortions.map(d => d.name || d.type).join(', ')
      : 'General negative thinking';

    // Format user answers
    const answersText = Object.entries(userAnswers)
      .map(([key, value]) => `Q${key}: ${value}`)
      .join('\n');

    const prompt = `Based on the user's answers to thought-challenging questions, create a balanced, realistic thought that incorporates their insights.

Original Automatic Thought: "${automaticThought}"
Identified Distortions: ${distortionList}

User's Answers:
${answersText}

Create a balanced thought that:
1. Acknowledges the kernel of truth in their original thought (if any)
2. Incorporates evidence and perspectives from their answers
3. Is realistic and grounded (not toxic positivity)
4. Maintains their voice and experience
5. Is compassionate and self-aware

Format your response as JSON:
{
  "balancedThought": "The new balanced thought (1-2 sentences)",
  "explanation": "Brief explanation of how this addresses the original distortion",
  "affirmation": "A supportive affirmation based on their insights"
}

Provide ONLY the JSON, no markdown or code blocks.`;

    console.log('🤖 Generating balanced thought...');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: THOUGHT_CHALLENGER_SYSTEM,
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    let text = result.text.trim();
    text = text.replace(/```json\n?/g, '');
    text = text.replace(/```\n?/g, '');
    text = text.trim();

    const response = JSON.parse(text);

    console.log('✅ Balanced thought generated:', response);

    return {
      balancedThought: response.balancedThought || '',
      explanation: response.explanation || '',
      affirmation: response.affirmation || '',
      isLocal: false
    };

  } catch (error) {
    console.error('❌ Error generating balanced thought:', error);
    return {
      balancedThought: 'Consider creating a more balanced perspective based on your answers.',
      explanation: 'Unable to generate AI suggestion.',
      affirmation: 'You are taking important steps to challenge unhelpful thinking patterns.',
      isLocal: true,
      error: error.message
    };
  }
};

/**
 * Get Triple-Column Technique data
 * This would normally scrape from web, but returns structured data
 */
export const getTripleColumnTechniqueData = () => {
  return {
    name: 'Triple-Column Technique',
    description: 'A powerful CBT tool for challenging negative thoughts',
    columns: [
      {
        title: 'Automatic Thought',
        description: 'The negative thought that pops into your mind',
        tips: [
          'Write exactly what you thought, not a summary',
          'Include the emotional intensity (0-100)',
          'Note when and where this thought occurred'
        ]
      },
      {
        title: 'Evidence For & Against',
        description: 'Examine the facts objectively',
        tips: [
          'List evidence that supports the thought',
          'List evidence that contradicts it',
          'Be honest - look for both sides',
          'Avoid assumptions; stick to facts'
        ]
      },
      {
        title: 'Balanced Thought',
        description: 'A more realistic, compassionate perspective',
        tips: [
          'Acknowledge any truth in the original thought',
          'Incorporate what you learned from examining evidence',
          'Be realistic, not overly positive',
          'This becomes your new default thought'
        ]
      }
    ],
    steps: [
      'Identify an automatic negative thought',
      'Rate its intensity (0-100)',
      'Write it down in Column 1',
      'Examine evidence for and against it',
      'Create a balanced, realistic thought',
      'Rate the new thought\'s intensity',
      'Practice using the balanced thought'
    ]
  };
};

/**
 * Analyze user's thought-challenging work
 */
export const analyzeThoughtChallengeWork = async (automaticThought, balancedThought, userAnswers) => {
  try {
    const ai = initializeAI();
    
    if (!ai) {
      return {
        quality: 'good',
        feedback: 'Your work shows genuine reflection.',
        suggestions: [],
        isLocal: true
      };
    }

    const prompt = `Evaluate the quality of this thought-challenging work:

Original Thought: "${automaticThought}"
Balanced Thought: "${balancedThought}"

User's Answers:
${Object.entries(userAnswers).map(([k, v]) => `${k}: ${v}`).join('\n')}

Evaluate:
1. Does the balanced thought genuinely challenge the original?
2. Is it grounded in the evidence they provided?
3. Is it realistic and compassionate?
4. What's working well?
5. Any suggestions for improvement?

Format as JSON:
{
  "quality": "excellent|good|needs-work",
  "feedback": "Encouraging feedback about their work",
  "suggestions": ["suggestion1", "suggestion2"],
  "strengthsIdentified": ["strength1", "strength2"]
}

Provide ONLY the JSON.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: THOUGHT_CHALLENGER_SYSTEM,
      contents: prompt,
      generationConfig: {
        temperature: 0.5,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    let text = result.text.trim();
    text = text.replace(/```json\n?/g, '');
    text = text.replace(/```\n?/g, '');
    text = text.trim();

    const analysis = JSON.parse(text);

    return {
      quality: analysis.quality || 'good',
      feedback: analysis.feedback || '',
      suggestions: analysis.suggestions || [],
      strengthsIdentified: analysis.strengthsIdentified || [],
      isLocal: false
    };

  } catch (error) {
    console.error('❌ Error analyzing work:', error);
    return {
      quality: 'good',
      feedback: 'Your work shows genuine reflection and effort.',
      suggestions: [],
      strengthsIdentified: ['You engaged with the process', 'You created a new perspective'],
      isLocal: true
    };
  }
};

/**
 * Save thought challenge session
 */
export const saveThoughtChallengeSession = (sessionData) => {
  try {
    const sessions = JSON.parse(localStorage.getItem('thoughtChallengeSessions') || '[]');
    
    const newSession = {
      id: Date.now().toString(),
      ...sessionData,
      timestamp: new Date().toISOString(),
      createdAt: Date.now()
    };
    
    sessions.unshift(newSession);
    
    // Keep only last 50 sessions
    if (sessions.length > 50) {
      sessions.pop();
    }
    
    localStorage.setItem('thoughtChallengeSessions', JSON.stringify(sessions));
    
    console.log('✅ Thought challenge session saved');
    return newSession;
  } catch (error) {
    console.error('❌ Error saving session:', error);
    throw error;
  }
};

/**
 * Get all thought challenge sessions
 */
export const getThoughtChallengeSessions = () => {
  try {
    return JSON.parse(localStorage.getItem('thoughtChallengeSessions') || '[]');
  } catch (error) {
    console.error('Error loading sessions:', error);
    return [];
  }
};

/**
 * Get statistics about thought challenging
 */
export const getThoughtChallengeStats = () => {
  try {
    const sessions = getThoughtChallengeSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageIntensityReduction: 0,
        mostChallengedThought: null,
        recentSessions: []
      };
    }

    // Calculate average intensity reduction
    const intensityReductions = sessions
      .filter(s => s.originalIntensity && s.balancedIntensity)
      .map(s => s.originalIntensity - s.balancedIntensity);
    
    const averageReduction = intensityReductions.length > 0
      ? (intensityReductions.reduce((a, b) => a + b, 0) / intensityReductions.length).toFixed(1)
      : 0;

    return {
      totalSessions: sessions.length,
      averageIntensityReduction: parseFloat(averageReduction),
      recentSessions: sessions.slice(0, 5),
      sessionsThisWeek: sessions.filter(s => {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return s.createdAt > weekAgo;
      }).length
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      totalSessions: 0,
      averageIntensityReduction: 0,
      recentSessions: []
    };
  }
};
