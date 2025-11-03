import React, { useState, useRef, useEffect } from 'react';
import api from '../services/apiService.js';
import { detectLanguageFromSpeech, getSTTLanguageCode } from '../services/languageDetectionService.js';

const VoiceButton = ({ onTranscription, onEmotionDetected, onListeningStart, disabled = false, currentLanguage = 'en' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [emotion, setEmotion] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(currentLanguage);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      // Use STT language code based on current language
      recognitionRef.current.lang = getSTTLanguageCode(currentLanguage);

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const currentTranscript = (finalTranscript + interimTranscript).trim();
        setTranscription(currentTranscript);

        // Detect language from speech (keyword matching for English letters)
        if (finalTranscript) {
          const detectedLang = detectLanguageFromSpeech(finalTranscript);
          setDetectedLanguage(detectedLang);
          console.log('🌍 Detected language from speech:', detectedLang, 'from transcript:', finalTranscript);
          
          // Analyze emotion in real-time for final transcripts
          analyzeEmotionRealTime(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          stopRecording();
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Restart if still recording
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.log('Recognition restart failed:', e);
          }
        }
      };
    }

    return () => {
      stopRecording();
    };
  }, []);

  const analyzeEmotionRealTime = async (text) => {
    if (!text.trim()) return;

    try {
      const analysis = await api.analyzeMood(text, {});
      setEmotion(analysis);
      
      if (onEmotionDetected) {
        onEmotionDetected(analysis);
      }
    } catch (error) {
      console.error('Real-time emotion analysis error:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      setIsRecording(true);
      setTranscription('');
      setEmotion(null);
      
      // Notify parent that listening started
      if (onListeningStart) {
        onListeningStart(true);
      }

      // Start speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Recognition already started');
        }
      }

      // Set up audio level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (!isRecording) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(Math.min(average / 128, 1));
        
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };
      updateAudioLevel();

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
    }

    // Stop audio monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Send final transcription with detected language
    if (transcription && onTranscription) {
      console.log('🎤 Sending transcription:', transcription, 'Language:', detectedLanguage);
      // Pass transcription with language metadata
      onTranscription(transcription, detectedLanguage);
    }

    setAudioLevel(0);
    setTranscription('');
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
    <div className="relative inline-block">
      <button
        onClick={toggleRecording}
        disabled={disabled || isProcessing}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? `bg-gradient-to-br ${getEmotionColor()} animate-pulse shadow-elevated`
            : 'bg-gradient-to-br from-ocean to-highlight hover:shadow-elevated hover:scale-105'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {/* Audio level indicator */}
        {isRecording && (
          <div
            className="absolute inset-0 rounded-full bg-white/30 transition-transform duration-100"
            style={{
              transform: `scale(${1 + audioLevel * 0.5})`,
            }}
          />
        )}

        {/* Icon */}
        <span className="relative z-10 text-white text-xl">
          {isRecording ? getEmotionEmoji() : '🎤'}
        </span>
      </button>

      {/* Real-time transcription tooltip */}
      {isRecording && transcription && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-elevated border border-ocean/10 min-w-[200px] max-w-[300px] z-50">
          <p className="text-xs text-navy/80 mb-1">Listening...</p>
          <p className="text-sm text-navy font-medium line-clamp-2">{transcription}</p>
          
          {/* Emotion indicator */}
          {emotion && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm">{getEmotionEmoji()}</span>
              <span className="text-xs text-navy/60 capitalize">{emotion.primaryMood}</span>
              {emotion.intensity && (
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getEmotionColor()} transition-all duration-300`}
                    style={{ width: `${emotion.intensity * 10}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default VoiceButton;
