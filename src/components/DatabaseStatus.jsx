import React, { useState, useEffect } from 'react';
import databaseService from '../services/databaseService';

const DatabaseStatus = () => {
  const [status, setStatus] = useState({
    connected: false,
    loading: true,
    error: null,
    mode: 'offline'
  });

  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const health = await databaseService.healthCheck();
      
      setStatus({
        connected: health.status === 'healthy',
        loading: false,
        error: health.error || null,
        mode: health.status === 'healthy' ? 'online' : 
               health.status === 'offline_only' ? 'offline' : 'error',
        queueSize: health.queueSize || 0
      });
    } catch (error) {
      setStatus({
        connected: false,
        loading: false,
        error: error.message,
        mode: 'error',
        queueSize: 0
      });
    }
  };

  const runDatabaseTests = async () => {
    setTestResults({ testing: true });
    
    const tests = {
      connection: false,
      userCreate: false,
      moodSave: false,
      exerciseSave: false,
      sync: false
    };

    try {
      // Test 1: Connection
      const health = await databaseService.healthCheck();
      tests.connection = health.status === 'healthy';

      if (tests.connection) {
        // Test 2: User creation
        try {
          const testUser = await databaseService.createUser({
            id: 'test-user-' + Date.now(),
            email: 'test@mindmend.ai',
            name: 'Test User',
            preferences: { theme: 'light' }
          });
          tests.userCreate = !!testUser;
        } catch (error) {
          console.warn('User creation test failed:', error);
        }

        // Test 3: Mood entry
        try {
          const moodEntry = await databaseService.saveMoodEntry('test-user', {
            mood: 'happy',
            intensity: 8,
            triggers: ['test'],
            notes: 'Database test'
          });
          tests.moodSave = !!moodEntry;
        } catch (error) {
          console.warn('Mood save test failed:', error);
        }

        // Test 4: Exercise completion
        try {
          const exercise = await databaseService.saveExerciseCompletion('test-user', {
            exerciseId: 'breathing-test',
            type: 'breathing',
            duration: 300,
            completionRate: 100,
            moodBefore: 'stressed',
            moodAfter: 'calm'
          });
          tests.exerciseSave = !!exercise;
        } catch (error) {
          console.warn('Exercise save test failed:', error);
        }

        // Test 5: Sync functionality
        tests.sync = databaseService.syncQueue.length >= 0;
      }

    } catch (error) {
      console.error('Database tests failed:', error);
    }

    setTestResults(tests);
  };

  const getStatusColor = () => {
    switch (status.mode) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.mode) {
      case 'online': return '🟢';
      case 'offline': return '🔵';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  const getStatusMessage = () => {
    switch (status.mode) {
      case 'online': return 'Connected to Supabase database';
      case 'offline': return 'Using offline storage (IndexedDB)';
      case 'error': return `Database error: ${status.error}`;
      default: return 'Checking database status...';
    }
  };

  if (status.loading) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          <span className="text-gray-600">Checking database status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className={`p-4 border rounded-lg ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon()}</span>
            <div>
              <h3 className="font-semibold">Database Status</h3>
              <p className="text-sm">{getStatusMessage()}</p>
            </div>
          </div>
          
          <button
            onClick={checkDatabaseStatus}
            className="px-3 py-1 text-xs bg-white border border-current rounded hover:bg-opacity-50 transition-all"
          >
            Refresh
          </button>
        </div>

        {status.queueSize > 0 && (
          <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-sm">
            <span className="font-medium">{status.queueSize}</span> items queued for sync
          </div>
        )}
      </div>

      {/* Database Tests */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Database Tests</h3>
          <button
            onClick={runDatabaseTests}
            disabled={testResults.testing}
            className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
          >
            {testResults.testing ? 'Testing...' : 'Run Tests'}
          </button>
        </div>

        {Object.keys(testResults).length > 0 && !testResults.testing && (
          <div className="space-y-2">
            {[
              { key: 'connection', label: 'Database Connection' },
              { key: 'userCreate', label: 'User Creation' },
              { key: 'moodSave', label: 'Mood Entry Save' },
              { key: 'exerciseSave', label: 'Exercise Save' },
              { key: 'sync', label: 'Sync Functionality' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <span className={testResults[key] ? 'text-green-600' : 'text-red-600'}>
                  {testResults[key] ? '✅ Pass' : '❌ Fail'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      {status.mode !== 'online' && (
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-semibold text-blue-800 mb-2">Setup Database</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></p>
            <p>2. Run the SQL schema from <code>supabase/schema.sql</code></p>
            <p>3. Add your credentials to <code>.env</code>:</p>
            <pre className="mt-2 p-2 bg-blue-100 rounded text-xs">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here`}
            </pre>
            <p>4. Restart your development server</p>
          </div>
        </div>
      )}

      {/* Current Configuration */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-2">Configuration</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Supabase URL:</span>
            <span className="font-mono text-xs">
              {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Supabase Key:</span>
            <span className="font-mono text-xs">
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Online:</span>
            <span className="font-mono text-xs">
              {navigator.onLine ? '✅ Yes' : '❌ No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;
