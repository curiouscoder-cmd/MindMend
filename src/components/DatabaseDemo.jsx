import React, { useState, useEffect } from 'react';
import useDatabase from '../hooks/useDatabase';
import DatabaseStatus from './DatabaseStatus';

const DatabaseDemo = () => {
  const [userId] = useState('demo-user-' + Date.now());
  const { 
    isConnected, 
    isLoading, 
    error, 
    saveMood, 
    getMoodHistory, 
    saveExercise,
    getAnalytics 
  } = useDatabase(userId);

  const [moodHistory, setMoodHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    if (!isLoading) {
      loadInitialData();
    }
  }, [isLoading]);

  const loadInitialData = async () => {
    try {
      const [history, analyticsData] = await Promise.all([
        getMoodHistory(10),
        getAnalytics('week')
      ]);
      
      setMoodHistory(history);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const testMoodSave = async () => {
    setTestResults(prev => ({ ...prev, mood: 'testing' }));
    
    try {
      const moodData = {
        mood: 'happy',
        intensity: 8,
        triggers: ['database-test'],
        notes: 'Testing database integration'
      };
      
      const result = await saveMood(moodData);
      setTestResults(prev => ({ ...prev, mood: result ? 'success' : 'failed' }));
      
      // Refresh mood history
      const updatedHistory = await getMoodHistory(10);
      setMoodHistory(updatedHistory);
      
    } catch (error) {
      setTestResults(prev => ({ ...prev, mood: 'failed' }));
      console.error('Mood test failed:', error);
    }
  };

  const testExerciseSave = async () => {
    setTestResults(prev => ({ ...prev, exercise: 'testing' }));
    
    try {
      const exerciseData = {
        exerciseId: 'breathing-demo',
        type: 'breathing',
        duration: 300,
        completionRate: 100,
        moodBefore: 'stressed',
        moodAfter: 'calm',
        effectiveness: 5,
        notes: 'Database integration test'
      };
      
      const result = await saveExercise(exerciseData);
      setTestResults(prev => ({ ...prev, exercise: result ? 'success' : 'failed' }));
      
    } catch (error) {
      setTestResults(prev => ({ ...prev, exercise: 'failed' }));
      console.error('Exercise test failed:', error);
    }
  };

  const refreshAnalytics = async () => {
    try {
      const analyticsData = await getAnalytics('week');
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-calm-600">Loading database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-calm-800 mb-4">Database Integration Demo</h1>
        <p className="text-calm-600">
          Test the MindMend AI database functionality with real Supabase integration
        </p>
      </div>

      {/* Database Status */}
      <DatabaseStatus />

      {/* Connection Status */}
      <div className={`p-4 rounded-lg border ${
        isConnected 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{isConnected ? '✅' : '⚠️'}</span>
          <span className="font-semibold">
            {isConnected ? 'Database Connected' : 'Using Offline Mode'}
          </span>
        </div>
        {error && (
          <p className="text-sm mt-2 text-red-600">Error: {error}</p>
        )}
      </div>

      {/* Test Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Test */}
        <div className="card">
          <h3 className="text-lg font-semibold text-calm-800 mb-4">Test Mood Saving</h3>
          <button
            onClick={testMoodSave}
            disabled={testResults.mood === 'testing'}
            className="btn-primary w-full mb-4"
          >
            {testResults.mood === 'testing' ? 'Testing...' : 'Save Test Mood'}
          </button>
          
          {testResults.mood && testResults.mood !== 'testing' && (
            <div className={`p-3 rounded text-sm ${
              testResults.mood === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {testResults.mood === 'success' ? '✅ Mood saved successfully!' : '❌ Mood save failed'}
            </div>
          )}

          {moodHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-calm-700 mb-2">Recent Moods:</h4>
              <div className="space-y-1">
                {moodHistory.slice(0, 3).map((entry, index) => (
                  <div key={index} className="text-sm text-calm-600 flex justify-between">
                    <span className="capitalize">{entry.mood}</span>
                    <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Exercise Test */}
        <div className="card">
          <h3 className="text-lg font-semibold text-calm-800 mb-4">Test Exercise Saving</h3>
          <button
            onClick={testExerciseSave}
            disabled={testResults.exercise === 'testing'}
            className="btn-primary w-full mb-4"
          >
            {testResults.exercise === 'testing' ? 'Testing...' : 'Save Test Exercise'}
          </button>
          
          {testResults.exercise && testResults.exercise !== 'testing' && (
            <div className={`p-3 rounded text-sm ${
              testResults.exercise === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {testResults.exercise === 'success' ? '✅ Exercise saved successfully!' : '❌ Exercise save failed'}
            </div>
          )}
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-calm-800">Analytics Dashboard</h3>
            <button
              onClick={refreshAnalytics}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalUsers}</div>
              <div className="text-sm text-blue-800">Total Users</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.completedExercises}</div>
              <div className="text-sm text-green-800">Exercises</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analytics.averageMoodScore}</div>
              <div className="text-sm text-purple-800">Avg Mood</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Math.round(analytics.engagementRate)}%</div>
              <div className="text-sm text-orange-800">Engagement</div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Guide */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Integration Guide</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>✅ What's Working:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Automatic fallback to offline storage when database is unavailable</li>
            <li>Real-time sync when connection is restored</li>
            <li>Metrics tracking for all database operations</li>
            <li>Error handling with user-friendly messages</li>
          </ul>
          
          <p className="mt-4"><strong>🔗 How to Use in Components:</strong></p>
          <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-x-auto">
{`import useDatabase from '../hooks/useDatabase';

const MyComponent = () => {
  const { saveMood, getMoodHistory } = useDatabase(userId);
  
  const handleMoodSave = async (mood) => {
    await saveMood({ mood, intensity: 8 });
  };
};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDemo;
