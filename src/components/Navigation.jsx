import React from 'react';

const Navigation = ({ currentView, onNavigate, calmPoints, onCrisisMode }) => {
  const navItems = [
    { id: 'onboarding', label: 'Home', icon: '🏠' },
    { id: 'coach', label: 'AI Coach', icon: '🤖' },
    { id: 'group-therapy', label: 'Group', icon: '👥' },
    { id: 'voice-input', label: 'Voice', icon: '🎤' },
    { id: 'doodle-mood', label: 'Express', icon: '🎨' },
    { id: 'emotional-twin', label: 'Twin', icon: '🌱' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'gamification', label: 'Achievements', icon: '🏆' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-calm-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold text-calm-800">MindMend</h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-lg transition-all duration-200 text-sm lg:text-base ${
                  currentView === item.id
                    ? 'bg-primary-50 text-black font-medium'
                    : 'text-black hover:text-primary-600 hover:bg-calm-50'
                }`}
              >
                <span className="text-base lg:text-lg">{item.icon}</span>
                <span className="hidden md:inline text-xs lg:text-sm">{item.label}</span>
              </button>
            ))}
            
            {/* Calm Points Display */}
            <div className="flex items-center space-x-2 bg-primary-50 px-3 py-2 rounded-lg">
              <span className="text-lg">✨</span>
              <span className="text-primary-600 font-medium">{calmPoints}</span>
              <span className="text-primary-500 text-sm hidden sm:inline">points</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
