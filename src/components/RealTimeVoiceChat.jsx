import React, { useState, useRef, useEffect } from 'react';

const RealTimeVoiceChat = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [emotion, setEmotion] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  // Initialize WebSocket connection to backend
  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const connectWebSocket = () => {
    // Connect to Firebase Function WebSocket endpoint
    const wsUrl = 'wss://us-central1-mindmend-25dca.cloudfunctions.net/realtimeVoiceChat';
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'transcription':
          setTranscription(data.text);
          break;
          
        case 'emotion':
          setEmotion(data.emotion);
          break;
          
        case 'audio_chunk':
          // Queue audio for playback
          audioQueueRef.current.push(data.audio);
          if (!isPlayingRef.current) {
            playAudioQueue();
          }
          break;
          
        case 'text_response':
          setAiResponse(data.text);
          break;
          
        case 'speaking_start':
          setIsSpeaking(true);
          break;
          
        case 'speaking_end':
          setIsSpeaking(false);
          break;
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      streamRef.current = stream;
      setIsRecording(true);

      // Set up audio context for level monitoring
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Monitor audio level
      const updateLevel = () => {
        if (!isRecording) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(Math.min(average / 128, 1));
        requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Set up MediaRecorder for PCM audio
      const options = { mimeType: 'audio/webm;codecs=opus' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert to PCM and send via WebSocket
          const arrayBuffer = await event.data.arrayBuffer();
          const audioData = new Uint8Array(arrayBuffer);
          
          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            audio: Array.from(audioData),
            timestamp: Date.now()
          }));
        }
      };

      // Send audio chunks every 100ms for real-time processing
      mediaRecorderRef.current.start(100);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioLevel(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const playAudioQueue = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift();

    try {
      // Create audio context if needed
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 24000 // Output is 24kHz
        });
      }

      // Decode base64 audio data
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to AudioBuffer
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      
      // Play audio
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        playAudioQueue(); // Play next chunk
      };
      
      source.start(0);

    } catch (error) {
      console.error('Error playing audio:', error);
      playAudioQueue(); // Try next chunk
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getEmotionColor = () => {
    if (!emotion) return 'from-ocean to-highlight';
    
    const colors = {
      happy: 'from-green-400 to-green-600',
      sad: 'from-blue-400 to-blue-600',
      anxious: 'from-yellow-400 to-orange-500',
      stressed: 'from-red-400 to-red-600',
      calm: 'from-sky to-mint',
      angry: 'from-red-500 to-red-700',
      neutral: 'from-gray-400 to-gray-600'
    };

    return colors[emotion.primaryMood] || 'from-ocean to-highlight';
  };

  const getEmotionEmoji = () => {
    if (!emotion) return '🎤';
    
    const emojis = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      stressed: '😤',
      calm: '😌',
      angry: '😡',
      neutral: '😐'
    };

    return emojis[emotion.primaryMood] || '🎤';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse-gentle">
            <span className="text-4xl">🤖</span>
          </div>
          <h2 className="text-3xl font-bold text-navy mb-2">Real-Time Voice Chat</h2>
          <p className="text-navy/60">Instant, natural conversation with Mira</p>
          
          {/* Connection status */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-navy/60">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Main voice interface */}
        <div className="flex flex-col items-center space-y-6">
          {/* Large voice button */}
          <button
            onClick={toggleRecording}
            disabled={!isConnected}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? `bg-gradient-to-br ${getEmotionColor()} animate-pulse shadow-2xl scale-110`
                : 'bg-gradient-to-br from-ocean to-highlight hover:shadow-2xl hover:scale-105'
            } ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {/* Audio level ring */}
            {isRecording && (
              <div
                className="absolute inset-0 rounded-full bg-white/30 transition-transform duration-100"
                style={{
                  transform: `scale(${1 + audioLevel * 0.3})`,
                }}
              />
            )}

            {/* Icon */}
            <span className="relative z-10 text-white text-5xl">
              {isRecording ? getEmotionEmoji() : '🎤'}
            </span>

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Status text */}
          <div className="text-center">
            <p className="text-lg font-medium text-navy">
              {isRecording ? 'Listening...' : isSpeaking ? 'Mira is speaking...' : 'Tap to start talking'}
            </p>
            {emotion && (
              <p className="text-sm text-navy/60 mt-1 capitalize">
                Detected: {emotion.primaryMood}
              </p>
            )}
          </div>

          {/* Real-time transcription */}
          {transcription && (
            <div className="w-full p-4 bg-sky/20 rounded-2xl border border-ocean/10">
              <p className="text-xs text-navy/60 mb-1">You said:</p>
              <p className="text-navy font-medium">{transcription}</p>
            </div>
          )}

          {/* AI response */}
          {aiResponse && (
            <div className="w-full p-4 bg-mint/40 rounded-2xl border border-ocean/10">
              <p className="text-xs text-navy/60 mb-1">Mira:</p>
              <p className="text-navy font-medium">{aiResponse}</p>
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-navy/60">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-ocean rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-ocean rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-ocean rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">Speaking...</span>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-navy/60">Instant Response</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🎭</div>
            <p className="text-xs text-navy/60">Emotion Aware</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🌊</div>
            <p className="text-xs text-navy/60">Natural Flow</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Speak naturally as if talking to a friend. Mira will respond instantly with empathy and understanding.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealTimeVoiceChat;
