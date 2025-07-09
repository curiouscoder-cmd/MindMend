import React, { useState, useEffect } from 'react';

const Gamification = ({ userProgress, onLevelUp }) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);

  // Calculate level based on calm points
  useEffect(() => {
    const newLevel = Math.floor(userProgress.calmPoints / 100) + 1;
    if (newLevel > currentLevel) {
      setShowLevelUp(true);
      setCurrentLevel(newLevel);
      onLevelUp?.(newLevel);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
    setXpToNextLevel(100 - (userProgress.calmPoints % 100));
  }, [userProgress.calmPoints, currentLevel, onLevelUp]);

  const badges = [
    {
      id: 'mindful-beginner',
      name: 'Mindful Beginner',
      description: 'Complete your first exercise',
      icon: '🌱',
      requirement: 1,
      unlocked: userProgress.completedExercises >= 1
    },
    {
      id: 'breath-master',
      name: 'Breath Master',
      description: 'Complete 5 breathing exercises',
      icon: '🫁',
      requirement: 5,
      unlocked: userProgress.breathingExercises >= 5
    },
    {
      id: 'streak-warrior',
      name: 'Streak Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      requirement: 7,
      unlocked: userProgress.streak >= 7
    },
    {
      id: 'zen-master',
      name: 'Zen Master',
      description: 'Reach level 5',
      icon: '🧘‍♀️',
      requirement: 5,
      unlocked: currentLevel >= 5
    },
    {
      id: 'mood-explorer',
      name: 'Mood Explorer',
      description: 'Try all 4 mood exercises',
      icon: '🎭',
      requirement: 4,
      unlocked: userProgress.moodsExplored >= 4
    },
    {
      id: 'consistency-champion',
      name: 'Consistency Champion',
      description: 'Complete 30 exercises',
      icon: '🏆',
      requirement: 30,
      unlocked: userProgress.completedExercises >= 30
    }
  ];

  const challenges = [
    {
      id: 'daily-calm',
      name: 'Daily Calm Challenge',
      description: 'Complete one exercise every day for a week',
      progress: Math.min(userProgress.streak, 7),
      target: 7,
      reward: '50 Calm Points',
      icon: '📅'
    },
    {
      id: 'mood-master',
      name: 'Mood Master Challenge',
      description: 'Complete exercises for all 4 moods',
      progress: userProgress.moodsExplored || 0,
      target: 4,
      reward: 'Zen Master Badge',
      icon: '🎯'
    },
    {
      id: 'breathing-guru',
      name: 'Breathing Guru Challenge',
      description: 'Complete 10 breathing exercises',
      progress: userProgress.breathingExercises || 0,
      target: 10,
      reward: 'Breath Master Badge',
      icon: '💨'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-8 text-center animate-slide-up">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-primary-600 mb-2">Level Up!</h2>
            <p className="text-calm-600 mb-4">You've reached Level {currentLevel}!</p>
            <div className="text-4xl font-bold text-primary-500">Level {currentLevel}</div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-calm-800">Level {currentLevel}</h3>
            <p className="text-calm-600 text-sm">{xpToNextLevel} points to next level</p>
          </div>
          <div className="text-4xl">
            {currentLevel >= 10 ? '🏆' : currentLevel >= 5 ? '🧘‍♀️' : currentLevel >= 3 ? '🌟' : '🌱'}
          </div>
        </div>
        
        <div className="progress-bar mb-2">
          <div 
            className="progress-fill"
            style={{ width: `${((userProgress.calmPoints % 100) / 100) * 100}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-calm-600">
          <span>{userProgress.calmPoints % 100} XP</span>
          <span>100 XP</span>
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h3 className="text-xl font-semibold text-calm-800 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`p-4 rounded-lg border-2 text-center transition-all duration-200 ${
                badge.unlocked
                  ? 'border-primary-200 bg-primary-50 shadow-md'
                  : 'border-calm-200 bg-calm-50 opacity-60'
              }`}
            >
              <div className={`text-3xl mb-2 ${badge.unlocked ? '' : 'grayscale'}`}>
                {badge.icon}
              </div>
              <h4 className={`font-semibold text-sm mb-1 ${
                badge.unlocked ? 'text-primary-800' : 'text-calm-600'
              }`}>
                {badge.name}
              </h4>
              <p className={`text-xs ${
                badge.unlocked ? 'text-primary-700' : 'text-calm-500'
              }`}>
                {badge.description}
              </p>
              {!badge.unlocked && (
                <div className="mt-2 text-xs text-calm-500">
                  Progress: {Math.min(userProgress.completedExercises, badge.requirement)}/{badge.requirement}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div className="card">
        <h3 className="text-xl font-semibold text-calm-800 mb-4">Active Challenges</h3>
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="p-4 bg-calm-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <h4 className="font-semibold text-calm-800">{challenge.name}</h4>
                    <p className="text-sm text-calm-600">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary-600">
                    {challenge.progress}/{challenge.target}
                  </div>
                  <div className="text-xs text-calm-500">{challenge.reward}</div>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="card">
        <h3 className="text-xl font-semibold text-calm-800 mb-4">Community Leaderboard</h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'MindfulSarah', level: 12, points: 1250, avatar: '👩‍💼' },
            { rank: 2, name: 'ZenMaster99', level: 10, points: 1100, avatar: '🧘‍♂️' },
            { rank: 3, name: 'CalmCoder', level: 8, points: 890, avatar: '👨‍💻' },
            { rank: 4, name: 'You', level: currentLevel, points: userProgress.calmPoints, avatar: '🌟' },
            { rank: 5, name: 'PeacefulPanda', level: 6, points: 650, avatar: '🐼' }
          ].map((user) => (
            <div 
              key={user.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                user.name === 'You' ? 'bg-primary-50 border border-primary-200' : 'bg-calm-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  user.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-calm-200 text-calm-700'
                }`}>
                  {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                </div>
                <span className="text-2xl">{user.avatar}</span>
                <div>
                  <div className={`font-medium ${user.name === 'You' ? 'text-primary-800' : 'text-calm-800'}`}>
                    {user.name}
                  </div>
                  <div className="text-sm text-calm-600">Level {user.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-calm-800">{user.points}</div>
                <div className="text-xs text-calm-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gamification;
