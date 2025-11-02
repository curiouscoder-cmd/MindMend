// Lightweight multilingual language detection and mix analysis
// - Detects by Unicode script ranges and common romanized lexicons
// - Returns per-token labels and aggregate counts for Hindi/English and others

const UNICODE_SCRIPTS = {
  devanagari: /[\u0900-\u097F]/, // Hindi, Marathi, Sanskrit
  tamil: /[\u0B80-\u0BFF]/,
  telugu: /[\u0C00-\u0C7F]/,
  bengali: /[\u0980-\u09FF]/,
  gujarati: /[\u0A80-\u0AFF]/,
  gurmukhi: /[\u0A00-\u0A7F]/, // Punjabi
  kannada: /[\u0C80-\u0CFF]/,
  malayalam: /[\u0D00-\u0D7F]/
};

// Common romanized Hindi words (extendable)
const ROMAN_HI = new Set([
  'mera','meri','mere','tera','teri','tere','hai','hun','hoon','ho','nahi','nahin','kyu','kyon','kya','kaise','kaisa','kaisi',
  'bahut','bohot','kharab','bura','achha','accha','acche','theek','thik','yaar','dost','bhai','aaj','kal','abhi','kuch','kuchh','sab',
  'gaya','gayee','gayi','kar','karo','karna','karun','samajh','dimag','kam','kiya','apne','aap','jabardasti','nautanki','karti','rahti','roz','roj'
]);

const ROMAN_EN = null; // We treat non-roman-hi latin tokens as English by default

const LATIN = /[A-Za-z]/;

function tokenize(text) {
  return (text || '')
    .split(/([\p{L}\p{N}']+)/u)
    .map(t => t.trim())
    .filter(Boolean);
}

function labelToken(token) {
  // Script-based
  for (const [name, regex] of Object.entries(UNICODE_SCRIPTS)) {
    if (regex.test(token)) {
      switch (name) {
        case 'devanagari': return { token, lang: 'hi', reason: 'devanagari' };
        case 'tamil': return { token, lang: 'ta', reason: 'tamil' };
        case 'telugu': return { token, lang: 'te', reason: 'telugu' };
        case 'bengali': return { token, lang: 'bn', reason: 'bengali' };
        case 'gujarati': return { token, lang: 'gu', reason: 'gujarati' };
        case 'gurmukhi': return { token, lang: 'pa', reason: 'gurmukhi' };
        case 'kannada': return { token, lang: 'kn', reason: 'kannada' };
        case 'malayalam': return { token, lang: 'ml', reason: 'malayalam' };
      }
    }
  }

  // Latin heuristics (Hinglish vs English)
  if (LATIN.test(token)) {
    const lower = token.toLowerCase();
    if (ROMAN_HI.has(lower)) {
      return { token, lang: 'hi', reason: 'roman_hi' };
    }
    return { token, lang: 'en', reason: 'latin_default' };
  }

  // Others
  return { token, lang: 'other', reason: 'other' };
}

export function detectLanguageMix(text) {
  const tokens = tokenize(text);
  const perToken = tokens.map(labelToken);
  const counts = perToken.reduce((acc, t) => {
    acc[t.lang] = (acc[t.lang] || 0) + 1;
    return acc;
  }, {});
  const totalLangTokens = (counts.hi || 0) + (counts.en || 0);
  const ratioHi = totalLangTokens ? (counts.hi || 0) / totalLangTokens : 0;
  const ratioEn = totalLangTokens ? (counts.en || 0) / totalLangTokens : 0;
  const scriptsDetected = new Set();
  for (const [name, regex] of Object.entries(UNICODE_SCRIPTS)) {
    if (regex.test(text)) scriptsDetected.add(name);
  }
  let recommended = 'en';
  let confidence = 0.5;

  if (scriptsDetected.size > 0) {
    if (scriptsDetected.has('devanagari')) {
      recommended = ratioHi >= 0.3 ? 'hi' : 'mixed';
      confidence = 0.9;
    } else {
      // Some other Indian script detected
      recommended = 'mixed';
      confidence = 0.8;
    }
  } else {
    if (ratioHi >= 0.6) { recommended = 'hi'; confidence = 0.75; }
    else if (ratioHi >= 0.25) { recommended = 'mixed'; confidence = 0.65; }
    else { recommended = 'en'; confidence = 0.7; }
  }

  return {
    perToken,
    counts,
    ratioHi,
    ratioEn,
    scriptsDetected: Array.from(scriptsDetected),
    languagesDetected: Object.keys(counts),
    recommended,
    confidence
  };
}

export function chooseReplyLanguage(mix, previous = 'en') {
  if (!mix) return previous || 'en';
  // If strong Hindi presence or Devanagari
  if (mix.recommended === 'hi') return 'hi';
  if (mix.recommended === 'en') return 'en';
  // Mixed: prefer stability; if previous was hi/en and still reasonable, keep it
  if (previous === 'hi' && mix.ratioHi >= 0.4) return 'hi';
  if (previous === 'en' && mix.ratioEn >= 0.6) return 'en';
  return 'mixed';
}

export function summarizeMix(mix) {
  if (!mix) return '';
  return `hi:${mix.counts.hi||0} en:${mix.counts.en||0} other:${mix.counts.other||0} ratioHi:${(mix.ratioHi*100).toFixed(0)}% rec:${mix.recommended}`;
}
