import React, { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';
import databaseService from '../services/databaseService';
import metricsService from '../services/metricsService';

const MicroCommunities = ({ userId, userProfile }) => {
  const [activeCommunities, setActiveCommunities] = useState([]);
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [communityFilter, setCommunityFilter] = useState('all');

  useEffect(() => {
    loadCommunities();
    if (selectedCommunity) {
      loadCommunityMessages(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const loadCommunities = async () => {
    // Generate micro-communities based on user profile and current needs
    const communities = [
      {
        id: 'exam_stress_micro',
        name: 'Exam Warriors',
        description: 'Small group for students dealing with exam anxiety',
        type: 'academic',
        size: 8,
        maxSize: 12,
        isActive: true,
        privacy: 'anonymous',
        mood: 'stressed',
        tags: ['exams', 'anxiety', 'students'],
        lastActivity: '2 minutes ago',
        icon: '📚',
        color: 'bg-blue-100 text-blue-800',
        moderator: 'AI Assistant',
        supportLevel: 'peer',
        activityLevel: 'high'
      },
      {
        id: 'morning_mindfulness',
        name: 'Dawn Meditators',
        description: 'Early risers practicing mindfulness together',
        type: 'wellness',
        size: 6,
        maxSize: 10,
        isActive: true,
        privacy: 'anonymous',
        mood: 'calm',
        tags: ['meditation', 'morning', 'routine'],
        lastActivity: '5 minutes ago',
        icon: '🌅',
        color: 'bg-orange-100 text-orange-800',
        moderator: 'Wellness Coach',
        supportLevel: 'guided',
        activityLevel: 'medium'
      },
      {
        id: 'social_anxiety_circle',
        name: 'Confidence Builders',
        description: 'Safe space for overcoming social anxiety',
        type: 'social',
        size: 5,
        maxSize: 8,
        isActive: true,
        privacy: 'anonymous',
        mood: 'anxious',
        tags: ['social-anxiety', 'confidence', 'support'],
        lastActivity: '10 minutes ago',
        icon: '🤝',
        color: 'bg-green-100 text-green-800',
        moderator: 'Peer Leader',
        supportLevel: 'peer',
        activityLevel: 'high'
      },
      {
        id: 'work_stress_relief',
        name: 'Professional Wellness',
        description: 'Working professionals managing stress',
        type: 'professional',
        size: 7,
        maxSize: 12,
        isActive: true,
        privacy: 'anonymous',
        mood: 'stressed',
        tags: ['work', 'stress', 'professional'],
        lastActivity: '15 minutes ago',
        icon: '💼',
        color: 'bg-purple-100 text-purple-800',
        moderator: 'Career Coach',
        supportLevel: 'professional',
        activityLevel: 'medium'
      },
      {
        id: 'family_pressure_support',
        name: 'Family Harmony',
        description: 'Navigating family expectations and pressure',
        type: 'cultural',
        size: 9,
        maxSize: 15,
        isActive: true,
        privacy: 'anonymous',
        mood: 'conflicted',
        tags: ['family', 'expectations', 'culture'],
        lastActivity: '20 minutes ago',
        icon: '👨‍👩‍👧‍👦',
        color: 'bg-pink-100 text-pink-800',
        moderator: 'Cultural Counselor',
        supportLevel: 'guided',
        activityLevel: 'high'
      },
      {
        id: 'creative_expression',
        name: 'Art Therapy Circle',
        description: 'Express emotions through creative activities',
        type: 'creative',
        size: 4,
        maxSize: 8,
        isActive: true,
        privacy: 'anonymous',
        mood: 'creative',
        tags: ['art', 'expression', 'creativity'],
        lastActivity: '30 minutes ago',
        icon: '🎨',
        color: 'bg-yellow-100 text-yellow-800',
        moderator: 'Art Therapist',
        supportLevel: 'guided',
        activityLevel: 'low'
      }
    ];

    // Filter based on user's current mood and preferences
    const recommended = communities.filter(community => 
      userProfile?.challenges?.some(challenge => 
        community.tags.includes(challenge.toLowerCase())
      ) || community.mood === userProfile?.currentMood
    );

    setAvailableCommunities(communities);
    setActiveCommunities(recommended.slice(0, 3));
  };

  const loadCommunityMessages = async (communityId) => {
    // Load recent messages for the community
    const mockMessages = [
      {
        id: 'msg_1',
        author: 'Anonymous Student',
        avatar: '👤',
        content: 'Just finished a really tough practice test. Feeling overwhelmed but trying to stay positive.',
        timestamp: '5 minutes ago',
        reactions: { support: 3, relate: 5, helpful: 1 },
        isSupported: false,
        mood: 'stressed'
      },
      {
        id: 'msg_2',
        author: 'Study Buddy',
        avatar: '📚',
        content: 'I totally understand that feeling! What helped me was breaking down the syllabus into smaller chunks. You\'ve got this! 💪',
        timestamp: '3 minutes ago',
        reactions: { support: 2, relate: 1, helpful: 4 },
        isSupported: true,
        mood: 'supportive'
      },
      {
        id: 'msg_3',
        author: 'Mindful Learner',
        avatar: '🧘‍♀️',
        content: 'Try the 4-7-8 breathing technique before your next study session. It really helps calm the nerves.',
        timestamp: '2 minutes ago',
        reactions: { support: 1, relate: 0, helpful: 6 },
        isSupported: true,
        mood: 'helpful'
      }
    ];

    setMessages(mockMessages);
  };

  const joinCommunity = async (community) => {
    if (community.size >= community.maxSize) {
      alert('This community is currently full. You\'ve been added to the waiting list.');
      return;
    }

    try {
      // Track community engagement
      metricsService.trackCommunityEngagement('join', {
        communityId: community.id,
        communityType: community.type,
        isAnonymous: true
      });

      // Update community size
      const updatedCommunity = { ...community, size: community.size + 1 };
      setSelectedCommunity(updatedCommunity);
      
      // Add to active communities
      setActiveCommunities(prev => {
        const exists = prev.find(c => c.id === community.id);
        if (!exists) {
          return [...prev, updatedCommunity];
        }
        return prev.map(c => c.id === community.id ? updatedCommunity : c);
      });

      // Show welcome message
      const welcomeMessage = {
        id: `welcome_${Date.now()}`,
        author: 'Community Assistant',
        avatar: '🤖',
        content: `Welcome to ${community.name}! This is a safe, anonymous space for support and sharing. Feel free to introduce yourself or just listen - whatever feels comfortable.`,
        timestamp: 'just now',
        reactions: {},
        isSupported: true,
        mood: 'welcoming'
      };

      setMessages(prev => [welcomeMessage, ...prev]);

    } catch (error) {
      console.error('Error joining community:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCommunity) return;

    const message = {
      id: `msg_${Date.now()}`,
      author: isAnonymous ? 'Anonymous' : userProfile?.name || 'User',
      avatar: isAnonymous ? '👤' : '👨‍💻',
      content: newMessage,
      timestamp: 'just now',
      reactions: {},
      isSupported: false,
      mood: 'neutral'
    };

    try {
      // Save to database
      await databaseService.saveForumPost(userId, {
        forumId: selectedCommunity.id,
        title: '',
        content: newMessage,
        isAnonymous,
        tags: selectedCommunity.tags
      });

      // Track engagement
      metricsService.trackCommunityEngagement('post', {
        communityId: selectedCommunity.id,
        isAnonymous,
        messageLength: newMessage.length
      });

      setMessages(prev => [message, ...prev]);
      setNewMessage('');

      // AI moderation check
      const moderationResult = await checkMessageModeration(newMessage);
      if (moderationResult.needsSupport) {
        showSupportOptions(moderationResult);
      }

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const checkMessageModeration = async (content) => {
    // Simple keyword-based moderation
    const supportKeywords = ['help', 'struggling', 'overwhelmed', 'can\'t cope', 'giving up'];
    const crisisKeywords = ['suicide', 'self-harm', 'end it all', 'no point'];
    
    const needsSupport = supportKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    const needsCrisis = crisisKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    return {
      needsSupport,
      needsCrisis,
      supportLevel: needsCrisis ? 'crisis' : needsSupport ? 'moderate' : 'none'
    };
  };

  const showSupportOptions = (moderationResult) => {
    if (moderationResult.needsCrisis) {
      // Trigger crisis mode
      alert('We noticed you might be going through a difficult time. Let us connect you with immediate support resources.');
    } else if (moderationResult.needsSupport) {
      // Show gentle support options
      const supportMessage = {
        id: `support_${Date.now()}`,
        author: 'Support Assistant',
        avatar: '💚',
        content: 'I noticed you might be going through a tough time. Remember, you\'re not alone. Would you like to try a quick breathing exercise or connect with additional support resources?',
        timestamp: 'just now',
        reactions: {},
        isSupported: true,
        mood: 'supportive'
      };
      
      setMessages(prev => [supportMessage, ...prev]);
    }
  };

  const reactToMessage = async (messageId, reactionType) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        return { ...msg, reactions };
      }
      return msg;
    }));

    // Track reaction
    metricsService.trackCommunityEngagement('react', {
      messageId,
      reactionType,
      communityId: selectedCommunity?.id
    });
  };

  const CommunityCard = ({ community, isJoined = false }) => (
    <div className={`card hover:shadow-lg transition-all cursor-pointer border-l-4 ${
      isJoined ? 'border-primary-500 bg-primary-50' : 'border-calm-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">{community.icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-calm-800">{community.name}</h3>
              {isJoined && <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full">Joined</span>}
            </div>
            <p className="text-calm-600 text-sm mb-3">{community.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {community.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-calm-100 text-calm-600 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-sm text-calm-500">
              <span className="flex items-center space-x-1">
                <span>👥</span>
                <span>{community.size}/{community.maxSize} members</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${
                  community.activityLevel === 'high' ? 'bg-green-400' :
                  community.activityLevel === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></span>
                <span>{community.lastActivity}</span>
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${community.color}`}>
                {community.type}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {!isJoined ? (
            <button
              onClick={() => joinCommunity(community)}
              disabled={community.size >= community.maxSize}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                community.size >= community.maxSize
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {community.size >= community.maxSize ? 'Full' : 'Join'}
            </button>
          ) : (
            <button
              onClick={() => setSelectedCommunity(community)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
            >
              Enter
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const MessageComponent = ({ message }) => (
    <div className="p-4 bg-white rounded-lg border border-calm-200 hover:shadow-sm transition-all">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{message.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-calm-800">{message.author}</span>
            <span className="text-sm text-calm-500">{message.timestamp}</span>
            {message.isSupported && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                ✓ Supportive
              </span>
            )}
          </div>
          
          <p className="text-calm-700 mb-3 leading-relaxed">{message.content}</p>
          
          <div className="flex items-center space-x-4">
            {['support', 'relate', 'helpful'].map((reaction) => (
              <button
                key={reaction}
                onClick={() => reactToMessage(message.id, reaction)}
                className="flex items-center space-x-1 text-sm text-calm-500 hover:text-primary-600 transition-colors"
              >
                <span>
                  {reaction === 'support' ? '💚' : reaction === 'relate' ? '🤝' : '💡'}
                </span>
                <span>{message.reactions[reaction] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (selectedCommunity) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Community Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedCommunity(null)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <span>←</span>
            <span>Back to Communities</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-calm-800 flex items-center space-x-2">
              <span className="text-3xl">{selectedCommunity.icon}</span>
              <span>{selectedCommunity.name}</span>
            </h1>
            <p className="text-calm-600">{selectedCommunity.description}</p>
          </div>
          
          <div className="text-right text-sm text-calm-500">
            <div>{selectedCommunity.size}/{selectedCommunity.maxSize} members</div>
            <div>Moderated by {selectedCommunity.moderator}</div>
          </div>
        </div>

        {/* Message Input */}
        <div className="card mb-6">
          <div className="space-y-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts, ask for support, or offer encouragement..."
              className="w-full p-3 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="3"
            />
            
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-calm-600">Post anonymously</span>
              </label>
              
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
        </div>

        {/* Community Guidelines */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Community Guidelines</h3>
          <div className="text-blue-700 text-sm space-y-1">
            <p>• Be kind and supportive to all members</p>
            <p>• Respect anonymity and privacy</p>
            <p>• Share experiences, not advice unless asked</p>
            <p>• Report concerning messages to moderators</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-calm-800 mb-4">Micro-Communities</h1>
        <p className="text-calm-600 max-w-2xl mx-auto">
          Join small, anonymous support groups with people who understand your challenges. 
          Safe spaces for authentic sharing and peer support.
        </p>
      </div>

      {/* Filter */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          {['all', 'academic', 'social', 'professional', 'wellness', 'cultural'].map((filter) => (
            <button
              key={filter}
              onClick={() => setCommunityFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                communityFilter === filter
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Active Communities */}
      {activeCommunities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-calm-800 mb-4">Your Communities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCommunities.map((community) => (
              <CommunityCard key={community.id} community={community} isJoined={true} />
            ))}
          </div>
        </div>
      )}

      {/* Available Communities */}
      <div>
        <h2 className="text-xl font-semibold text-calm-800 mb-4">Discover Communities</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {availableCommunities
            .filter(community => 
              communityFilter === 'all' || community.type === communityFilter
            )
            .filter(community => 
              !activeCommunities.find(active => active.id === community.id)
            )
            .map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-12 p-6 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
        <h3 className="font-semibold text-primary-800 mb-3 flex items-center">
          <span className="text-xl mr-2">✨</span>
          Why Micro-Communities Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-primary-700 text-sm">
          <div>
            <strong>Small & Safe:</strong> Limited size ensures intimate, supportive environment
          </div>
          <div>
            <strong>Anonymous:</strong> Share freely without judgment or identity concerns
          </div>
          <div>
            <strong>Moderated:</strong> AI and human moderation ensure positive interactions
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicroCommunities;
