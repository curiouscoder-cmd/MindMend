// Netlify Function: Chat via Gemini REST API (robust against SDK changes)

const MENTAL_HEALTH_CONTEXT = `
You are Mira, an empathetic AI mental wellness coach specializing in Cognitive Behavioral Therapy (CBT) techniques. 
You are designed to support young adults in India dealing with academic and social pressure.

Guidelines:
- Always be supportive, non-judgmental, and empathetic
- Use evidence-based CBT techniques and mindfulness practices
- Keep responses concise but meaningful (2-3 sentences max for chat)
- Never provide medical diagnosis or replace professional therapy
- If someone mentions self-harm or suicide, immediately suggest professional help
- Use culturally sensitive language appropriate for Indian youth
- Focus on practical, actionable advice
- Encourage professional help when needed
`;

export const handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, moodHistory = [], userProgress = {} } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('GEMINI_API_KEY available:', !!apiKey);
    console.log('API Key preview:', apiKey ? `${apiKey.slice(0, 5)}...${apiKey.slice(-5)}` : 'MISSING');
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      throw new Error('Missing GEMINI_API_KEY');
    }

    // Build contents per REST API schema
    const contents = [
      {
        role: 'user',
        parts: [
          { text: `You are Mira, an empathetic AI wellness coach specializing in CBT techniques for young adults in India. User says: "${message}". Their mood history: ${moodHistory.slice(-5).join(', ') || 'none'}. Progress: ${userProgress.completedExercises || 0} exercises done, ${userProgress.streak || 0} day streak. Respond with empathy and practical CBT guidance in 2-3 sentences.` }
        ]
      }
    ];

    const body = {
      contents,
      generationConfig: {
        temperature: 0.85,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 220
      }
    };
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    console.log('Making Gemini API call to:', model);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    console.log('Gemini API response status:', resp.status);

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error(`Gemini API error: ${resp.status} - ${errText}`);
      throw new Error(`Gemini HTTP ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    const candidates = data.candidates || [];
    const first = candidates[0];
    const parts = first?.content?.parts || [];
    const textOut = parts.map(p => p.text).filter(Boolean).join('\n').trim();

    const safeText = textOut || "Thank you for sharing. I'm here to support you. What would feel most helpful right now—listening, a grounding exercise, or a small next step?";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: safeText,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Chat API Error:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Fallback response
    const fallbackResponses = {
      anxious: "I understand you're feeling anxious. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8. You're not alone in this.",
      sad: "It's okay to feel sad sometimes. Your feelings are valid. Would you like to try a gentle self-compassion exercise?",
      stressed: "Stress can be overwhelming. Let's break things down into smaller, manageable steps. What's one small thing you can do right now?",
      default: "Thank you for sharing. I'm here to support you. What would feel most helpful right now?"
    };

    const message = JSON.parse(event.body).message?.toLowerCase() || '';
    let fallbackResponse = fallbackResponses.default;
    
    if (message.includes('anxious') || message.includes('worried')) {
      fallbackResponse = fallbackResponses.anxious;
    } else if (message.includes('sad') || message.includes('down')) {
      fallbackResponse = fallbackResponses.sad;
    } else if (message.includes('stressed') || message.includes('overwhelmed')) {
      fallbackResponse = fallbackResponses.stressed;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        fallback: true
      })
    };
  }
};
