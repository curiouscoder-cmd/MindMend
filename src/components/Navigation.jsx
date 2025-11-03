import React, { useEffect, useRef, useState } from 'react';
import { logout } from '../services/authService.js';

const Navigation = ({ currentView, onNavigate, calmPoints, user }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'cbt-worksheet', label: 'CBT', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'coach', label: 'AI Coach', icon: '🤖' },
    { id: 'your-friend', label: 'Your Friend', icon: '👥' }
  ];

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-ocean/10 shadow-soft relative z-40">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between min-h-14 sm:min-h-16 py-2 gap-2 sm:gap-3">
          {/* Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-ocean to-highlight rounded-2xl flex items-center justify-center shadow-soft">
              <span className="text-white font-bold text-xs sm:text-sm">M</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-navy hidden sm:inline">MindMend</h1>
          </div>

          {/* Navigation Items - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-1 justify-center">
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
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-mint/60 transition-all"
            aria-label="Toggle menu"
          >
            <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-auto">
            {/* User Menu */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-2xl hover:bg-mint/60 transition-all focus:outline-none focus:ring-2 focus:ring-ocean/40"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ocean text-white flex items-center justify-center text-xs sm:text-sm font-medium">
                      {user.displayName?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-xs sm:text-sm text-navy hidden lg:inline max-w-[100px] truncate">
                    {user.displayName || 'User'}
                  </span>
                  <span className="text-navy/60 text-xs hidden sm:inline">▾</span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-ocean/10 z-[999]"
                  >
                    <div className="px-4 py-3 border-b border-ocean/10">
                      <p className="text-sm text-navy font-medium truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-navy/60 truncate">{user.email || ''}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-navy hover:bg-mint/60 rounded-lg transition-all flex items-center gap-2"
                      >
                        <span>🚪</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-ocean/10 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-1 p-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                    currentView === item.id
                      ? 'bg-sky text-navy font-semibold'
                      : 'text-navy/80 hover:text-navy hover:bg-mint/60'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
