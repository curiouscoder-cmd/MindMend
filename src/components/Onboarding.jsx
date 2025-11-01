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
        <h1 className="text-4xl md:text-5xl font-bold text-navy mb-4">
          Welcome to <span className="text-ocean">MindMend</span>
        </h1>
        <p className="text-xl text-navy/80 mb-2">
          Your AI-powered mental wellness companion
        </p>
        <p className="text-navy/80 max-w-2xl mx-auto">
          Let's start by understanding how you're feeling today. 
          Select your current emotional state to receive personalized CBT exercises.
        </p>
      </div>

      {/* Mood Selection */}
      <div className="card max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-navy mb-6 text-center">
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
                  <h3 className="font-semibold text-navy text-lg">
                    {mood.label}
                  </h3>
                  <p className="text-navy/80 text-sm">
                    {mood.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-mint/60 rounded-lg border border-ocean/10">
          <div className="flex items-start space-x-3">
            <div className="text-ocean text-xl">💡</div>
            <div>
              <h4 className="font-medium text-navy mb-1">
                Personalized Experience
              </h4>
              <p className="text-navy/80 text-sm">
                Based on your selection, we'll provide tailored cognitive behavioral therapy 
                exercises designed to help you process and improve your emotional state.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Uiverse-style card: CBT Exercises */}
        <div className="group relative w-56 h-56 mx-auto bg-white text-navy/80 rounded-xl overflow-hidden shadow-soft flex flex-col items-center justify-center hover:-translate-y-2 duration-500">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute blur z-10 fill-ocean/30 duration-500 group-hover:blur-none group-hover:scale-105">
            <path transform="translate(100 100)" d="M39.5,-49.6C54.8,-43.2,73.2,-36.5,78.2,-24.6C83.2,-12.7,74.8,4.4,69,22.5C63.3,40.6,60.2,59.6,49.1,64.8C38.1,70,19,61.5,0.6,60.7C-17.9,59.9,-35.9,67,-47.2,61.9C-58.6,56.7,-63.4,39.5,-70,22.1C-76.6,4.7,-84.9,-12.8,-81.9,-28.1C-79,-43.3,-64.6,-56.3,-49.1,-62.5C-33.6,-68.8,-16.8,-68.3,-2.3,-65.1C12.1,-61.9,24.2,-55.9,39.5,-49.6Z"></path>
          </svg>
          <div className="z-20 flex flex-col justify-center items-center text-center px-4">
            <h3 className="font-semibold text-navy mb-1">CBT Exercises</h3>
            <p className="text-navy/80 text-sm">Evidence-based cognitive behavioral therapy techniques</p>
          </div>
        </div>

        {/* Uiverse-style card: Progress Tracking */}
        <div className="group relative w-56 h-56 mx-auto bg-white text-navy/80 rounded-xl overflow-hidden shadow-soft flex flex-col items-center justify-center hover:-translate-y-2 duration-500">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute blur z-10 fill-highlight/30 duration-500 group-hover:blur-none group-hover:scale-105">
            <path transform="translate(100 100)" d="M39.5,-49.6C54.8,-43.2,73.2,-36.5,78.2,-24.6C83.2,-12.7,74.8,4.4,69,22.5C63.3,40.6,60.2,59.6,49.1,64.8C38.1,70,19,61.5,0.6,60.7C-17.9,59.9,-35.9,67,-47.2,61.9C-58.6,56.7,-63.4,39.5,-70,22.1C-76.6,4.7,-84.9,-12.8,-81.9,-28.1C-79,-43.3,-64.6,-56.3,-49.1,-62.5C-33.6,-68.8,-16.8,-68.3,-2.3,-65.1C12.1,-61.9,24.2,-55.9,39.5,-49.6Z"></path>
          </svg>
          <div className="z-20 flex flex-col justify-center items-center text-center px-4">
            <h3 className="font-semibold text-navy mb-1">Progress Tracking</h3>
            <p className="text-navy/80 text-sm">Monitor your mental wellness journey over time</p>
          </div>
        </div>

        {/* Uiverse-style card: Calm Points */}
        <div className="group relative w-56 h-56 mx-auto bg-white text-navy/80 rounded-xl overflow-hidden shadow-soft flex flex-col items-center justify-center hover:-translate-y-2 duration-500">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="absolute blur z-10 fill-sky/50 duration-500 group-hover:blur-none group-hover:scale-105">
            <path transform="translate(100 100)" d="M39.5,-49.6C54.8,-43.2,73.2,-36.5,78.2,-24.6C83.2,-12.7,74.8,4.4,69,22.5C63.3,40.6,60.2,59.6,49.1,64.8C38.1,70,19,61.5,0.6,60.7C-17.9,59.9,-35.9,67,-47.2,61.9C-58.6,56.7,-63.4,39.5,-70,22.1C-76.6,4.7,-84.9,-12.8,-81.9,-28.1C-79,-43.3,-64.6,-56.3,-49.1,-62.5C-33.6,-68.8,-16.8,-68.3,-2.3,-65.1C12.1,-61.9,24.2,-55.9,39.5,-49.6Z"></path>
          </svg>
          <div className="z-20 flex flex-col justify-center items-center text-center px-4">
            <h3 className="font-semibold text-navy mb-1">Calm Points</h3>
            <p className="text-navy/80 text-sm">Earn rewards for completing exercises and building habits</p>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Onboarding;
