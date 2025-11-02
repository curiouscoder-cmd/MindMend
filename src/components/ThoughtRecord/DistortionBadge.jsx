import React from 'react';
import { motion } from 'framer-motion';

const DistortionBadge = ({ distortion, showConfidence = false, onClick = null }) => {
  const { name, confidence, explanation } = distortion;
  
  // Color mapping for different distortion types
  const getColor = (type) => {
    const colors = {
      'all-or-nothing': 'bg-red-100 text-red-800 border-red-300',
      'overgeneralization': 'bg-orange-100 text-orange-800 border-orange-300',
      'mental-filter': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'disqualifying-positive': 'bg-green-100 text-green-800 border-green-300',
      'jumping-to-conclusions': 'bg-blue-100 text-blue-800 border-blue-300',
      'magnification': 'bg-purple-100 text-purple-800 border-purple-300',
      'emotional-reasoning': 'bg-pink-100 text-pink-800 border-pink-300',
      'should-statements': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'labeling': 'bg-red-100 text-red-800 border-red-300',
      'personalization': 'bg-teal-100 text-teal-800 border-teal-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const colorClass = getColor(distortion.type);
  const isClickable = onClick !== null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isClickable ? { scale: 1.05 } : {}}
      className={`inline-flex items-center gap-2 px-3 py-1.5 border ${colorClass} text-xs font-normal ${
        isClickable ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
      title={explanation}
    >
      <span>{name}</span>
      {showConfidence && confidence && (
        <span className="opacity-70">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </motion.div>
  );
};

export default DistortionBadge;
