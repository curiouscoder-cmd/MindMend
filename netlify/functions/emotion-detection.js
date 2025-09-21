import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { textInput } = JSON.parse(event.body);

    if (!textInput) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text input is required' })
      };
    }

    const prompt = `
Analyze the emotional state and stress level from this text:
"${textInput}"

Consider:
- Emotional tone and language patterns
- Stress indicators and urgency markers
- Mental health context for young adults
- Cultural sensitivity for Indian context

Return JSON with:
{
  "primaryEmotion": "dominant emotion (happy, sad, anxious, stressed, calm, angry, confused, excited)",
  "stressLevel": 1-10,
  "urgency": "low/medium/high",
  "suggestedAction": "immediate recommendation",
  "confidence": 1-100
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 200,
        systemInstruction: "You are an expert emotion detection AI for mental wellness applications. Provide accurate, helpful emotional analysis."
      }
    });

    let emotionResult;
    try {
      emotionResult = JSON.parse(response.text);
    } catch (parseError) {
      // Fallback emotion detection
      const lowerText = textInput.toLowerCase();
      let primaryEmotion = "neutral";
      let stressLevel = 5;
      let urgency = "low";
      
      if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('panic')) {
        primaryEmotion = "anxious";
        stressLevel = 7;
        urgency = "medium";
      } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down')) {
        primaryEmotion = "sad";
        stressLevel = 6;
        urgency = "medium";
      } else if (lowerText.includes('stressed') || lowerText.includes('overwhelmed') || lowerText.includes('pressure')) {
        primaryEmotion = "stressed";
        stressLevel = 8;
        urgency = "high";
      } else if (lowerText.includes('happy') || lowerText.includes('good') || lowerText.includes('great')) {
        primaryEmotion = "happy";
        stressLevel = 3;
        urgency = "low";
      }

      emotionResult = {
        primaryEmotion,
        stressLevel,
        urgency,
        suggestedAction: "Take a few deep breaths and practice mindfulness",
        confidence: 75
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        emotion: emotionResult,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Emotion Detection API Error:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        emotion: {
          primaryEmotion: "neutral",
          stressLevel: 5,
          urgency: "low",
          suggestedAction: "Take a few deep breaths and practice mindfulness",
          confidence: 50
        },
        timestamp: new Date().toISOString(),
        fallback: true
      })
    };
  }
};
