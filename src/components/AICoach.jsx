import React, { useState, useEffect, useRef } from 'react';

const AICoach = ({ userProgress, moodHistory, currentMood }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coachPersonality, setCoachPersonality] = useState('supportive');
  const messagesEndRef = useRef(null);

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

  const generateWelcomeMessage = () => {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';
    
    const welcomeMessages = [
      `${greeting}! I'm Mira, your AI wellness coach. I'm here to support you on your mental wellness journey. How are you feeling today?`,
      `${greeting}! I'm so glad you're here. Taking time for your mental wellness shows real strength. What's on your mind?`,
      `${greeting}! I'm Mira, and I'm here to listen and support you. Every step you take toward wellness matters. How can I help you today?`
    ];
    
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  };

  const generateAIResponse = (userMessage) => {
    const responses = {
      anxious: [
        "I hear that you're feeling anxious. That's completely valid - anxiety is your mind's way of trying to protect you. Let's try a quick grounding exercise together. Can you name 3 things you can see right now?",
        "Anxiety can feel overwhelming, but you're not alone in this. Your breathing is a powerful tool - would you like to try a calming breathing exercise with me?",
        "I understand anxiety can be really challenging. Remember, this feeling is temporary. You've gotten through difficult moments before, and you can get through this one too. What usually helps you feel more grounded?"
      ],
      sad: [
        "I'm sorry you're feeling sad right now. Your feelings are valid, and it's okay to sit with them. Sometimes sadness is our heart's way of processing. Would you like to talk about what's contributing to these feelings?",
        "Sadness can feel heavy, but please know that you matter and this feeling will pass. You're taking a positive step by being here. What's one small thing that usually brings you a tiny bit of comfort?",
        "I see you're going through a tough time. It takes courage to reach out when you're feeling low. You don't have to carry this alone. Would a gentle self-compassion exercise help right now?"
      ],
      stressed: [
        "Stress can make everything feel urgent and overwhelming. Let's take a step back together. What's the most pressing thing on your mind right now? Sometimes breaking it down helps.",
        "I can sense you're feeling stressed. Your nervous system is in high alert mode, which is exhausting. Would you like to try a quick stress-relief technique to help your body calm down?",
        "Stress is your body's response to feeling overwhelmed. You're handling a lot right now, and that's tough. What if we focused on just the next small step instead of everything at once?"
      ],
      happy: [
        "I love hearing that you're feeling good! Happiness is wonderful to experience and even better when we can savor it. What's contributing to your positive mood today?",
        "That's fantastic! When we're feeling good, it's a great time to build on that positive energy. Would you like to do a gratitude practice to amplify these good feelings?",
        "Your positive energy is wonderful! These are the moments worth celebrating. What's one thing you're particularly grateful for right now?"
      ],
      general: [
        "Thank you for sharing that with me. I'm here to listen and support you. What feels most important for you to focus on right now?",
        "I appreciate you opening up. Everyone's wellness journey is unique, and yours matters. How can I best support you today?",
        "It sounds like you have a lot on your mind. I'm here to help you work through whatever you're experiencing. What would feel most helpful right now?"
      ]
    };

    // Simple keyword detection for mood
    const lowerMessage = userMessage.toLowerCase();
    let detectedMood = 'general';
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('nervous')) {
      detectedMood = 'anxious';
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('depressed')) {
      detectedMood = 'sad';
    } else if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
      detectedMood = 'stressed';
    } else if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      detectedMood = 'happy';
    }

    const moodResponses = responses[detectedMood];
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const aiMsg = {
        id: Date.now() + 1,
        type: 'coach',
        content: aiResponse,
        timestamp: new Date(),
        mood: 'supportive'
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I'm having a tough day",
    "I'm feeling good today",
    "I need some motivation",
    "Help me relax"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse-gentle">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-calm-800">Meet Mira</h1>
            <p className="text-blue-900">Your AI Wellness Coach</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-blue-900">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Online and ready to help</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card max-h-96 overflow-hidden flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 text-calm-800 border border-purple-100'
                }`}
              >
                {message.type === 'coach' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <span className="text-xs font-medium text-purple-600">Mira</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-primary-100' : 'text-calm-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-2xl border border-purple-100">
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
        </div>

        {/* Quick Responses */}
        <div className="px-4 py-2 border-t border-calm-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(response)}
                className="px-3 py-1 bg-calm-100 hover:bg-calm-200 text-calm-700 text-xs rounded-full transition-all"
              >
                {response}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-calm-100">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 p-3 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Coach Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
          <div className="text-2xl mb-2">💭</div>
          <h3 className="font-semibold text-blue-800 mb-1">Empathetic Listening</h3>
          <p className="text-sm text-blue-900">I'm here to listen without judgment and provide support</p>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
          <div className="text-2xl mb-2">🎯</div>
          <h3 className="font-semibold text-blue-800 mb-1">Personalized Guidance</h3>
          <p className="text-sm text-blue-900">Tailored advice based on your unique situation</p>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
          <div className="text-2xl mb-2">🌱</div>
          <h3 className="font-semibent text-purple-800 mb-1">Growth Support</h3>
          <p className="text-sm text-purple-600">Helping you build resilience and coping skills</p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
