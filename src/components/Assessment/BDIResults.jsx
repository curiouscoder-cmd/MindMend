import React from 'react';
import { motion } from 'framer-motion';

const BDIResults = ({ results, onBack, onNavigate }) => {
  const { 
    score, 
    level, 
    interpretation, 
    recommendations, 
    suicidalIdeation,
    criticalAlert,
    suicidalCheck,
    nextAssessmentDate,
    icon
  } = results;

  const percentage = Math.min((score / 100) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="text-5xl font-semibold text-navy mb-3 tracking-tight">
          Assessment Complete
        </h1>
        <p className="text-navy/60 font-light text-lg">
          Here are your results and personalized recommendations
        </p>
      </motion.div>

      {/* Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 border-l-4 border-navy p-10 mb-8"
      >
        <div className="text-center">
          <h2 className="text-lg font-normal text-navy/60 mb-2 tracking-wider uppercase">
            Your Score
          </h2>
          <div className="text-7xl font-light text-navy mb-6">
            {score}
          </div>
          <div className="w-full bg-navy/10 h-1 mb-6">
            <motion.div
              className="h-full bg-navy"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <h3 className="text-2xl font-light text-navy mb-3">
            {level}
          </h3>
          <p className="text-navy/70 font-light text-base">
            {interpretation}
          </p>
          {nextAssessmentDate && (
            <p className="text-navy/50 font-light text-sm mt-4">
              Next assessment recommended: {new Date(nextAssessmentDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </motion.div>

      {/* Crisis Alert */}
      {(suicidalIdeation || criticalAlert) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 border-l-4 border-red-600 p-8 mb-8"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠</span>
            <div>
              <h3 className="text-xl font-normal text-red-900 mb-3">
                {criticalAlert ? 'Immediate Support Required' : 'Support Available'}
              </h3>
              <p className="text-red-800 mb-4 font-light">
                {suicidalCheck?.message || 'If you\'re experiencing thoughts of self-harm or suicide, please reach out for help immediately. You don\'t have to face this alone.'}
              </p>
              <div className="space-y-2 text-sm font-light">
                <div className="flex items-start gap-2">
                  <span className="text-red-900">•</span>
                  <span className="text-red-900">
                    <strong className="font-normal">AASRA:</strong> 9820466726 (24/7)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-900">•</span>
                  <span className="text-red-900">
                    <strong className="font-normal">Vandrevala Foundation:</strong> 1860-2662-345
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-900">•</span>
                  <span className="text-red-900">
                    <strong className="font-normal">iCall:</strong> 9152987821
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/60 border-l-4 border-navy/20 p-8 mb-8"
      >
        <h3 className="text-2xl font-light text-navy mb-6 tracking-tight">
          Recommended Actions
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-3 p-4 bg-navy/5 border-l-2 border-navy/20"
            >
              <span className="text-navy/40 font-light text-sm">•</span>
              <p className="text-navy/80 flex-1 font-light">{rec}</p>
            </motion.div>
          ))}
          
          {/* Find Therapist Button */}
          {score >= 11 && onNavigate && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + recommendations.length * 0.1 }}
              className="p-4 bg-ocean/10 border-l-2 border-ocean cursor-pointer hover:bg-ocean/20 transition-all"
              onClick={() => onNavigate('therapist-finder')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-ocean font-light text-sm">🧠</span>
                  <p className="text-navy/80 flex-1 font-light">
                    Find a qualified therapist in your city
                  </p>
                </div>
                <span className="text-ocean text-sm">→</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* CBT Worksheet Recommendation */}
      {score >= 11 && onNavigate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-ocean/10 border-l-4 border-ocean p-8 mb-8"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">📝</span>
            <div className="flex-1">
              <h3 className="text-xl font-normal text-navy mb-2">
                Try the Triple-Column Technique
              </h3>
              <p className="text-navy/70 font-light text-sm leading-relaxed mb-4">
                A powerful CBT tool to challenge negative thoughts. Write your automatic thought, 
                let AI identify cognitive distortions, then craft a rational response.
              </p>
              <button
                onClick={() => onNavigate('cbt-worksheet')}
                className="bg-navy text-white py-3 px-6 font-normal text-sm hover:bg-navy/90 transition-all border-l-4 border-ocean"
              >
                Open CBT Worksheet →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Important Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="card bg-sky/20 border border-ocean/20 mb-6"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-bold text-navy mb-1">Important Note</h4>
            <p className="text-sm text-navy/70">
              This assessment is a screening tool and not a diagnostic instrument. 
              Only a qualified mental health professional can provide an accurate diagnosis. 
              Please consult with a healthcare provider for a comprehensive evaluation.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 rounded-xl font-semibold bg-white border-2 border-ocean/20 text-navy hover:bg-mint/20 transition-all"
        >
          Back to Home
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-ocean to-highlight text-white shadow-elevated hover:shadow-lg transition-all"
        >
          Save Results (Print)
        </button>
      </div>
    </div>
  );
};

export default BDIResults;
