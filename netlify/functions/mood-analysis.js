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
    const { moodHistory, journalEntries = [] } = JSON.parse(event.body);

    if (!moodHistory || moodHistory.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Mood history is required' })
      };
    }

    const prompt = `
You are an AI mental wellness analyst. Analyze this user's mood pattern and journal entries to provide insights:

Mood History (last 14 days): ${moodHistory.join(', ')}
Recent Journal Entries: ${journalEntries.slice(-3).join(' | ')}

Provide:
1. Key mood patterns or triggers you notice
2. One specific CBT technique recommendation
3. A brief encouraging insight (1-2 sentences)

Format as JSON:
{
  "patterns": "observed patterns",
  "recommendation": "specific CBT technique",
  "insight": "encouraging message"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 300,
        systemInstruction: "You are a supportive mental health AI analyst. Provide constructive, evidence-based insights."
      }
    });

    // Parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(response.text);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysisResult = {
        patterns: "I notice some variation in your mood patterns. This is completely normal and shows you're actively tracking your emotional wellness.",
        recommendation: "Try the 5-4-3-2-1 grounding technique when feeling overwhelmed: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
        insight: "You're taking positive steps by tracking your mental wellness journey. Every day of awareness is progress."
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis: analysisResult,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Mood Analysis API Error:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis: {
          patterns: "I notice some variation in your mood patterns. This is completely normal.",
          recommendation: "Try the 5-4-3-2-1 grounding technique when feeling overwhelmed.",
          insight: "You're taking positive steps by tracking your mental wellness journey."
        },
        timestamp: new Date().toISOString(),
        fallback: true
      })
    };
  }
};
