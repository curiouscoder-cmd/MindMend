/**
 * Your Friend - Real-time Conversational AI Component
 * A friend who's always there to talk, motivate, and support
 * With multilingual support for 8 Indian languages
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as friendService from '../services/realTimeFriendService';
import { getCurrentUser } from '../services/authService';
import { getUserProfile } from '../services/firestoreService';

const YourFriend = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [error, setError] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState(''); // Real-time transcript

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (profileError) {
          console.warn('Could not load user profile, using defaults:', profileError);
          // Use default profile if Firestore fails
          setUserProfile({
            profile: {
              displayName: user.displayName || 'friend'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const startConversation = () => {
    if (isConnected) {
      stopConversation();
      return;
    }

    console.log('🚀 Starting conversation...');
    setError(null);

    // Initialize speech recognition
    recognitionRef.current = friendService.initializeSpeechRecognition(
      handleTranscript,
      handleError
    );

    if (!recognitionRef.current) {
      setError('Speech recognition not supported in your browser');
      return;
    }

    // Start listening
    const started = friendService.startListening();
    if (started) {
      setIsConnected(true);
      setIsListening(true);

      // Welcome message
      const welcomeMessages = {
        en: `Hey ${userProfile?.profile?.displayName || 'friend'}! I'm here for you. What's on your mind today?`,
        hi: `नमस्ते ${userProfile?.profile?.displayName || 'दोस्त'}! मैं यहाँ आपके लिए हूँ। आज आपके मन में क्या है?`,
        ta: `வணக்கம் ${userProfile?.profile?.displayName || 'நண்பரே'}! நான் உங்களுக்காக இங்கே இருக்கிறேன். இன்று உங்கள் மனதில் என்ன இருக்கிறது?`,
        te: `హలో ${userProfile?.profile?.displayName || 'స్నేహితుడు'}! నేను మీ కోసం ఇక్కడ ఉన్నాను। ఈ రోజు మీ మనసులో ఏముంది?`
      };

      const welcomeText = welcomeMessages[currentLanguage] || welcomeMessages.en;
      
      addMessage('friend', welcomeText);
      speakMessage(welcomeText);
    } else {
      setError('Failed to start speech recognition');
    }
  };

  const stopConversation = () => {
    console.log('🛑 Stopping conversation...');
    
    friendService.stopListening();
    friendService.resetConversation();
    
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
  };

  const handleTranscript = async (transcript, isFinal = true) => {
    if (!transcript.trim()) return;

    // Show interim results in real-time
    if (!isFinal) {
      setInterimTranscript(transcript);
      return;
    }

    console.log('👤 User said:', transcript);

    // Clear interim transcript
    setInterimTranscript('');

    // Check if user wants to end conversation
    if (friendService.shouldEndConversation(transcript)) {
      console.log('👋 User indicated they\'re feeling better - ending conversation');
      addMessage('user', transcript);
      
      const goodbyeMessages = {
        en: "I'm so glad you're feeling better! Remember, I'm always here if you need me. Take care! 💙",
        hi: "मुझे खुशी है कि आप बेहतर महसूस कर रहे हैं! याद रखें, मैं हमेशा यहाँ हूँ। ध्यान रखना! 💙"
      };
      
      const goodbyeMsg = goodbyeMessages[currentLanguage] || goodbyeMessages.en;
      addMessage('friend', goodbyeMsg);
      await speakMessage(goodbyeMsg);
      
      // Stop conversation after goodbye
      setTimeout(() => {
        stopConversation();
      }, 2000);
      return;
    }

    // Add user message
    addMessage('user', transcript);

    // Pause listening while processing
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
    }

    try {
      // Get AI response
      const response = await friendService.generateFriendResponse(transcript, {
        language: currentLanguage,
        userProfile
      });

      // Add friend message
      addMessage('friend', response);

      // Speak response (this will handle listening state)
      await speakMessage(response);

    } catch (error) {
      console.error('Error getting response:', error);
      const errorMsg = 'Sorry, I had trouble understanding. Can you say that again?';
      addMessage('friend', errorMsg);
      await speakMessage(errorMsg);
    }
  };

  const handleError = (error) => {
    console.error('Speech recognition error:', error);
    if (error !== 'no-speech' && error !== 'aborted') {
      setError(`Error: ${error}`);
    }
  };

  const addMessage = (type, content) => {
    const message = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

const speakMessage = async (text) => {
  setIsSpeaking(true);
  setIsListening(false);

  // Stop listening before speaking (prevent echo)
  if (recognitionRef.current) {
    try {
      recognitionRef.current.stop();
      console.log('🔇 Stopped listening to prevent echo');
    } catch (e) {
      console.log('Recognition already stopped');
    }
  }

  await friendService.speakResponse(text, {
    onStart: () => {
      console.log('🔊 Friend speaking...');
      setIsListening(false);
      setIsSpeaking(true);
    },
    onEnd: () => {
      console.log('✅ Friend finished speaking');
      setIsSpeaking(false);
      setIsListening(true); // Reflect resumed listening in UI
    },
  });
};


  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
    friendService.updateContext({ language: lang });
  };

  return (
    <div className="min-h-screen bg-mint/50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 mb-3 sm:mb-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-ocean to-highlight flex items-center justify-center text-2xl sm:text-3xl shadow-lg shrink-0">
                👥
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Your Friend</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {isConnected ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="hidden sm:inline">Connected • Real-time</span>
                      <span className="sm:hidden">Connected</span>
                    </span>
                  ) : (
                    'Start talking with your friend'
                  )}
                </p>
              </div>
            </div>

            {/* Language Selector & Start Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={currentLanguage}
                onChange={(e) => changeLanguage(e.target.value)}
                className="px-2 sm:px-3 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ocean"
                disabled={isConnected}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="bn">বাংলা</option>
                <option value="mr">मराठी</option>
                <option value="gu">ગુજરાતી</option>
                <option value="kn">ಕನ್ನಡ</option>
              </select>

              {/* Start/Stop Button */}
              <button
                onClick={startConversation}
                className={`px-3 sm:px-6 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 text-xs sm:text-sm whitespace-nowrap ${
                  isConnected
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-ocean to-highlight hover:from-primary-700 hover:to-ocean text-white'
                }`}
              >
                <span className="hidden sm:inline">{isConnected ? '🛑 End Chat' : '🎤 Start Talking'}</span>
                <span className="sm:hidden">{isConnected ? '🛑 End' : '🎤 Talk'}</span>
              </button>
            </div>
          </div>

          {/* Status Indicators */}
          {isConnected && (
            <div className={`mt-2 sm:mt-4 p-2 sm:p-3 rounded-lg transition-all text-xs sm:text-sm ${
              isListening 
                ? 'bg-gradient-to-r from-green-50 to-cyan-50 border border-green-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                <div className={`flex items-center gap-2 transition-all ${isListening ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="font-medium">{isListening ? '🎤 Listening' : '⏸️ Paused'}</span>
                </div>
                <div className={`flex items-center gap-2 transition-all ${isSpeaking ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="font-medium">{isSpeaking ? '🔊 Speaking' : '🔇 Silent'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </motion.div>

        {/* Chat Messages */}
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-6 h-[50vh] sm:h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-4 custom-scrollbar">
            <AnimatePresence>
              {messages.length === 0 && !interimTranscript ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center px-4">
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">👥</div>
                    <p className="text-sm sm:text-lg">Click "Start Talking" to begin</p>
                    <p className="text-xs sm:text-sm mt-1 sm:mt-2">Your friend is ready to listen</p>
                  </div>
                </div>
              ) : (
                <>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'user' ? (
                      // User Message
                      <div className="max-w-[85%] sm:max-w-[70%] flex items-start gap-1 sm:gap-2">
                        <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-ocean to-highlight text-white shadow-md">
                          <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                          <div className="text-[8px] sm:text-[10px] mt-1 text-sky text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-ocean to-highlight text-white flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-xs sm:text-sm">🧑</span>
                        </div>
                      </div>
                    ) : (
                      // Friend Message
                      <div className="max-w-[85%] sm:max-w-[70%] flex items-start gap-1 sm:gap-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-ocean to-highlight flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-sm sm:text-base">👥</span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 p-2 sm:p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-1 gap-1">
                            <span className="text-xs font-medium text-ocean">Friend</span>
                            <div className="text-[8px] sm:text-[10px] text-gray-500">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
                }
                
                {/* Real-time Interim Transcript */}
                {interimTranscript && isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] sm:max-w-[70%] flex items-start gap-1 sm:gap-2">
                      <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-primary-300 to-highlight text-white shadow-md opacity-70">
                        <p className="text-xs sm:text-sm leading-relaxed italic">{interimTranscript}</p>
                        <div className="text-[8px] sm:text-[10px] mt-1 text-sky text-right">
                          Listening...
                        </div>
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-primary-300 to-highlight text-white flex items-center justify-center shadow-md flex-shrink-0 animate-pulse">
                        <span className="text-xs sm:text-sm">🎤</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                </>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Instructions */}
          {!isConnected && messages.length === 0 && (
            <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-200">
              <h3 className="text-sm font-semibold text-navy mb-2">💡 How to use:</h3>
              <ul className="text-xs text-primary-700 space-y-1">
                <li>• Click "Start Talking" to begin</li>
                <li>• Speak naturally in your chosen language</li>
                <li>• Your friend will respond in real-time</li>
                <li>• Share your feelings, thoughts, or concerns</li>
                <li>• Get motivation and support instantly</li>
              </ul>
            </div>
          )}
        </div>

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4"
        >
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎤</div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">Real-time Voice</h3>
            <p className="text-xs text-gray-600">Natural conversation</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🧠</div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">Context Aware</h3>
            <p className="text-xs text-gray-600">Remembers & adapts</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md">
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🌍</div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">8 Languages</h3>
            <p className="text-xs text-gray-600">Indian languages</p>
          </div>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #62b6cb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5fa8d3;
        }
      `}</style>
    </div>
  );
};

export default YourFriend;
