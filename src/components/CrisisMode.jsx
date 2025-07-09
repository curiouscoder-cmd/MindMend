import React, { useState, useEffect } from 'react';

const CrisisMode = ({ onClose, onExerciseComplete }) => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [breathingCount, setBreathingCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [groundingStep, setGroundingStep] = useState(0);

  const crisisExercises = [
    {
      id: 'immediate-grounding',
      title: '5-4-3-2-1 Grounding',
      description: 'This will help bring you back to the present moment',
      type: 'grounding',
      steps: [
        'Name 5 things you can SEE around you',
        'Name 4 things you can TOUCH',
        'Name 3 things you can HEAR',
        'Name 2 things you can SMELL',
        'Name 1 thing you can TASTE'
      ]
    },
    {
      id: 'box-breathing',
      title: 'Emergency Breathing',
      description: 'Calm your nervous system with controlled breathing',
      type: 'breathing',
      instruction: 'Breathe in for 4, hold for 4, breathe out for 4, hold for 4'
    },
    {
      id: 'self-soothing',
      title: 'Self-Soothing Statements',
      description: 'Remind yourself of your strength and safety',
      type: 'affirmations',
      statements: [
        'This feeling is temporary and will pass',
        'I am safe in this moment',
        'I have gotten through difficult times before',
        'I am stronger than I know',
        'I deserve care and compassion',
        'I can take this one breath at a time'
      ]
    }
  ];

  const emergencyContacts = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 crisis support',
      type: 'call'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Text-based crisis support',
      type: 'text'
    },
    {
      name: 'Emergency Services',
      number: '911',
      description: 'For immediate emergency',
      type: 'emergency'
    }
  ];

  useEffect(() => {
    // Auto-start first exercise
    if (currentExercise === 0) {
      setCurrentExercise(0);
    }
  }, []);

  const handleBreathingExercise = () => {
    setIsBreathing(true);
    let count = 0;
    const breathingCycle = setInterval(() => {
      count++;
      setBreathingCount(count);
      if (count >= 16) { // 4 complete cycles
        clearInterval(breathingCycle);
        setIsBreathing(false);
        setCurrentExercise(2); // Move to affirmations
      }
    }, 4000); // 4 seconds per phase
  };

  const getBreathingPhase = () => {
    const phase = breathingCount % 4;
    switch (phase) {
      case 1: return { text: 'Breathe In', color: 'text-blue-600', scale: 'scale-110' };
      case 2: return { text: 'Hold', color: 'text-purple-600', scale: 'scale-110' };
      case 3: return { text: 'Breathe Out', color: 'text-green-600', scale: 'scale-90' };
      case 0: return { text: 'Hold', color: 'text-orange-600', scale: 'scale-90' };
      default: return { text: 'Ready?', color: 'text-blue-900', scale: 'scale-100' };
    }
  };

  const renderGroundingExercise = () => {
    const exercise = crisisExercises[0];
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">{exercise.title}</h3>
        <p className="text-blue-900 mb-6">{exercise.description}</p>
        
        <div className="space-y-4">
          {exercise.steps.map((step, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                index === groundingStep
                  ? 'border-primary-400 bg-primary-50 shadow-lg'
                  : index < groundingStep
                  ? 'border-green-400 bg-green-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index < groundingStep
                    ? 'bg-green-400 text-white'
                    : index === groundingStep
                    ? 'bg-primary-400 text-white animate-pulse'
                    : 'bg-blue-300 text-blue-600'
                }`}>
                  {index < groundingStep ? '✓' : index + 1}
                </div>
                <span className={`font-medium ${
                  index === groundingStep ? 'text-primary-800' : 'text-blue-700'
                }`}>
                  {step}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {groundingStep < exercise.steps.length ? (
            <button
              onClick={() => setGroundingStep(groundingStep + 1)}
              className="btn-primary w-full"
            >
              {groundingStep === 0 ? 'Start Grounding' : 'Next Step'}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">Great job! You've completed the grounding exercise.</p>
              </div>
              <button
                onClick={() => setCurrentExercise(1)}
                className="btn-primary w-full"
              >
                Continue to Breathing Exercise
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBreathingExercise = () => {
    const phase = getBreathingPhase();
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Emergency Breathing</h3>
        <p className="text-blue-900 mb-8">Focus on your breath to calm your nervous system</p>
        
        <div className="mb-8">
          <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center transform transition-all duration-1000 ${phase.scale} ${isBreathing ? 'animate-pulse' : ''}`}>
            <span className={`text-2xl font-bold text-white ${phase.color}`}>
              {isBreathing ? phase.text : 'Ready?'}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg text-blue-700 mb-2">
            {isBreathing ? `Cycle ${Math.floor(breathingCount / 4) + 1} of 4` : 'Click to start breathing exercise'}
          </p>
          <div className="text-sm text-blue-500">
            Breathe in for 4 → Hold for 4 → Breathe out for 4 → Hold for 4
          </div>
        </div>

        {!isBreathing && breathingCount === 0 && (
          <button onClick={handleBreathingExercise} className="btn-primary">
            Start Breathing Exercise
          </button>
        )}

        {breathingCount >= 16 && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">Excellent! You've completed the breathing exercise.</p>
            </div>
            <button
              onClick={() => setCurrentExercise(2)}
              className="btn-primary w-full"
            >
              Continue to Self-Soothing
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAffirmations = () => {
    const exercise = crisisExercises[2];
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">{exercise.title}</h3>
        <p className="text-blue-900 mb-6">{exercise.description}</p>
        
        <div className="space-y-4 mb-8">
          {exercise.statements.map((statement, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
            >
              <p className="text-purple-800 font-medium text-lg">{statement}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">You've completed the crisis support exercises. You're doing great!</p>
          </div>
          <button
            onClick={() => {
              onExerciseComplete?.();
              onClose();
            }}
            className="btn-primary w-full"
          >
            I'm Feeling Better
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-blue-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🆘</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-800">Crisis Support</h2>
                <p className="text-red-600 text-sm">Immediate help is here</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-500 hover:text-blue-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentExercise === 0 && renderGroundingExercise()}
          {currentExercise === 1 && renderBreathingExercise()}
          {currentExercise === 2 && renderAffirmations()}
        </div>

        {/* Emergency Contacts */}
        <div className="p-6 border-t border-blue-200 bg-blue-50">
          <h4 className="font-semibold text-blue-800 mb-4">Need immediate help?</h4>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-blue-800">{contact.name}</h5>
                  <p className="text-sm text-blue-600">{contact.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-600">{contact.number}</div>
                  <div className="text-xs text-blue-500">{contact.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisMode;
