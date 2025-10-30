# 🎙️ Real-Time Voice Conversation Options

## 📊 Comparison: Best Voice Solutions

| Feature | Gemini 2.5 Live API | ElevenLabs | Current (Web Speech) |
|---------|-------------------|------------|---------------------|
| **Latency** | 200-500ms | 75ms (Flash v2.5) | 0ms (local) |
| **Quality** | Excellent | Exceptional | Good |
| **Multilingual** | 24 languages | 32 languages | Browser-dependent |
| **Real-time** | ✅ WebSocket | ✅ Streaming | ✅ Local |
| **Voice Cloning** | ❌ | ✅ Instant/Pro | ❌ |
| **Cost** | API usage | $0.30/1K chars | Free |
| **Offline** | ❌ | ❌ | ✅ |
| **Setup** | Complex | Easy | Already working |

## 🎯 Recommendations

### Option 1: **ElevenLabs** (Best for Quality + Speed)
**Best for**: Production-quality voice with low latency
- ✅ 75ms latency (fastest)
- ✅ Most natural, expressive voices
- ✅ Voice cloning (instant/professional)
- ✅ 32 languages
- ✅ Easy to implement
- ❌ Costs $0.30 per 1K characters

### Option 2: **Gemini 2.5 Live API** (Best for Real-time Conversation)
**Best for**: True conversational AI with multimodal support
- ✅ Real-time bidirectional audio
- ✅ Can interrupt and respond naturally
- ✅ Multimodal (audio + video + text)
- ✅ 24 languages
- ✅ Integrated with Gemini AI
- ❌ More complex setup (WebSocket)
- ❌ API usage costs

### Option 3: **Current Web Speech API** (Best for Free + Offline)
**Best for**: No-cost solution that works now
- ✅ Already implemented and working
- ✅ Free, no API costs
- ✅ Works offline
- ✅ Good quality (Google/Apple voices)
- ❌ Not as natural as ElevenLabs
- ❌ No voice cloning

---

## 🚀 Implementation Guides

### Option 1: ElevenLabs Implementation

#### Step 1: Get API Key
```bash
# Sign up at https://elevenlabs.io
# Get API key from dashboard
```

#### Step 2: Install SDK
```bash
npm install elevenlabs
```

#### Step 3: Create ElevenLabs Service
```javascript
// src/services/elevenLabsService.js
import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY
});

/**
 * Generate speech with ElevenLabs streaming
 * @param {string} text - Text to synthesize
 * @param {Object} options - Configuration
 * @returns {Promise<string>} Audio URL
 */
export const generateSpeech = async (text, options = {}) => {
  const {
    voiceId = 'EXAVITQu4vr4xnSDxMaL', // Bella (female, expressive)
    modelId = 'eleven_flash_v2_5', // Fastest model (75ms latency)
    language = 'en',
    onChunk = null
  } = options;

  console.log('🎙️ Generating speech with ElevenLabs Flash v2.5');
  
  try {
    const audioStream = await client.textToSpeech.convertAsStream(voiceId, {
      text,
      model_id: modelId,
      language_code: language,
      output_format: 'mp3_44100_128'
    });

    // Collect chunks
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
      if (onChunk) onChunk(chunk);
    }

    // Create blob from chunks
    const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('✅ ElevenLabs speech generated');
    return audioUrl;
  } catch (error) {
    console.error('❌ ElevenLabs error:', error);
    throw error;
  }
};

/**
 * Get available voices
 */
export const getVoices = async () => {
  const voices = await client.voices.getAll();
  return voices.voices;
};

/**
 * Clone a voice (instant)
 */
export const cloneVoice = async (name, files) => {
  const voice = await client.voices.add({
    name,
    files,
    description: 'Custom cloned voice'
  });
  return voice;
};

export default {
  generateSpeech,
  getVoices,
  cloneVoice
};
```

#### Step 4: Update VoiceEnabledMessage
```javascript
import * as elevenLabsService from '../services/elevenLabsService';

// In handlePlayMessage:
url = await elevenLabsService.generateSpeech(
  message.content,
  {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella
    modelId: 'eleven_flash_v2_5',
    language: 'en'
  }
);
```

#### Multilingual Support
```javascript
// Hindi
await elevenLabsService.generateSpeech(text, { language: 'hi' });

// Spanish
await elevenLabsService.generateSpeech(text, { language: 'es' });

// Supported: en, es, fr, de, it, pt, pl, hi, ja, zh, ko, nl, tr, sv, id, fil, uk, el, cs, fi, ro, ru, da, bg, ms, sk, hr, ar, ta
```

---

### Option 2: Gemini 2.5 Live API Implementation

