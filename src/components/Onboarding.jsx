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
                  <p className="text-blue-900 text-sm">
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
          <p className="text-blue-900 text-sm">
            Evidence-based cognitive behavioral therapy techniques
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-full shadow-sm border border-calm-100 w-56 h-56 mx-auto">
          <div className="text-3xl mb-3">📈</div>
          <h3 className="font-semibold text-calm-800 mb-2">Progress Tracking</h3>
          <p className="text-blue-900 text-sm">
            Monitor your mental wellness journey over time
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-full shadow-sm border border-calm-100 w-56 h-56 mx-auto">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="font-semibold text-calm-800 mb-2">Calm Points</h3>
          <p className="text-blue-900 text-sm">
            Earn rewards for completing exercises and building habits
          </p>
        </div>
      </div>

      {/* Calming Music and Video Feature */}
      <div className="flex flex-col md:flex-row items-center justify-center mt-12 gap-8">
        {/* Music Card */}
        <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-100 to-calm-100 rounded-full shadow-lg border border-blue-200 w-56 h-56 mb-4 md:mb-0">
          <div className="text-5xl mb-3">🎵</div>
          <h3 className="font-semibold text-blue-900 mb-2">Listen to Calming Music</h3>
          <audio id="calm-audio" src="/music.mp3" preload="auto"></audio>
          <button
            onClick={() => {
              const audio = document.getElementById('calm-audio');
              if (audio.paused) {
                audio.play();
              } else {
                audio.pause();
              }
            }}
            className="mt-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold shadow transition-all duration-200"
          >
            Play / Pause
          </button>
          <p className="text-blue-900 text-xs mt-2">Gentle background music to help you relax</p>
        </div>
      </div>
      {/* Large Video Card */}
      <div className="flex flex-col items-center justify-center w-full mt-8">
        <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-green-100 to-calm-100 rounded-3xl shadow-lg border border-green-200 w-full max-w-3xl mx-auto p-6">
          <div className="text-5xl mb-3">🌱</div>
          <h3 className="font-semibold text-blue-900 mb-2">Watch Calming Video</h3>
          <video
            src="/plant.mp4"
            controls
            className="w-full max-w-2xl h-72 rounded-2xl object-cover bg-white shadow mx-auto"
            style={{ minHeight: '18rem' }}
          />
          <p className="text-blue-900 text-xs mt-2">A peaceful plant video to soothe your mind</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
