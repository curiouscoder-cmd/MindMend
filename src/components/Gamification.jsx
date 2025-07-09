import React, { useState, useEffect, useRef } from 'react';

// Confetti component for celebration
const Confetti = () => (
  <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `hsl(${Math.random() * 360}, 80%, 70%)`,
            opacity: 0.8,
            transform: `scale(${0.8 + Math.random() * 0.8}) rotate(${Math.random() * 360}deg)`,
            animation: `confetti-fall 1.5s ease-out ${Math.random()}s 1`,
          }}
        />
      ))}
    </div>
    <style>{`
      @keyframes confetti-fall {
        0% { transform: translateY(-100px) scale(1) rotate(0deg); opacity: 1; }
        100% { transform: translateY(400px) scale(1.2) rotate(360deg); opacity: 0; }
      }
    `}</style>
  </div>
);

const Gamification = ({ userProgress, onLevelUp }) => {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [unlockedBadgeId, setUnlockedBadgeId] = useState(null);
  const prevBadgesRef = useRef([]);

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

  // Detect badge unlock
  useEffect(() => {
    if (!prevBadgesRef.current.length) {
      prevBadgesRef.current = badges.map(b => b.unlocked);
      return;
    }
    badges.forEach((badge, idx) => {
      if (badge.unlocked && !prevBadgesRef.current[idx]) {
        setUnlockedBadgeId(badge.id);
        setTimeout(() => setUnlockedBadgeId(null), 2000);
      }
    });
    prevBadgesRef.current = badges.map(b => b.unlocked);
  });

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
    <div className="space-y-8">
      {/* Confetti on Level Up or Badge Unlock */}
      {(showLevelUp || unlockedBadgeId) && <Confetti />}
      {/* Level Up Animation */}
      {showLevelUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-8 text-center animate-slide-up shadow-2xl border-4 border-primary-200">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-primary-600 mb-2 animate-pop">Level Up!</h2>
            <p className="text-blue-900 mb-4">You've reached Level {currentLevel}!</p>
            <div className="text-4xl font-bold text-primary-500 animate-glow">Level {currentLevel}</div>
          </div>
        </div>
      )}
      {/* Level Progress */}
      <div className="card bg-gradient-to-br from-primary-50 to-calm-50 shadow-xl border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-blue-900">Level {currentLevel}</h3>
            <p className="text-blue-900 text-sm">{xpToNextLevel} points to next level</p>
          </div>
          <div className="text-4xl animate-pop">
            {currentLevel >= 10 ? '🏆' : currentLevel >= 5 ? '🧘‍♀️' : currentLevel >= 3 ? '🌟' : '🌱'}
          </div>
        </div>
        <div className="relative h-4 rounded-full bg-calm-100 overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full shadow-inner transition-all duration-700 animate-progress-bar"
            style={{ width: `${((userProgress.calmPoints % 100) / 100) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-blue-900">
          <span>{userProgress.calmPoints % 100} XP</span>
          <span>100 XP</span>
        </div>
      </div>
      {/* Badges */}
      <div className="card bg-gradient-to-br from-primary-50 to-calm-50 shadow-xl border-0">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`relative group p-4 rounded-xl border-2 text-center transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl
                ${badge.unlocked ? 'border-primary-300 bg-gradient-to-br from-primary-100 to-primary-50 shadow-md animate-badge-pop' : 'border-calm-200 bg-calm-50 opacity-60'}
                ${unlockedBadgeId === badge.id ? 'animate-badge-glow' : ''}
              `}
            >
              <div className={`text-4xl mb-2 transition-all duration-300 ${badge.unlocked ? 'animate-badge-pop' : 'grayscale opacity-60'}`}>{badge.icon}</div>
              <h4 className={`font-semibold text-base mb-1 ${badge.unlocked ? 'text-primary-800' : 'text-blue-900'}`}>{badge.name}</h4>
              <p className={`text-xs ${badge.unlocked ? 'text-primary-700' : 'text-blue-900'}`}>{badge.description}</p>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs px-3 py-2 rounded-lg bg-black bg-opacity-80 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10">
                {badge.unlocked ? 'Unlocked!' : `Unlock by: ${badge.description}`}
              </div>
              {!badge.unlocked && (
                <div className="mt-2 text-xs text-blue-900">
                  Progress: {Math.min(userProgress.completedExercises, badge.requirement)}/{badge.requirement}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Active Challenges */}
      <div className="card bg-gradient-to-br from-calm-50 to-primary-50 shadow-xl border-0">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Active Challenges</h3>
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="p-4 bg-calm-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <h4 className="font-semibold text-blue-900">{challenge.name}</h4>
                    <p className="text-sm text-blue-900">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary-600">
                    {challenge.progress}/{challenge.target}
                  </div>
                  <div className="text-xs text-blue-900">{challenge.reward}</div>
                </div>
              </div>
              <div className="relative h-3 rounded-full bg-calm-200 overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-700 animate-progress-bar"
                  style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Leaderboard Preview */}
      <div className="card bg-gradient-to-br from-primary-50 to-calm-50 shadow-xl border-0">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Community Leaderboard</h3>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'MindfulSarah', level: 12, points: 1250, avatar: '👩‍💼' },
            { rank: 2, name: 'ZenMaster99', level: 10, points: 1100, avatar: '��‍♂️' },
            { rank: 3, name: 'CalmCoder', level: 8, points: 890, avatar: '👨‍💻' },
            { rank: 4, name: 'You', level: currentLevel, points: userProgress.calmPoints, avatar: '🌟' },
            { rank: 5, name: 'PeacefulPanda', level: 6, points: 650, avatar: '🐼' }
          ].map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300
                ${user.name === 'You' ? 'bg-primary-100 border-2 border-primary-300 shadow-lg scale-105' : 'bg-calm-50'}
                hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${user.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-calm-200 text-blue-900'}`}
                >
                  {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                </div>
                <span className="text-2xl">{user.avatar}</span>
                <div>
                  <div className={`font-medium ${user.name === 'You' ? 'text-primary-800' : 'text-blue-900'}`}>{user.name}</div>
                  <div className="text-sm text-blue-900">Level {user.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-900">{user.points}</div>
                <div className="text-xs text-blue-900">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Animations */}
      <style>{`
        .animate-badge-pop { animation: badge-pop 0.5s cubic-bezier(.68,-0.55,.27,1.55); }
        @keyframes badge-pop { 0% { transform: scale(0.7); } 80% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .animate-badge-glow { box-shadow: 0 0 16px 4px #60a5fa, 0 0 32px 8px #a5b4fc; animation: badge-glow 1.2s ease-in-out; }
        @keyframes badge-glow { 0% { box-shadow: 0 0 0 0 #60a5fa; } 50% { box-shadow: 0 0 32px 8px #a5b4fc; } 100% { box-shadow: 0 0 0 0 #60a5fa; } }
        .animate-pop { animation: pop 0.5s cubic-bezier(.68,-0.55,.27,1.55); }
        @keyframes pop { 0% { transform: scale(0.7); } 80% { transform: scale(1.15); } 100% { transform: scale(1); } }
        .animate-glow { animation: glow 1.5s infinite alternate; }
        @keyframes glow { 0% { text-shadow: 0 0 8px #60a5fa; } 100% { text-shadow: 0 0 24px #a5b4fc; } }
        .animate-progress-bar { transition: width 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
      `}</style>
    </div>
  );
};

export default Gamification;
