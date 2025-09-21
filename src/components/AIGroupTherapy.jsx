import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/geminiService';

const AIGroupTherapy = ({ userProgress, currentMood }) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sessionTopic, setSessionTopic] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  // AI Personas for group therapy
  const therapistPersonas = [
    {
      id: 'dr_maya',
      name: 'Dr. Maya',
      role: 'Therapist',
      avatar: '👩‍⚕️',
      personality: 'Warm, professional, uses CBT techniques',
      color: 'bg-blue-100 text-blue-800'
    }
  ];

  const peerPersonas = [
    {
      id: 'arjun',
      name: 'Arjun',
      role: 'Peer',
      avatar: '👨‍🎓',
      personality: 'Engineering student, deals with academic pressure, supportive',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'priya',
      name: 'Priya',
      role: 'Peer',
      avatar: '👩‍💼',
      personality: 'Working professional, anxiety management, empathetic',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'rohit',
      name: 'Rohit',
      role: 'Peer',
      avatar: '👨‍💻',
      personality: 'Tech worker, stress management, practical advice',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const sessionTopics = [
    {
      id: 'academic_stress',
      title: 'Managing Academic Pressure',
      description: 'Strategies for handling exam stress and academic expectations',
      icon: '📚'
    },
    {
      id: 'social_anxiety',
      title: 'Overcoming Social Anxiety',
      description: 'Building confidence in social situations',
      icon: '👥'
    },
    {
      id: 'work_life_balance',
      title: 'Work-Life Balance',
      description: 'Managing professional stress and personal well-being',
      icon: '⚖️'
    },
    {
      id: 'self_esteem',
      title: 'Building Self-Esteem',
      description: 'Developing a positive self-image and confidence',
      icon: '💪'
    },
    {
      id: 'family_pressure',
      title: 'Family Expectations',
      description: 'Navigating family pressure and cultural expectations',
      icon: '👨‍👩‍👧‍👦'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async (topic) => {
    setSessionTopic(topic.title);
    setSessionActive(true);
    setMessages([]);
    
    // Select random participants (therapist + 2-3 peers)
    const selectedPeers = peerPersonas
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 2));
    
    setParticipants([...therapistPersonas, ...selectedPeers]);

    // Generate opening message from therapist
    const openingMessage = {
      id: Date.now(),
      sender: therapistPersonas[0],
      content: `Welcome everyone to today's group session on "${topic.title}". This is a safe space where we can share our experiences and support each other. Who would like to start by sharing what brings them here today?`,
      timestamp: new Date(),
      type: 'ai'
    };

    setMessages([openingMessage]);
  };

  const generateGroupResponse = async (userMessage) => {
    setIsGenerating(true);
    
    try {
      // Create context for the AI group therapy session
      const sessionContext = `
You are facilitating an AI group therapy session on "${sessionTopic}". 

Participants:
${participants.map(p => `- ${p.name} (${p.role}): ${p.personality}`).join('\n')}

User just said: "${userMessage}"

Generate 1-2 responses from different participants that:
1. Acknowledge the user's sharing
2. Provide supportive, culturally sensitive responses for Indian youth
3. Share relevant experiences or professional guidance
4. Encourage further discussion

Format as JSON array:
[
  {
    "participant": "participant_id",
    "message": "response message",
    "tone": "supportive/professional/empathetic"
  }
]
`;

      // For demo purposes, generate simulated responses
      // In production, this would call the Gemini API
      const responses = await generateSimulatedResponses(userMessage, sessionTopic, participants);
      
      // Add responses with delays to simulate natural conversation
      responses.forEach((response, index) => {
        setTimeout(() => {
          const participant = participants.find(p => p.id === response.participant) || participants[0];
          const aiMessage = {
            id: Date.now() + index,
            sender: participant,
            content: response.message,
            timestamp: new Date(),
            type: 'ai'
          };
          setMessages(prev => [...prev, aiMessage]);
        }, (index + 1) * 2000); // 2 second delays between responses
      });

    } catch (error) {
      console.error('Error generating group response:', error);
    }
    
    setIsGenerating(false);
  };

  const generateSimulatedResponses = async (userMessage, topic, participants) => {
    // Simulated responses based on topic and user input
    const responses = [];
    
    if (topic.includes('Academic')) {
      responses.push({
        participant: 'dr_maya',
        message: "Thank you for sharing that. Academic pressure is very common among students in India. What you're feeling is completely valid. Let's explore some coping strategies together.",
        tone: 'professional'
      });
      
      responses.push({
        participant: 'arjun',
        message: "I totally relate to what you're saying. I've been there too with exam stress. What helped me was breaking down my study schedule into smaller, manageable chunks. Have you tried that?",
        tone: 'supportive'
      });
    } else if (topic.includes('Social')) {
      responses.push({
        participant: 'priya',
        message: "Social anxiety can feel overwhelming, but you're not alone in this. I used to avoid social gatherings completely. Small steps really do make a difference.",
        tone: 'empathetic'
      });
      
      responses.push({
        participant: 'dr_maya',
        message: "That's a great insight, Priya. Gradual exposure combined with breathing techniques can be very effective. Would you like to try a quick grounding exercise together?",
        tone: 'professional'
      });
    } else {
      responses.push({
        participant: 'dr_maya',
        message: "Thank you for opening up. Your willingness to share shows real courage. How has this been affecting your daily life?",
        tone: 'professional'
      });
    }
    
    return responses;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: { name: 'You', avatar: '👤', color: 'bg-primary-100 text-primary-800' },
      content: userInput,
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // Generate AI responses
    await generateGroupResponse(userInput);
  };

  const endSession = () => {
    const closingMessage = {
      id: Date.now(),
      sender: therapistPersonas[0],
      content: "Thank you everyone for sharing today. Remember, healing is a journey, and you're all taking important steps. Take care of yourselves, and we'll see you next time.",
      timestamp: new Date(),
      type: 'ai'
    };

    setMessages(prev => [...prev, closingMessage]);
    
    setTimeout(() => {
      setSessionActive(false);
      setMessages([]);
      setParticipants([]);
    }, 3000);
  };

  if (!sessionActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-calm-800 mb-4">AI Group Therapy</h1>
          <p className="text-calm-600 max-w-2xl mx-auto">
            Join a supportive AI-simulated group therapy session. Experience multiple perspectives 
            from a professional therapist and peers who understand your challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessionTopics.map((topic) => (
            <div key={topic.id} className="card hover:shadow-lg transition-all cursor-pointer"
                 onClick={() => startSession(topic)}>
              <div className="text-center">
                <div className="text-4xl mb-4">{topic.icon}</div>
                <h3 className="text-xl font-semibold text-calm-800 mb-2">{topic.title}</h3>
                <p className="text-calm-600 text-sm mb-4">{topic.description}</p>
                <button className="btn-primary w-full">
                  Join Session
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <span className="text-xl mr-2">ℹ️</span>
            How AI Group Therapy Works
          </h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>• <strong>Safe Environment:</strong> Practice sharing in a judgment-free AI simulation</p>
            <p>• <strong>Multiple Perspectives:</strong> Get insights from both professional and peer viewpoints</p>
            <p>• <strong>Cultural Sensitivity:</strong> Designed specifically for Indian youth experiences</p>
            <p>• <strong>Available 24/7:</strong> Access support whenever you need it</p>
            <p>• <strong>Privacy Protected:</strong> Your conversations are private and secure</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Session Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-calm-800">{sessionTopic}</h2>
            <p className="text-calm-600 text-sm">Group Therapy Session</p>
          </div>
          <button
            onClick={endSession}
            className="btn-secondary text-sm"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Participants */}
      <div className="card mb-6">
        <h3 className="font-semibold text-calm-800 mb-3">Session Participants</h3>
        <div className="flex flex-wrap gap-3">
          {participants.map((participant) => (
            <div key={participant.id} className={`flex items-center space-x-2 px-3 py-2 rounded-full ${participant.color}`}>
              <span className="text-lg">{participant.avatar}</span>
              <span className="text-sm font-medium">{participant.name}</span>
              <span className="text-xs opacity-75">({participant.role})</span>
            </div>
          ))}
          <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-primary-100 text-primary-800">
            <span className="text-lg">👤</span>
            <span className="text-sm font-medium">You</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="card mb-6">
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.sender.color || 'bg-gray-100'}`}>
                <span className="text-lg">{message.sender.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-calm-800">{message.sender.name}</span>
                  <span className="text-xs text-calm-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-calm-700 leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isGenerating && (
            <div className="flex items-center space-x-2 text-calm-500">
              <div className="animate-spin w-4 h-4 border-2 border-calm-300 border-t-transparent rounded-full"></div>
              <span className="text-sm">Participants are responding...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-calm-100 p-4">
          <div className="flex space-x-3">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Share your thoughts with the group..."
              className="flex-1 p-3 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="2"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isGenerating}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Session Tips */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-800 mb-2 flex items-center">
          <span className="text-lg mr-2">💡</span>
          Session Tips
        </h4>
        <div className="text-green-700 text-sm space-y-1">
          <p>• Be open and honest - this is a safe space</p>
          <p>• Listen actively to others' experiences</p>
          <p>• Ask questions and offer support to peers</p>
          <p>• Take notes on insights that resonate with you</p>
        </div>
      </div>
    </div>
  );
};

export default AIGroupTherapy;
