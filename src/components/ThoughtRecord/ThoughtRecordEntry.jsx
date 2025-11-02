import React from 'react';
import { motion } from 'framer-motion';
import DistortionBadge from './DistortionBadge';

const ThoughtRecordEntry = ({ record, onDelete }) => {
  const { automaticThought, distortions, rationalResponse, timestamp } = record;
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/60 border-l-4 border-navy/20 p-6 mb-4 hover:border-navy/40 transition-all"
    >
      {/* Header with date and delete button */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs text-navy/50 font-light tracking-wider uppercase">
          {formatDate(timestamp)}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(record.id)}
            className="text-navy/40 hover:text-red-600 transition-colors text-sm"
            title="Delete entry"
          >
            ✕
          </button>
        )}
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Automatic Thought */}
        <div>
          <h4 className="text-sm font-normal text-navy/60 mb-2 tracking-wider uppercase">
            Automatic Thought
          </h4>
          <p className="text-navy/80 font-light text-sm leading-relaxed">
            {automaticThought}
          </p>
        </div>

        {/* Column 2: Cognitive Distortions */}
        <div>
          <h4 className="text-sm font-normal text-navy/60 mb-2 tracking-wider uppercase">
            Distortions Identified
          </h4>
          <div className="flex flex-wrap gap-2">
            {distortions && distortions.length > 0 ? (
              distortions.map((distortion, index) => (
                <DistortionBadge 
                  key={index} 
                  distortion={distortion}
                />
              ))
            ) : (
              <span className="text-navy/40 text-sm font-light">None detected</span>
            )}
          </div>
        </div>

        {/* Column 3: Rational Response */}
        <div>
          <h4 className="text-sm font-normal text-navy/60 mb-2 tracking-wider uppercase">
            Rational Response
          </h4>
          <p className="text-navy/80 font-light text-sm leading-relaxed">
            {rationalResponse || <span className="text-navy/40">Not provided</span>}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ThoughtRecordEntry;
