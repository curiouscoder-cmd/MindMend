import React, { useState, useEffect } from 'react';

const MoodAnalytics = ({ moodHistory, userProgress }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [insights, setInsights] = useState([]);

  const moodColors = {
    happy: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', emoji: '😊' },
    anxious: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', emoji: '😰' },
    sad: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', emoji: '😢' },
    stressed: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', emoji: '😤' }
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
  }, [moodHistory, selectedTimeframe]);

  const generateInsights = () => {
    const newInsights = [];
    
    // Mood frequency analysis
    const moodCounts = moodHistory.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b, 'happy'
    );

    if (mostCommonMood) {
      newInsights.push({
        type: 'pattern',
        title: 'Most Common Mood',
        value: mostCommonMood,
        description: `You've felt ${mostCommonMood} most often this week`,
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
    const happyCount = recentMoods.filter(m => m === 'happy').length;
    if (happyCount >= 4) {
      newInsights.push({
        type: 'positive',
        title: 'Positive Trend',
        value: `${happyCount}/7 happy days`,
        description: 'Your mood has been trending positively!',
        icon: '📈'
      });
    }

    setInsights(newInsights);
  };

  const getMoodPercentage = (mood) => {
    const count = moodHistory.filter(m => m === mood).length;
    return moodHistory.length > 0 ? (count / moodHistory.length) * 100 : 0;
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
                  <span className="font-medium text-calm-800 capitalize">{mood}</span>
                </div>
                <span className="text-sm text-calm-600">{percentage.toFixed(1)}%</span>
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
          const moodColor = moodColors[day.mood];
          return (
            <div key={index} className="text-center">
              <div className="text-xs text-calm-600 mb-1">{day.day}</div>
              <div
                className={`w-12 h-12 rounded-lg ${moodColor.bg} ${moodColor.border} border-2 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all`}
              >
                <span className="text-lg">{moodColor.emoji}</span>
                <div className="text-xs font-medium">{day.exercises}</div>
              </div>
              <div className="text-xs text-calm-500 mt-1">
                {day.date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-calm-800 mb-4">
          Mood Analytics
        </h1>
        <p className="text-blue-900">
          Understand your emotional patterns and track your wellness journey
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-calm-100 p-1 rounded-lg">
          {['week', 'month', 'year'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-md transition-all capitalize ${
                selectedTimeframe === timeframe
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-xl font-semibold text-calm-800 mb-6">Weekly Overview</h3>
            {renderWeeklyCalendar()}
            
            <div className="mt-6 p-4 bg-calm-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-calm-600">Legend:</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-primary-400 rounded"></div>
                    <span className="text-calm-600">Exercises completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-calm-800 mb-6">Key Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'positive' ? 'bg-green-50 border-green-400' :
                    insight.type === 'achievement' ? 'bg-purple-50 border-purple-400' :
                    'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div>
                      <h4 className="font-semibold text-calm-800 mb-1">{insight.title}</h4>
                      <p className="text-lg font-bold text-primary-600 mb-1">{insight.value}</p>
                      <p className="text-sm text-calm-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="card">
          <h3 className="text-xl font-semibold text-calm-800 mb-6">Mood Distribution</h3>
          {renderMoodChart()}
        </div>

        {/* Progress Summary */}
        <div className="card">
          <h3 className="text-xl font-semibold text-calm-800 mb-6">Progress Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <span className="font-medium text-primary-800">Exercises Completed</span>
              </div>
              <span className="text-xl font-bold text-primary-600">{userProgress.completedExercises}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔥</span>
                <span className="font-medium text-green-800">Current Streak</span>
              </div>
              <span className="text-xl font-bold text-green-600">{userProgress.streak} days</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✨</span>
                <span className="font-medium text-purple-800">Calm Points</span>
              </div>
              <span className="text-xl font-bold text-purple-600">{userProgress.calmPoints}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
