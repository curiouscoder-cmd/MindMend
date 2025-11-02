import { detectDistortionsLocally } from '../utils/cognitiveDistortions';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
let genAI = null;

const initializeAI = () => {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log('🔑 API Key check:', {
      exists: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      prefix: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'
    });
    
    if (!apiKey) {
      console.error('❌ VITE_GEMINI_API_KEY is not set in environment variables');
      console.log('💡 Please add VITE_GEMINI_API_KEY to your .env file');
      return null;
    }
    
    try {
      genAI = new GoogleGenAI({ apiKey: apiKey });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      return null;
    }
  }
  return genAI;
};

// System instruction for CBT context
const CBT_SYSTEM_INSTRUCTION = `You are a compassionate and expert Cognitive Behavioral Therapy (CBT) therapist trained in David Burns' "Feeling Good" methodology. 

Your role is to:
1. Help users identify and challenge cognitive distortions in their automatic negative thoughts
2. Provide evidence-based, empathetic responses
3. Guide users toward more balanced, realistic thinking patterns
4. Support mental health and emotional wellbeing

Key principles:
- Be warm, non-judgmental, and supportive
- Acknowledge the user's feelings while gently challenging distorted thinking
- Provide practical, actionable insights
- Use evidence-based CBT techniques
- Avoid toxic positivity - focus on realistic, balanced perspectives
- Consider the user's context and emotional state

You specialize in identifying these 10 cognitive distortions:
1. All-or-Nothing Thinking: Seeing things in black-and-white categories
2. Overgeneralization: Viewing a single negative event as a never-ending pattern
3. Mental Filter: Dwelling exclusively on negatives
4. Disqualifying the Positive: Rejecting positive experiences
5. Jumping to Conclusions: Making negative interpretations without evidence
6. Magnification/Catastrophizing: Exaggerating the importance of negative events
7. Emotional Reasoning: Taking emotions as evidence for truth
8. Should Statements: Using "should" and "must" to pressure yourself
9. Labeling: Creating negative self-image based on errors
10. Personalization: Taking responsibility for things outside your control`;

const DISTORTION_DETECTION_PROMPT = `Analyze this automatic negative thought for cognitive distortions:

Return ONLY a JSON object (no markdown, no code blocks) with this structure:
{
  "distortions": [
    {
      "type": "all-or-nothing",
      "name": "All-or-Nothing Thinking",
      "confidence": 0.92,
      "explanation": "Brief explanation of why this distortion applies"
    }
  ],
  "suggestions": "A compassionate rational response suggestion"
}

Only include distortions with confidence > 0.6. Limit to top 3 distortions.`;

export const detectDistortions = async (automaticThought, userId = null) => {
  try {
    // Validate input
    if (!automaticThought || automaticThought.trim().length === 0) {
      throw new Error('Automatic thought cannot be empty');
    }

    // Initialize AI
    const ai = initializeAI();
    
    // Check if API key is available
    if (!ai || !import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn('⚠️ Gemini API key not found, using local detection');
      return {
        distortions: detectDistortionsLocally(automaticThought),
        suggestions: 'Try to identify evidence for and against this thought.',
        isLocal: true
      };
    }

    console.log('🤖 Analyzing thought with Gemini AI...');

    const prompt = `${DISTORTION_DETECTION_PROMPT}

Automatic Thought: "${automaticThought}"

Provide your analysis in valid JSON format only. No markdown, no code blocks, just the JSON object.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: CBT_SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });

    // FIX: Correct way to get text from @google/genai
    // response.text is a PROPERTY, not a method
    const text = result.text;

    console.log('📝 AI Response:', text);

    // Clean up response - remove markdown code blocks if present
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json\n?/g, '');
    cleanText = cleanText.replace(/```\n?/g, '');
    cleanText = cleanText.trim();

    // Parse JSON response
    const analysis = JSON.parse(cleanText);

    console.log('✅ Analysis complete:', analysis);

    // Validate and return
    return {
      distortions: analysis.distortions || [],
      suggestions: analysis.suggestions || 'Consider alternative perspectives.',
      isLocal: false,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error detecting distortions:', error);
    
    // Fallback to local detection
    return {
      distortions: detectDistortionsLocally(automaticThought),
      suggestions: 'Try to identify evidence for and against this thought.',
      isLocal: true,
      error: error.message
    };
  }
};

