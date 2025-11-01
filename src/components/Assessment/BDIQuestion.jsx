import React from 'react';
import { motion } from 'framer-motion';

const BDIQuestion = ({ question, questionNumber, selectedValue, onAnswer }) => {
  return (
    <div className={`card ${question.isCritical ? 'bg-red-50 border-2 border-red-300' : 'bg-white border border-ocean/20'}`}>
      {/* Question Header */}
      <div className="mb-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-sm font-bold text-ocean bg-ocean/10 px-3 py-1 rounded-full">
            Q{questionNumber}
          </span>
          {question.isCritical && (
            <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-1 rounded-full">
              CRITICAL
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-navy/60 mb-2 tracking-wide uppercase">
          On a scale of 0-4:
        </p>
        <h3 className="text-lg font-bold text-navy">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedValue === option.value
                ? 'bg-gradient-to-r from-ocean/20 to-highlight/20 border-ocean shadow-soft'
                : 'bg-white border-ocean/20 hover:border-ocean/40 hover:bg-mint/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                selectedValue === option.value
                  ? 'border-ocean bg-ocean'
                  : 'border-navy/30'
              }`}>
                {selectedValue === option.value && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className={`text-sm font-semibold block mb-1 ${
                  selectedValue === option.value ? 'text-ocean' : 'text-navy/70'
                }`}>
                  {option.value}: {option.value === 0 ? 'Not at all' : 
                     option.value === 1 ? 'Somewhat' :
                     option.value === 2 ? 'Moderately' :
                     option.value === 3 ? 'A lot' : 'Extremely'}
                </span>
                <p className={`text-sm ${
                  selectedValue === option.value ? 'text-navy' : 'text-navy/70'
                }`}>
                  {option.label}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default BDIQuestion;
