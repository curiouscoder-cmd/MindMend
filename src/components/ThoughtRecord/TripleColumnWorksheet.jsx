import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DistortionBadge from './DistortionBadge';
import DistortionExplainer from './DistortionExplainer';
import SocraticQuestions from './SocraticQuestions';
import ThoughtRecordHistory from './ThoughtRecordHistory';
import { detectDistortions, saveThoughtRecord, validateRationalResponse, analyzeQuestionAnswers } from '../../services/distortionDetection';
import { saveThoughtRecordToFirestore } from '../../services/thoughtRecordService';

const TripleColumnWorksheet = ({ prefilledThought = null, onBack = null, onNavigate = null, user = null }) => {
  console.log('🎨 TripleColumnWorksheet rendering...');
  
  const [automaticThought, setAutomaticThought] = useState(prefilledThought || '');
  const [distortions, setDistortions] = useState([]);
  const [rationalResponse, setRationalResponse] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationFeedback, setValidationFeedback] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDistortion, setSelectedDistortion] = useState(null);
  const [showDistortionExplainer, setShowDistortionExplainer] = useState(false);
  const [questionQuality, setQuestionQuality] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [answersApproved, setAnswersApproved] = useState(false);
  const [responseValidated, setResponseValidated] = useState(false);
  const [isValidatingResponse, setIsValidatingResponse] = useState(false);

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
    setRationalResponse('');

    try {
      console.log('🔍 Analyzing thought:', automaticThought);
      const result = await detectDistortions(automaticThought);
      console.log('✅ Distortions detected:', result);
      
      if (result && result.distortions && result.distortions.length > 0) {
        setDistortions(result.distortions);
        setCurrentStep(2);
        setRationalResponse('');
      } else {
        alert('No distortions detected. Please try another thought.');
      }
    } catch (error) {
      console.error('❌ Error analyzing thought:', error);
      alert('Failed to analyze thought. Please check your API key and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShowDistortionExplainer = (distortion) => {
    setSelectedDistortion(distortion);
    setShowDistortionExplainer(true);
  };

  const handleSubmitAnswers = async (answers) => {
    try {
      const result = await analyzeQuestionAnswers(automaticThought, answers, distortions);
      
      if (result.approved) {
        setAnswersApproved(true);
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting answers:', error);
      return {
        approved: false,
        message: 'Failed to analyze answers. Please try again.'
      };
    }
  };

  const handleValidateResponse = async () => {
    if (!rationalResponse.trim()) {
      alert('Please write a rational response first');
      return;
    }

    setIsValidatingResponse(true);
    setValidationFeedback(null);

    try {
      const validation = await validateRationalResponse(automaticThought, rationalResponse, distortions);
      
      if (validation.isRational) {
        setResponseValidated(true);
        setValidationFeedback({
          type: 'success',
          message: validation.feedback || '✅ Great! Your response effectively challenges the negative thought. You can now save it.'
        });
      } else {
        setResponseValidated(false);
        setValidationFeedback({
          type: 'warning',
          message: validation.feedback || '⚠️ Your response needs improvement to effectively challenge the thought.',
          suggestion: validation.suggestion
        });
      }
    } catch (error) {
      console.error('Error validating response:', error);
      setValidationFeedback({
        type: 'error',
        message: 'Failed to validate response. Please try again.'
      });
    } finally {
      setIsValidatingResponse(false);
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

    if (!responseValidated) {
      alert('Please validate your response first by clicking "Analyze Response"');
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

      // Save to localStorage and Firestore
      await saveThoughtRecord(record);
      
      // Save to Firestore (if user is logged in)
      if (user && user.uid) {
        try {
          await saveThoughtRecordToFirestore(user.uid, record);
          console.log('✅ Saved to both localStorage and Firestore');
        } catch (firestoreError) {
          console.error('Failed to save to Firestore, but saved locally:', firestoreError);
        }
      }
      
      // Show success message
      setShowSuccess(true);
      setValidationFeedback({
        type: 'success',
        message: 'Great work! Your rational response is balanced and helpful.'
      });
      
      setTimeout(() => {
        setShowSuccess(false);
        setValidationFeedback(null);
      }, 3000);

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
      setValidationFeedback(null);
    }
  };

  console.log('📊 Rendering with state:', { currentStep, distortions: distortions.length });

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
                placeholder="What's the negative thought on your mind?"
                className="w-full h-24 p-4 bg-white/80 border border-navy/20 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy transition-all resize-none rounded"
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
                          showConfidence={false}
                          onClick={() => handleShowDistortionExplainer(distortion)}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-navy/50 font-light">
                      💡 Click on any distortion to learn how to challenge it
                    </p>
                    
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

              {currentStep >= 3 && (
                <>
                  <div className="bg-white/80 border border-navy/20 p-4 rounded mb-3">
                    <p className="text-xs text-navy/60 font-normal uppercase tracking-wider mb-2">
                      ✍️ Your Balanced Response
                    </p>
                    <textarea
                      value={rationalResponse}
                      onChange={(e) => {
                        setRationalResponse(e.target.value);
                        setValidationFeedback(null);
                        setResponseValidated(false); // Reset validation when user edits
                      }}
                      placeholder={!answersApproved ? 'Complete and submit the questions below first...' : 'Write your balanced, rational response here...'}
                      disabled={!answersApproved}
                      className={`w-full h-32 p-4 bg-navy/5 border border-navy/20 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy transition-all resize-none rounded ${
                        !answersApproved ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    
                    {!answersApproved && (
                      <p className="text-xs text-navy/50 font-light mt-2 italic">
                        💡 Answer all questions below and click "Analyze My Answers" to unlock this field
                      </p>
                    )}

                    {answersApproved && rationalResponse.trim() && (
                      <div className="mt-4">
                        <button
                          onClick={handleValidateResponse}
                          disabled={isValidatingResponse}
                          className="w-full bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 disabled:bg-ocean/50 disabled:cursor-not-allowed transition-all rounded"
                        >
                          {isValidatingResponse ? '⏳ Analyzing Response...' : '🔍 Analyze Response'}
                        </button>
                      </div>
                    )}
                    
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Socratic Questions Section (Below Table) */}
        {currentStep >= 3 && (
          <div className="mb-8">
            <SocraticQuestions 
              automaticThought={automaticThought}
              distortions={distortions}
              onQualityChange={setQuestionQuality}
              onAnswersChange={(answers) => {
                setQuestionAnswers(answers);
              }}
              onSubmitAnswers={handleSubmitAnswers}
            />
          </div>
        )}

        {/* Validation Feedback */}
        {currentStep >= 3 && validationFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 text-sm font-light ${
              validationFeedback.type === 'success' 
                ? 'bg-green-50 text-green-800 border-l-4 border-green-500' 
                : 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500'
            }`}
          >
            <p className="mb-2">{validationFeedback.message}</p>
            {validationFeedback.suggestion && (
              <p className="text-xs italic opacity-80">
                💡 Tip: {validationFeedback.suggestion}
              </p>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        {currentStep >= 3 && (
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleSaveRecord}
              disabled={!responseValidated || isSaving}
              className="flex-1 bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 disabled:bg-ocean/30 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? '💾 Saving...' : '💾 Save Entry'}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isSaving || isValidating}
              className="flex-1 bg-white/60 text-navy/60 py-3 px-6 font-normal text-sm hover:bg-white border border-navy/20 transition-all"
            >
              🔄 Start Over
            </button>
          </div>
        )}

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

      {/* Distortion Explainer Modal */}
      <DistortionExplainer 
        distortion={selectedDistortion}
        isOpen={showDistortionExplainer}
        onClose={() => setShowDistortionExplainer(false)}
      />
    </div>
  );
};

export default TripleColumnWorksheet;
