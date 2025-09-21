// Simplified chat function for debugging
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

  try {
    const { message } = JSON.parse(event.body || '{}');
    const apiKey = process.env.GEMINI_API_KEY;
    
    console.log('Simple chat - message:', message);
    console.log('Simple chat - API key available:', !!apiKey);

    if (!apiKey) {
      throw new Error('No API key');
    }

    // Simple Gemini API call
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
      contents: [{
        role: 'user',
        parts: [{ text: `You are Mira, a supportive AI wellness coach. User says: "${message}". Respond with empathy and practical CBT guidance in 2-3 sentences. Use natural, conversational language without any markdown formatting, asterisks, or special symbols. Speak as if you're having a warm, supportive conversation.` }]
      }]
    };

    console.log('Simple chat - making API call');
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('Simple chat - API response status:', resp.status);

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Simple chat - API error:', errText);
      throw new Error(`API error: ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Simple chat - API response data:', JSON.stringify(data, null, 2));
    
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I understand. How can I support you right now?';
    
    // Clean up markdown formatting and special characters
    responseText = responseText
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/_(.*?)_/g, '$1')       // Remove _underline_
      .replace(/`(.*?)`/g, '$1')       // Remove `code`
      .replace(/#{1,6}\s/g, '')        // Remove # headers
      .replace(/\n+/g, ' ')            // Replace newlines with spaces
      .replace(/\s+/g, ' ')            // Replace multiple spaces with single
      .trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: responseText,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Simple chat error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: "I'm here to support you. What would feel most helpful right now?",
        timestamp: new Date().toISOString(),
        error: error.message
      })
    };
  }
};