// Save thought record to localStorage (can be upgraded to Firestore later)
export const saveThoughtRecord = (thoughtRecord) => {
  try {
    const records = JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
    
    const newRecord = {
      id: Date.now().toString(),
      ...thoughtRecord,
      timestamp: new Date().toISOString(),
      createdAt: Date.now()
    };
    
    records.unshift(newRecord); // Add to beginning
    
    // Keep only last 100 records
    if (records.length > 100) {
      records.pop();
    }
    
    localStorage.setItem('thoughtRecords', JSON.stringify(records));
    
    return newRecord;
  } catch (error) {
    console.error('Error saving thought record:', error);
    throw error;
  }
};

// Get all thought records
export const getThoughtRecords = () => {
  try {
    return JSON.parse(localStorage.getItem('thoughtRecords') || '[]');
  } catch (error) {
    console.error('Error loading thought records:', error);
    return [];
  }
};

// Get thought record statistics
export const getThoughtRecordStats = () => {
  try {
    const records = getThoughtRecords();
    
    if (records.length === 0) {
      return {
        totalRecords: 0,
        distortionCounts: {},
        recentRecords: []
      };
    }
    
    // Count distortion occurrences
    const distortionCounts = {};
    records.forEach(record => {
      if (record.distortions) {
        record.distortions.forEach(distortion => {
          distortionCounts[distortion.type] = (distortionCounts[distortion.type] || 0) + 1;
        });
      }
    });
    
    return {
      totalRecords: records.length,
      distortionCounts,
      recentRecords: records.slice(0, 10),
      mostCommonDistortion: Object.keys(distortionCounts).sort((a, b) => 
        distortionCounts[b] - distortionCounts[a]
      )[0]
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      totalRecords: 0,
      distortionCounts: {},
      recentRecords: []
    };
  }
};

// Delete a thought record
export const deleteThoughtRecord = (recordId) => {
  try {
    const records = getThoughtRecords();
    const filtered = records.filter(r => r.id !== recordId);
    localStorage.setItem('thoughtRecords', JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting thought record:', error);
    return false;
  }
};

// Generate rational response starter with AI (user completes it)
export const generateRationalResponse = async (automaticThought, distortions) => {
  try {
    console.log('🎯 Starting generateRationalResponse...');
    console.log('Input:', { automaticThought, distortions });
    
    const ai = initializeAI();
    
    if (!ai) {
      console.error('❌ AI initialization failed');
      return {
        response: '',
        error: 'AI not available. Please write your own rational response.'
      };
    }

    console.log('🤖 Generating rational response starter with AI...');

    const distortionList = distortions.map(d => d.name).join(', ');
    
    const prompt = `You are a compassionate CBT therapist helping someone reframe their negative thought.

Automatic Thought: "${automaticThought}"
Identified Distortions: ${distortionList}

Generate a SHORT STARTER response in FIRST PERSON ("I") that the user will complete themselves.

Requirements:
1. Start with "I..." (first person)
2. Acknowledge the feeling but challenge the distortion
3. Be SHORT (1 sentence max, 10-15 words)
4. Leave room for the user to complete it
5. Be compassionate and supportive

Example:
- Negative thought: "I messed up in exam, I am a failure"
- Starter: "One exam result doesn't define my..."

Write ONLY the starter response, no explanations.`;

    console.log('📝 Calling AI with prompt...');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: CBT_SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 150,
      }
    });

    console.log('📦 AI Response received:', result);

    // FIX: Correct way to get text from @google/genai
    // response.text is a PROPERTY, not a method
    const text = result.text.trim();
    console.log('✅ Rational response starter generated:', text);

    return {
      response: text,
      error: null
    };

  } catch (error) {
    console.error('❌ Error generating rational response:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      response: '',
      error: 'Failed to generate response. Please write your own.'
    };
  }
};

