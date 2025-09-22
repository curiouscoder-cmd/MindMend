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
    <nav className="bg-white/90 backdrop-blur border-b border-ocean/10 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between min-h-16 py-2 gap-3 overflow-hidden">
          {/* Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-r from-ocean to-highlight rounded-2xl flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold text-navy">MindMend</h1>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-4 max-w-full min-w-0 flex-1 justify-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-2 rounded-2xl transition-all duration-200 text-sm lg:text-base ${
                  currentView === item.id
                    ? 'bg-sky text-navy font-semibold shadow-soft'
                    : 'text-navy/80 hover:text-navy hover:bg-mint/60 hover:shadow-soft hover:-translate-y-0.5'
                }`}
              >
                <span className="text-sm lg:text-sm">{item.label}</span>
              </button>
            ))}
          
          </div>

          {/* Calm Points Display */}
          <div className="flex items-center space-x-2 bg-mint px-3 py-2 rounded-2xl border border-ocean/10 shadow-soft shrink-0 ml-auto">
            <span className="text-navy font-medium">{calmPoints}</span>
            <span className="text-navy/70 text-sm hidden sm:inline">points</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
