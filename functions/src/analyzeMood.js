// Cloud Natural Language API - Mood Analysis
import { onRequest } from 'firebase-functions/v2/https';
import language from '@google-cloud/language';

export const analyzeMood = onRequest({ 
  cors: true,
  timeoutSeconds: 30,
  region: 'asia-south1',
}, async (req, res) => {
  try {
    const { text, language: lang = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const client = new language.LanguageServiceClient();
    
    // Analyze sentiment
    const [result] = await client.analyzeSentiment({
      document: {
        content: text,
        type: 'PLAIN_TEXT',
        language: lang,
      },
    });
    
    const sentiment = result.documentSentiment;
    
    // Crisis keyword detection (multilingual)
    const crisisKeywords = {
      en: ['suicide', 'kill myself', 'end it all', 'self-harm', 'want to die', 'no point living'],
      hi: ['आत्महत्या', 'मरना चाहता', 'खुद को नुकसान', 'जीने का कोई मतलब नहीं'],
      ta: ['தற்கொலை', 'சாக விரும்புகிறேன்', 'வாழ்வதில் அர்த்தமில்லை'],
      te: ['ఆత్మహత్య', 'చనిపోవాలనుకుంటున్నాను'],
      bn: ['আত্মহত্যা', 'মরতে চাই'],
    };
    
    const keywords = crisisKeywords[lang] || crisisKeywords.en;
    const lowerText = text.toLowerCase();
    const hasCrisisKeyword = keywords.some(k => lowerText.includes(k.toLowerCase()));
    
    // Determine urgency level
    let urgency = 'low';
    if (hasCrisisKeyword) {
      urgency = 'critical';
    } else if (sentiment.score < -0.6) {
      urgency = 'high';
    } else if (sentiment.score < -0.3) {
      urgency = 'medium';
    }
    
    // Map sentiment to mood
    let mood = 'neutral';
    if (sentiment.score > 0.5) mood = 'happy';
    else if (sentiment.score > 0.2) mood = 'calm';
    else if (sentiment.score < -0.5) mood = 'sad';
    else if (sentiment.score < -0.2) mood = 'anxious';
    
    res.json({
      sentiment: {
        score: sentiment.score,
        magnitude: sentiment.magnitude,
      },
      mood,
      urgency,
      hasCrisisIndicators: hasCrisisKeyword,
      language: lang,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze mood',
      details: error.message 
    });
  }
});
