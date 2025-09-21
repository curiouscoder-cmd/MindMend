// Debug endpoint to check environment variables
export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const envCheck = {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY?.length || 0,
      ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      // Show first/last 5 chars of API key for debugging (safe)
      GEMINI_KEY_PREVIEW: process.env.GEMINI_API_KEY ? 
        `${process.env.GEMINI_API_KEY.slice(0, 5)}...${process.env.GEMINI_API_KEY.slice(-5)}` : 
        'NOT_FOUND'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(envCheck, null, 2)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
