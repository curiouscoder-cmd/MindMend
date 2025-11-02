import { GoogleGenAI } from '@google/genai';
import { getThoughtChallengingPrompts, getCopingStatements } from './webScraperService';

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
      console.log('✅ Gemini AI initialized for dynamic questions');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      return null;
    }
  }
  return genAI;
};

const SYSTEM_INSTRUCTION = `You are an expert CBT therapist specializing in dynamic thought challenging.
Your role is to generate personalized, powerful questions that help users examine their specific thoughts from multiple angles.
Questions should be:
- Specific to their exact thought (not generic)
- Open-ended and thought-provoking
- Grounded in CBT principles
- Compassionate and non-judgmental
- Designed to help them discover insights themselves`;

/**
 * Generate dynamic questions based on user's specific thought and distortions
 */
export const generateDynamicQuestionsForThought = async (
  automaticThought,
  distortions = [],
  userContext = {}
) => {
  try {
    const ai = initializeAI();
    if (!ai) {
      return getDefaultDynamicQuestions(automaticThought, distortions);
    }

    const distortionList = distortions && distortions.length > 0
      ? distortions.map(d => d.name || d.type).join(', ')
      : 'General negative thinking';

    const contextInfo = userContext.mood ? `User's mood: ${userContext.mood}` : '';

    const prompt = `Generate 7 powerful, specific Socratic questions to challenge this exact thought.

AUTOMATIC THOUGHT: "${automaticThought}"
DISTORTIONS IDENTIFIED: ${distortionList}
${contextInfo}

Requirements:
1. Each question must be SPECIFIC to this exact thought (not generic)
2. Questions should help examine from: evidence, alternatives, consequences, self-compassion, perspective
3. Questions should be open-ended (not yes/no)
4. Avoid leading questions - let them discover insights
5. Include at least one self-compassion question
6. Include at least one evidence-based question

Format as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "The specific question",
      "category": "evidence|alternatives|consequences|self-compassion|perspective",
      "purpose": "Why this question helps (one sentence)"
    }
  ],
  "keyInsight": "One powerful insight they should discover"
}

Provide ONLY valid JSON, no markdown.`;

    console.log('🤖 Generating dynamic questions...');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    let text = result.text.trim();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(text);
    console.log('✅ Dynamic questions generated');

    return {
      questions: data.questions || [],
      keyInsight: data.keyInsight || '',
      isLocal: false
    };
  } catch (error) {
    console.error('❌ Error generating dynamic questions:', error);
    return getDefaultDynamicQuestions(automaticThought, distortions);
  }
};

/**
 * Generate a personalized balanced thought
 */