// Validate if user's response actually fights the negative thought
export const validateRationalResponse = async (automaticThought, rationalResponse, distortions = []) => {
  try {
    const ai = initializeAI();
    
    if (!ai || !import.meta.env.VITE_GEMINI_API_KEY) {
      return {
        isRational: true,
        feedback: 'Validation unavailable, proceeding with save.'
      };
    }

    console.log('🤖 Validating rational response...');

    const distortionList = distortions && distortions.length > 0 
      ? distortions.map(d => d.name || d.type).join(', ')
      : 'Unknown';

    const prompt = `You are a CBT expert evaluating if a user's response truly fights their negative thought.

Automatic Negative Thought: "${automaticThought}"
Identified Distortions: ${distortionList}
User's Rational Response: "${rationalResponse}"

Analyze COMPREHENSIVELY if the response:
1. DIRECTLY challenges the negative thought (provides alternative perspective)
2. Provides evidence, logic, or reasoning against the distortion
3. Is realistic and grounded (not toxic positivity or false reassurance)
4. Actually helps reframe the thought (not just agreeing or restating it)
5. Shows understanding of the core issue

Be STRICT - if the response just restates the negative thought, is vague, or doesn't address the distortion, mark as NOT rational.

Respond in JSON format:
{
  "isRational": true/false,
  "feedback": "Comprehensive analysis of why this response does/doesn't fight the negative thought",
  "suggestion": "If not rational, specific suggestion for improvement"
}

Provide ONLY the JSON, no markdown or code blocks.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: CBT_SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 256,
      }
    });

    // FIX: Correct way to get text from @google/genai
    // response.text is a PROPERTY, not a method
    let text = result.text.trim();
    
    // Clean up response
    text = text.replace(/```json\n?/g, '');
    text = text.replace(/```\n?/g, '');
    text = text.trim();

    const validation = JSON.parse(text);

    console.log('✅ Validation complete:', validation);

    return {
      isRational: validation.isRational === true, // STRICT: must be explicitly true
      feedback: validation.feedback || '',
      suggestion: validation.suggestion || ''
    };

  } catch (error) {
    console.error('❌ Error validating response:', error);
    return {
      isRational: false,
      feedback: 'Validation error. Please try again.',
      suggestion: 'Make sure your response directly challenges the negative thought with evidence or logic.'
    };
  }
};

// Generate rational response from user's answers to Socratic questions
export const generateResponseFromUserAnswers = async (automaticThought, answers, distortions) => {
  try {
    const ai = initializeAI();
    
    if (!ai || !import.meta.env.VITE_GEMINI_API_KEY) {
      return {
        response: '',
        error: 'AI generation unavailable. Please write your response manually.'
      };
    }

    console.log('🎯 Starting generateResponseFromUserAnswers...');
    console.log('Answers:', answers);

    const distortionList = distortions.map(d => d.name).join(', ');
    
    const prompt = `You are a CBT therapist helping a user create a rational response based on their thoughtful answers to Socratic questions.

Automatic Negative Thought: "${automaticThought}"
Identified Distortions: ${distortionList}

User's Answers to Reflection Questions:
Question 1 Answer: "${answers.q1}"
Question 2 Answer: "${answers.q2}"
Question 3 Answer: "${answers.q3}"

Based ONLY on these answers, create a balanced, rational response that:
1. Directly incorporates insights from their answers
2. Challenges the identified distortions
3. Is grounded in the evidence they provided
4. Maintains their voice and perspective
5. Is compassionate and realistic

Generate ONLY the response text, no explanations or labels. The response should flow naturally from their answers.`;

    console.log('📝 Calling AI to generate response from answers...');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: CBT_SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    const responseText = result.text.trim();
    console.log('✅ Response generated from answers:', responseText);

    return {
      response: responseText,
      error: null
    };

  } catch (error) {
    console.error('❌ Error generating response from answers:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      response: '',
      error: 'Failed to generate response. Please write your own.'
    };
  }
};

// Improve rational response with AI suggestions
export const improveRationalResponse = async (automaticThought, userResponse, distortions) => {
  try {
    const ai = initializeAI();
    
    if (!ai || !import.meta.env.VITE_GEMINI_API_KEY) {
      return {
        improvedResponse: userResponse,
        error: 'AI improvement unavailable. Please edit manually.'
      };
    }

    console.log('🎯 Starting improveRationalResponse...');

    const distortionList = distortions.map(d => d.name).join(', ');
    
    const prompt = `You are a CBT therapist helping improve a user's rational response to a negative thought.

Automatic Negative Thought: "${automaticThought}"
Identified Distortions: ${distortionList}
User's Current Response: "${userResponse}"

Improve this response by:
1. Making it more specific and evidence-based
2. Ensuring it directly challenges the identified distortions
3. Adding concrete examples or reasons
4. Keeping it compassionate and realistic
5. Maintaining the user's voice and perspective

Provide ONLY the improved response text, no explanations or labels.`;

    console.log('📝 Calling AI to improve response...');

    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: CBT_SYSTEM_INSTRUCTION,
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 512,
      }
    });

    const improvedText = result.text.trim();
    console.log('✅ Response improved:', improvedText);

    return {
      improvedResponse: improvedText,
      error: null
    };

  } catch (error) {
    console.error('❌ Error improving response:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      improvedResponse: userResponse,
      error: 'Failed to improve response. Please try again.'
    };
  }
};
