import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../services/apiService.js';
import { generatePersonalizedResponse } from '../services/personalizedChatService.js';
import { getCurrentUser } from '../services/authService.js';
import VoiceButton from './VoiceButton.jsx';
import VoiceEnabledMessage from './VoiceEnabledMessage';
import { mockData } from '../data/mockData';
import * as elevenLabsService from '../services/elevenLabsService';
import * as ttsService from '../services/ttsService';

const AICoach = ({ userProgress, moodHistory, currentMood }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coachPersonality, setCoachPersonality] = useState('supportive');
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [showRealTimeChat, setShowRealTimeChat] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = generateWelcomeMessage();
    setMessages([{
      id: 1,
      type: 'coach',
      content: welcomeMessage,
      timestamp: new Date(),
      mood: 'supportive'
    }]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Track scroll to toggle scroll-to-bottom button
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setShowScrollToBottom(!nearBottom);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
  };

  const generateWelcomeMessage = () => {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';
    const user = getCurrentUser();
    const userName = user?.displayName?.split(' ')[0] || 'friend';
    
    // Personalized welcome based on user progress
    const streak = userProgress?.streak || 0;
    const exercises = userProgress?.completedExercises || 0;
    
    let welcomeMessages = [];
    
    if (streak > 0 && exercises > 0) {
      welcomeMessages = [
        `${greeting}, ${userName}! 🌟 I see you're on a ${streak}-day streak with ${exercises} exercises completed. That's amazing dedication! How are you feeling today?`,
        `${greeting}, ${userName}! Your ${streak}-day streak shows real commitment to your wellness. I'm here to support you. What's on your mind?`,
        `${greeting}, ${userName}! ${exercises} exercises completed and counting! I'm proud of your progress. How can I help you today?`
      ];
    } else if (user && !user.isAnonymous) {
      welcomeMessages = [
        `${greeting}, ${userName}! I'm Mira, your AI wellness coach. I'm here to support you on your mental wellness journey. How are you feeling today?`,
        `${greeting}, ${userName}! I'm so glad you're here. Taking time for your mental wellness shows real strength. What's on your mind?`,
        `${greeting}, ${userName}! Every step you take toward wellness matters. How can I help you today?`
      ];
    } else {
      welcomeMessages = [
        `${greeting}! I'm Mira, your AI wellness coach. I'm here to support you on your mental wellness journey. How are you feeling today?`,
        `${greeting}! I'm so glad you're here. Taking time for your mental wellness shows real strength. What's on your mind?`,
        `${greeting}! I'm Mira, and I'm here to listen and support you. Every step you take toward wellness matters. How can I help you today?`
      ];
    }
    
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  };

  const generateAIResponse = async (userMessage) => {
    try {
      console.log('🤖 Generating personalized response with Mira...');
      console.log('📊 Context:', { 
        userMessage, 
        moodCount: moodHistory?.length || 0, 
        streak: userProgress?.streak || 0,
        exercises: userProgress?.completedExercises || 0
      });
      
      // Use personalized chat service with full context
      const result = await generatePersonalizedResponse(
        userMessage,
        moodHistory,
        userProgress,
        messages // Pass current conversation as context
      );
      
      console.log('✅ Personalized response generated:', {
        personalized: result.personalized,
        fallback: result.fallback,
        length: result.response?.length
      });
      
      // Return the response text
      return result.response || 'I understand. How can I help you further?';
    } catch (error) {
      console.error('AI Response Error:', error);
      // Fallback with intent handling and varied templates
      const text = userMessage.toLowerCase();

      // Simple intent detection
      const intent = (() => {
        if (/breath|breathing|ground|calm me|panic|anxious/.test(text)) return 'breathing';
        if (/motivat|encourag|inspire|push/.test(text)) return 'motivation';
        if (/tough|hard day|bad day|overwhelm|stressed/.test(text)) return 'tough_day';
        if (/gratitude|grateful|thanks/.test(text)) return 'gratitude';
        if (/sleep|insomnia|rest/.test(text)) return 'sleep';
        if (/happy|good|great|better/.test(text)) return 'celebrate';
        return 'general';
      })();

      const templates = {
        breathing: [
          "Let's try a 4-7-8 breathing together: Inhale through your nose for 4, hold for 7, exhale slowly through your mouth for 8. We can do 3 rounds. Ready for round 1?",
          "We can do a quick 5-4-3-2-1 grounding. Tell me: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Start with what you see around you.",
          "Try box breathing with me: Inhale 4 • Hold 4 • Exhale 4 • Hold 4. I'll keep time if you'd like."
        ],
        motivation: [
          "You're showing up for yourself—that's powerful. Let's set a tiny goal for the next 10 minutes. What feels doable right now?",
          "Progress > perfection. Think of one small action you can take today. I can help you pick if you'd like.",
          "Your consistency matters more than intensity. What would a 1% improvement look like right now?"
        ],
        tough_day: [
          "That sounds heavy. I'm here with you. Want to vent for 2 minutes or try a quick reset exercise?",
          "When days feel tough, breaking it into ‘next 1 step’ helps. What's one gentle next step we can take together?",
          "You're allowed to take a pause. Would you like a 3-minute reset or a supportive reflection prompt?"
        ],
        gratitude: [
          "Beautiful. Want to try a 3-line gratitude note? 1) What happened 2) Why it mattered 3) How it made you feel.",
          "Gratitude can shift our lens. What's one small thing today that felt kind, safe, or comforting?",
          "Let’s anchor this: Name one person, one place, and one ability you’re grateful for right now."
        ],
        sleep: [
          "For better sleep: dim lights, slow exhale breathing, and write down tomorrow’s top 1 task. Want a short wind-down routine?",
          "Try this: 4 slow breaths, loosen jaw and shoulders, then imagine placing your worries in a box you'll open tomorrow.",
          "We can try progressive relaxation: tense each muscle group for 5s, then release. Shall I guide you?"
        ],
        celebrate: [
          "Love that! What contributed to this feeling? Let’s note it so we can repeat it more often.",
          "That’s wonderful—let’s savor it for 10 seconds. Breathe in and name what feels good about this moment.",
          "Amazing. Want to set a tiny ritual to celebrate wins like this?"
        ],
        general: [
          "Thank you for sharing that. What feels most supportive right now—listening, a tool, or a tiny next step?",
          "I'm here with you. Would you like to unpack this, try a quick practice, or set a gentle intention?",
          "I hear you. On a scale 1-10, how intense does this feel? We can choose a practice based on that."
        ]
      };

      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

      return pick(templates[intent] ?? templates.general);
    }
  };

  const playResponseVoice = async (text) => {
    // Don't auto-play voice - let VoiceEnabledMessage handle it
    // This prevents duplicate voice playback
    console.log('ℹ️ Voice playback handled by VoiceEnabledMessage component');
    return;
  };

  const handleVoiceTranscription = (transcription) => {
    setInputMessage(transcription);
    // Auto-send after voice input
    setTimeout(() => handleSendMessage(transcription), 500);
  };

  const handleEmotionDetected = (emotion) => {
    setCurrentEmotion(emotion);
    console.log('Real-time emotion:', emotion);
  };

  const handleSendMessage = async (overrideText) => {
    const text = (overrideText ?? inputMessage).trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      emotion: currentEmotion
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setCurrentEmotion(null);
    setIsTyping(true);

    // Generate AI response
    try {
      const aiResponse = await generateAIResponse(text);
      const aiMsg = {
        id: Date.now() + 1,
        type: 'coach',
        content: aiResponse,
        timestamp: new Date(),
        mood: 'supportive'
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
      
      // Play voice response
      if (autoPlayVoice) {
        playResponseVoice(aiResponse);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-resize the textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'; // cap at ~6 rows
  }, [inputMessage]);

  // Use mock data for quick responses
  const quickResponses = [
    "I'm feeling anxious",
    "I'm having a tough day", 
    "I'm feeling good today",
    "I need some motivation",
    "Help me relax",
    "I'm stressed about exams",
    "Can you guide me through breathing?",
    "I want to practice gratitude"
  ];

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse-gentle shrink-0">
            <span className="text-xl sm:text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-calm-800">Meet Mira</h1>
            <p className="text-xs sm:text-sm text-blue-900">Your Personalized AI Wellness Coach</p>
          </div>
        </div>
        
        {/* User Context Indicator */}
        {getCurrentUser() && (
          <div className="mb-2 sm:mb-3 inline-flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200 text-xs">
            <span className="font-medium text-purple-700">
              {getCurrentUser().isAnonymous ? '🔒 Anon' : `👤 ${getCurrentUser().displayName?.split(' ')[0] || 'User'}`}
            </span>
            {userProgress?.streak > 0 && (
              <>
                <span className="text-purple-300">•</span>
                <span className="text-purple-600">🔥 {userProgress.streak}d</span>
              </>
            )}
            {userProgress?.completedExercises > 0 && (
              <>
                <span className="text-purple-300">•</span>
                <span className="text-purple-600">✅ {userProgress.completedExercises}</span>
              </>
            )}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-blue-900">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Gemini 2.5 Flash • Personalized</span>
            <span className="sm:hidden">Gemini 2.5</span>
          </div>
          
          {/* Auto-play toggle */}
          <button
            onClick={() => setAutoPlayVoice(!autoPlayVoice)}
            className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs transition-all ${
              autoPlayVoice 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={autoPlayVoice ? 'Auto-play enabled' : 'Auto-play disabled'}
          >
            <span>{autoPlayVoice ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">Auto-speak</span>
          </button>
          
        </div>
      </div>

      {/* Chat Container */}
      <div className="card flex flex-col h-[50vh] sm:h-[60vh] min-h-[24rem] sm:min-h-[28rem]">
        {/* Messages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 custom-scrollbar"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'user' ? (
                <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] flex items-start space-x-1 sm:space-x-2">
                  <div className="flex-1 px-4 py-3 rounded-2xl bg-primary-500 text-white shadow-sm">
                    <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                          em: ({node, ...props}) => <em className="italic" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="ml-2" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline 
                              ? <code className="bg-primary-600 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                              : <code className="block bg-primary-600 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="text-[9px] sm:text-[10px] mt-1 text-primary-100 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow shrink-0">
                    <span className="text-xs sm:text-sm">🧑</span>
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] flex items-start space-x-1 sm:space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow shrink-0">
                    <span className="text-sm sm:text-base">🤖</span>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-purple-100 p-2 sm:p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-purple-600">Mira</span>
                      <div className="text-[10px] text-calm-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <VoiceEnabledMessage 
                      message={message}
                      persona="mira"
                      emotion={message.mood || 'supportive'}
                      autoPlay={autoPlayVoice}
                      showControls={true}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-2xl border border-purple-100 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🤖</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          {showScrollToBottom && (
            <div className="flex justify-center">
              <button
                onClick={scrollToBottom}
                className="mt-2 px-3 py-1 text-xs bg-white border border-calm-200 rounded-full shadow hover:bg-calm-50"
              >
                Jump to latest ↓
              </button>
            </div>
          )}
        </div>

        {/* Quick Responses */}
        <div className="px-2 sm:px-4 py-2 border-t border-calm-100 overflow-x-auto">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(response)}
                className="px-2 sm:px-3 py-1 bg-calm-100 hover:bg-calm-200 text-calm-700 text-xs rounded-full transition-all shadow-sm whitespace-nowrap"
              >
                {response}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-2 sm:p-4 border-t border-calm-100 sticky bottom-0 bg-white">
          <div className="flex items-end gap-2 sm:gap-3">
            {/* Voice Button */}
            <VoiceButton
              onTranscription={handleVoiceTranscription}
              onEmotionDetected={handleEmotionDetected}
              disabled={isTyping}
            />
            
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts... 💭"
              className="flex-1 p-2 sm:p-3 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none shadow-sm text-sm"
              rows="1"
              ref={textareaRef}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="btn-primary px-3 sm:px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed shadow text-sm"
            >
              Send
            </button>
          </div>
          
          {/* Current emotion indicator */}
          {currentEmotion && (
            <div className="mt-2 flex items-center gap-2 text-sm text-navy/60">
              <span>Detected emotion:</span>
              <span className="px-2 py-1 bg-mint rounded-full capitalize font-medium">
                {currentEmotion.primaryMood}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Coach Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">💭</div>
          <h3 className="font-semibold text-blue-800 mb-1 text-sm">Empathetic Listening</h3>
          <p className="text-xs sm:text-sm text-blue-900">I'm here to listen without judgment</p>
        </div>
        
        <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🎯</div>
          <h3 className="font-semibold text-blue-800 mb-1 text-sm">Personalized Guidance</h3>
          <p className="text-xs sm:text-sm text-blue-900">Tailored advice for your situation</p>
        </div>
        
        <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">🌱</div>
          <h3 className="font-semibold text-purple-800 mb-1 text-sm">Growth Support</h3>
          <p className="text-xs sm:text-sm text-purple-600">Build resilience & coping skills</p>
        </div>
      </div>

    </div>
  );
};

export default AICoach;
