import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash-exp';

// Cache for AI instance
let aiInstance = null;

const initializeAI = () => {
  if (!aiInstance) {
    if (!API_KEY) {
      console.error('❌ VITE_GEMINI_API_KEY not found in environment variables');
      return null;
    }
    aiInstance = new GoogleGenerativeAI(API_KEY);
  }
  return aiInstance;
};

/**
 * Parallel batch processing for multiple Gemini API calls
 * Reduces total response time by executing requests concurrently
 */
export const parallelGenerateContent = async (requests) => {
  try {
    const ai = initializeAI();
    if (!ai) {
      console.error('❌ AI not initialized');
      return requests.map(() => ({ error: 'AI not initialized' }));
    }

    console.log(`🚀 Processing ${requests.length} requests in parallel...`);
    const startTime = Date.now();

    // Execute all requests in parallel
    const promises = requests.map(async (request) => {
      try {
        const result = await ai.models.generateContent({
          model: MODEL,
          systemInstruction: request.systemInstruction || '',
          contents: request.prompt,
          generationConfig: {
            temperature: request.temperature || 0.7,
            topP: request.topP || 0.95,
            topK: request.topK || 40,
            maxOutputTokens: request.maxOutputTokens || 512,
          }
        });

        return {
          id: request.id,
          text: result.text.trim(),
          success: true
        };
      } catch (error) {
        console.error(`❌ Error in request ${request.id}:`, error);
        return {
          id: request.id,
          error: error.message,
          success: false
        };
      }
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    console.log(`✅ Parallel processing completed in ${duration}ms`);
    return results;

  } catch (error) {
    console.error('❌ Error in parallel processing:', error);
    return requests.map(req => ({
      id: req.id,
      error: error.message,
      success: false
    }));
  }
};

/**
 * Optimized CBT exercise processing
 * Generates distortion explanation, dynamic questions, and coping statements in parallel
 */
export const optimizedCBTExerciseProcessing = async (automaticThought, distortions = []) => {
  try {
    const ai = initializeAI();
    if (!ai) {
      console.error('❌ AI not initialized');
      return null;
    }

    console.log('🧠 Starting optimized CBT exercise processing...');
    const startTime = Date.now();

    const distortionList = distortions && distortions.length > 0
      ? distortions.map(d => d.name || d.type).join(', ')
      : 'General negative thinking';

    // Prepare all requests for parallel processing
    const requests = [
      {
        id: 'explanation',
        prompt: `You are a CBT therapist explaining a cognitive distortion to someone who just experienced it.

User's Thought: "${automaticThought}"
Distortion Type: ${distortionList}

Create a SHORT, PERSONALIZED explanation (2-3 sentences) that:
1. Explains how THIS SPECIFIC distortion appears in THEIR thought
2. Is compassionate and non-judgmental
3. Helps them understand the pattern
4. Suggests one way to challenge it

Write ONLY the explanation, no labels or formatting.`,
        temperature: 0.7,
        maxOutputTokens: 200,
        systemInstruction: 'You are a compassionate CBT therapist.'
      },
      {
        id: 'questions',
        prompt: `You are a compassionate CBT therapist creating powerful Socratic questions to help someone challenge their automatic negative thought.

User's Thought: "${automaticThought}"
Identified Distortions: ${distortionList}

Generate 3 powerful, SPECIFIC Socratic questions that:
1. Are tailored to THIS exact thought (not generic)
2. Help examine the thought from different angles
3. Are open-ended and thought-provoking
4. Guide the user to discover insights themselves
5. Are compassionate and non-judgmental

Format as JSON:
{
  "questions": [
    {
      "question": "The specific question",
      "hint": "A brief hint to guide their thinking"
    }
  ]
}

Provide ONLY valid JSON, no markdown.`,
        temperature: 0.8,
        maxOutputTokens: 512,
        systemInstruction: 'You are a compassionate CBT therapist.'
      },
      {
        id: 'coping',
        prompt: `You are a compassionate CBT therapist creating personalized coping statements.

User's Thought: "${automaticThought}"
Distortion Type: ${distortionList}

Generate 5 short, powerful coping statements (1-2 sentences each) that:
1. Are specific to THIS thought
2. Are realistic and believable
3. Can be used in the moment
4. Are compassionate and supportive
5. Challenge the distortion

Format as JSON:
{
  "statements": [
    "Statement 1",
    "Statement 2",
    "Statement 3",
    "Statement 4",
    "Statement 5"
  ]
}

Provide ONLY valid JSON, no markdown.`,
        temperature: 0.7,
        maxOutputTokens: 256,
        systemInstruction: 'You are a compassionate CBT therapist.'
      }
    ];

    // Execute all requests in parallel
    const results = await parallelGenerateContent(requests);
    const duration = Date.now() - startTime;

    // Parse results
    const processedResults = {
      explanation: null,
      questions: [],
      copingStatements: [],
      duration: duration,
      success: true
    };

    results.forEach(result => {
      if (result.success) {
        if (result.id === 'explanation') {
          processedResults.explanation = result.text;
        } else if (result.id === 'questions') {
          try {
            let text = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const data = JSON.parse(text);
            processedResults.questions = data.questions || [];
          } catch (e) {
            console.error('Error parsing questions:', e);
          }
        } else if (result.id === 'coping') {
          try {
            let text = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const data = JSON.parse(text);
            processedResults.copingStatements = data.statements || [];
          } catch (e) {
            console.error('Error parsing coping statements:', e);
          }
        }
      }
    });

    console.log(`✅ CBT exercise processing completed in ${duration}ms`);
    return processedResults;

  } catch (error) {
    console.error('❌ Error in CBT exercise processing:', error);
    return {
      explanation: null,
      questions: [],
      copingStatements: [],
      error: error.message,
      success: false
    };
  }
};

/**
 * Batch process multiple thoughts for analysis
 * Useful for processing multiple thoughts in one go
 */
export const batchProcessThoughts = async (thoughts) => {
  try {
    console.log(`📦 Batch processing ${thoughts.length} thoughts...`);
    const startTime = Date.now();

    const requests = thoughts.map((thought, idx) => ({
      id: `thought-${idx}`,
      prompt: `Analyze this negative thought and identify the primary cognitive distortion.

Thought: "${thought}"

Respond with JSON:
{
  "thought": "${thought}",
  "distortion": "Name of primary distortion",
  "confidence": 0.0-1.0,
  "explanation": "Brief explanation"
}

Provide ONLY valid JSON.`,
      temperature: 0.5,
      maxOutputTokens: 256,
      systemInstruction: 'You are a CBT expert analyzing cognitive distortions.'
    }));

    const results = await parallelGenerateContent(requests);
    const duration = Date.now() - startTime;

    const processedResults = results.map(result => {
      if (result.success) {
        try {
          let text = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          return JSON.parse(text);
        } catch (e) {
          return { error: 'Parse error', id: result.id };
        }
      }
      return { error: result.error, id: result.id };
    });

    console.log(`✅ Batch processing completed in ${duration}ms`);
    return {
      results: processedResults,
      duration: duration,
      count: thoughts.length
    };

  } catch (error) {
    console.error('❌ Error in batch processing:', error);
    return {
      results: [],
      error: error.message,
      duration: 0
    };
  }
};

/**
 * Race-based optimization: Get fastest response from multiple strategies
 * Useful for time-sensitive operations
 */
export const raceOptimizedGeneration = async (prompt, strategies = []) => {
  try {
    console.log('🏁 Starting race-optimized generation...');
    const startTime = Date.now();

    const ai = initializeAI();
    if (!ai) {
      console.error('❌ AI not initialized');
      return null;
    }

    // Create promises for each strategy
    const promises = strategies.map(strategy =>
      ai.models.generateContent({
        model: MODEL,
        systemInstruction: strategy.systemInstruction || '',
        contents: prompt,
        generationConfig: {
          temperature: strategy.temperature || 0.7,
          topP: strategy.topP || 0.95,
          topK: strategy.topK || 40,
          maxOutputTokens: strategy.maxOutputTokens || 512,
        }
      }).then(result => ({
        strategy: strategy.name,
        text: result.text.trim(),
        success: true
      }))
    );

    // Return first successful response
    const result = await Promise.race(promises);
    const duration = Date.now() - startTime;

    console.log(`✅ Race-optimized generation completed in ${duration}ms using strategy: ${result.strategy}`);
    return {
      ...result,
      duration: duration
    };

  } catch (error) {
    console.error('❌ Error in race-optimized generation:', error);
    return {
      error: error.message,
      success: false
    };
  }
};

/**
 * Streaming response for real-time feedback
 * Returns a stream instead of waiting for full response
 */
export const streamGenerateContent = async (prompt, systemInstruction = '', config = {}) => {
  try {
    const ai = initializeAI();
    if (!ai) {
      console.error('❌ AI not initialized');
      return null;
    }

    console.log('📡 Starting streaming generation...');

    const model = ai.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemInstruction
    });

    const stream = await model.generateContentStream({
      contents: prompt,
      generationConfig: {
        temperature: config.temperature || 0.7,
        topP: config.topP || 0.95,
        topK: config.topK || 40,
        maxOutputTokens: config.maxOutputTokens || 512,
      }
    });

    return stream;

  } catch (error) {
    console.error('❌ Error in streaming generation:', error);
    return null;
  }
};