#### Step 1: Create WebSocket Service
```javascript
// src/services/geminiLiveService.js
class GeminiLiveSession {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ws = null;
    this.audioContext = null;
    this.mediaStream = null;
  }

  async connect() {
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('🔌 Connected to Gemini Live API');
      this.sendSetup();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
  }

  sendSetup() {
    const setupMessage = {
      setup: {
        model: 'models/gemini-2.5-flash',
        generationConfig: {
          responseModalities: ['AUDIO', 'TEXT'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede' // Female voice
              }
            },
            encoding: 'LINEAR16',
            sampleRateHertz: 24000
          }
        }
      }
    };

    this.ws.send(JSON.stringify(setupMessage));
  }

  async startMicrophone() {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = this.floatTo16BitPCM(inputData);
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
      
      this.ws.send(JSON.stringify({
        realtimeInput: {
          mediaChunks: [{
            mimeType: 'audio/pcm',
            data: base64
          }]
        }
      }));
    };

    source.connect(processor);
    processor.connect(this.audioContext.destination);
  }

  floatTo16BitPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }

  handleMessage(data) {
    if (data.serverContent) {
      // Handle audio response
      if (data.serverContent.modelTurn?.parts) {
        data.serverContent.modelTurn.parts.forEach(part => {
          if (part.inlineData?.mimeType === 'audio/pcm') {
            this.playAudio(part.inlineData.data);
          }
          if (part.text) {
            console.log('📝 Gemini:', part.text);
          }
        });
      }
    }
  }

  playAudio(base64Audio) {
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const audioContext = new AudioContext({ sampleRate: 24000 });
    const audioBuffer = audioContext.createBuffer(1, bytes.length / 2, 24000);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < channelData.length; i++) {
      const int16 = (bytes[i * 2 + 1] << 8) | bytes[i * 2];
      channelData[i] = int16 / 32768.0;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }

  sendText(text) {
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete: true
      }
    }));
  }

  disconnect() {
    if (this.ws) this.ws.close();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) this.audioContext.close();
  }
}

export default GeminiLiveSession;
```

#### Step 2: Use in Component
```javascript
import GeminiLiveSession from '../services/geminiLiveService';

const [liveSession, setLiveSession] = useState(null);

const startLiveConversation = async () => {
  const session = new GeminiLiveSession(apiKey);
  await session.connect();
  await session.startMicrophone();
  setLiveSession(session);
};

const sendMessage = (text) => {
  if (liveSession) {
    liveSession.sendText(text);
  }
};
```

---

## 🌍 Multilingual Support Comparison

### ElevenLabs (32 languages):
English, Spanish, French, German, Italian, Portuguese, Polish, Hindi, Japanese, Chinese, Korean, Dutch, Turkish, Swedish, Indonesian, Filipino, Ukrainian, Greek, Czech, Finnish, Romanian, Russian, Danish, Bulgarian, Malay, Slovak, Croatian, Arabic, Tamil

### Gemini Live (24 languages):
Arabic, Bengali, Chinese, Danish, Dutch, English, French, German, Hindi, Indonesian, Italian, Japanese, Korean, Marathi, Norwegian, Polish, Portuguese, Russian, Spanish, Swedish, Tamil, Telugu, Thai, Turkish, Ukrainian, Vietnamese

### Web Speech API:
Browser-dependent (typically 10-50 languages)

---

## 💰 Cost Comparison

### ElevenLabs:
- **Free Tier**: 10,000 characters/month
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters
- **Pro**: $99/month - 500,000 characters
- **Streaming**: Same pricing

### Gemini Live API:
- **Free Tier**: 1,500 requests/day
- **Pay-as-you-go**: ~$0.00025 per request
- **Audio**: Charged per minute of audio

### Web Speech API:
- **Free**: Unlimited

---

## 🎯 My Recommendation

**For MindMend (Mental Wellness App):**

### Phase 1: Keep Current Web Speech API ✅
- Already working perfectly
- Free, no API costs
- Good quality
- Works offline
- **Best for MVP and testing**

### Phase 2: Add ElevenLabs (Optional Premium Feature)
- Offer as premium voice option
- Much better quality
- Voice cloning for personalized Mira
- 75ms latency for real-time feel
- **Best for production quality**

### Phase 3: Gemini Live API (Future Enhancement)
- True conversational AI
- Can interrupt and respond naturally
- Multimodal support
- **Best for advanced features**

---

## 🚀 Quick Start: Add ElevenLabs Now

```bash
# 1. Install
npm install elevenlabs

# 2. Add to .env.local
VITE_ELEVENLABS_API_KEY=your_api_key_here

# 3. Create service (see code above)

# 4. Update one component to test

# 5. Compare with current Web Speech API
```

**Want me to implement ElevenLabs or Gemini Live API for you?** Let me know which option you prefer!
