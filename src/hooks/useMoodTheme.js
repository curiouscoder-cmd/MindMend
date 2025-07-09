import { useState, useEffect } from 'react';

export const useMoodTheme = (currentMood) => {
  const [backgroundClass, setBackgroundClass] = useState('bg-gray-50');

  useEffect(() => {
    // Simple mood-based background colors
    switch (currentMood) {
      case 'happy':
        setBackgroundClass('bg-yellow-50');
        break;
      case 'anxious':
        setBackgroundClass('bg-blue-50');
        break;
      case 'sad':
        setBackgroundClass('bg-gray-100');
        break;
      case 'stressed':
        setBackgroundClass('bg-green-50');
        break;
      default:
        setBackgroundClass('bg-gray-50');
    }
  }, [currentMood]);

  return {
    backgroundGradient: backgroundClass
  };
};
