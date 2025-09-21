import React, { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';
import { GeminiService } from '../services/geminiService';

const EnhancedAIInsights = ({ userProgress, moodHistory, journalEntries = [] }) => {
  const [insights, setInsights] = useState([]);
  const [actionableTips, setActionableTips] = useState([]);
  const [moodTrends, setMoodTrends] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);

  useEffect(() => {
    generateAIInsights();
  }, [userProgress, moodHistory, selectedTimeframe]);

  const generateAIInsights = async () => {
    setIsLoading(true);
    try {
      // Generate comprehensive AI insights
      const analysis = await GeminiService.analyzeMoodPattern(moodHistory, journalEntries);
      
      const enhancedInsights = [
        {
          type: 'trend',
          icon: '📈',
          title: 'Mood Trend Analysis',
          message: analysis.patterns || 'Your mood patterns show healthy variation with positive trends.',
          confidence: 92,
          actionable: true,
          actions: ['Track specific triggers', 'Continue current practices', 'Set mood goals']
        },
        {
          type: 'recommendation',
          icon: '💡',
          title: 'Personalized Recommendation',
          message: analysis.recommendation || 'Try the 5-4-3-2-1 grounding technique when feeling overwhelmed.',
          confidence: 88,
          actionable: true,
          actions: ['Start recommended exercise', 'Set reminder', 'Learn more']
        },
        {
          type: 'achievement',
          icon: '🎯',
          title: 'Progress Milestone',
          message: analysis.insight || 'You\'re taking positive steps by tracking your mental wellness journey.',
          confidence: 95,
          actionable: true,
          actions: ['Celebrate progress', 'Set new goals', 'Share success']
        }
      ];

      setInsights(enhancedInsights);
      generateActionableTips();
      analyzeMoodTrends();
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights(mockInsights);
    }
    setIsLoading(false);
  };

  const mockInsights = [
    {
      type: 'positive',
      icon: '🔥',
      title: 'Excellent Consistency!',
      message: `Your ${userProgress.streak || 0}-day streak shows strong commitment to mental wellness.`,
      confidence: 95,
      actionable: true,
      actions: ['Maintain streak', 'Set higher goals', 'Share achievement']
    }
  ];

  const generateActionableTips = () => {
    const tips = [
      {
        id: 'morning_routine',
        category: 'Daily Habits',
        title: 'Optimize Your Morning Routine',
        description: 'Start your day with 5 minutes of mindfulness to set a positive tone.',
        impact: 'High',
        effort: 'Low',
        timeframe: '1 week',
        steps: [
          'Set alarm 10 minutes earlier',
          'Practice deep breathing for 2 minutes',
          'Set daily intention',
          'Track mood improvement'
        ]
      },
      {
        id: 'stress_triggers',
        category: 'Stress Management',
        title: 'Identify Stress Triggers',
        description: 'Understanding your triggers helps prevent overwhelming situations.',
        impact: 'High',
        effort: 'Medium',
        timeframe: '2 weeks',
        steps: [
          'Keep a trigger journal',
          'Note physical sensations',
          'Practice coping strategies',
          'Review patterns weekly'
        ]
      }
    ];
    setActionableTips(tips);
  };

  const analyzeMoodTrends = () => {
    const trends = {
      dominant: moodHistory.length > 0 ? 
        moodHistory.reduce((a, b, i, arr) => 
          arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
        ) : 'calm',
      improvement: calculateMoodImprovement(),
      consistency: calculateConsistency(),
      riskFactors: identifyRiskFactors()
    };
    setMoodTrends(trends);
  };

  const calculateMoodImprovement = () => {
    if (moodHistory.length < 7) return 0;
    
    const recent = moodHistory.slice(-7);
    const older = moodHistory.slice(-14, -7);
    
    const recentScore = recent.reduce((sum, mood) => sum + getMoodScore(mood), 0) / recent.length;
    const olderScore = older.reduce((sum, mood) => sum + getMoodScore(mood), 0) / older.length;
    
    return ((recentScore - olderScore) / olderScore) * 100;
  };

  const getMoodScore = (mood) => {
    const scores = { happy: 5, calm: 4, neutral: 3, stressed: 2, anxious: 1, sad: 1 };
    return scores[mood] || 3;
  };

  const calculateConsistency = () => {
    return Math.max(0, 100 - (moodHistory.length > 0 ? 
      (new Set(moodHistory.slice(-7)).size / 7) * 100 : 0));
  };

  const identifyRiskFactors = () => {
    const recentMoods = moodHistory.slice(-7);
    const negativeCount = recentMoods.filter(m => ['sad', 'anxious', 'stressed'].includes(m)).length;
    return negativeCount > 4 ? 'high' : negativeCount > 2 ? 'medium' : 'low';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-calm-600">Analyzing your wellness data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-calm-800 mb-4">AI-Powered Insights</h1>
        <p className="text-calm-600">Personalized analysis and actionable recommendations for your mental wellness journey</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          {['week', 'month', 'quarter'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedTimeframe === timeframe
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {insights.map((insight, index) => (
          <div key={index} className="card hover:shadow-lg transition-all cursor-pointer"
               onClick={() => setSelectedInsight(insight)}>
            <div className="text-center">
              <div className="text-3xl mb-3">{insight.icon}</div>
              <h3 className="text-lg font-semibold text-calm-800 mb-2">{insight.title}</h3>
              <p className="text-calm-700 text-sm mb-4">{insight.message}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-calm-500">Confidence: {insight.confidence}%</span>
                {insight.actionable && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Actionable
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable Tips */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-calm-800 mb-6">Actionable Recommendations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {actionableTips.map((tip) => (
            <div key={tip.id} className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mb-2 inline-block">
                    {tip.category}
                  </span>
                  <h3 className="text-lg font-semibold text-calm-800">{tip.title}</h3>
                </div>
                <div className="text-right text-sm">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    tip.impact === 'High' ? 'bg-green-100 text-green-700' :
                    tip.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {tip.impact} Impact
                  </div>
                </div>
              </div>
              
              <p className="text-calm-700 mb-4">{tip.description}</p>
              
              <div className="space-y-2 mb-4">
                {tip.steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span className="text-calm-700">{step}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-calm-600">
                <span>Effort: {tip.effort}</span>
                <span>Timeline: {tip.timeframe}</span>
              </div>
              
              <button className="mt-4 btn-primary w-full text-sm">
                Start This Practice
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mood Trends Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-calm-800 mb-4">Mood Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-calm-50 rounded-lg">
              <span className="text-calm-700">Dominant Mood</span>
              <span className="font-semibold text-primary-600 capitalize">{moodTrends.dominant}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-calm-50 rounded-lg">
              <span className="text-calm-700">Improvement</span>
              <span className={`font-semibold ${
                moodTrends.improvement > 0 ? 'text-green-600' : 
                moodTrends.improvement < 0 ? 'text-red-600' : 'text-calm-600'
              }`}>
                {moodTrends.improvement > 0 ? '+' : ''}{Math.round(moodTrends.improvement)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-calm-50 rounded-lg">
              <span className="text-calm-700">Consistency</span>
              <span className="font-semibold text-primary-600">{Math.round(moodTrends.consistency)}%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-calm-800 mb-4">Risk Assessment</h3>
          <div className={`p-4 rounded-lg border-2 ${
            moodTrends.riskFactors === 'high' ? 'border-red-300 bg-red-50' :
            moodTrends.riskFactors === 'medium' ? 'border-yellow-300 bg-yellow-50' :
            'border-green-300 bg-green-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">
                {moodTrends.riskFactors === 'high' ? '⚠️' :
                 moodTrends.riskFactors === 'medium' ? '⚡' : '✅'}
              </span>
              <span className={`font-semibold ${
                moodTrends.riskFactors === 'high' ? 'text-red-800' :
                moodTrends.riskFactors === 'medium' ? 'text-yellow-800' :
                'text-green-800'
              }`}>
                {moodTrends.riskFactors.charAt(0).toUpperCase() + moodTrends.riskFactors.slice(1)} Risk
              </span>
            </div>
            <p className={`text-sm ${
              moodTrends.riskFactors === 'high' ? 'text-red-700' :
              moodTrends.riskFactors === 'medium' ? 'text-yellow-700' :
              'text-green-700'
            }`}>
              {moodTrends.riskFactors === 'high' ? 
                'Consider reaching out to a mental health professional for additional support.' :
                moodTrends.riskFactors === 'medium' ?
                'Monitor your mood patterns and practice self-care regularly.' :
                'Your mental wellness indicators are positive. Keep up the great work!'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-calm-800">{selectedInsight.title}</h2>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-calm-500 hover:text-calm-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{selectedInsight.icon}</div>
              <p className="text-calm-700">{selectedInsight.message}</p>
            </div>

            {selectedInsight.actions && (
              <div className="space-y-3">
                <h3 className="font-semibold text-calm-800">Recommended Actions:</h3>
                {selectedInsight.actions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full p-3 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-all"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAIInsights;
