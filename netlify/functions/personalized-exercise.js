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
    const { currentMood, userHistory = {} } = JSON.parse(event.body);

    if (!currentMood) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Current mood is required' })
      };
    }

    const prompt = `
Create a personalized CBT exercise for someone feeling "${currentMood}".

User context:
- Completed exercises: ${userHistory.completedExercises || 0}
- Current streak: ${userHistory.streak || 0}
- Recent moods: ${userHistory.recentMoods?.join(', ') || 'No data'}

Generate a specific, actionable CBT exercise with:
{
  "title": "Exercise name",
  "duration": "X minutes",
  "difficulty": "beginner/intermediate/advanced",
  "steps": ["step 1", "step 2", "step 3", "step 4"],
  "outcome": "what they'll gain",
  "technique": "CBT technique used",
  "tips": ["helpful tip 1", "helpful tip 2"]
}

Requirements:
- Evidence-based CBT techniques
- Appropriate for Indian youth context
- Practical and actionable steps
- 5-15 minute duration
- Progressive difficulty based on user experience
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 400,
        systemInstruction: "You are an expert CBT therapist creating personalized mental wellness exercises."
      }
    });

    let exerciseResult;
    try {
      exerciseResult = JSON.parse(response.text);
    } catch (parseError) {
      // Fallback exercises based on mood
      const fallbackExercises = {
        anxious: {
          title: "5-4-3-2-1 Grounding Technique",
          duration: "5 minutes",
          difficulty: "beginner",
          steps: [
            "Name 5 things you can see around you",
            "Name 4 things you can touch",
            "Name 3 things you can hear",
            "Name 2 things you can smell",
            "Name 1 thing you can taste"
          ],
          outcome: "Feel more grounded and present in the moment",
          technique: "Mindfulness grounding",
          tips: ["Take your time with each step", "Focus on the physical sensations"]
        },
        sad: {
          title: "Self-Compassion Practice",
          duration: "10 minutes",
          difficulty: "beginner",
          steps: [
            "Place your hand on your heart",
            "Acknowledge: 'This is a moment of suffering'",
            "Remember: 'Suffering is part of human experience'",
            "Offer yourself kindness: 'May I be kind to myself'"
          ],
          outcome: "Develop a more compassionate relationship with yourself",
          technique: "Self-compassion therapy",
          tips: ["Speak to yourself as you would a good friend", "It's okay if this feels awkward at first"]
        },
        stressed: {
          title: "Progressive Muscle Relaxation",
          duration: "15 minutes",
          difficulty: "intermediate",
          steps: [
            "Start with your toes, tense for 5 seconds then relax",
            "Move up to your calves, repeat the process",
            "Continue with thighs, abdomen, arms, and face",
            "Notice the difference between tension and relaxation"
          ],
          outcome: "Release physical tension and mental stress",
          technique: "Progressive muscle relaxation",
          tips: ["Find a quiet, comfortable space", "Focus on the contrast between tension and relaxation"]
        },
        happy: {
          title: "Gratitude Amplification",
          duration: "8 minutes",
          difficulty: "beginner",
          steps: [
            "Write down 3 things you're grateful for today",
            "For each item, write why you're grateful",
            "Visualize how these positive things impact your life",
            "Share your gratitude with someone you care about"
          ],
          outcome: "Amplify positive emotions and strengthen relationships",
          technique: "Positive psychology",
          tips: ["Be specific in your gratitude", "Notice how sharing gratitude affects others"]
        }
      };

      exerciseResult = fallbackExercises[currentMood] || fallbackExercises.happy;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        exercise: exerciseResult,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Personalized Exercise API Error:', error);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        exercise: {
          title: "Mindful Breathing",
          duration: "5 minutes",
          difficulty: "beginner",
          steps: [
            "Find a comfortable seated position",
            "Close your eyes or soften your gaze",
            "Breathe naturally and count each breath",
            "When your mind wanders, gently return to counting"
          ],
          outcome: "Feel more centered and calm",
          technique: "Mindfulness meditation",
          tips: ["There's no perfect way to do this", "Be patient with yourself"]
        },
        timestamp: new Date().toISOString(),
        fallback: true
      })
    };
  }
};
