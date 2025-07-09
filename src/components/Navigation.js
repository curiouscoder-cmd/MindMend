import React from 'react';

const Navigation = ({ currentView, onNavigate, calmPoints }) => {
  const navItems = [
    { id: 'onboarding', label: 'Home', icon: '🏠' },
    { id: 'progress', label: 'Progress', icon: '📊' }
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
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-calm-600 hover:text-primary-600 hover:bg-calm-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
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
