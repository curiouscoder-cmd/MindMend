import { useState, useEffect } from 'react';

export const useMoodTheme = (currentMood, moodHistory) => {
  const [theme, setTheme] = useState('default');
  const [backgroundGradient, setBackgroundGradient] = useState('');
  const [accentColor, setAccentColor] = useState('');

  const moodThemes = {
    happy: {
      name: 'Sunshine',
      background: 'from-yellow-50 via-orange-50 to-pink-50',
      accent: 'from-yellow-400 to-orange-400',
      primaryColor: 'text-yellow-600',
      cardBg: 'bg-gradient-to-r from-yellow-50 to-orange-50',
      buttonStyle: 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500',
      particles: '✨🌟⭐',
      animation: 'animate-bounce'
    },
    anxious: {
      name: 'Calm Waters',
      background: 'from-blue-50 via-cyan-50 to-teal-50',
      accent: 'from-blue-400 to-cyan-400',
      primaryColor: 'text-blue-600',
      cardBg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      buttonStyle: 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500',
      particles: '💙🌊💎',
      animation: 'animate-pulse'
    },
    sad: {
      name: 'Gentle Rain',
      background: 'from-slate-50 via-blue-50 to-indigo-50',
      accent: 'from-slate-400 to-blue-400',
      primaryColor: 'text-slate-600',
      cardBg: 'bg-gradient-to-r from-slate-50 to-blue-50',
      buttonStyle: 'bg-gradient-to-r from-slate-400 to-blue-400 hover:from-slate-500 hover:to-blue-500',
      particles: '💙🌧️💜',
      animation: 'animate-pulse'
    },
    stressed: {
      name: 'Forest Calm',
      background: 'from-green-50 via-emerald-50 to-teal-50',
      accent: 'from-green-400 to-emerald-400',
      primaryColor: 'text-green-600',
      cardBg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      buttonStyle: 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500',
      particles: '🌿🍃🌱',
      animation: 'animate-pulse'
    },
    default: {
      name: 'Peaceful',
      background: 'from-calm-50 to-primary-50',
      accent: 'from-primary-400 to-primary-600',
      primaryColor: 'text-primary-600',
      cardBg: 'bg-white',
      buttonStyle: 'bg-gradient-to-r from-primary-400 to-primary-600 hover:from-primary-500 hover:to-primary-700',
      particles: '✨💫🌟',
      animation: 'animate-fade-in'
    }
  };

  useEffect(() => {
    if (currentMood) {
      const moodTheme = moodThemes[currentMood] || moodThemes.default;
      setTheme(moodTheme);
      setBackgroundGradient(moodTheme.background);
      setAccentColor(moodTheme.accent);
      
      // Apply theme to document root for global styling
      document.documentElement.style.setProperty('--mood-bg', moodTheme.background);
      document.documentElement.style.setProperty('--mood-accent', moodTheme.accent);
    } else {
      // Use default theme
      const defaultTheme = moodThemes.default;
      setTheme(defaultTheme);
      setBackgroundGradient(defaultTheme.background);
      setAccentColor(defaultTheme.accent);
    }
  }, [currentMood]);

  const getParticleEmoji = () => {
    if (!theme.particles) return '✨';
    const particles = theme.particles.split('');
    return particles[Math.floor(Math.random() * particles.length)];
  };

  const createFloatingParticle = () => {
    return {
      id: Math.random(),
      emoji: getParticleEmoji(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2
    };
  };

  return {
    theme,
    backgroundGradient,
    accentColor,
    moodThemes,
    getParticleEmoji,
    createFloatingParticle
  };
};