export const generatePersonalizedBalancedThought = async (
  automaticThought,
  userAnswers,
  distortions = []
) => {
  try {
    const ai = initializeAI();
    if (!ai) {
      return {
        balancedThought: 'Create a more balanced perspective based on your answers.',
        isLocal: true
      };
    }

    const answersText = Object.entries(userAnswers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const distortionList = distortions && distortions.length > 0
      ? distortions.map(d => d.name || d.type).join(', ')
      : 'General negative thinking';

    const prompt = `Create a personalized, balanced thought based on their insights.

ORIGINAL THOUGHT: "${automaticThought}"
DISTORTIONS: ${distortionList}

THEIR ANSWERS:
${answersText}

Create a balanced thought that:
1. Incorporates their specific insights from answers
2. Acknowledges any truth in the original thought
3. Is realistic and grounded (not toxic positivity)
4. Uses their own language/voice
5. Is compassionate and self-aware
6. Is 1-3 sentences max

Format as JSON:
{
  "balancedThought": "The new thought",
  "explanation": "How this addresses their specific situation",
  "affirmation": "A supportive statement based on their insights"
}

Provide ONLY valid JSON.`;

    console.log('🤖 Generating personalized balanced thought...');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    let text = result.text.trim();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(text);
    console.log('✅ Personalized balanced thought generated');

    return {
      balancedThought: data.balancedThought || '',
      explanation: data.explanation || '',
      affirmation: data.affirmation || '',
      isLocal: false
    };
  } catch (error) {
    console.error('❌ Error generating balanced thought:', error);
    return {
      balancedThought: 'Create a more balanced perspective based on your answers.',
      explanation: 'Unable to generate AI suggestion.',
      affirmation: 'You are taking important steps to challenge unhelpful patterns.',
      isLocal: true
    };
  }
};

/**
 * Get default questions if AI unavailable
 */
const getDefaultDynamicQuestions = (thought, distortions) => {
  const distortionType = distortions?.[0]?.type || 'general';
  const basePrompts = getThoughtChallengingPrompts(distortionType);

  return {
    questions: [
      {
        id: 1,
        question: 'What facts support this thought?',
        category: 'evidence',
        purpose: 'Examine the factual basis'
      },
      {
        id: 2,
        question: 'What facts contradict this thought?',
        category: 'evidence',
        purpose: 'Look for counter-evidence'
      },
      {
        id: 3,
        question: basePrompts[0] || 'What is another way to look at this?',
        category: 'alternatives',
        purpose: 'Generate alternative perspectives'
      },
      {
        id: 4,
        question: 'What would I tell a good friend in this situation?',
        category: 'self-compassion',
        purpose: 'Access self-compassion'
      },
      {
        id: 5,
        question: 'What is the worst that could realistically happen, and could I handle it?',
        category: 'consequences',
        purpose: 'Reality-test catastrophic thinking'
      },
      {
        id: 6,
        question: 'What am I not considering?',
        category: 'perspective',
        purpose: 'Gain broader perspective'
      },
      {
        id: 7,
        question: 'Is this thought helpful or harmful to me?',
        category: 'perspective',
        purpose: 'Evaluate usefulness'
      }
    ],
    keyInsight: 'Your thoughts are not facts - they are interpretations that can be examined and changed.',
    isLocal: true
  };
};

/**
 * Generate coping statements for specific situation
 */
export const generateCopingStatements = async (
  automaticThought,
  distortions = [],
  emotionalState = 'general'
) => {
  try {
    const ai = initializeAI();
    if (!ai) {
      const copingStatements = getCopingStatements();
      return {
        statements: copingStatements[emotionalState] || copingStatements.general,
        isLocal: true
      };
    }

    const distortionList = distortions && distortions.length > 0
      ? distortions.map(d => d.name || d.type).join(', ')
      : 'General negative thinking';

    const prompt = `Generate 5 personalized coping statements for this situation.

THOUGHT: "${automaticThought}"
DISTORTIONS: ${distortionList}
EMOTIONAL STATE: ${emotionalState}

Create coping statements that:
1. Are specific to their thought (not generic)
2. Are realistic and believable to them
3. Counter the specific distortion
4. Are compassionate and supportive
5. Can be used in the moment

Format as JSON:
{
  "statements": ["statement1", "statement2", "statement3", "statement4", "statement5"]
}

Provide ONLY valid JSON.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 256,
      }
    });

    let text = result.text.trim();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(text);

    return {
      statements: data.statements || [],
      isLocal: false
    };
  } catch (error) {
    console.error('❌ Error generating coping statements:', error);
    const copingStatements = getCopingStatements();
    return {
      statements: copingStatements[emotionalState] || copingStatements.general,
      isLocal: true
    };
  }
};

/**
 * Evaluate quality of user's thought work
 */
export const evaluateThoughtWork = async (
  automaticThought,
  balancedThought,
  userAnswers,
  distortions = []
) => {
  try {
    const ai = initializeAI();
    if (!ai) {
      return {
        quality: 'good',
        feedback: 'Your work shows genuine reflection.',
        isLocal: true
      };
    }

    const answersText = Object.entries(userAnswers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const prompt = `Evaluate the quality of this thought-challenging work.

ORIGINAL: "${automaticThought}"
BALANCED: "${balancedThought}"

ANSWERS:
${answersText}

Evaluate:
1. Does balanced thought genuinely challenge the original?
2. Is it grounded in their evidence?
3. Is it realistic and compassionate?
4. What's working well?
5. Any suggestions?

Format as JSON:
{
  "quality": "excellent|good|needs-work",
  "feedback": "Encouraging feedback",
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Provide ONLY valid JSON.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.5,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    let text = result.text.trim();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(text);

    return {
      quality: data.quality || 'good',
      feedback: data.feedback || '',
      strengths: data.strengths || [],
      suggestions: data.suggestions || [],
      isLocal: false
    };
  } catch (error) {
    console.error('❌ Error evaluating work:', error);
    return {
      quality: 'good',
      feedback: 'Your work shows genuine reflection and effort.',
      strengths: ['You engaged with the process'],
      suggestions: [],
      isLocal: true
    };
  }
};
