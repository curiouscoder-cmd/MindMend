import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    voiceAnnouncements: true,
    colorBlindFriendly: false,
    fontSize: 'medium', // small, medium, large, xl
    theme: 'light' // light, dark, high-contrast
  });

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Load accessibility settings from localStorage
    const savedSettings = localStorage.getItem('mindmend_accessibility');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Detect system preferences
    detectSystemPreferences();
    
    // Set up keyboard navigation
    setupKeyboardNavigation();
    
    // Apply initial settings
    applyAccessibilitySettings(settings);
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('mindmend_accessibility', JSON.stringify(settings));
    
    // Apply settings to DOM
    applyAccessibilitySettings(settings);
  }, [settings]);

  const detectSystemPreferences = () => {
    // Detect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateSetting('reducedMotion', true);
    }

    // Detect high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      updateSetting('highContrast', true);
    }

    // Detect color scheme preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      updateSetting('theme', 'dark');
    }

    // Detect screen reader
    if (navigator.userAgent.includes('NVDA') || 
        navigator.userAgent.includes('JAWS') || 
        navigator.userAgent.includes('VoiceOver')) {
      updateSetting('screenReader', true);
    }
  };

  const setupKeyboardNavigation = () => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  };

  const handleKeyboardNavigation = (event) => {
    if (!settings.keyboardNavigation) return;

    // Skip links with Alt + S
    if (event.altKey && event.key === 's') {
      event.preventDefault();
      const skipLink = document.querySelector('[data-skip-link]');
      if (skipLink) skipLink.focus();
    }

    // Main navigation with Alt + M
    if (event.altKey && event.key === 'm') {
      event.preventDefault();
      const mainNav = document.querySelector('[role="navigation"]');
      if (mainNav) mainNav.focus();
    }

    // Main content with Alt + C
    if (event.altKey && event.key === 'c') {
      event.preventDefault();
      const mainContent = document.querySelector('main');
      if (mainContent) mainContent.focus();
    }

    // Crisis mode with Alt + H (Help)
    if (event.altKey && event.key === 'h') {
      event.preventDefault();
      const crisisButton = document.querySelector('[data-crisis-button]');
      if (crisisButton) crisisButton.click();
    }
  };

  const applyAccessibilitySettings = (newSettings) => {
    const root = document.documentElement;
    
    // High contrast theme
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Color blind friendly
    if (newSettings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xl');
    root.classList.add(`font-${newSettings.fontSize}`);

    // Theme
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    root.classList.add(`theme-${newSettings.theme}`);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announce = (message, priority = 'polite') => {
    if (!settings.voiceAnnouncements) return;

    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  };

  const getAccessibilityProps = (element) => {
    const props = {};

    // Add ARIA labels based on element type
    if (element === 'button' && settings.screenReader) {
      props['aria-describedby'] = 'button-help';
    }

    // Add keyboard navigation hints
    if (settings.keyboardNavigation) {
      props.tabIndex = 0;
    }

    return props;
  };

  const value = {
    settings,
    updateSetting,
    announce,
    getAccessibilityProps,
    announcements
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen Reader Announcements */}
      <div
        aria-live={settings.voiceAnnouncements ? 'polite' : 'off'}
        aria-atomic="true"
        className="sr-only"
      >
        {announcements.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>

      {/* Skip Links */}
      <div className="skip-links">
        <a
          href="#main-content"
          data-skip-link
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-primary-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to navigation
        </a>
      </div>

      {/* Keyboard Navigation Help */}
      {settings.keyboardNavigation && (
        <div className="sr-only">
          <p>Keyboard shortcuts: Alt+S for skip links, Alt+M for navigation, Alt+C for main content, Alt+H for crisis help</p>
        </div>
      )}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