/**
 * Caching layer for frequently used prompts
 * Reduces API calls for repeated requests
 */
const responseCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

export const cachedGenerateContent = async (cacheKey, prompt, config = {}) => {
  try {
    // Check cache
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('✅ Cache hit for:', cacheKey);
      return cached.response;
    }

    // Generate new response
    const ai = initializeAI();
    if (!ai) {
      console.error('❌ AI not initialized');
      return null;
    }

    console.log('🔄 Cache miss, generating new response for:', cacheKey);

    const result = await ai.models.generateContent({
      model: MODEL,
      systemInstruction: config.systemInstruction || '',
      contents: prompt,
      generationConfig: {
        temperature: config.temperature || 0.7,
        topP: config.topP || 0.95,
        topK: config.topK || 40,
        maxOutputTokens: config.maxOutputTokens || 512,
      }
    });

    const response = result.text.trim();

    // Store in cache
    responseCache.set(cacheKey, {
      response: response,
      timestamp: Date.now()
    });

    return response;

  } catch (error) {
    console.error('❌ Error in cached generation:', error);
    return null;
  }
};

/**
 * Clear cache
 */
export const clearCache = () => {
  responseCache.clear();
  console.log('✅ Cache cleared');
};

/**
 * Get cache stats
 */
export const getCacheStats = () => {
  return {
    size: responseCache.size,
    entries: Array.from(responseCache.keys())
  };
};
