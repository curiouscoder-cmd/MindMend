import React, { useState } from 'react';

const Community = ({ userProgress }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');

  const communityPosts = [
    {
      id: 1,
      user: { name: 'Sarah M.', avatar: '👩‍💼', level: 8 },
      content: 'Just completed my 30-day streak! The breathing exercises have been life-changing. 🌟',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 5,
      mood: 'happy',
      anonymous: false
    },
    {
      id: 2,
      user: { name: 'Anonymous', avatar: '🌸', level: 3 },
      content: 'Having a tough day but the grounding exercise really helped me center myself. Thank you MindMend community! 💙',
      timestamp: '4 hours ago',
      likes: 18,
      comments: 8,
      mood: 'anxious',
      anonymous: true
    },
    {
      id: 3,
      user: { name: 'Mike R.', avatar: '👨‍💻', level: 12 },
      content: 'Pro tip: I do my morning CBT exercise right after my coffee. It sets such a positive tone for the day! ☕️✨',
      timestamp: '1 day ago',
      likes: 31,
      comments: 12,
      mood: 'happy',
      anonymous: false
    }
  ];

  const supportGroups = [
    {
      id: 1,
      name: 'Anxiety Support Circle',
      members: 1247,
      description: 'A safe space to share experiences and coping strategies for anxiety',
      icon: '💙',
      isJoined: true
    },
    {
      id: 2,
      name: 'Mindful Professionals',
      members: 892,
      description: 'Workplace wellness and stress management for busy professionals',
      icon: '💼',
      isJoined: false
    },
    {
      id: 3,
      name: 'Daily Gratitude',
      members: 2156,
      description: 'Share daily gratitude and positive affirmations',
      icon: '🌟',
      isJoined: true
    },
    {
      id: 4,
      name: 'Sleep & Relaxation',
      members: 743,
      description: 'Tips and techniques for better sleep and relaxation',
      icon: '🌙',
      isJoined: false
    }
  ];

  const challenges = [
    {
      id: 1,
      name: '7-Day Mindfulness Challenge',
      participants: 1543,
      description: 'Complete one mindfulness exercise daily for a week',
      progress: 4,
      total: 7,
      reward: 'Mindful Warrior Badge',
      endDate: '3 days left'
    },
    {
      id: 2,
      name: 'Gratitude Month',
      participants: 2891,
      description: 'Share one thing you\'re grateful for each day',
      progress: 12,
      total: 30,
      reward: 'Gratitude Master Badge',
      endDate: '18 days left'
    }
  ];

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'happy': return 'text-yellow-600 bg-yellow-100';
      case 'anxious': return 'text-orange-600 bg-orange-100';
      case 'sad': return 'text-blue-600 bg-blue-100';
      case 'stressed': return 'text-red-600 bg-red-100';
      default: return 'text-calm-600 bg-calm-100';
    }
  };

  const handlePost = () => {
    if (newPost.trim()) {
      // In a real app, this would send to backend
      console.log('New post:', newPost);
      setNewPost('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-calm-800 mb-4">
          MindMend Community
        </h1>
        <p className="text-blue-900">
          Connect, share, and grow together on your wellness journey
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-calm-100 p-1 rounded-lg">
        {[
          { id: 'feed', label: 'Community Feed', icon: '📱' },
          { id: 'groups', label: 'Support Groups', icon: '👥' },
          { id: 'challenges', label: 'Challenges', icon: '🏆' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-calm-600 hover:text-calm-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Community Feed */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Create Post */}
          <div className="card">
            <h3 className="text-lg font-semibold text-calm-800 mb-4">Share with the community</h3>
            <div className="space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your wellness journey, insights, or encouragement..."
                className="w-full p-4 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-calm-600">Post anonymously</span>
                  </label>
                  <select className="text-sm border border-calm-200 rounded px-2 py-1">
                    <option>Current mood: Happy</option>
                    <option>Current mood: Anxious</option>
                    <option>Current mood: Sad</option>
                    <option>Current mood: Stressed</option>
                  </select>
                </div>
                <button 
                  onClick={handlePost}
                  disabled={!newPost.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <div key={post.id} className="card">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">{post.user.avatar}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-calm-800">{post.user.name}</h4>
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        Level {post.user.level}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getMoodColor(post.mood)}`}>
                        {post.mood}
                      </span>
                      <span className="text-sm text-calm-500">{post.timestamp}</span>
                    </div>
                    <p className="text-calm-700 mb-4">{post.content}</p>
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-calm-600 hover:text-primary-600">
                        <span>❤️</span>
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-calm-600 hover:text-primary-600">
                        <span>💬</span>
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-calm-600 hover:text-primary-600">
                        <span>🔗</span>
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Groups */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supportGroups.map((group) => (
              <div key={group.id} className="card">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{group.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-calm-800 mb-2">{group.name}</h3>
                    <p className="text-sm text-calm-600 mb-3">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-calm-500">{group.members.toLocaleString()} members</span>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        group.isJoined
                          ? 'bg-calm-100 text-calm-700 hover:bg-calm-200'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}>
                        {group.isJoined ? 'Joined' : 'Join Group'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenges */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-calm-800 mb-2">{challenge.name}</h3>
                  <p className="text-calm-600 mb-2">{challenge.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-calm-500">
                    <span>👥 {challenge.participants.toLocaleString()} participants</span>
                    <span>⏰ {challenge.endDate}</span>
                  </div>
                </div>
                <button className="btn-primary">
                  Join Challenge
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-900">Your Progress</span>
                  <span className="text-calm-800 font-medium">
                    {challenge.progress}/{challenge.total} days
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-primary-600 font-medium">
                  Reward: {challenge.reward}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
