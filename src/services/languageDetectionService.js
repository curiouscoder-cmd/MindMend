/**
 * Language Detection Service
 * Detects language from both written text and speech
 * Supports 8 Indian languages + English
 */

// Language codes for Web Speech API
export const STT_LANGUAGE_CODES = {
  en: 'en-US',      // English
  hi: 'hi-IN',      // Hindi
  ta: 'ta-IN',      // Tamil
  te: 'te-IN',      // Telugu
  bn: 'bn-IN',      // Bengali
  gu: 'gu-IN',      // Gujarati
  kn: 'kn-IN',      // Kannada
  ml: 'ml-IN',      // Malayalam
  pa: 'pa-IN'       // Punjabi
};

// Language names for display
export const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'हिंदी (Hindi)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  bn: 'বাংলা (Bengali)',
  gu: 'ગુજરાતી (Gujarati)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)'
};

/**
 * Detect language from written text using script detection
 * @param {string} text - Text to analyze
 * @returns {string} Language code (en, hi, ta, te, bn, gu, kn, ml, pa)
 */
export const detectLanguageFromText = (text) => {
  if (!text) return 'en';

  // Devanagari script detection (Hindi, Marathi, Sanskrit)
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) return 'hi';
  
  // Tamil script detection
  const tamilRegex = /[\u0B80-\u0BFF]/;
  if (tamilRegex.test(text)) return 'ta';
  
  // Telugu script detection
  const teluguRegex = /[\u0C00-\u0C7F]/;
  if (teluguRegex.test(text)) return 'te';
  
  // Bengali script detection
  const bengaliRegex = /[\u0980-\u09FF]/;
  if (bengaliRegex.test(text)) return 'bn';
  
  // Gujarati script detection
  const gujaratiRegex = /[\u0A80-\u0AFF]/;
  if (gujaratiRegex.test(text)) return 'gu';
  
  // Kannada script detection
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  if (kannadaRegex.test(text)) return 'kn';
  
  // Malayalam script detection
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  if (malayalamRegex.test(text)) return 'ml';
  
  // Punjabi script detection
  const punjabiRegex = /[\u0A00-\u0A7F]/;
  if (punjabiRegex.test(text)) return 'pa';
  
  return 'en'; // Default to English
};

/**
 * Detect language from spoken input using keyword matching
 * This helps identify language when STT returns English letters
 * @param {string} transcript - Speech-to-text transcript
 * @returns {string} Language code
 */
