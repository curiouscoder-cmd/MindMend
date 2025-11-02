import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation.jsx';
import Home from './components/Home.jsx';
import Onboarding from './components/Onboarding.jsx';
import Login from './components/Login.jsx';

// Lazy load heavy components
const CBTExercise = lazy(() => import('./components/CBTExercise.jsx'));
const ProgressTracking = lazy(() => import('./components/ProgressTracking.jsx'));
const ProgressDashboard = lazy(() => import('./components/ProgressDashboard.jsx'));
const AICoach = lazy(() => import('./components/AICoach.jsx'));
const YourFriend = lazy(() => import('./components/YourFriend.jsx'));
const AIInsights = lazy(() => import('./components/AIInsights.jsx'));
const MoodAnalytics = lazy(() => import('./components/MoodAnalytics.jsx'));
const CrisisMode = lazy(() => import('./components/CrisisMode.jsx'));
const VoiceInput = lazy(() => import('./components/VoiceInput.jsx'));
const BDIAssessment = lazy(() => import('./components/Assessment/BDIAssessment.jsx'));
const BDIAssessmentNew = lazy(() => import('./components/BDIAssessment.jsx'));
const TripleColumnWorksheet = lazy(() => import('./components/ThoughtRecord/TripleColumnWorksheet.jsx'));
const DistortionLibrary = lazy(() => import('./components/DistortionLibrary/DistortionLibrary.jsx'));
const TherapistFinder = lazy(() => import('./components/TherapistFinder.jsx'));
const DynamicThoughtChallenger = lazy(() => import('./components/ThoughtRecord/DynamicThoughtChallenger.jsx'));
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { onAuthChange } from './services/authService.js';
import { createUserProfile, getUserProfile, updateUserProgress } from './services/firestoreService.js';
import { initializeFCM, onForegroundMessage } from './services/fcmService.js';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthLoader, setShowAuthLoader] = useState(false);
  
  // App state
  const [currentView, setCurrentView] = useState('home');
  const [selectedMood, setSelectedMood] = useState(null);
  const [userProgress, setUserProgress] = useState({
    completedExercises: 0,
    calmPoints: 0,
    streak: 0
  });
  const [currentMood, setCurrentMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showCrisisMode, setShowCrisisMode] = useState(false);
  const [showBDIModal, setShowBDIModal] = useState(false);

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

  const handleMoodSelection = (mood) => {
    setSelectedMood(mood);
    setCurrentMood(mood.id);
    // Store mood with timestamp for better tracking
    const moodEntry = {
      id: mood.id,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    setMoodHistory(prev => [...prev, moodEntry]);
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
            case 'home':
              return (
                <Home
                  user={user}
                  onMoodSelect={handleMoodSelection}
                  onNavigate={handleNavigate}
                  moodHistory={moodHistory}
                />
              );
            case 'onboarding':
              return <Onboarding onMoodSelect={handleMoodSelection} />;
            case 'exercise':
              return (
                <CBTExercise
                  mood={selectedMood}
                  onComplete={handleExerciseComplete}
                  onBack={() => setCurrentView('home')}
                />
              );
            case 'progress':
              return (
                <ProgressTracking
                  progress={userProgress}
                  onBack={() => setCurrentView('home')}
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
            case 'your-friend':
              return (
                <YourFriend />
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
                <ProgressDashboard
                  user={user}
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
            case 'bdi-assessment':
              return (
                <BDIAssessment
                  user={user}
                  onBack={() => setCurrentView('home')}
                  onNavigate={handleNavigate}
                />
              );
            case 'cbt-worksheet':
              return (
                <TripleColumnWorksheet
                  onBack={() => setCurrentView('home')}
                  onNavigate={handleNavigate}
                  user={user}
                />
              );
            case 'distortion-library':
              return (
                <DistortionLibrary
                  onBack={() => setCurrentView('cbt-worksheet')}
                />
              );
            case 'therapist-finder':
              return (
                <TherapistFinder
                  onBack={() => setCurrentView('home')}
                />
              );
            case 'dynamic-thought-challenger':
              return (
                <DynamicThoughtChallenger
                  onBack={() => setCurrentView('home')}
                />
              );
            default:
              return (
                <Home
                  user={user}
                  onMoodSelect={handleMoodSelection}
                  onNavigate={handleNavigate}
                  moodHistory={moodHistory}
                />
              );
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
            onNavigate={handleNavigate}
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

      {/* BDI Assessment Modal */}
      {showBDIModal && (
        <Suspense fallback={null}>
          <BDIAssessmentNew
            onComplete={(score) => {
              console.log('BDI Score:', score);
              setShowBDIModal(false);
              setCurrentView('analytics');
            }}
            onClose={() => setShowBDIModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
