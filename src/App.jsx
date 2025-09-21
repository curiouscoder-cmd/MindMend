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
import EmotionalTwin from './components/EmotionalTwin.jsx';
import VoiceInput from './components/VoiceInput.jsx';
import DoodleMoodInput from './components/DoodleMoodInput.jsx';
import AIGroupTherapy from './components/AIGroupTherapy.jsx';
import OfflineIndicator from './components/OfflineIndicator.jsx';
import { useMoodTheme } from './hooks/useMoodTheme.js';
import offlineService from './services/offlineService.js';

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

  const handleExerciseComplete = async () => {
    const newProgress = {
      completedExercises: userProgress.completedExercises + 1,
      calmPoints: userProgress.calmPoints + 10,
      streak: userProgress.streak + 1
    };
    
    setUserProgress(prev => ({
      ...prev,
      ...newProgress
    }));
    
    // Save progress offline
    await offlineService.updateProgress(newProgress);
    
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
      case 'emotional-twin':
        return (
          <EmotionalTwin
            moodHistory={moodHistory}
            userProgress={userProgress}
            personalityTraits={{}}
          />
        );
      case 'voice-input':
        return (
          <VoiceInput
            onEmotionDetected={(emotion) => {
              console.log('Emotion detected:', emotion);
              if (emotion.urgency === 'high') {
                setShowCrisisMode(true);
              }
            }}
            onTranscriptionComplete={(text) => {
              console.log('Transcription:', text);
            }}
          />
        );
      case 'doodle-mood':
        return (
          <DoodleMoodInput
            onMoodDetected={(analysis) => {
              console.log('Mood analysis:', analysis);
              setCurrentMood(analysis.primaryMood);
            }}
            onDoodleComplete={(data) => {
              console.log('Doodle complete:', data);
            }}
          />
        );
      case 'group-therapy':
        return (
          <AIGroupTherapy
            userProgress={userProgress}
            currentMood={currentMood}
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

      {/* Offline Indicator */}
      <OfflineIndicator />

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
