import React, { useState } from 'react';
import Navigation from './components/Navigation.jsx';
import Onboarding from './components/Onboarding.jsx';
import CBTExercise from './components/CBTExercise.jsx';
import ProgressTracking from './components/ProgressTracking.jsx';
import Gamification from './components/Gamification.jsx';
import Community from './components/Community.jsx';
import AICoach from './components/AICoach.jsx';
import AIInsights from './components/AIInsights.jsx';
import MoodAnalytics from './components/MoodAnalytics.jsx';
import CrisisMode from './components/CrisisMode.jsx';
import { useMoodTheme } from './hooks/useMoodTheme.js';

function App() {
  const [currentView, setCurrentView] = useState('onboarding');
  const [selectedMood, setSelectedMood] = useState(null);
  const [userProgress, setUserProgress] = useState({
    completedExercises: 0,
    calmPoints: 0,
    streak: 0
  });
  const [currentMood, setCurrentMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showCrisisMode, setShowCrisisMode] = useState(false);

  // Simple mood theme
  const { backgroundGradient } = useMoodTheme(currentMood);

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
    setCurrentMood(mood.id);
    setMoodHistory(prev => [...prev, mood.id]);
    setCurrentView('exercise');
  };

  const handleExerciseComplete = () => {
    setUserProgress(prev => ({
      ...prev,
      completedExercises: prev.completedExercises + 1,
      calmPoints: prev.calmPoints + 10,
      streak: prev.streak + 1
    }));
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
      case 'insights':
        return (
          <AIInsights
            userProgress={userProgress}
            moodHistory={moodHistory}
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
    <div className={`min-h-screen ${backgroundGradient}`}>
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        calmPoints={userProgress.calmPoints}
      />

      {/* SOS Floating Button */}
      <button
        onClick={() => setShowCrisisMode(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transition-all duration-200 hover:scale-110"
        title="Crisis Support - Immediate Help"
      >
        🆘
      </button>

      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
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
