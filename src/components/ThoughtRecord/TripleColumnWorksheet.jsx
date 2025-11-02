import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DistortionBadge from './DistortionBadge';
import ThoughtRecordHistory from './ThoughtRecordHistory';
import { detectDistortions, saveThoughtRecord } from '../../services/distortionDetection';

const TripleColumnWorksheet = ({ prefilledThought = null, onBack = null, onNavigate = null }) => {
  const [automaticThought, setAutomaticThought] = useState(prefilledThought || '');
  const [distortions, setDistortions] = useState([]);
  const [rationalResponse, setRationalResponse] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3
  const [showHistory, setShowHistory] = useState(false);

  // Auto-analyze when thought is provided
  useEffect(() => {
    if (prefilledThought && prefilledThought.trim().length > 0) {
      handleAnalyzeThought();
    }
  }, [prefilledThought]);

  const handleAnalyzeThought = async () => {
    if (!automaticThought.trim()) {
      alert('Please enter an automatic thought first');
      return;
    }

    setIsAnalyzing(true);
    setDistortions([]);
    setAiSuggestion('');

    try {
      const result = await detectDistortions(automaticThought);
      setDistortions(result.distortions || []);
      setAiSuggestion(result.suggestions || '');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error analyzing thought:', error);
      alert('Failed to analyze thought. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!automaticThought.trim()) {
      alert('Please enter an automatic thought');
      return;
    }

    if (!rationalResponse.trim()) {
      alert('Please enter a rational response');
      return;
    }

    setIsSaving(true);

    try {
      const record = {
        automaticThought: automaticThought.trim(),
        distortions,
        rationalResponse: rationalResponse.trim(),
        aiSuggestion
      };

      saveThoughtRecord(record);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setAutomaticThought('');
      setDistortions([]);
      setRationalResponse('');
      setAiSuggestion('');
      setCurrentStep(1);

      // Refresh history
      setShowHistory(true);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save thought record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear this entry?')) {
      setAutomaticThought('');
      setDistortions([]);
      setRationalResponse('');
      setAiSuggestion('');
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy/5 via-ocean/5 to-sky/10 p-6">
      <div className="max-w-6xl mx-auto">
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
            Triple-Column Technique
          </h1>
          <p className="text-navy/60 font-light text-lg max-w-3xl mb-4">
            A powerful CBT tool to challenge negative thoughts. Write your automatic thought, 
            let AI identify cognitive distortions, then craft a rational response.
          </p>
          
          {onNavigate && (
            <button
              onClick={() => onNavigate('distortion-library')}
              className="text-ocean hover:text-ocean/80 font-normal text-sm underline transition-colors"
            >
              📚 Learn about Cognitive Distortions
            </button>
          )}
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-50 border-l-4 border-green-500 p-4 mb-6"
            >
              <p className="text-green-800 font-light">
                ✓ Thought record saved successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Worksheet */}
        <div className="bg-white/60 border-l-4 border-navy p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Automatic Thought */}
            <div className={`${currentStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 flex items-center justify-center border-2 text-sm font-normal ${
                  currentStep >= 1 ? 'border-navy bg-navy text-white' : 'border-navy/20 text-navy/40'
                }`}>
                  1
                </div>
                <h3 className="text-lg font-normal text-navy tracking-wider uppercase">
                  Automatic Thought
                </h3>
              </div>
              
              <textarea
                value={automaticThought}
                onChange={(e) => setAutomaticThought(e.target.value)}
                placeholder="What negative thought went through your mind?&#10;&#10;Example: 'I'm going to fail this presentation and everyone will think I'm incompetent.'"
                className="w-full h-40 p-4 bg-white/80 border border-navy/20 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy transition-all resize-none"
                disabled={isAnalyzing || isSaving}
              />
              
              {currentStep === 1 && (
                <button
                  onClick={handleAnalyzeThought}
                  disabled={!automaticThought.trim() || isAnalyzing}
                  className="mt-4 w-full bg-navy text-white py-3 px-6 font-normal text-sm hover:bg-navy/90 disabled:bg-navy/30 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Thought →'}
                </button>
              )}
            </div>

            {/* Column 2: Cognitive Distortions */}
            <div className={`${currentStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 flex items-center justify-center border-2 text-sm font-normal ${
                  currentStep >= 2 ? 'border-navy bg-navy text-white' : 'border-navy/20 text-navy/40'
                }`}>
                  2
                </div>
                <h3 className="text-lg font-normal text-navy tracking-wider uppercase">
                  Distortions
                </h3>
              </div>

              {isAnalyzing ? (
                <div className="h-40 flex items-center justify-center bg-white/80 border border-navy/20">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-navy border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-navy/60 text-sm font-light">Analyzing...</p>
                  </div>
                </div>
              ) : distortions.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white/80 border border-navy/20 p-4 min-h-[160px]">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {distortions.map((distortion, index) => (
                        <DistortionBadge 
                          key={index} 
                          distortion={distortion}
                          showConfidence={true}
                        />
                      ))}
                    </div>
                    
                    {aiSuggestion && (
                      <div className="pt-4 border-t border-navy/10">
                        <p className="text-xs text-navy/60 mb-2 font-normal tracking-wider uppercase">
                          AI Suggestion
                        </p>
                        <p className="text-navy/80 text-sm font-light leading-relaxed">
                          {aiSuggestion}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {currentStep === 2 && (
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="w-full bg-navy text-white py-3 px-6 font-normal text-sm hover:bg-navy/90 transition-all"
                    >
                      Write Response →
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center bg-white/80 border border-navy/20">
                  <p className="text-navy/40 text-sm font-light">
                    Distortions will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Column 3: Rational Response */}
            <div className={`${currentStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 flex items-center justify-center border-2 text-sm font-normal ${
                  currentStep >= 3 ? 'border-navy bg-navy text-white' : 'border-navy/20 text-navy/40'
                }`}>
                  3
                </div>
                <h3 className="text-lg font-normal text-navy tracking-wider uppercase">
                  Rational Response
                </h3>
              </div>
              
              <textarea
                value={rationalResponse}
                onChange={(e) => setRationalResponse(e.target.value)}
                placeholder="Write a more balanced, realistic thought...&#10;&#10;Example: 'While I'm nervous, I've prepared well. Even if I make mistakes, it doesn't define my competence.'"
                className="w-full h-40 p-4 bg-white/80 border border-navy/20 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy transition-all resize-none"
                disabled={currentStep < 3 || isSaving}
              />
              
              {currentStep === 3 && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleSaveRecord}
                    disabled={!rationalResponse.trim() || isSaving}
                    className="w-full bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 disabled:bg-ocean/30 disabled:cursor-not-allowed transition-all"
                  >
                    {isSaving ? 'Saving...' : 'Save Entry'}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isSaving}
                    className="w-full bg-white/60 text-navy/60 py-2 px-6 font-normal text-sm hover:bg-white border border-navy/20 transition-all"
                  >
                    Clear & Start New
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-navy/70 hover:text-navy font-normal text-base mb-4 transition-colors"
          >
            <span>{showHistory ? '▼' : '▶'}</span>
            <span>View Past Entries</span>
          </button>
          
          {showHistory && <ThoughtRecordHistory />}
        </div>
      </div>
    </div>
  );
};

export default TripleColumnWorksheet;
