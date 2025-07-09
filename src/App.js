import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Onboarding from './components/Onboarding';
import CBTExercise from './components/CBTExercise';
import ProgressTracking from './components/ProgressTracking';

function App() {
  const [currentView, setCurrentView] = useState('onboarding');
  const [selectedMood, setSelectedMood] = useState(null);
  const [userProgress, setUserProgress] = useState({
    completedExercises: 0,
    totalExercises: 10,
    calmPoints: 0,
    streak: 0
  });

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
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
