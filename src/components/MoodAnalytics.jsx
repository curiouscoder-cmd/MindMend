import React, { useState, useEffect } from 'react';

const MoodAnalytics = ({ moodHistory, userProgress }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [insights, setInsights] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [personalizedTips, setPersonalizedTips] = useState([]);
  const [moodTrends, setMoodTrends] = useState({});

  const moodColors = {
    happy: { bg: 'bg-mint/80', border: 'border-ocean/30', text: 'text-navy', emoji: '😊' },
    okay: { bg: 'bg-mint/50', border: 'border-ocean/20', text: 'text-navy', emoji: '😐' },
    sad: { bg: 'bg-ocean/20', border: 'border-ocean/30', text: 'text-navy', emoji: '😢' },
    anxious: { bg: 'bg-highlight/20', border: 'border-highlight/30', text: 'text-navy', emoji: '😰' },
    angry: { bg: 'bg-highlight/30', border: 'border-highlight/40', text: 'text-navy', emoji: '😤' },
    stressed: { bg: 'bg-ocean/25', border: 'border-ocean/35', text: 'text-navy', emoji: '😫' },
    tired: { bg: 'bg-sky/40', border: 'border-ocean/25', text: 'text-navy', emoji: '😴' }
  };

  // Generate mock data for demonstration
  const generateMockData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const moods = ['happy', 'anxious', 'sad', 'stressed'];
    
    return days.map((day, index) => ({
      day,
      mood: moodHistory[index] || moods[Math.floor(Math.random() * moods.length)],
      intensity: Math.floor(Math.random() * 5) + 1,
      exercises: Math.floor(Math.random() * 3),
      date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
    }));
  };

  const [weekData] = useState(generateMockData());

  useEffect(() => {
    generateInsights();
    generateAIInsights();
    generatePersonalizedTips();
    analyzeMoodTrends();
  }, [moodHistory, selectedTimeframe]);

  const generateInsights = () => {
    const newInsights = [];
    
    // Mood frequency analysis
    const moodCounts = moodHistory.reduce((acc, entry) => {
      const moodId = typeof entry === 'string' ? entry : entry.id;
      acc[moodId] = (acc[moodId] || 0) + 1;
      return acc;
    }, {});

    const mostCommonMood = Object.keys(moodCounts).length > 0
      ? Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b)
      : 'happy';

    if (mostCommonMood) {
      newInsights.push({
        type: 'pattern',
        title: 'Most Common Mood',
        value: mostCommonMood,
        description: `You've felt ${mostCommonMood.replace('-', ' ')} most often this week`,
        icon: moodColors[mostCommonMood]?.emoji || '😊'
      });
    }

    // Streak analysis
    if (userProgress.streak >= 3) {
      newInsights.push({
        type: 'achievement',
        title: 'Consistency Streak',
        value: `${userProgress.streak} days`,
        description: 'Great job maintaining your wellness routine!',
        icon: '🔥'
      });
    }

    // Progress trend
    const recentMoods = moodHistory.slice(-7);
    const positiveCount = recentMoods.filter(entry => {
      const moodId = typeof entry === 'string' ? entry : entry.id;
      return ['very-happy', 'happy', 'good'].includes(moodId);
    }).length;
    
    if (positiveCount >= 4) {
      newInsights.push({
        type: 'positive',
        title: 'Positive Trend',
        value: `${positiveCount}/7 positive days`,
        description: 'Your mood has been trending positively!',
        icon: '📈'
      });
    }

    setInsights(newInsights);
  };

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
    const anxiousCount = recentMoods.filter(entry => {
      const moodId = typeof entry === 'string' ? entry : entry.id;
      return moodId === 'anxious';
    }).length;
    
    const positiveCount = recentMoods.filter(entry => {
      const moodId = typeof entry === 'string' ? entry : entry.id;
      return ['very-happy', 'happy', 'good'].includes(moodId);
    }).length;

    if (anxiousCount >= 3) {
      newInsights.push({
        type: 'concern',
        icon: '💙',
        title: 'Anxiety Pattern Detected',
        message: 'I notice increased anxiety recently. Consider focusing on breathing exercises and grounding techniques.',
        confidence: 85
      });
    }

    if (positiveCount >= 4) {
      newInsights.push({
        type: 'positive',
        icon: '😊',
        title: 'Positive Mood Trend',
        message: 'Your mood has been predominantly positive lately! This suggests your wellness routine is working well.',
        confidence: 90
      });
    }

    setAiInsights(newInsights);
  };

  const generatePersonalizedTips = () => {
    const tips = [];
    
    // Based on most used mood
    const moodCounts = moodHistory?.reduce((acc, entry) => {
      const moodId = typeof entry === 'string' ? entry : entry.id;
      acc[moodId] = (acc[moodId] || 0) + 1;
      return acc;
    }, {}) || {};
    
    const mostCommonMood = Object.keys(moodCounts).length > 0
      ? Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b)
      : 'happy';

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
      case 'very-sad':
        tips.push({
          icon: '🌱',
          title: 'Gratitude Practice',
          tip: 'Start each day by writing down 3 things you\'re grateful for to boost positive emotions.',
          category: 'Mood Lifting'
        });
        break;
      case 'angry':
        tips.push({
          icon: '🧘',
          title: 'Anger Management',
          tip: 'Practice the cooling breath technique and identify triggers to manage anger constructively.',
          category: 'Emotional Regulation'
        });
        break;
      case 'tired':
        tips.push({
          icon: '😴',
          title: 'Rest & Recovery',
          tip: 'Honor your body\'s need for rest. Consider a consistent sleep schedule and gentle restorative practices.',
          category: 'Self-Care'
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

    const moodScores = {
      'very-happy': 5, 'happy': 4, 'good': 3.5, 'okay': 3,
      'tired': 2.5, 'anxious': 2, 'stressed': 2, 'sad': 1.5,
      'angry': 1.5, 'very-sad': 1
    };

    const getAverage = (moods) => {
      if (moods.length === 0) return 0;
      return moods.reduce((sum, entry) => {
        const moodId = typeof entry === 'string' ? entry : entry.id;
        return sum + (moodScores[moodId] || 3);
      }, 0) / moods.length;
    };

    const recentAvg = getAverage(recent);
    const olderAvg = getAverage(older);
    const trend = recentAvg - olderAvg;

    setMoodTrends({
      direction: trend > 0.3 ? 'improving' : trend < -0.3 ? 'declining' : 'stable',
      change: Math.abs(trend),
      recentScore: recentAvg,
      recommendation: trend > 0.3 
        ? 'Keep up the great work! Your mood is trending positively.'
        : trend < -0.3 
        ? 'Consider increasing your wellness activities or speaking with a professional.'
        : 'Your mood is stable. Continue your current routine.'
    });
  };

  const getMoodPercentage = (mood) => {
    // Map all mood variations to simplified categories
    const moodMapping = {
      'very-happy': 'happy',
      'happy': 'happy',
      'good': 'happy',
      'okay': 'okay',
      'sad': 'sad',
      'very-sad': 'sad',
      'anxious': 'anxious',
      'angry': 'angry',
      'stressed': 'stressed',
      'tired': 'tired'
    };
    
    const count = moodHistory.filter(entry => {
      const moodId = typeof entry === 'string' ? entry : entry.id;
      const mappedMood = moodMapping[moodId] || moodId;
      return mappedMood === mood;
    }).length;
    return moodHistory.length > 0 ? (count / moodHistory.length) * 100 : 0;
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'from-mint/30 to-sky/30 border-ocean/20';
      case 'concern': return 'from-highlight/20 to-ocean/20 border-highlight/30';
      case 'achievement': return 'from-sky/40 to-mint/40 border-ocean/30';
      default: return 'from-mint/20 to-sky/20 border-ocean/20';
    }
  };

  const renderMoodChart = () => {
    return (
      <div className="space-y-4">
        {Object.entries(moodColors).map(([mood, colors]) => {
          const percentage = getMoodPercentage(mood);
          return (
            <div key={mood} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{colors.emoji}</span>
                  <span className="font-medium text-blue-900 capitalize">{mood}</span>
                </div>
                <span className="text-sm text-blue-900">{percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-calm-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${colors.bg.replace('100', '400')}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeeklyCalendar = () => {
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, index) => {
          // Map mood to simplified category
          const moodMapping = {
            'very-happy': 'happy',
            'good': 'happy',
            'very-sad': 'sad'
          };
          const simplifiedMood = moodMapping[day.mood] || day.mood;
          const moodColor = moodColors[simplifiedMood] || moodColors['okay'];
          
          return (
            <div key={index} className="text-center">
              <div className="text-xs text-navy/70 mb-1 font-medium">{day.day}</div>
              <div
                className={`w-14 h-14 rounded-xl ${moodColor.bg} ${moodColor.border} border-2 flex items-center justify-center cursor-pointer hover:shadow-md transition-all`}
              >
                <span className="text-2xl">{moodColor.emoji}</span>
              </div>
              <div className="text-xs text-navy/70 mt-1 font-medium">
                {day.date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-display font-bold text-navy mb-2 tracking-tight">
          Analytics & Insights
        </h1>
        <p className="text-navy/70">
          Understand your emotional patterns and track your wellness journey
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-mint/40 p-1 rounded-xl border border-ocean/10">
          {['week', 'month', 'year'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg transition-all capitalize font-medium ${
                selectedTimeframe === timeframe
                  ? 'bg-white text-ocean shadow-soft'
                  : 'text-navy/70 hover:text-navy'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <div className="card bg-gradient-to-br from-white to-sky/20 border-2 border-ocean/20">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-2xl">🤖</span>
            <h3 className="text-2xl font-display font-bold text-navy tracking-tight">AI Insights</h3>
            <span className="px-2 py-1 bg-ocean/10 text-ocean text-xs rounded-full font-semibold">
              Beta
            </span>
          </div>
          
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border-2 bg-gradient-to-br ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy mb-1">{insight.title}</h4>
                    <p className="text-sm text-navy/80 mb-2">{insight.message}</p>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-navy/60 font-medium">
                        AI Confidence: {insight.confidence}%
                      </div>
                      <div className="w-16 h-1.5 bg-navy/20 rounded-full">
                        <div 
                          className="h-full bg-ocean rounded-full transition-all"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Trends */}
      {moodTrends.direction && (
        <div className="card bg-gradient-to-br from-white to-mint/20 border-2 border-ocean/20">
          <h3 className="text-2xl font-display font-bold text-navy mb-4 tracking-tight">Mood Trends</h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className={`p-3 rounded-full ${
              moodTrends.direction === 'improving' ? 'bg-mint' :
              moodTrends.direction === 'declining' ? 'bg-highlight/30' : 'bg-sky'
            }`}>
              <span className="text-2xl">
                {moodTrends.direction === 'improving' ? '📈' :
                 moodTrends.direction === 'declining' ? '📉' : '📊'}
              </span>
            </div>
            <div>
              <h4 className="font-bold text-navy capitalize">
                {moodTrends.direction} Trend
              </h4>
              <p className="text-sm text-navy/70">{moodTrends.recommendation}</p>
            </div>
          </div>
          
          <div className="bg-sky/40 p-4 rounded-xl border border-ocean/10">
            <div className="text-sm text-navy/70 mb-2 font-medium">Current Mood Score</div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-ocean/20 rounded-full h-3">
                <div 
                  className="h-full bg-gradient-to-r from-ocean to-highlight rounded-full transition-all"
                  style={{ width: `${(moodTrends.recentScore / 5) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-bold text-navy">
                {((moodTrends.recentScore / 5) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-display font-bold text-navy mb-6 tracking-tight">Weekly Overview</h3>
            {renderWeeklyCalendar()}
          </div>
        </div>

        {/* Key Insights */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-display font-bold text-navy mb-6 tracking-tight">Key Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    insight.type === 'positive' ? 'bg-mint/40 border-ocean' :
                    insight.type === 'achievement' ? 'bg-sky/40 border-highlight' :
                    'bg-mint/30 border-ocean/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <h4 className="font-bold text-navy mb-1">{insight.title}</h4>
                      <p className="text-lg font-bold text-ocean mb-1">{insight.value}</p>
                      <p className="text-sm text-navy/70">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Personalized Tips */}
      <div className="card bg-gradient-to-br from-white to-mint/20 border-2 border-ocean/20">
        <h3 className="text-2xl font-display font-bold text-navy mb-6 tracking-tight">Personalized Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalizedTips.map((tip, index) => (
            <div key={index} className="p-4 bg-sky/30 rounded-xl border border-ocean/10">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-bold text-navy">{tip.title}</h4>
                    <span className="px-2 py-1 bg-ocean/20 text-ocean text-xs rounded-full font-semibold">
                      {tip.category}
                    </span>
                  </div>
                  <p className="text-sm text-navy/70">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Distribution & Progress Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-display font-bold text-navy mb-6 tracking-tight">Mood Distribution</h3>
          {renderMoodChart()}
        </div>

        {/* Progress Summary - WITHOUT Calm Points */}
        <div className="card">
          <h3 className="text-xl font-display font-bold text-navy mb-6 tracking-tight">Progress Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-sky/30 to-mint/30 rounded-xl border border-ocean/10">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <span className="font-semibold text-navy">Exercises Completed</span>
              </div>
              <span className="text-2xl font-bold text-ocean">{userProgress.completedExercises}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-mint/30 to-sky/30 rounded-xl border border-ocean/10">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔥</span>
                <span className="font-semibold text-navy">Current Streak</span>
              </div>
              <span className="text-2xl font-bold text-ocean">{userProgress.streak} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
