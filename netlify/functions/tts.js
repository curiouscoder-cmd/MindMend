// Netlify Function: Text-to-Speech via ElevenLabs
// Path: /.netlify/functions/tts
// Expects JSON body: { text: string, voiceId?: string, persona?: string, model?: string, voiceSettings?: { ... } }

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing ELEVENLABS_API_KEY server env var' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { text, voiceId, persona, model, voiceSettings } = body;
    if (!text || typeof text !== 'string') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing text' }) };
    }

    // Map personas to stable voice IDs
    const personaVoices = {
      mira: 'EXAVITQu4vr4xnSDxMaL',      // Bella
      dr_maya: 'ThT5KcBeYPX3keUQqHPh',   // Dorothy
      arjun: 'pNInz6obpgDQGcFmaJgB',     // Adam
      priya: 'XrExE9yKIg1WjnnlVkGX',     // Matilda
      rohit: 'onwK4e9ZLuTAKqWW03F9',     // Daniel
      meditation: 'AZnzlk1XvdvUeBnXmlld' // Domi
    };

    const resolvedVoiceId = voiceId || personaVoices[persona] || personaVoices.mira;

    const payload = {
      text,
      model_id: model || 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.4,
        use_speaker_boost: true,
        ...(voiceSettings || {})
      }
    };

    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const textErr = await resp.text();
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: 'ElevenLabs error', details: textErr })
      };
    }

    const arrayBuffer = await resp.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ audioBase64: base64Audio, contentType: 'audio/mpeg' })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error', details: err.message }) };
  }
}
