import React, { useState, useEffect } from 'react';

const AIInsights = ({ userProgress, moodHistory }) => {
  const [insights, setInsights] = useState([]);
  const [personalizedTips, setPersonalizedTips] = useState([]);
  const [moodTrends, setMoodTrends] = useState({});

  // Simulate AI analysis
  useEffect(() => {
    generateAIInsights();
    generatePersonalizedTips();
    analyzeMoodTrends();
  }, [userProgress, moodHistory]);

  const generateAIInsights = () => {
    const newInsights = [];
    
    // Streak analysis
    if (userProgress.streak >= 7) {
      newInsights.push({
        type: 'positive',
        icon: '🔥',
        title: 'Excellent Consistency!',
        message: `Your ${userProgress.streak}-day streak shows strong commitment to mental wellness. Keep it up!`,
        confidence: 95
      });
    } else if (userProgress.streak >= 3) {
      newInsights.push({
        type: 'encouraging',
        icon: '📈',
        title: 'Building Momentum',
        message: 'You\'re developing a healthy routine. Try to maintain this consistency for maximum benefit.',
        confidence: 88
      });
    }

    // Exercise completion analysis
    if (userProgress.completedExercises >= 10) {
      newInsights.push({
        type: 'achievement',
        icon: '🎯',
        title: 'Milestone Reached',
        message: 'You\'ve completed 10+ exercises! Research shows this level of engagement significantly improves mental wellness.',
        confidence: 92
      });
    }

    // Mood pattern analysis
    const recentMoods = moodHistory?.slice(-7) || [];
    const anxiousCount = recentMoods.filter(m => m === 'anxious').length;
    const happyCount = recentMoods.filter(m => m === 'happy').length;

    if (anxiousCount >= 3) {
      newInsights.push({
        type: 'concern',
        icon: '💙',
        title: 'Anxiety Pattern Detected',
        message: 'I notice increased anxiety recently. Consider focusing on breathing exercises and grounding techniques.',
        confidence: 85
      });
    }

    if (happyCount >= 4) {
      newInsights.push({
        type: 'positive',
        icon: '😊',
        title: 'Positive Mood Trend',
        message: 'Your mood has been predominantly positive lately! This suggests your wellness routine is working well.',
        confidence: 90
      });
    }

    setInsights(newInsights);
  };

  const generatePersonalizedTips = () => {
    const tips = [];
    
    // Based on most used mood
    const moodCounts = moodHistory?.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'happy'
    );

    switch (mostCommonMood) {
      case 'anxious':
        tips.push({
          icon: '🫁',
          title: 'Breathing Focus',
          tip: 'Since anxiety is common for you, try the 4-7-8 breathing technique daily, even when not anxious.',
          category: 'Preventive Care'
        });
        break;
      case 'stressed':
        tips.push({
          icon: '📝',
          title: 'Priority Planning',
          tip: 'Create a daily priority list each morning to reduce decision fatigue and stress.',
          category: 'Organization'
        });
        break;
      case 'sad':
        tips.push({
          icon: '🌱',
          title: 'Gratitude Practice',
          tip: 'Start each day by writing down 3 things you\'re grateful for to boost positive emotions.',
          category: 'Mood Lifting'
        });
        break;
      default:
        tips.push({
          icon: '🎯',
          title: 'Maintain Balance',
          tip: 'You\'re doing great! Continue your current routine and explore new mindfulness techniques.',
          category: 'Growth'
        });
    }

    // Time-based tips
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      tips.push({
        icon: '🌅',
        title: 'Morning Mindfulness',
        tip: 'Perfect time for a morning meditation or gratitude practice to set a positive tone for the day.',
        category: 'Timing'
      });
    } else if (currentHour > 18) {
      tips.push({
        icon: '🌙',
        title: 'Evening Wind-down',
        tip: 'Consider a calming breathing exercise to help transition from day to evening relaxation.',
        category: 'Timing'
      });
    }

    // Streak-based tips
    if (userProgress.streak < 3) {
      tips.push({
        icon: '🔄',
        title: 'Consistency Building',
        tip: 'Try setting a daily reminder for the same time each day to build a sustainable wellness habit.',
        category: 'Habit Formation'
      });
    }

    setPersonalizedTips(tips);
  };

  const analyzeMoodTrends = () => {
    if (!moodHistory || moodHistory.length < 3) {
      setMoodTrends({});
      return;
    }

    const recent = moodHistory.slice(-7);
    const older = moodHistory.slice(-14, -7);

    const getAverage = (moods) => {
      const scores = { happy: 4, sad: 2, anxious: 1, stressed: 1.5 };
      return moods.reduce((sum, mood) => sum + (scores[mood] || 2), 0) / moods.length;
    };

    const recentAvg = getAverage(recent);
    const olderAvg = getAverage(older);
    const trend = recentAvg - olderAvg;

    setMoodTrends({
      direction: trend > 0.2 ? 'improving' : trend < -0.2 ? 'declining' : 'stable',
      change: Math.abs(trend),
      recentScore: recentAvg,
      recommendation: trend > 0.2 
        ? 'Keep up the great work! Your mood is trending positively.'
        : trend < -0.2 
        ? 'Consider increasing your wellness activities or speaking with a professional.'
        : 'Your mood is stable. Continue your current routine.'
    });
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200 text-green-800';
      case 'concern': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'achievement': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="text-xl font-semibold text-calm-800">AI Insights</h3>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
            Beta
          </span>
        </div>
        
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm mb-2">{insight.message}</p>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs opacity-75">
                        AI Confidence: {insight.confidence}%
                      </div>
                      <div className="w-16 h-1 bg-black bg-opacity-20 rounded-full">
                        <div 
                          className="h-full bg-current rounded-full"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-calm-600">
            <span className="text-4xl mb-2 block">📊</span>
            <p>Complete more exercises to unlock AI insights!</p>
          </div>
        )}
      </div>

      {/* Mood Trends */}
      {moodTrends.direction && (
        <div className="card">
          <h3 className="text-xl font-semibold text-calm-800 mb-4">Mood Trends</h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 rounded-full ${
              moodTrends.direction === 'improving' ? 'bg-green-100' :
              moodTrends.direction === 'declining' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <span className="text-2xl">
                {moodTrends.direction === 'improving' ? '📈' :
                 moodTrends.direction === 'declining' ? '📉' : '📊'}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-calm-800 capitalize">
                {moodTrends.direction} Trend
              </h4>
              <p className="text-sm text-calm-600">{moodTrends.recommendation}</p>
            </div>
          </div>
          
          <div className="bg-calm-50 p-3 rounded-lg">
            <div className="text-sm text-calm-600 mb-1">Current Mood Score</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-calm-200 rounded-full h-2">
                <div 
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${(moodTrends.recentScore / 4) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">
                {(moodTrends.recentScore * 25).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Tips */}
      <div className="card">
        <h3 className="text-xl font-semibold text-calm-800 mb-4">Personalized Tips</h3>
        <div className="space-y-3">
          {personalizedTips.map((tip, index) => (
            <div key={index} className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-primary-800">{tip.title}</h4>
                    <span className="px-2 py-1 bg-primary-200 text-primary-700 text-xs rounded-full">
                      {tip.category}
                    </span>
                  </div>
                  <p className="text-sm text-primary-700">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-xl font-semibold text-calm-800 mb-4">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-left hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold text-blue-800">Focus Exercise</h4>
                <p className="text-sm text-blue-600">Based on your patterns</p>
              </div>
            </div>
          </button>
          
          <button className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg text-left hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="font-semibold text-green-800">Set Reminder</h4>
                <p className="text-sm text-green-600">Optimize your schedule</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
