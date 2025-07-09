import React, { useState, useEffect } from 'react';

const FloatingParticles = ({ mood = 'default', count = 8 }) => {
  const [particles, setParticles] = useState([]);

  const moodParticles = {
    happy: ['✨', '🌟', '⭐', '💫', '🌈', '☀️'],
    anxious: ['💙', '🌊', '💎', '🔵', '💧', '🌀'],
    sad: ['💙', '🌧️', '💜', '🔮', '💙', '🌙'],
    stressed: ['🌿', '🍃', '🌱', '🌳', '💚', '🌲'],
    default: ['✨', '💫', '🌟', '⭐', '💎', '🔮']
  };

  const getRandomParticle = () => {
    const particleSet = moodParticles[mood] || moodParticles.default;
    return particleSet[Math.floor(Math.random() * particleSet.length)];
  };

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: getRandomParticle(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }));
    
    setParticles(newParticles);
  }, [mood, count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-float opacity-20 hover:opacity-40 transition-opacity"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}rem`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingParticles;
