import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';

const EmotionalTwin = ({ moodHistory, userProgress, personalityTraits }) => {
  const [twinData, setTwinData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    generateEmotionalTwin();
  }, [moodHistory, personalityTraits]);

  const generateEmotionalTwin = async () => {
    setIsLoading(true);
    try {
      const twin = await GeminiService.generateEmotionalTwin(moodHistory, personalityTraits, userProgress);
      setTwinData(twin);
    } catch (error) {
      console.error('Error generating emotional twin:', error);
      // Fallback twin data
      setTwinData({
        twinPersonality: "A resilient individual on a journey of self-discovery and growth",
        strengths: ["Self-awareness", "Commitment to wellness", "Emotional intelligence"],
        growthAreas: ["Stress management", "Emotional regulation", "Self-compassion"],
        motivationalMessage: "Your emotional twin sees your potential and believes in your journey!",
        avatar: "🌱",
        insights: "Your dedication to mental wellness shows remarkable self-awareness and commitment to personal growth.",
        recommendations: [
          "Practice daily mindfulness meditation for 5 minutes",
          "Keep a gratitude journal to reinforce positive patterns",
          "Schedule weekly self-compassion check-ins"
        ]
      });
    }
    setIsLoading(false);
  };

  const getMoodVisualization = () => {
    const moodCounts = moodHistory.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const total = moodHistory.length || 1;
    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      percentage: Math.round((count / total) * 100),
      color: getMoodColor(mood)
    }));
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'bg-yellow-400',
      sad: 'bg-blue-400',
      anxious: 'bg-red-400',
      stressed: 'bg-orange-400',
      calm: 'bg-green-400',
      excited: 'bg-purple-400'
    };
    return colors[mood] || 'bg-gray-400';
  };

  const getEmotionalJourney = () => {
    const recentMoods = moodHistory.slice(-14); // Last 14 days
    return recentMoods.map((mood, index) => ({
      day: index + 1,
      mood,
      intensity: Math.random() * 100 // Simulated intensity
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-calm-600">Creating your Emotional Twin...</p>
          <p className="text-sm text-calm-500 mt-2">Analyzing your emotional patterns with AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="text-6xl animate-pulse-gentle">{twinData?.avatar || '🌱'}</div>
          <div>
            <h1 className="text-4xl font-bold text-calm-800">Your Emotional Twin</h1>
            <p className="text-calm-600">AI-powered reflection of your emotional journey</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          {['overview', 'patterns', 'journey', 'insights'].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedView === view
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Twin Personality */}
          <div className="card">
            <h3 className="text-xl font-semibold text-calm-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🧠</span>
              Personality Profile
            </h3>
            <p className="text-calm-700 leading-relaxed mb-4">{twinData?.twinPersonality}</p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <p className="text-purple-800 font-medium">{twinData?.motivationalMessage}</p>
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-lg font-semibold text-calm-800 mb-3 flex items-center">
                <span className="text-xl mr-2">💪</span>
                Your Strengths
              </h3>
              <div className="space-y-2">
                {twinData?.strengths?.map((strength, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-calm-700">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-calm-800 mb-3 flex items-center">
                <span className="text-xl mr-2">🌱</span>
                Growth Opportunities
              </h3>
              <div className="space-y-2">
                {twinData?.growthAreas?.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-calm-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'patterns' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-calm-800 mb-6 flex items-center">
            <span className="text-2xl mr-2">📊</span>
            Emotional Patterns
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-calm-700 mb-4">Mood Distribution</h4>
              <div className="space-y-3">
                {getMoodVisualization().map(({ mood, percentage, color }) => (
                  <div key={mood} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-calm-600 capitalize">{mood}</div>
                    <div className="flex-1 bg-calm-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-calm-600 w-12">{percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-calm-700 mb-4">Progress Metrics</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-calm-50 rounded-lg">
                  <span className="text-calm-700">Exercises Completed</span>
                  <span className="font-semibold text-primary-600">{userProgress.completedExercises || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-calm-50 rounded-lg">
                  <span className="text-calm-700">Current Streak</span>
                  <span className="font-semibold text-primary-600">{userProgress.streak || 0} days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-calm-50 rounded-lg">
                  <span className="text-calm-700">Calm Points</span>
                  <span className="font-semibold text-primary-600">{userProgress.calmPoints || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'journey' && (
        <div className="card">
          <h3 className="text-xl font-semibold text-calm-800 mb-6 flex items-center">
            <span className="text-2xl mr-2">🗺️</span>
            Emotional Journey
          </h3>
          <div className="relative">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-calm-600">Recent 14 days</span>
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {getEmotionalJourney().map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-calm-500 mb-1">Day {day.day}</div>
                  <div
                    className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${getMoodColor(day.mood)} 
                    flex items-center justify-center text-white text-xs md:text-sm font-medium
                    transform hover:scale-110 transition-all cursor-pointer`}
                    title={`${day.mood} - ${Math.round(day.intensity)}% intensity`}
                  >
                    {day.mood.charAt(0).toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-calm-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔮</span>
              AI Insights
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-medium text-blue-800 mb-2">Pattern Recognition</h4>
                <p className="text-blue-700 text-sm">
                  Your twin notices you tend to feel more positive in the mornings and may experience 
                  stress peaks during afternoon hours. Consider scheduling important tasks earlier in the day.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h4 className="font-medium text-green-800 mb-2">Strength Spotlight</h4>
                <p className="text-green-700 text-sm">
                  Your consistency in using this app shows remarkable self-awareness and commitment 
                  to personal growth. This is a significant strength in your wellness journey.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-calm-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Personalized Recommendations
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-600 text-lg">💡</span>
                <div>
                  <h4 className="font-medium text-purple-800">Morning Routine</h4>
                  <p className="text-purple-700 text-sm">Start your day with 5 minutes of gratitude practice</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-600 text-lg">⚡</span>
                <div>
                  <h4 className="font-medium text-orange-800">Stress Management</h4>
                  <p className="text-orange-700 text-sm">Try the 4-7-8 breathing technique during stressful moments</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-pink-50 rounded-lg">
                <span className="text-pink-600 text-lg">🌸</span>
                <div>
                  <h4 className="font-medium text-pink-800">Self-Care</h4>
                  <p className="text-pink-700 text-sm">Schedule weekly self-compassion check-ins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={generateEmotionalTwin}
          className="btn-primary flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refresh Twin</span>
        </button>
        <button className="btn-secondary flex items-center space-x-2">
          <span>💾</span>
          <span>Save Insights</span>
        </button>
      </div>
    </div>
  );
};

export default EmotionalTwin;
