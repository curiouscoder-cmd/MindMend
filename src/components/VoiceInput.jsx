import React, { useState, useRef, useEffect } from 'react';
import api from '../services/apiService.js';

const VoiceInput = ({ onEmotionDetected, onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [emotionalAnalysis, setEmotionalAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscription(finalTranscript);
          analyzeEmotion(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }

    return () => {
      stopRecording();
    };
  }, []);

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
      setRecordingTime(0);
      setTranscription('');
      setEmotionalAnalysis(null);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
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
        if (isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioLevel(0);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (transcription && onTranscriptionComplete) {
      onTranscriptionComplete(transcription);
    }
  };

  const analyzeEmotion = async (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const analysis = await api.analyzeMood(text, {});
      setEmotionalAnalysis(analysis);
      
      if (onEmotionDetected) {
        onEmotionDetected(analysis);
      }
    } catch (error) {
      console.error('Emotion analysis error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'text-yellow-600 bg-yellow-100',
      sad: 'text-blue-600 bg-blue-100',
      anxious: 'text-red-600 bg-red-100',
      stressed: 'text-orange-600 bg-orange-100',
      calm: 'text-green-600 bg-green-100',
      excited: 'text-purple-600 bg-purple-100',
      neutral: 'text-gray-600 bg-gray-100'
    };
    return colors[emotion?.toLowerCase()] || colors.neutral;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'border-green-300 bg-green-50',
      medium: 'border-yellow-300 bg-yellow-50',
      high: 'border-red-300 bg-red-50'
    };
    return colors[urgency] || colors.low;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-calm-800 mb-2">Voice & Emotion Analysis</h2>
          <p className="text-calm-600">Share your thoughts through voice and get AI-powered emotional insights</p>
        </div>

        {/* Recording Interface */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            {/* Audio Level Visualization */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-primary-400" 
                 style={{ 
                   transform: `scale(${1 + (audioLevel / 255) * 0.5})`,
                   display: isRecording ? 'block' : 'none'
                 }}>
            </div>
            
            {/* Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-200 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-105'
              }`}
              disabled={isProcessing}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="mt-4 space-y-2">
              <div className="text-red-600 font-medium">Recording... {formatTime(recordingTime)}</div>
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-8 bg-red-400 rounded-full transition-all duration-100 ${
                        audioLevel > (i * 50) ? 'opacity-100' : 'opacity-30'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-calm-600">Speak naturally about how you're feeling...</p>
            </div>
          )}

          {!isRecording && !transcription && (
            <div className="mt-4">
              <p className="text-calm-600">Tap the microphone to start recording</p>
              <p className="text-sm text-calm-500 mt-1">Your voice will be analyzed for emotional insights</p>
            </div>
          )}
        </div>

        {/* Transcription */}
        {transcription && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-calm-800 mb-3 flex items-center">
              <span className="text-xl mr-2">📝</span>
              What you said:
            </h3>
            <div className="p-4 bg-calm-50 rounded-lg border">
              <p className="text-calm-700 leading-relaxed">{transcription}</p>
            </div>
          </div>
        )}

        {/* Emotional Analysis */}
        {emotionalAnalysis && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-calm-800 flex items-center">
              <span className="text-xl mr-2">🧠</span>
              AI Emotional Analysis:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Emotion */}
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium text-calm-700 mb-2">Primary Emotion</h4>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getEmotionColor(emotionalAnalysis.primaryEmotion)
                }`}>
                  {emotionalAnalysis.primaryEmotion}
                </div>
              </div>

              {/* Stress Level */}
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium text-calm-700 mb-2">Stress Level</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        emotionalAnalysis.stressLevel <= 3 ? 'bg-green-400' :
                        emotionalAnalysis.stressLevel <= 6 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${emotionalAnalysis.stressLevel * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-calm-700">
                    {emotionalAnalysis.stressLevel}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Urgency & Suggestion */}
            <div className={`p-4 rounded-lg border-2 ${getUrgencyColor(emotionalAnalysis.urgency)}`}>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {emotionalAnalysis.urgency === 'high' ? '🚨' : 
                   emotionalAnalysis.urgency === 'medium' ? '⚠️' : '💡'}
                </div>
                <div>
                  <h4 className="font-medium text-calm-800 mb-1">
                    {emotionalAnalysis.urgency === 'high' ? 'Immediate Attention Needed' :
                     emotionalAnalysis.urgency === 'medium' ? 'Consider Taking Action' : 'Gentle Suggestion'}
                  </h4>
                  <p className="text-calm-700">{emotionalAnalysis.suggestedAction}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button className="btn-primary text-sm">
                Start Recommended Exercise
              </button>
              <button className="btn-secondary text-sm">
                Talk to AI Coach
              </button>
              {emotionalAnalysis.urgency === 'high' && (
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                  Get Crisis Support
                </button>
              )}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-calm-600">Analyzing your emotional state...</p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 text-lg">🔒</span>
            <div>
              <h4 className="font-medium text-blue-800 text-sm">Privacy Protected</h4>
              <p className="text-blue-700 text-xs">
                Your voice data is processed securely and not stored permanently. 
                Only the transcription is used for emotional analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
