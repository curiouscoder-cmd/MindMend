import React from 'react';

const ProgressTracking = ({ progress, onBack }) => {
  const { completedExercises, totalExercises, calmPoints, streak } = progress;
  const progressPercentage = (completedExercises / totalExercises) * 100;

  const achievements = [
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Complete your first exercise',
      icon: '🌱',
      unlocked: completedExercises >= 1,
      requirement: 1
    },
    {
      id: 'consistent',
      title: 'Consistent Practice',
      description: 'Complete 3 exercises',
      icon: '🔥',
      unlocked: completedExercises >= 3,
      requirement: 3
    },
    {
      id: 'dedicated',
      title: 'Dedicated Learner',
      description: 'Complete 5 exercises',
      icon: '⭐',
      unlocked: completedExercises >= 5,
      requirement: 5
    },
    {
      id: 'mindful-master',
      title: 'Mindful Master',
      description: 'Complete 10 exercises',
      icon: '🏆',
      unlocked: completedExercises >= 10,
      requirement: 10
    }
  ];

  const weeklyData = [
    { day: 'Mon', exercises: 1, mood: 'happy' },
    { day: 'Tue', exercises: 0, mood: null },
    { day: 'Wed', exercises: 2, mood: 'anxious' },
    { day: 'Thu', exercises: 1, mood: 'stressed' },
    { day: 'Fri', exercises: 0, mood: null },
    { day: 'Sat', exercises: 1, mood: 'sad' },
    { day: 'Sun', exercises: completedExercises > 5 ? 1 : 0, mood: 'happy' }
  ];

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      happy: '😊',
      anxious: '😰',
      sad: '😢',
      stressed: '😤'
    };
    return moodEmojis[mood] || '😐';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-calm-800 mb-4">
          Your Progress Journey
        </h1>
        <p className="text-blue-900">
          Track your mental wellness journey and celebrate your achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {completedExercises}
          </div>
          <div className="text-blue-900 text-sm">Exercises Completed</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl mb-2">✨</div>
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {calmPoints}
          </div>
          <div className="text-blue-900 text-sm">Calm Points</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {streak}
          </div>
          <div className="text-blue-900 text-sm">Day Streak</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-primary-600 mb-1">
            {Math.round(progressPercentage)}%
          </div>
          <div className="text-blue-900 text-sm">Overall Progress</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-calm-800 mb-6">
            Overall Progress
          </h2>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm text-blue-900 mb-2">
              <span>Exercises Completed</span>
              <span>{completedExercises} / {totalExercises}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-calm-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="font-medium text-calm-800">Next Goal</div>
                  <div className="text-sm text-blue-900">
                    Complete {Math.min(totalExercises, completedExercises + 1)} exercises
                  </div>
                </div>
              </div>
              <div className="text-primary-600 font-semibold">
                {completedExercises < totalExercises ? 
                  `${totalExercises - completedExercises} to go` : 
                  'Complete!'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="card">
          <h2 className="text-2xl font-semibold text-calm-800 mb-6">
            Weekly Activity
          </h2>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-blue-900 mb-2">{day.day}</div>
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                    day.exercises > 0 
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-200' 
                      : 'bg-calm-100 text-calm-400'
                  }`}
                >
                  {day.exercises > 0 ? day.exercises : '—'}
                </div>
                <div className="text-lg mt-1">
                  {day.mood ? getMoodEmoji(day.mood) : ''}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center text-sm text-blue-900">
            Keep up the great work! Consistency is key to mental wellness.
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card mt-8">
        <h2 className="text-2xl font-semibold text-calm-800 mb-6">
          Achievements
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                achievement.unlocked
                  ? 'border-primary-200 bg-primary-50'
                  : 'border-calm-200 bg-calm-50'
              }`}
            >
              <div className={`text-4xl mb-2 ${
                achievement.unlocked ? '' : 'grayscale opacity-50'
              }`}>
                {achievement.icon}
              </div>
              <h3 className={`font-semibold mb-1 ${
                achievement.unlocked ? 'text-primary-800' : 'text-blue-900'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-sm ${
                achievement.unlocked ? 'text-primary-700' : 'text-blue-500'
              }`}>
                {achievement.description}
              </p>
              {!achievement.unlocked && (
                <div className="mt-2 text-xs text-blue-500">
                  {completedExercises}/{achievement.requirement} exercises
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="card mt-8 bg-gradient-to-r from-primary-50 to-calm-50 border-primary-200">
        <div className="text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold text-calm-800 mb-2">
            {completedExercises === 0 
              ? "Ready to start your journey?"
              : completedExercises < 3
              ? "You're off to a great start!"
              : completedExercises < 7
              ? "You're building great habits!"
              : "You're doing amazing!"
            }
          </h3>
          <p className="text-blue-900 mb-6">
            {completedExercises === 0 
              ? "Take the first step towards better mental wellness today."
              : "Every exercise brings you closer to better mental wellness. Keep going!"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onBack} className="btn-primary">
              Continue Your Journey
            </button>
            <button className="btn-secondary">
              Share Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;
