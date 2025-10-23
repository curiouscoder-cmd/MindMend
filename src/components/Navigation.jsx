import React, { useState } from 'react';
import { logout } from '../services/authService.js';

const Navigation = ({ currentView, onNavigate, calmPoints, user }) => {
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

          {/* User Profile & Calm Points */}
          <div className="flex items-center space-x-3 shrink-0 ml-auto">
            {/* Calm Points */}
            <div className="flex items-center space-x-2 bg-mint px-3 py-2 rounded-2xl border border-ocean/10 shadow-soft">
              <span className="text-navy font-medium">{calmPoints}</span>
              <span className="text-navy/70 text-sm hidden sm:inline">points</span>
            </div>
            
            {/* User Menu */}
            {user && (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-2xl hover:bg-mint/60 transition-all">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-ocean text-white flex items-center justify-center text-sm font-medium">
                      {user.displayName?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-sm text-navy hidden md:inline max-w-[100px] truncate">
                    {user.displayName || 'User'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-elevated border border-ocean/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-mint/60 rounded-lg transition-all flex items-center space-x-2"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
