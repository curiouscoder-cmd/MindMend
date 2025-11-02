import { detectDistortionsLocally } from '../utils/cognitiveDistortions';

// Lazy import for Google AI to avoid blocking
let GoogleGenerativeAI = null;
let genAI = null;

// Initialize Gemini AI lazily
const initializeAI = async () => {
  if (!genAI && import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const module = await import('@google/genai');
      GoogleGenerativeAI = module.GoogleGenerativeAI;
      genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    } catch (error) {
      console.warn('Google AI not available:', error);
    }
  }
  return genAI;
};

const DISTORTION_DETECTION_PROMPT = `You are a cognitive behavioral therapy (CBT) expert analyzing automatic negative thoughts for cognitive distortions.

Analyze the following thought and identify which cognitive distortions are present from this list:

1. **All-or-Nothing Thinking**: Seeing things in black-and-white categories
2. **Overgeneralization**: Seeing a single negative event as a never-ending pattern
3. **Mental Filter**: Dwelling exclusively on negative details
4. **Disqualifying the Positive**: Rejecting positive experiences
5. **Jumping to Conclusions**: Making negative interpretations without evidence (mind reading/fortune telling)
6. **Magnification (Catastrophizing)**: Exaggerating the importance of problems
7. **Emotional Reasoning**: Assuming emotions reflect reality ("I feel it, so it must be true")
8. **Should Statements**: Motivating with "shoulds" and "musts"
9. **Labeling**: Attaching negative labels to yourself
10. **Personalization**: Blaming yourself for things outside your control

Return your analysis in this exact JSON format:
{
  "distortions": [
    {
      "type": "distortion-id",
      "name": "Distortion Name",
      "confidence": 0.85,
      "explanation": "Brief explanation of why this distortion applies"
    }
  ],
  "suggestions": "A brief, compassionate reframe of the thought"
}

Only include distortions with confidence > 0.6. Limit to top 3 distortions.`;

export const detectDistortions = async (automaticThought, userId = null) => {
  try {
    // Validate input
    if (!automaticThought || automaticThought.trim().length === 0) {
      throw new Error('Automatic thought cannot be empty');
    }

    // Try to initialize AI
    const ai = await initializeAI();
    
    // Check if API key is available or AI failed to initialize
    if (!ai || !import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn('Gemini API key not found or AI unavailable, using local detection');
      return {
        distortions: detectDistortionsLocally(automaticThought),
        suggestions: 'Try to identify evidence for and against this thought.',
        isLocal: true
      };
    }

    // Call Gemini AI
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = `${DISTORTION_DETECTION_PROMPT}

Automatic Thought: "${automaticThought}"

Analysis:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate and return
    return {
      distortions: analysis.distortions || [],
      suggestions: analysis.suggestions || 'Consider alternative perspectives.',
      isLocal: false,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error detecting distortions:', error);
    
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
