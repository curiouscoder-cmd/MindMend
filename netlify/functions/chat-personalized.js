// Netlify Function: Personalized Chat with Gemini 2.5 Flash
// Enhanced with conversation context and user personalization

export const handler = async (event, context) => {
  // Handle CORS
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
    const { messages, userContext = {} } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable');
      throw new Error('Missing GEMINI_API_KEY');
    }

    // Use Gemini 2.5 Flash for better performance and quality
    const model = 'gemini-2.0-flash-exp';
    
    // Build contents array for Gemini API
    // Gemini doesn't have a separate "system" role, so we merge system prompt into first user message
    const contents = [];
    let systemPrompt = '';
    
    messages.forEach((msg, index) => {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else if (msg.role === 'user') {
        // For first user message, prepend system prompt
        const content = index === 1 && systemPrompt 
          ? `${systemPrompt}\n\n---\n\nUser: ${msg.content}`
          : msg.content;
        
        contents.push({
          role: 'user',
          parts: [{ text: content }]
        });
      } else if (msg.role === 'assistant') {
        contents.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    });

    // Enhanced generation config for personalized responses
    const body = {
      contents,
      generationConfig: {
        temperature: 0.9,        // Higher for more natural, varied responses
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 300,    // Slightly longer for personalized responses
        candidateCount: 1
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'  // Mental health context requires flexibility
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'  // Mental health discussions need nuance
        }
      ]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    console.log('🤖 Calling Gemini 2.5 Flash with personalized context');
    console.log('📊 User context:', {
      userId: userContext.userId,
      userName: userContext.userName,
      moodCount: userContext.moodHistory?.length || 0,
      hasProgress: !!userContext.progress
    });
    
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      console.error(`Gemini API error: ${resp.status} - ${errText}`);
      throw new Error(`Gemini HTTP ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    
    // Extract response text
    const candidates = data.candidates || [];
    const firstCandidate = candidates[0];
    const parts = firstCandidate?.content?.parts || [];
    const responseText = parts.map(p => p.text).filter(Boolean).join('\n').trim();

    // Fallback if no response
    const finalResponse = responseText || 
      `Thank you for sharing, ${userContext.userName || 'friend'}. I'm here to support you. What would feel most helpful right now?`;

    // Log for debugging
    console.log('✅ Generated personalized response:', {
      length: finalResponse.length,
      userName: userContext.userName,
      finishReason: firstCandidate?.finishReason
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: finalResponse,
        timestamp: new Date().toISOString(),
        model: model,
        personalized: true
      })
    };

  } catch (error) {
    console.error('❌ Personalized chat error:', error);
    console.error('Error details:', error.message);
    
    // Intelligent fallback based on context
    const { userContext = {} } = JSON.parse(event.body || '{}');
    const userName = userContext.userName || 'friend';
    const recentMood = userContext.moodHistory?.[userContext.moodHistory.length - 1];
    
    const fallbackResponse = recentMood
      ? `I'm here with you, ${userName}. I noticed you've been feeling ${recentMood}. What would feel most supportive right now—talking through it, trying a grounding exercise, or taking a small action step?`
      : `Thank you for reaching out, ${userName}. I'm here to support you. What's on your mind today?`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        fallback: true,
        personalized: true
      })
    };
  }
};
