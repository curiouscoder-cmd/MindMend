import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DistortionCard from './DistortionCard';
import { getAllDistortions } from '../../utils/cognitiveDistortions';

const DistortionLibrary = ({ onBack = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const distortions = getAllDistortions();

  const filteredDistortions = distortions.filter(distortion =>
    distortion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    distortion.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy/5 via-ocean/5 to-sky/10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-navy/50 hover:text-navy mb-6 font-normal text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}
          
          <h1 className="text-5xl font-semibold text-navy mb-4 tracking-tight">
            Cognitive Distortions Library
          </h1>
          <p className="text-navy/60 font-light text-lg max-w-3xl mb-6">
            Learn about the 10 common thinking patterns that can contribute to depression and anxiety. 
            Understanding these distortions is the first step to challenging them.
          </p>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search distortions..."
            className="w-full p-4 bg-white/80 border border-navy/20 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy transition-all"
          />
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-ocean/10 border-l-4 border-ocean p-6 mb-8"
        >
          <h2 className="text-xl font-light text-navy mb-2">
            What are Cognitive Distortions?
          </h2>
          <p className="text-navy/70 font-light text-sm leading-relaxed mb-3">
            Cognitive distortions are irrational thought patterns that can intensify negative emotions. 
            They're automatic, habitual ways of thinking that are often inaccurate and negatively biased.
          </p>
          <p className="text-navy/70 font-light text-sm leading-relaxed">
            By identifying these patterns in your own thinking, you can begin to challenge and replace 
            them with more balanced, realistic thoughts.
          </p>
        </motion.div>

        {/* Distortions List */}
        <div className="space-y-4">
          {filteredDistortions.length > 0 ? (
            filteredDistortions.map((distortion, index) => (
              <DistortionCard key={distortion.id} distortion={distortion} />
            ))
          ) : (
            <div className="bg-white/40 border-l-4 border-navy/10 p-8 text-center">
              <p className="text-navy/60 font-light">
                No distortions found matching "{searchTerm}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 pt-8 border-t border-navy/10 text-center"
        >
          <p className="text-navy/60 font-light text-sm">
            Based on the work of Dr. David Burns in "Feeling Good: The New Mood Therapy"
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DistortionLibrary;
