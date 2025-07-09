import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import Onboarding from './components/Onboarding.jsx';
import CBTExercise from './components/CBTExercise.jsx';
import ProgressTracking from './components/ProgressTracking.jsx';
import Gamification from './components/Gamification.jsx';
import AIInsights from './components/AIInsights.jsx';
import Community from './components/Community.jsx';

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

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
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
      default:
        return <Onboarding onMoodSelect={handleMoodSelection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-primary-50">
      <Navigation 
        currentView={currentView} 
        onNavigate={handleNavigate}
        calmPoints={userProgress.calmPoints}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {renderCurrentView()}
        </div>
      </main>
    </div>
  );
}

export default App;
