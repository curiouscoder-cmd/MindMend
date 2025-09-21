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
    const { moodHistory, personalityTraits = {}, userProgress = {} } = JSON.parse(event.body);

    if (!moodHistory || moodHistory.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Mood history is required' })
      };
    }

    const prompt = `
Create an "Emotional Twin" profile based on this user's data:

Mood History: ${moodHistory.join(', ')}
Personality Traits: ${JSON.stringify(personalityTraits)}
User Progress: ${userProgress.completedExercises || 0} exercises, ${userProgress.streak || 0} day streak

Generate a compassionate digital representation with:
{
  "twinPersonality": "description of their emotional patterns and character",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "growthAreas": ["area 1", "area 2"],
  "motivationalMessage": "personalized encouragement",
  "avatar": "single emoji representation",
  "insights": "key psychological insights about their journey",
  "recommendations": ["actionable suggestion 1", "actionable suggestion 2"]
}

Focus on:
- Positive reinforcement and growth mindset
- Cultural sensitivity for Indian youth
- Evidence-based psychological insights
- Actionable mental wellness recommendations
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
        maxOutputTokens: 500,
        systemInstruction: "You are a compassionate AI psychologist creating supportive emotional profiles for mental wellness."
      }
    });

    let twinResult;
    try {
      twinResult = JSON.parse(response.text);
    } catch (parseError) {
      // Fallback emotional twin
      const dominantMood = moodHistory.reduce((a, b, i, arr) => 
        arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
      );

      twinResult = {
        twinPersonality: "A resilient individual on a journey of self-discovery and emotional growth, showing commitment to mental wellness through consistent self-reflection.",
        strengths: ["Self-awareness", "Commitment to growth", "Emotional intelligence"],
        growthAreas: ["Stress management", "Emotional regulation"],
        motivationalMessage: "Your emotional twin sees your potential and believes in your journey toward better mental wellness!",
        avatar: "🌱",
        insights: `Your ${dominantMood} tendencies show you're in touch with your emotions, which is a significant strength in mental wellness.`,
        recommendations: [
          "Practice daily mindfulness meditation for 5 minutes",
          "Keep a gratitude journal to reinforce positive patterns"
        ]
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        twin: twinResult,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Emotional Twin API Error:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        twin: {
          twinPersonality: "A resilient individual working on their mental wellness journey",
          strengths: ["Self-awareness", "Commitment to growth"],
          growthAreas: ["Stress management", "Emotional regulation"],
          motivationalMessage: "You're making great progress on your wellness journey!",
          avatar: "🌱",
          insights: "Your dedication to mental wellness shows remarkable self-awareness.",
          recommendations: [
            "Practice daily mindfulness",
            "Maintain consistent self-care routines"
          ]
        },
        timestamp: new Date().toISOString(),
        fallback: true
      })
    };
  }
};
