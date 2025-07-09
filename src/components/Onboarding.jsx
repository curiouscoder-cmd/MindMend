import React from 'react';

const Onboarding = ({ onMoodSelect }) => {
  const moods = [
    {
      id: 'happy',
      label: 'Happy',
      emoji: '😊',
      description: 'Feeling good and positive',
      color: 'happy'
    },
    {
      id: 'anxious',
      label: 'Anxious',
      emoji: '😰',
      description: 'Feeling worried or nervous',
      color: 'anxious'
    },
    {
      id: 'sad',
      label: 'Sad',
      emoji: '😢',
      description: 'Feeling down or melancholy',
      color: 'sad'
    },
    {
      id: 'stressed',
      label: 'Stressed',
      emoji: '😤',
      description: 'Feeling overwhelmed or pressured',
      color: 'stressed'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center mb-12 animate-slide-up">
        <h1 className="text-4xl md:text-5xl font-bold text-calm-800 mb-4">
          Welcome to <span className="text-primary-600">MindMend</span>
        </h1>
        <p className="text-xl text-blue-900 mb-2">
          Your AI-powered mental wellness companion
        </p>
        <p className="text-blue-900 max-w-2xl mx-auto">
          Let's start by understanding how you're feeling today. 
          Select your current emotional state to receive personalized CBT exercises.
        </p>
      </div>

      {/* Mood Selection */}
      <div className="card max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-calm-800 mb-6 text-center">
          How are you feeling right now?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moods.map((mood, index) => (
            <button
              key={mood.id}
              onClick={() => onMoodSelect(mood)}
              className={`mood-button ${mood.color}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{mood.emoji}</div>
                <div className="text-left">
                  <h3 className="font-semibold text-calm-800 text-lg">
                    {mood.label}
                  </h3>
                  <p className="text-calm-600 text-sm">
                    {mood.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-primary-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-primary-500 text-xl">💡</div>
            <div>
              <h4 className="font-medium text-primary-800 mb-1">
                Personalized Experience
              </h4>
              <p className="text-primary-700 text-sm">
                Based on your selection, we'll provide tailored cognitive behavioral therapy 
                exercises designed to help you process and improve your emotional state.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-full shadow-sm border border-calm-100 w-56 h-56 mx-auto">
          <div className="text-3xl mb-3">🧠</div>
          <h3 className="font-semibold text-calm-800 mb-2">CBT Exercises</h3>
          <p className="text-calm-600 text-sm">
            Evidence-based cognitive behavioral therapy techniques
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-full shadow-sm border border-calm-100 w-56 h-56 mx-auto">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-semibold text-calm-800 mb-2">Progress Tracking</h3>
          <p className="text-calm-600 text-sm">
            Monitor your mental wellness journey over time
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-full shadow-sm border border-calm-100 w-56 h-56 mx-auto">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="font-semibold text-calm-800 mb-2">Calm Points</h3>
          <p className="text-calm-600 text-sm">
            Earn rewards for completing exercises and building habits
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
