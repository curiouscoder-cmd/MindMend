import React, { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';

const CommunityForums = ({ userProgress, currentUser }) => {
  const [activeTab, setActiveTab] = useState('forums');
  const [selectedForum, setSelectedForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Enhanced forum data with real-time features
  const [forums, setForums] = useState([
    {
      id: 'exam_stress',
      name: 'Exam Stress Support',
      description: 'Support for students dealing with exam anxiety and academic pressure',
      category: 'Academic',
      members: 234,
      posts: 156,
      isActive: true,
      recentActivity: '2 minutes ago',
      moderators: ['Dr. Maya', 'AI Assistant'],
      tags: ['exams', 'stress', 'academic', 'study-tips'],
      icon: '📚'
    },
    {
      id: 'social_anxiety',
      name: 'Social Confidence Circle',
      description: 'Building confidence in social situations and overcoming social anxiety',
      category: 'Social',
      members: 189,
      posts: 203,
      isActive: true,
      recentActivity: '15 minutes ago',
      moderators: ['Priya', 'AI Assistant'],
      tags: ['social-anxiety', 'confidence', 'relationships'],
      icon: '👥'
    },
    {
      id: 'work_stress',
      name: 'Professional Wellness',
      description: 'Managing workplace stress, burnout, and career-related anxiety',
      category: 'Professional',
      members: 156,
      posts: 89,
      isActive: true,
      recentActivity: '1 hour ago',
      moderators: ['Rohit', 'AI Assistant'],
      tags: ['work-stress', 'burnout', 'career'],
      icon: '💼'
    },
    {
      id: 'family_pressure',
      name: 'Family & Cultural Expectations',
      description: 'Navigating family pressure and cultural expectations in Indian society',
      category: 'Cultural',
      members: 298,
      posts: 167,
      isActive: true,
      recentActivity: '30 minutes ago',
      moderators: ['Dr. Maya', 'Community Leader'],
      tags: ['family', 'culture', 'expectations', 'indian-youth'],
      icon: '👨‍👩‍👧‍👦'
    },
    {
      id: 'self_care',
      name: 'Self-Care & Wellness',
      description: 'Daily wellness practices, self-care routines, and mental health tips',
      category: 'Wellness',
      members: 445,
      posts: 312,
      isActive: true,
      recentActivity: '5 minutes ago',
      moderators: ['Wellness Coach', 'AI Assistant'],
      tags: ['self-care', 'wellness', 'mindfulness', 'habits'],
      icon: '🌸'
    }
  ]);

  const [groupSessions, setGroupSessions] = useState([
    {
      id: 'morning_mindfulness',
      title: 'Morning Mindfulness Circle',
      description: 'Start your day with guided meditation and positive intentions',
      time: '8:00 AM IST',
      duration: '30 minutes',
      participants: 12,
      maxParticipants: 15,
      facilitator: 'Dr. Maya',
      category: 'Mindfulness',
      isLive: false,
      nextSession: '2024-01-21T08:00:00',
      tags: ['meditation', 'morning', 'mindfulness'],
      icon: '🌅'
    },
    {
      id: 'exam_support',
      title: 'Exam Stress Support Group',
      description: 'Peer support for students dealing with exam anxiety',
      time: '7:00 PM IST',
      duration: '45 minutes',
      participants: 8,
      maxParticipants: 12,
      facilitator: 'Arjun & Priya',
      category: 'Academic',
      isLive: true,
      nextSession: '2024-01-20T19:00:00',
      tags: ['exams', 'stress', 'peer-support'],
      icon: '📖'
    },
    {
      id: 'weekend_wellness',
      title: 'Weekend Wellness Workshop',
      description: 'Interactive workshop on building healthy weekend routines',
      time: '10:00 AM IST',
      duration: '60 minutes',
      participants: 15,
      maxParticipants: 20,
      facilitator: 'Wellness Team',
      category: 'Wellness',
      isLive: false,
      nextSession: '2024-01-21T10:00:00',
      tags: ['wellness', 'workshop', 'routine'],
      icon: '🌿'
    }
  ]);

  useEffect(() => {
    if (selectedForum) {
      loadForumPosts(selectedForum.id);
    }
  }, [selectedForum]);

  const loadForumPosts = (forumId) => {
    // Simulate loading forum posts
    const mockPosts = [
      {
        id: 'post_1',
        author: isAnonymous ? 'Anonymous Student' : 'Rahul K.',
        avatar: '👨‍🎓',
        title: 'Struggling with JEE preparation stress',
        content: 'I\'ve been preparing for JEE for the past year and the pressure is getting overwhelming. Anyone else going through this?',
        timestamp: '2 hours ago',
        likes: 12,
        replies: 8,
        category: 'Academic',
        tags: ['JEE', 'preparation', 'stress'],
        isHelpful: true
      },
      {
        id: 'post_2',
        author: 'Anonymous',
        avatar: '👩‍💼',
        title: 'Family expectations vs personal goals',
        content: 'My family wants me to pursue engineering, but I\'m passionate about arts. How do I handle this conflict?',
        timestamp: '4 hours ago',
        likes: 23,
        replies: 15,
        category: 'Cultural',
        tags: ['family', 'career', 'expectations'],
        isHelpful: true
      },
      {
        id: 'post_3',
        author: 'Meditation Buddy',
        avatar: '🧘‍♀️',
        title: 'Daily meditation routine that changed my life',
        content: 'Sharing my 10-minute morning meditation routine that helped me manage anxiety better. Would love to hear your experiences too!',
        timestamp: '1 day ago',
        likes: 45,
        replies: 22,
        category: 'Wellness',
        tags: ['meditation', 'routine', 'anxiety'],
        isHelpful: true
      }
    ];
    setPosts(mockPosts);
  };

  const handleJoinSession = async (sessionId) => {
    const session = groupSessions.find(s => s.id === sessionId);
    if (session && session.participants < session.maxParticipants) {
      // Update participant count
      setGroupSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, participants: s.participants + 1 }
          : s
      ));

      // Show confirmation
      alert(`Successfully joined "${session.title}"! You'll receive a reminder 15 minutes before the session.`);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const post = {
      id: `post_${Date.now()}`,
      author: isAnonymous ? 'Anonymous' : currentUser?.name || 'User',
      avatar: '👤',
      title: newPost.substring(0, 50) + (newPost.length > 50 ? '...' : ''),
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      replies: 0,
      category: selectedForum?.category || 'General',
      tags: [],
      isHelpful: false
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');

    // AI moderation check
    const moderationResult = await checkContentModeration(newPost);
    if (moderationResult.needsReview) {
      console.log('Post flagged for review:', moderationResult.reason);
    }
  };

  const checkContentModeration = async (content) => {
    // Simple content moderation
    const harmfulKeywords = ['suicide', 'self-harm', 'kill', 'die'];
    const needsReview = harmfulKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (needsReview) {
      return {
        needsReview: true,
        reason: 'Contains potentially harmful content',
        action: 'escalate_to_professional'
      };
    }

    return { needsReview: false };
  };

  const categories = ['all', 'Academic', 'Social', 'Professional', 'Cultural', 'Wellness'];

  const filteredForums = selectedCategory === 'all' 
    ? forums 
    : forums.filter(forum => forum.category === selectedCategory);

  const ForumCard = ({ forum }) => (
    <div 
      className="card hover:shadow-lg transition-all cursor-pointer border-l-4 border-primary-500"
      onClick={() => setSelectedForum(forum)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">{forum.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-calm-800 mb-1">{forum.name}</h3>
            <p className="text-calm-600 text-sm mb-3">{forum.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {forum.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-sm text-calm-500">
              <span className="flex items-center space-x-1">
                <span>👥</span>
                <span>{forum.members} members</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>💬</span>
                <span>{forum.posts} posts</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${forum.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <span>{forum.recentActivity}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`px-2 py-1 text-xs rounded-full ${
            forum.category === 'Academic' ? 'bg-blue-100 text-blue-700' :
            forum.category === 'Social' ? 'bg-green-100 text-green-700' :
            forum.category === 'Professional' ? 'bg-purple-100 text-purple-700' :
            forum.category === 'Cultural' ? 'bg-orange-100 text-orange-700' :
            'bg-pink-100 text-pink-700'
          }`}>
            {forum.category}
          </span>
        </div>
      </div>
    </div>
  );

  const SessionCard = ({ session }) => (
    <div className="card border-l-4 border-green-500">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">{session.icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-calm-800">{session.title}</h3>
              {session.isLive && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full animate-pulse">
                  🔴 LIVE
                </span>
              )}
            </div>
            
            <p className="text-calm-600 text-sm mb-3">{session.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-calm-600 mb-3">
              <div className="flex items-center space-x-2">
                <span>🕐</span>
                <span>{session.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⏱️</span>
                <span>{session.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👨‍🏫</span>
                <span>{session.facilitator}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>{session.participants}/{session.maxParticipants} joined</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {session.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <button
            onClick={() => handleJoinSession(session.id)}
            disabled={session.participants >= session.maxParticipants}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              session.isLive 
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : session.participants >= session.maxParticipants
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {session.isLive ? 'Join Now' : 
             session.participants >= session.maxParticipants ? 'Full' : 'Join Session'}
          </button>
        </div>
      </div>
    </div>
  );

  if (selectedForum) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Forum Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedForum(null)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <span>←</span>
            <span>Back to Forums</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-calm-800 flex items-center space-x-2">
              <span className="text-3xl">{selectedForum.icon}</span>
              <span>{selectedForum.name}</span>
            </h1>
            <p className="text-calm-600">{selectedForum.description}</p>
          </div>
          
          <div className="text-right text-sm text-calm-500">
            <div>{selectedForum.members} members</div>
            <div>{selectedForum.posts} posts</div>
          </div>
        </div>

        {/* Create Post */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-calm-800 mb-4">Share Your Thoughts</h3>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind? Share your experience, ask for advice, or offer support to others..."
            className="w-full p-3 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows="4"
          />
          
          <div className="flex items-center justify-between mt-4">
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
              onClick={handleCreatePost}
              disabled={!newPost.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Share Post
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="card">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{post.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-calm-800">{post.author}</h4>
                    <span className="text-sm text-calm-500">{post.timestamp}</span>
                    {post.isHelpful && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Helpful
                      </span>
                    )}
                  </div>
                  
                  <h5 className="font-medium text-calm-800 mb-2">{post.title}</h5>
                  <p className="text-calm-700 mb-3">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-calm-100 text-calm-600 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-calm-500">
                    <button className="flex items-center space-x-1 hover:text-primary-600">
                      <span>👍</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-primary-600">
                      <span>💬</span>
                      <span>{post.replies} replies</span>
                    </button>
                    <button className="hover:text-primary-600">Share</button>
                    <button className="hover:text-primary-600">Report</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-calm-800 mb-4">Community Support</h1>
        <p className="text-calm-600 max-w-2xl mx-auto">
          Connect with peers, share experiences, and find support in our safe, moderated community spaces.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'forums', label: 'Discussion Forums', icon: '💬' },
            { id: 'sessions', label: 'Group Sessions', icon: '👥' },
            { id: 'stories', label: 'Success Stories', icon: '🌟' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'forums' && (
        <div>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-calm-100 text-calm-700 hover:bg-calm-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>

          {/* Forums Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredForums.map((forum) => (
              <ForumCard key={forum.id} forum={forum} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {groupSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockData.communityData.successStories.map((story) => (
            <div key={story.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-calm-800">{story.title}</h3>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  {story.category}
                </span>
              </div>
              
              <p className="text-calm-700 mb-4">{story.excerpt}</p>
              
              <div className="flex items-center justify-between text-sm text-calm-500">
                <span>By {story.author}</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <span>👍</span>
                    <span>{story.likes}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{story.comments}</span>
                  </span>
                  <span>{story.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Community Guidelines */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <span className="text-xl mr-2">📋</span>
          Community Guidelines
        </h3>
        <div className="text-blue-700 text-sm space-y-2">
          <p>• <strong>Be Respectful:</strong> Treat all community members with kindness and respect</p>
          <p>• <strong>Stay Anonymous:</strong> Protect your privacy and others' by not sharing personal details</p>
          <p>• <strong>No Medical Advice:</strong> Share experiences, not medical recommendations</p>
          <p>• <strong>Crisis Support:</strong> If someone mentions self-harm, encourage professional help immediately</p>
          <p>• <strong>Report Issues:</strong> Help us maintain a safe space by reporting inappropriate content</p>
        </div>
      </div>
    </div>
  );
};

export default CommunityForums;
