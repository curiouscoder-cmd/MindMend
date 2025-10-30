import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation.jsx';
import Onboarding from './components/Onboarding.jsx';
import Login from './components/Login.jsx';
import OfflineIndicator from './components/OfflineIndicator.jsx';

// Lazy load heavy components
const CBTExercise = lazy(() => import('./components/CBTExercise.jsx'));
const ProgressTracking = lazy(() => import('./components/ProgressTracking.jsx'));
const Gamification = lazy(() => import('./components/Gamification.jsx'));
const Community = lazy(() => import('./components/Community.jsx'));
const AICoach = lazy(() => import('./components/AICoach.jsx'));
const AIInsights = lazy(() => import('./components/AIInsights.jsx'));
const MoodAnalytics = lazy(() => import('./components/MoodAnalytics.jsx'));
const CrisisMode = lazy(() => import('./components/CrisisMode.jsx'));
const EmotionalTwin = lazy(() => import('./components/EmotionalTwin.jsx'));
const VoiceInput = lazy(() => import('./components/VoiceInput.jsx'));
const DoodleMoodInput = lazy(() => import('./components/DoodleMoodInput.jsx'));
const AIGroupTherapy = lazy(() => import('./components/AIGroupTherapy.jsx'));
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { useMoodTheme } from './hooks/useMoodTheme.js';
import offlineService from './services/offlineService.js';
import { onAuthChange } from './services/authService.js';
import { createUserProfile, getUserProfile, updateUserProgress } from './services/firestoreService.js';
import { initializeFCM, onForegroundMessage } from './services/fcmService.js';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthLoader, setShowAuthLoader] = useState(false);
  
  // App state
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

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        console.log('👤 User authenticated:', authUser.displayName || authUser.uid);
        
        // Load or create user profile
        try {
          let profile = await getUserProfile(authUser.uid);
          
          if (!profile) {
            // First time user - create profile
            console.log('🆕 Creating new user profile...');
            await createUserProfile(authUser.uid, {
              displayName: authUser.displayName,
              email: authUser.email,
              photoURL: authUser.photoURL,
            });
            profile = await getUserProfile(authUser.uid);
          }
          
          // Load user progress
          if (profile?.progress) {
            setUserProgress(profile.progress);
          }
          
          // Initialize FCM notifications
          if (profile?.preferences?.notificationsEnabled !== false) {
            initializeFCM(authUser.uid).then(success => {
              if (success) {
                console.log('✅ FCM initialized');
              }
            });
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
      
      setAuthLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Debounce the auth loader to avoid flicker
  useEffect(() => {
    let t;
    if (authLoading) {
      t = setTimeout(() => setShowAuthLoader(true), 250);
    } else {
      setShowAuthLoader(false);
    }
    return () => clearTimeout(t);
  }, [authLoading]);
  
  // Listen for foreground notifications
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('📬 Notification received:', payload);
      
      // Handle different notification types
      const type = payload.data?.type;
      
      if (type === 'crisis_support') {
        setShowCrisisMode(true);
      }
    });
    
    return unsubscribe;
  }, [user]);

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
    
    // Save to Firestore
    if (user) {
      try {
        await updateUserProgress(user.uid, newProgress);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
    
    setCurrentView('progress');
  };

  const handleLevelUp = (newLevel) => {
    setUserProgress(prev => ({ ...prev, level: newLevel }));
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    return (
      <Suspense fallback={null}> 
        {(() => {
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
        })()}
      </Suspense>
    );
  };

  if (authLoading) {
    if (!showAuthLoader) return null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky to-mint">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MindMend...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <div className={`min-h-screen bg-mint/50`}>
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigate}
        calmPoints={userProgress.calmPoints}
        user={user}
      />

      {/* SOS Floating Button */}
      <button
        onClick={() => setShowCrisisMode(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-ocean to-highlight text-white rounded-full shadow-elevated flex items-center justify-center text-2xl z-40 transition-transform duration-200 hover:scale-110 animate-glow"
        title="Crisis Support - Immediate Help"
      >
        🆘
      </button>


      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Crisis Mode Modal */}
      {showCrisisMode && (
        <Suspense fallback={null}> 
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
        </Suspense>
      )}
    </div>
  );
}

export default App;
