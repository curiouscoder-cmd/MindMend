import React, { useState, useEffect } from 'react';
import { mockData } from '../data/mockData';
import confetti from 'canvas-confetti';

const EnhancedGamification = ({ userProgress, onLevelUp, onAchievementUnlocked }) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [achievements, setAchievements] = useState([]);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  // Enhanced achievement system
  const achievementCategories = {
    consistency: {
      name: 'Consistency Master',
      icon: '🔥',
      color: 'bg-red-100 text-red-700',
      achievements: [
        { id: 'streak_3', title: '3-Day Warrior', description: 'Complete activities for 3 consecutive days', requirement: 3, points: 50 },
        { id: 'streak_7', title: 'Week Champion', description: 'Complete activities for 7 consecutive days', requirement: 7, points: 150 },
        { id: 'streak_30', title: 'Month Master', description: 'Complete activities for 30 consecutive days', requirement: 30, points: 500 },
        { id: 'streak_100', title: 'Centurion', description: 'Complete activities for 100 consecutive days', requirement: 100, points: 2000 }
      ]
    },
    exercises: {
      name: 'Exercise Expert',
      icon: '🧘‍♀️',
      color: 'bg-green-100 text-green-700',
      achievements: [
        { id: 'exercises_10', title: 'Getting Started', description: 'Complete 10 CBT exercises', requirement: 10, points: 100 },
        { id: 'exercises_50', title: 'Dedicated Learner', description: 'Complete 50 CBT exercises', requirement: 50, points: 300 },
        { id: 'exercises_100', title: 'CBT Master', description: 'Complete 100 CBT exercises', requirement: 100, points: 750 },
        { id: 'exercises_250', title: 'Wellness Guru', description: 'Complete 250 CBT exercises', requirement: 250, points: 1500 }
      ]
    },
    social: {
      name: 'Community Builder',
      icon: '👥',
      color: 'bg-blue-100 text-blue-700',
      achievements: [
        { id: 'first_post', title: 'Voice Heard', description: 'Make your first community post', requirement: 1, points: 25 },
        { id: 'helpful_member', title: 'Helpful Member', description: 'Receive 10 likes on your posts', requirement: 10, points: 100 },
        { id: 'support_giver', title: 'Support Giver', description: 'Help 25 community members', requirement: 25, points: 200 },
        { id: 'community_leader', title: 'Community Leader', description: 'Become a top contributor', requirement: 100, points: 500 }
      ]
    },
    innovation: {
      name: 'Innovation Pioneer',
      icon: '🚀',
      color: 'bg-purple-100 text-purple-700',
      achievements: [
        { id: 'voice_pioneer', title: 'Voice Pioneer', description: 'First to use voice emotion analysis', requirement: 1, points: 75 },
        { id: 'doodle_artist', title: 'Doodle Artist', description: 'Express emotions through 10 doodles', requirement: 10, points: 150 },
        { id: 'ai_whisperer', title: 'AI Whisperer', description: 'Have 50 conversations with AI coach', requirement: 50, points: 300 },
        { id: 'feature_explorer', title: 'Feature Explorer', description: 'Try all app features', requirement: 8, points: 400 }
      ]
    },
    wellness: {
      name: 'Wellness Champion',
      icon: '🌟',
      color: 'bg-yellow-100 text-yellow-700',
      achievements: [
        { id: 'mood_tracker', title: 'Mood Tracker', description: 'Track mood for 14 consecutive days', requirement: 14, points: 200 },
        { id: 'crisis_survivor', title: 'Crisis Survivor', description: 'Successfully manage a crisis situation', requirement: 1, points: 300 },
        { id: 'wellness_advocate', title: 'Wellness Advocate', description: 'Share wellness tips with community', requirement: 5, points: 250 },
        { id: 'transformation', title: 'Transformation', description: 'Show significant mood improvement', requirement: 1, points: 1000 }
      ]
    }
  };

  // Level system
  const levelSystem = {
    1: { name: 'Beginner', minPoints: 0, maxPoints: 100, color: 'bg-gray-100 text-gray-700', icon: '🌱' },
    2: { name: 'Explorer', minPoints: 100, maxPoints: 300, color: 'bg-green-100 text-green-700', icon: '🌿' },
    3: { name: 'Practitioner', minPoints: 300, maxPoints: 600, color: 'bg-blue-100 text-blue-700', icon: '🌊' },
    4: { name: 'Advocate', minPoints: 600, maxPoints: 1000, color: 'bg-purple-100 text-purple-700', icon: '🦋' },
    5: { name: 'Champion', minPoints: 1000, maxPoints: 1500, color: 'bg-orange-100 text-orange-700', icon: '🔥' },
    6: { name: 'Master', minPoints: 1500, maxPoints: 2500, color: 'bg-red-100 text-red-700', icon: '⭐' },
    7: { name: 'Guru', minPoints: 2500, maxPoints: 5000, color: 'bg-yellow-100 text-yellow-700', icon: '👑' },
    8: { name: 'Legend', minPoints: 5000, maxPoints: Infinity, color: 'bg-gradient-to-r from-purple-400 to-pink-400 text-white', icon: '🏆' }
  };

  useEffect(() => {
    checkAchievements();
    checkLevelUp();
    generateDailyGoals();
    generateWeeklyChallenge();
  }, [userProgress]);

  const getCurrentLevel = () => {
    const points = userProgress.calmPoints || 0;
    for (let level = 8; level >= 1; level--) {
      if (points >= levelSystem[level].minPoints) {
        return level;
      }
    }
    return 1;
  };

  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const currentPoints = userProgress.calmPoints || 0;
    
    if (currentLevel === 8) return 100; // Max level
    
    const nextLevel = levelSystem[currentLevel + 1];
    const currentLevelMin = levelSystem[currentLevel].minPoints;
    const progress = ((currentPoints - currentLevelMin) / (nextLevel.minPoints - currentLevelMin)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  };

  const checkLevelUp = () => {
    const currentLevel = getCurrentLevel();
    const previousLevel = userProgress.level || 1;
    
    if (currentLevel > previousLevel) {
      setShowLevelUpModal(true);
      triggerConfetti();
      if (onLevelUp) {
        onLevelUp(currentLevel);
      }
    }
  };

  const checkAchievements = () => {
    const newAchievements = [];
    const userAchievements = userProgress.achievements || [];

    Object.values(achievementCategories).forEach(category => {
      category.achievements.forEach(achievement => {
        if (!userAchievements.includes(achievement.id)) {
          let earned = false;

          // Check achievement conditions
          switch (achievement.id) {
            case 'streak_3':
            case 'streak_7':
            case 'streak_30':
            case 'streak_100':
              earned = (userProgress.streak || 0) >= achievement.requirement;
              break;
            case 'exercises_10':
            case 'exercises_50':
            case 'exercises_100':
            case 'exercises_250':
              earned = (userProgress.completedExercises || 0) >= achievement.requirement;
              break;
            case 'voice_pioneer':
              earned = userProgress.usedVoiceInput || false;
              break;
            case 'doodle_artist':
              earned = (userProgress.doodleCount || 0) >= achievement.requirement;
              break;
            case 'ai_whisperer':
              earned = (userProgress.aiConversations || 0) >= achievement.requirement;
              break;
            default:
              earned = false;
          }

          if (earned) {
            newAchievements.push(achievement);
          }
        }
      });
    });

    if (newAchievements.length > 0) {
      setNewAchievement(newAchievements[0]);
      triggerConfetti();
      if (onAchievementUnlocked) {
        onAchievementUnlocked(newAchievements);
      }
    }
  };

  const generateDailyGoals = () => {
    const goals = [
      {
        id: 'daily_exercise',
        title: 'Complete a CBT Exercise',
        description: 'Practice mindfulness with any CBT exercise',
        progress: userProgress.dailyExercises || 0,
        target: 1,
        points: 20,
        icon: '🧘‍♀️',
        completed: (userProgress.dailyExercises || 0) >= 1
      },
      {
        id: 'mood_check',
        title: 'Log Your Mood',
        description: 'Track how you\'re feeling today',
        progress: userProgress.dailyMoodLogs || 0,
        target: 1,
        points: 10,
        icon: '😊',
        completed: (userProgress.dailyMoodLogs || 0) >= 1
      },
      {
        id: 'community_engage',
        title: 'Community Engagement',
        description: 'Interact with the community',
        progress: userProgress.dailyCommunityActions || 0,
        target: 1,
        points: 15,
        icon: '👥',
        completed: (userProgress.dailyCommunityActions || 0) >= 1
      }
    ];

    setDailyGoals(goals);
  };

  const generateWeeklyChallenge = () => {
    const challenges = [
      {
        id: 'mindful_week',
        title: 'Mindful Week Challenge',
        description: 'Complete 5 different types of CBT exercises this week',
        progress: userProgress.weeklyExerciseTypes || 0,
        target: 5,
        points: 100,
        icon: '🌟',
        daysLeft: 4
      },
      {
        id: 'social_support',
        title: 'Social Support Challenge',
        description: 'Help 3 community members this week',
        progress: userProgress.weeklyHelpCount || 0,
        target: 3,
        points: 75,
        icon: '🤝',
        daysLeft: 4
      }
    ];

    setWeeklyChallenge(challenges[0]);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const AchievementCard = ({ achievement, category, earned = false }) => (
    <div className={`card transition-all ${earned ? 'ring-2 ring-yellow-400 bg-yellow-50' : 'opacity-75'}`}>
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
          <span className="text-xl">{category.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${earned ? 'text-yellow-800' : 'text-calm-800'}`}>
              {achievement.title}
            </h3>
            {earned && <span className="text-yellow-500 text-xl">✨</span>}
          </div>
          <p className="text-calm-600 text-sm mb-2">{achievement.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-calm-500">
              Requirement: {achievement.requirement}
            </span>
            <span className={`text-sm font-medium ${earned ? 'text-yellow-600' : 'text-primary-600'}`}>
              +{achievement.points} points
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const LevelUpModal = () => (
    showLevelUpModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-calm-800 mb-2">Level Up!</h2>
          <p className="text-calm-600 mb-4">
            Congratulations! You've reached level {getCurrentLevel()}
          </p>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${levelSystem[getCurrentLevel()].color}`}>
            <span className="text-2xl">{levelSystem[getCurrentLevel()].icon}</span>
            <span className="font-semibold">{levelSystem[getCurrentLevel()].name}</span>
          </div>
          <button
            onClick={() => setShowLevelUpModal(false)}
            className="mt-6 btn-primary w-full"
          >
            Continue
          </button>
        </div>
      </div>
    )
  );

  const AchievementModal = () => (
    newAchievement && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-calm-800 mb-2">Achievement Unlocked!</h2>
          <h3 className="text-xl font-semibold text-yellow-600 mb-2">{newAchievement.title}</h3>
          <p className="text-calm-600 mb-4">{newAchievement.description}</p>
          <div className="text-primary-600 font-semibold">+{newAchievement.points} Calm Points</div>
          <button
            onClick={() => setNewAchievement(null)}
            className="mt-6 btn-primary w-full"
          >
            Awesome!
          </button>
        </div>
      </div>
    )
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-calm-800 mb-4">Your Wellness Journey</h1>
        <p className="text-calm-600">Track your progress, earn achievements, and level up your mental wellness</p>
      </div>

      {/* Current Level & Progress */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${levelSystem[getCurrentLevel()].color}`}>
              <span className="text-2xl">{levelSystem[getCurrentLevel()].icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-calm-800">Level {getCurrentLevel()}</h2>
              <p className="text-calm-600">{levelSystem[getCurrentLevel()].name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{userProgress.calmPoints || 0}</div>
            <div className="text-sm text-calm-500">Calm Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-calm-600 mb-2">
            <span>Progress to Level {getCurrentLevel() + 1}</span>
            <span>{Math.round(getProgressToNextLevel())}%</span>
          </div>
          <div className="w-full bg-calm-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressToNextLevel()}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-calm-800">{userProgress.streak || 0}</div>
            <div className="text-sm text-calm-600">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-calm-800">{userProgress.completedExercises || 0}</div>
            <div className="text-sm text-calm-600">Exercises</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-calm-800">{userProgress.achievements?.length || 0}</div>
            <div className="text-sm text-calm-600">Achievements</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' },
            { id: 'goals', label: 'Daily Goals', icon: '🎯' },
            { id: 'challenges', label: 'Challenges', icon: '⚡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                selectedTab === tab.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-calm-600 hover:text-calm-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <div className="card">
            <h3 className="text-lg font-semibold text-calm-800 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {mockData.progressData.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-medium text-calm-800">{achievement.title}</h4>
                    <p className="text-sm text-calm-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Goals Progress */}
          <div className="card">
            <h3 className="text-lg font-semibold text-calm-800 mb-4">Today's Goals</h3>
            <div className="space-y-3">
              {dailyGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-calm-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{goal.icon}</span>
                    <div>
                      <h4 className="font-medium text-calm-800">{goal.title}</h4>
                      <p className="text-sm text-calm-600">{goal.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {goal.completed ? (
                      <span className="text-green-600 text-xl">✓</span>
                    ) : (
                      <span className="text-calm-400 text-xl">○</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'achievements' && (
        <div className="space-y-8">
          {Object.entries(achievementCategories).map(([key, category]) => (
            <div key={key}>
              <h3 className="text-xl font-semibold text-calm-800 mb-4 flex items-center space-x-2">
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    category={category}
                    earned={userProgress.achievements?.includes(achievement.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'goals' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailyGoals.map((goal) => (
            <div key={goal.id} className="card">
              <div className="text-center">
                <div className="text-4xl mb-4">{goal.icon}</div>
                <h3 className="text-lg font-semibold text-calm-800 mb-2">{goal.title}</h3>
                <p className="text-calm-600 text-sm mb-4">{goal.description}</p>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold text-primary-600">
                    {goal.progress}/{goal.target}
                  </div>
                  <div className="w-full bg-calm-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-primary-600 font-medium">+{goal.points} points</div>
                
                {goal.completed && (
                  <div className="mt-3 text-green-600 font-medium">✓ Completed!</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'challenges' && weeklyChallenge && (
        <div className="card max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">{weeklyChallenge.icon}</div>
            <h3 className="text-2xl font-bold text-calm-800 mb-2">{weeklyChallenge.title}</h3>
            <p className="text-calm-600 mb-6">{weeklyChallenge.description}</p>
            
            <div className="mb-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {weeklyChallenge.progress}/{weeklyChallenge.target}
              </div>
              <div className="w-full bg-calm-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-calm-600 mb-4">
              <span>Reward: +{weeklyChallenge.points} points</span>
              <span>{weeklyChallenge.daysLeft} days left</span>
            </div>

            <button className="btn-primary w-full">
              Continue Challenge
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <LevelUpModal />
      <AchievementModal />
    </div>
  );
};

export default EnhancedGamification;
