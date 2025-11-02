import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DistortionCard = ({ distortion }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { name, description, examples } = distortion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 border-l-4 border-navy/20 p-6 hover:border-navy/40 transition-all cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-light text-navy mb-2">
            {name}
          </h3>
          <p className="text-navy/70 font-light text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-navy/40 ml-4"
        >
          ▼
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 pt-4 border-t border-navy/10"
          >
            <h4 className="text-sm font-normal text-navy/60 mb-3 tracking-wider uppercase">
              Examples
            </h4>
            <ul className="space-y-2">
              {examples.map((example, index) => (
                <li key={index} className="flex items-start gap-2 text-navy/70 font-light text-sm">
                  <span className="text-navy/40 mt-1">•</span>
                  <span className="flex-1 italic">"{example}"</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DistortionCard;
