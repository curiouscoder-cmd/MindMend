import React, { useState, useEffect } from 'react';

const CBTExercise = ({ mood, onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  const exercises = {
    'very-happy': {
      title: "Amplify Joy & Share Positivity",
      description: "Let's celebrate and spread your wonderful energy!",
      steps: [
        {
          type: "reflection",
          title: "Celebrate Your Joy",
          content: "Acknowledge what's making you feel so wonderful.",
          prompt: "What's bringing you so much joy right now?",
          placeholder: "I'm feeling amazing because..."
        },
        {
          type: "breathing",
          title: "Energizing Breath",
          content: "Amplify your positive energy with vibrant breathing.",
          instruction: "Take deep, energizing breaths. Breathe in joy for 4 counts, hold for 4, breathe out gratitude for 4. Feel the energy radiating through you."
        },
        {
          type: "activity",
          title: "Share the Joy",
          content: "Think of how you might share this positive energy with others.",
          prompt: "How could you spread this joy to someone else today?",
          placeholder: "I could share my joy by..."
        }
      ]
    },
    happy: {
      title: "Gratitude & Positive Reinforcement",
      description: "Let's amplify your positive feelings and build lasting happiness habits.",
      steps: [
        {
          type: "reflection",
          title: "Gratitude Practice",
          content: "Take a moment to reflect on three things you're grateful for today.",
          prompt: "What are you most grateful for right now?",
          placeholder: "I'm grateful for..."
        },
        {
          type: "breathing",
          title: "Joy Breathing",
          content: "Let's enhance your positive state with mindful breathing.",
          instruction: "Breathe in for 4 counts, hold for 4, breathe out for 6. Focus on the feeling of joy spreading through your body."
        },
        {
          type: "affirmation",
          title: "Positive Affirmation",
          content: "Reinforce your positive mindset with a personal affirmation.",
          prompt: "Create a positive affirmation about yourself:",
          placeholder: "I am..."
        }
      ]
    },
    good: {
      title: "Maintain Balance & Contentment",
      description: "Let's appreciate this peaceful state and build on it.",
      steps: [
        {
          type: "reflection",
          title: "Appreciate the Moment",
          content: "Recognize what's contributing to your sense of balance.",
          prompt: "What's helping you feel content right now?",
          placeholder: "I feel balanced because..."
        },
        {
          type: "breathing",
          title: "Centering Breath",
          content: "Maintain your equilibrium with mindful breathing.",
          instruction: "Breathe naturally and calmly. With each breath, notice the sense of peace and balance within you."
        },
        {
          type: "affirmation",
          title: "Affirm Your Stability",
          content: "Acknowledge your inner strength and balance.",
          prompt: "What positive quality helps you maintain this balance?",
          placeholder: "I am capable of..."
        }
      ]
    },
    okay: {
      title: "Gentle Uplift & Self-Care",
      description: "Let's gently shift toward a more positive state.",
      steps: [
        {
          type: "reflection",
          title: "Check In With Yourself",
          content: "Explore what might help you feel a bit better.",
          prompt: "What's one small thing that could brighten your day?",
          placeholder: "Something that might help is..."
        },
        {
          type: "breathing",
          title: "Refreshing Breath",
          content: "Use your breath to create a gentle shift in energy.",
          instruction: "Breathe in fresh energy for 4 counts, hold for 4, breathe out stagnation for 6. Feel yourself becoming more present."
        },
        {
          type: "activity",
          title: "Small Joy Action",
          content: "Plan one small act of self-care.",
          prompt: "What's one kind thing you can do for yourself today?",
          placeholder: "I will..."
        }
      ]
    },
    anxious: {
      title: "Anxiety Management & Grounding",
      description: "Let's work together to calm your mind and reduce anxiety.",
      steps: [
        {
          type: "grounding",
          title: "5-4-3-2-1 Grounding Technique",
          content: "This technique helps bring you back to the present moment.",
          instruction: "Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste."
        },
        {
          type: "breathing",
          title: "Calming Breath",
          content: "Deep breathing activates your body's relaxation response.",
          instruction: "Breathe in slowly for 4 counts, hold for 7 counts, then exhale for 8 counts. Repeat this cycle 4 times."
        },
        {
          type: "thought-challenge",
          title: "Thought Challenging",
          content: "Let's examine your anxious thoughts objectively.",
          prompt: "What's one anxious thought you're having? Let's reframe it positively:",
          placeholder: "My anxious thought is... A more balanced thought would be..."
        }
      ]
    },
    sad: {
      title: "Mood Lifting & Self-Compassion",
      description: "Let's gently work on lifting your spirits and practicing self-kindness.",
      steps: [
        {
          type: "self-compassion",
          title: "Self-Compassion Practice",
          content: "Treat yourself with the same kindness you'd show a good friend.",
          prompt: "Write yourself a compassionate message:",
          placeholder: "Dear self, I want you to know..."
        },
        {
          type: "breathing",
          title: "Healing Breath",
          content: "Use your breath to send healing energy to yourself.",
          instruction: "Breathe in self-love and acceptance, breathe out sadness and pain. With each breath, imagine warm, healing light filling your body."
        },
        {
          type: "activity",
          title: "Small Joy Planning",
          content: "Plan a small activity that might bring you a moment of joy.",
          prompt: "What's one small thing you could do today to care for yourself?",
          placeholder: "I could..."
        }
      ]
    },
    'very-sad': {
      title: "Deep Comfort & Gentle Support",
      description: "I'm here with you. Let's take this one gentle step at a time.",
      steps: [
        {
          type: "self-compassion",
          title: "You're Not Alone",
          content: "It's okay to feel this way. Your feelings are valid and you deserve kindness.",
          prompt: "What do you need to hear right now? Write a message of comfort to yourself:",
          placeholder: "It's okay that I'm feeling... I deserve..."
        },
        {
          type: "breathing",
          title: "Gentle Soothing Breath",
          content: "Let's use breath to bring some comfort.",
          instruction: "Breathe very gently and slowly. No pressure, just soft, caring breaths. Imagine someone who loves you is breathing with you, supporting you."
        },
        {
          type: "activity",
          title: "One Tiny Step",
          content: "What's the smallest, gentlest thing you could do for yourself?",
          prompt: "Even the tiniest act of self-care counts. What feels manageable?",
          placeholder: "I could try..."
        }
      ]
    },
    angry: {
      title: "Anger Release & Healthy Expression",
      description: "Let's acknowledge your anger and channel it constructively.",
      steps: [
        {
          type: "reflection",
          title: "Understand Your Anger",
          content: "Anger often protects other feelings. Let's explore what's underneath.",
          prompt: "What triggered your anger? What might you really be feeling underneath (hurt, fear, frustration)?",
          placeholder: "I'm angry because... Underneath, I might be feeling..."
        },
        {
          type: "breathing",
          title: "Cooling Breath",
          content: "Release the heat of anger with powerful exhales.",
          instruction: "Breathe in slowly for 4 counts, then exhale forcefully for 6 counts, releasing the anger. Imagine the anger leaving your body with each exhale."
        },
        {
          type: "solution",
          title: "Constructive Action",
          content: "How can you address this situation in a healthy way?",
          prompt: "What's one constructive action you could take to address what's making you angry?",
          placeholder: "I could..."
        }
      ]
    },
    stressed: {
      title: "Stress Relief & Perspective",
      description: "Let's work on reducing your stress and gaining perspective.",
      steps: [
        {
          type: "priority",
          title: "Priority Assessment",
          content: "Let's identify what's most important right now.",
          prompt: "What's causing you the most stress? Can you break it into smaller, manageable parts?",
          placeholder: "My main stressor is... I can break it down into..."
        },
        {
          type: "breathing",
          title: "Stress-Relief Breathing",
          content: "Release tension with focused breathing.",
          instruction: "Breathe in calm and peace for 4 counts, hold for 4, then breathe out stress and tension for 6 counts. Feel your muscles relax with each exhale."
        },
        {
          type: "solution",
          title: "Solution Focus",
          content: "Shift from problem-focused to solution-focused thinking.",
          prompt: "What's one small step you can take today to address your stress?",
          placeholder: "One thing I can do is..."
        }
      ]
    },
    tired: {
      title: "Energy Restoration & Rest Permission",
      description: "Let's honor your need for rest and gentle renewal.",
      steps: [
        {
          type: "reflection",
          title: "Acknowledge Your Tiredness",
          content: "Being tired is your body's way of asking for care.",
          prompt: "What's been draining your energy? What do you need right now?",
          placeholder: "I'm tired because... I need..."
        },
        {
          type: "breathing",
          title: "Restorative Breath",
          content: "Use gentle breathing to restore some energy.",
          instruction: "Breathe slowly and deeply. Imagine breathing in golden, restorative light. Breathe out exhaustion. No rush, just gentle renewal."
        },
        {
          type: "activity",
          title: "Rest Planning",
          content: "Give yourself permission to rest.",
          prompt: "What's one way you could give yourself rest or restoration today?",
          placeholder: "I will allow myself to..."
        }
      ]
    }
  };

  const currentExercise = exercises[mood?.id] || exercises.happy;
  const currentStepData = currentExercise.steps[currentStep];

  const handleResponse = (response) => {
    setResponses(prev => ({
      ...prev,
      [currentStep]: response
    }));
  };

  const handleNext = () => {
    if (currentStep < currentExercise.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-blue-900 mb-4">
            Exercise Complete!
          </h2>
          <p className="text-blue-900 mb-6">
            Great job completing your {currentExercise.title} exercise. 
            You've earned 10 calm points!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onBack} className="btn-secondary">
              Back to Home
            </button>
            <button onClick={handleComplete} className="btn-primary">
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <span className="text-4xl">{mood?.emoji}</span>
          <h1 className="text-3xl font-bold text-blue-900">
            {currentExercise.title}
          </h1>
        </div>
        <p className="text-blue-900">{currentExercise.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-blue-900 mb-2">
          <span>Step {currentStep + 1} of {currentExercise.steps.length}</span>
          <span>{Math.round(((currentStep + 1) / currentExercise.steps.length) * 100)}% Complete</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / currentExercise.steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Exercise Content */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-blue-900 mb-4">
          {currentStepData.title}
        </h2>
        <p className="text-blue-900 mb-6">
          {currentStepData.content}
        </p>

        {currentStepData.type === 'breathing' && (
          <BreathingExercise 
            instruction={currentStepData.instruction}
            onComplete={handleNext}
          />
        )}

        {(currentStepData.type === 'reflection' || 
          currentStepData.type === 'affirmation' || 
          currentStepData.type === 'thought-challenge' ||
          currentStepData.type === 'self-compassion' ||
          currentStepData.type === 'activity' ||
          currentStepData.type === 'priority' ||
          currentStepData.type === 'solution') && (
          <TextExercise
            prompt={currentStepData.prompt}
            placeholder={currentStepData.placeholder}
            onResponse={handleResponse}
            onNext={handleNext}
            response={responses[currentStep] || ''}
          />
        )}

        {currentStepData.type === 'grounding' && (
          <GroundingExercise
            instruction={currentStepData.instruction}
            onComplete={handleNext}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="btn-secondary">
          ← Back to Home
        </button>
        {currentStep > 0 && (
          <button 
            onClick={() => setCurrentStep(currentStep - 1)}
            className="btn-secondary"
          >
            Previous Step
          </button>
        )}
      </div>
    </div>
  );
};

// Breathing Exercise Component
const BreathingExercise = ({ instruction, onComplete }) => {
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const startExercise = () => {
    setIsActive(true);
  };

  const completeExercise = () => {
    onComplete();
  };

  return (
    <div className="text-center">
      <div className="bg-primary-50 p-6 rounded-lg mb-6">
        <p className="text-primary-800 mb-4">{instruction}</p>
        <div className="text-4xl font-bold text-primary-600 mb-4">
          {timer > 0 ? `${timer}s` : 'Complete!'}
        </div>
        {!isActive && timer > 0 && (
          <button onClick={startExercise} className="btn-primary">
            Start Breathing Exercise
          </button>
        )}
        {timer === 0 && (
          <button onClick={completeExercise} className="btn-primary">
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

// Text Exercise Component
const TextExercise = ({ prompt, placeholder, onResponse, onNext, response }) => {
  const [text, setText] = useState(response);

  const handleSubmit = () => {
    onResponse(text);
    onNext();
  };

  return (
    <div>
      <p className="text-calm-700 mb-4">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 border border-calm-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        rows="4"
      />
      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
};

// Grounding Exercise Component
const GroundingExercise = ({ instruction, onComplete }) => {
  return (
    <div className="text-center">
      <div className="bg-calm-50 p-6 rounded-lg mb-6">
        <p className="text-calm-800 mb-4">{instruction}</p>
        <div className="text-6xl mb-4 animate-pulse-gentle">🌱</div>
        <p className="text-blue-900 text-sm mb-4">
          Take your time with this exercise. Focus on each sense mindfully.
        </p>
      </div>
      <button onClick={onComplete} className="btn-primary">
        I've completed the grounding exercise
      </button>
    </div>
  );
};

export default CBTExercise;
