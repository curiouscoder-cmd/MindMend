import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import Onboarding from './components/Onboarding.jsx';
import CBTExercise from './components/CBTExercise.jsx';
import ProgressTracking from './components/ProgressTracking.jsx';
import Gamification from './components/Gamification.jsx';
import AIInsights from './components/AIInsights.jsx';
import Community from './components/Community.jsx';
import AICoach from './components/AICoach.jsx';
import CrisisMode from './components/CrisisMode.jsx';
import MoodAnalytics from './components/MoodAnalytics.jsx';
import { useMoodTheme } from './hooks/useMoodTheme.js';

function App() {
  const [currentView, setCurrentView] = useState('onboarding');
  const [selectedMood, setSelectedMood] = useState(null);
  const [userProgress, setUserProgress] = useState({
    completedExercises: 0,
    totalExercises: 10,
    calmPoints: 0,
    streak: 0,
    breathingExercises: 0,
    moodsExplored: 0,
    level: 1
  });
  const [moodHistory, setMoodHistory] = useState([]);
  const [showCrisisMode, setShowCrisisMode] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);

  // Mood-responsive theme
  const { theme, backgroundGradient } = useMoodTheme(currentMood, moodHistory);

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
    setCurrentMood(mood.id);
    setMoodHistory(prev => [...prev, mood.id]);
    setCurrentView('exercise');
  };

  const handleExerciseComplete = (exerciseType = 'general') => {
    setUserProgress(prev => {
      const uniqueMoods = new Set([...moodHistory]);
      return {
        ...prev,
        completedExercises: prev.completedExercises + 1,
        calmPoints: prev.calmPoints + 10,
        streak: prev.streak + 1,
        breathingExercises: exerciseType === 'breathing' ? prev.breathingExercises + 1 : prev.breathingExercises,
        moodsExplored: uniqueMoods.size
      };
    });
    setCurrentView('progress');
  };

  const handleLevelUp = (newLevel) => {
    setUserProgress(prev => ({ ...prev, level: newLevel }));
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'onboarding':
        return <Onboarding onMoodSelect={handleMoodSelection} />;
      case 'exercise':
        return (
          <CBTExercise
            mood={selectedMood}
            onComplete={handleExerciseComplete}
            onBack={() => setCurrentView('onboarding')}
          />
        );
      case 'progress':
        return (
          <ProgressTracking
            progress={userProgress}
            onBack={() => setCurrentView('onboarding')}
          />
        );
      case 'gamification':
        return (
          <Gamification
            userProgress={userProgress}
            onLevelUp={handleLevelUp}
          />
        );
      case 'insights':
        return (
          <AIInsights
            userProgress={userProgress}
            moodHistory={moodHistory}
          />
        );
      case 'community':
        return (
          <Community
            userProgress={userProgress}
          />
        );
      case 'coach':
        return (
          <AICoach
            userProgress={userProgress}
            moodHistory={moodHistory}
            currentMood={currentMood}
          />
        );
      case 'analytics':
        return (
          <MoodAnalytics
            moodHistory={moodHistory}
            userProgress={userProgress}
          />
        );
      default:
        return <Onboarding onMoodSelect={handleMoodSelection} />;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient}`}>
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        calmPoints={userProgress.calmPoints}
        onCrisisMode={() => setShowCrisisMode(true)}
      />

      {/* Crisis Mode Button - Always Visible */}
      <button
        onClick={() => setShowCrisisMode(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transition-all duration-200 hover:scale-110"
        title="Crisis Support - Immediate Help"
      >
        🆘
      </button>

      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {renderCurrentView()}
        </div>
      </main>

      {/* Crisis Mode Modal */}
      {showCrisisMode && (
        <CrisisMode
          onClose={() => setShowCrisisMode(false)}
          onExerciseComplete={() => {
            setUserProgress(prev => ({
              ...prev,
              completedExercises: prev.completedExercises + 1,
              calmPoints: prev.calmPoints + 20 // Extra points for crisis exercises
            }));
          }}
        />
      )}
    </div>
  );
}

export default App;