export const detectLanguageFromSpeech = (transcript) => {
  if (!transcript) return 'en';

  const text = transcript.toLowerCase();

  // Hindi keywords (common words in Hindi)
  const hindiKeywords = [
    'mujhe', 'mere', 'mera', 'meri', 'hoon', 'hain', 'hai', 'kya', 'kaise',
    'aapka', 'aapke', 'aap', 'maine', 'mene', 'tha', 'the', 'thi', 'nahi',
    'nahin', 'bilkul', 'bilkull', 'bahut', 'bahot', 'bahot', 'acha', 'achha',
    'theek', 'theek hai', 'bilkul theek', 'shukriya', 'dhanyavaad', 'sukriya',
    'phir', 'phir se', 'dobara', 'ab', 'abhi', 'jab', 'tab', 'jaha', 'waha',
    'yaha', 'vaha', 'kuch', 'kuch bhi', 'sab', 'sabhi', 'koi', 'kisi', 'kaun'
  ];

  // Tamil keywords
  const tamilKeywords = [
    'naan', 'naan', 'ennai', 'enna', 'ennangal', 'innum', 'illa', 'illai',
    'aama', 'aamam', 'sari', 'sari', 'nandri', 'nandrigal', 'vandhu', 'vanthen',
    'irukku', 'irundhu', 'irukkum', 'sollren', 'sollran', 'sollum', 'solluvom'
  ];

  // Telugu keywords
  const teluguKeywords = [
    'nenu', 'nevu', 'naa', 'na', 'inka', 'ledu', 'ledhu', 'kani', 'kani',
    'ayya', 'ayyo', 'shukriya', 'dhanyavadam', 'vundi', 'undhi', 'undhi',
    'cheppanu', 'cheppu', 'cheppukunna', 'anukunta', 'anukunnanu'
  ];

  // Bengali keywords
  const bengaliKeywords = [
    'ami', 'amar', 'amare', 'apni', 'apnar', 'tai', 'tao', 'kintu', 'kinto',
    'na', 'nai', 'haan', 'hye', 'chilo', 'chilam', 'dhonnobad', 'sukriya',
    'bolchi', 'bolbo', 'bolun', 'bolun', 'bolte', 'bolbe', 'bolben'
  ];

  // Gujarati keywords
  const gujaratiKeywords = [
    'hu', 'hoo', 'mara', 'mare', 'mari', 'ane', 'anu', 'nathi', 'nathi',
    'hoy', 'hota', 'hoti', 'shukriya', 'dhanyavaad', 'bolun', 'bolish',
    'bolish', 'bolvu', 'bolvi', 'bolvu', 'bolvi'
  ];

  // Kannada keywords
  const kannadaKeywords = [
    'nanu', 'nanna', 'nannage', 'neevu', 'neeve', 'neevige', 'illa', 'illade',
    'hogi', 'hogu', 'hoguttide', 'dhanyavada', 'shukriya', 'helu', 'helutte',
    'heluttene', 'heluttidde', 'heluttare'
  ];

  // Malayalam keywords
  const malayalamKeywords = [
    'njan', 'njaan', 'enne', 'ennu', 'nee', 'neeye', 'illa', 'illai',
    'undo', 'undayirunnu', 'undakum', 'dhanyavadam', 'shukriya', 'parayan',
    'parayunnu', 'parayum', 'parayatte'
  ];

  // Punjabi keywords
  const punjabiKeywords = [
    'main', 'mera', 'mere', 'meri', 'tussi', 'tussi', 'nahi', 'nahin',
    'haan', 'hai', 'si', 'sian', 'shukriya', 'dhanyavaad', 'bolda', 'bolde',
    'boldi', 'boldan', 'bolde', 'boldi'
  ];

  // Check keyword matches
  const keywordMatches = {
    hi: hindiKeywords.filter(kw => text.includes(kw)).length,
    ta: tamilKeywords.filter(kw => text.includes(kw)).length,
    te: teluguKeywords.filter(kw => text.includes(kw)).length,
    bn: bengaliKeywords.filter(kw => text.includes(kw)).length,
    gu: gujaratiKeywords.filter(kw => text.includes(kw)).length,
    kn: kannadaKeywords.filter(kw => text.includes(kw)).length,
    ml: malayalamKeywords.filter(kw => text.includes(kw)).length,
    pa: punjabiKeywords.filter(kw => text.includes(kw)).length
  };

  // Find language with most keyword matches
  let detectedLanguage = 'en';
  let maxMatches = 0;

  for (const [lang, matches] of Object.entries(keywordMatches)) {
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedLanguage = lang;
    }
  }

  // Only return detected language if we have at least 2 keyword matches
  return maxMatches >= 2 ? detectedLanguage : 'en';
};

/**
 * Get STT language code for Web Speech API
 * @param {string} language - Language code (en, hi, ta, etc.)
 * @returns {string} STT language code for Web Speech API
 */
export const getSTTLanguageCode = (language = 'en') => {
  return STT_LANGUAGE_CODES[language] || STT_LANGUAGE_CODES.en;
};

/**
 * Get language name for display
 * @param {string} language - Language code
 * @returns {string} Language name
 */
export const getLanguageName = (language = 'en') => {
  return LANGUAGE_NAMES[language] || LANGUAGE_NAMES.en;
};

/**
 * Detect language from any input (text or speech)
 * Combines both script detection and keyword matching
 * @param {string} input - Text or speech transcript
 * @param {boolean} isSpoken - Whether input is from speech
 * @returns {string} Language code
 */
export const detectLanguage = (input, isSpoken = false) => {
  if (!input) return 'en';

  // First try script detection (works for written text with proper script)
  const scriptDetected = detectLanguageFromText(input);
  if (scriptDetected !== 'en') {
    return scriptDetected;
  }

  // If no script detected and input is from speech, use keyword matching
  if (isSpoken) {
    return detectLanguageFromSpeech(input);
  }

  return 'en';
};

export default {
  detectLanguageFromText,
  detectLanguageFromSpeech,
  detectLanguage,
  getSTTLanguageCode,
  getLanguageName,
  STT_LANGUAGE_CODES,
  LANGUAGE_NAMES
};
