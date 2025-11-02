import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateDynamicQuestions,
  generateBalancedThought,
  analyzeThoughtChallengeWork,
  saveThoughtChallengeSession,
  getThoughtChallengeStats
} from '../../services/thoughtChallengerService';
import { detectDistortions } from '../../services/distortionDetection';
import DistortionBadge from './DistortionBadge';
import ThoughtChallengerStep1 from './ThoughtChallengerSteps/Step1Input';
import ThoughtChallengerStep2 from './ThoughtChallengerSteps/Step2Questions';
import ThoughtChallengerStep3 from './ThoughtChallengerSteps/Step3Balanced';
import ThoughtChallengerStep4 from './ThoughtChallengerSteps/Step4Review';

const ThoughtChallenger = ({ onBack = null, prefilledThought = null }) => {
  // Main state
  const [automaticThought, setAutomaticThought] = useState(prefilledThought || '');
  const [originalIntensity, setOriginalIntensity] = useState(5);
  const [distortions, setDistortions] = useState([]);
  
  // Dynamic questions state
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [tripleColumnTip, setTripleColumnTip] = useState('');
  
  // Balanced thought state
  const [balancedThought, setBalancedThought] = useState('');
  const [balancedIntensity, setBalancedIntensity] = useState(2);
  const [explanation, setExplanation] = useState('');
  const [affirmation, setAffirmation] = useState('');
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [workQuality, setWorkQuality] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load stats on mount
  useEffect(() => {
    const loadedStats = getThoughtChallengeStats();
    setStats(loadedStats);
  }, []);

  // Handle analyzing the automatic thought
  const handleAnalyzeThought = async () => {
    if (!automaticThought.trim()) {
      alert('Please enter an automatic thought');
      return;
    }

    setIsLoading(true);
    try {
      const distortionResult = await detectDistortions(automaticThought);
      setDistortions(distortionResult.distortions || []);

      const questionsResult = await generateDynamicQuestions(
        automaticThought,
        distortionResult.distortions || []
      );
      setQuestions(questionsResult.questions || []);
      setTripleColumnTip(questionsResult.tripleColumnTip || '');
      
      const initialAnswers = {};
      (questionsResult.questions || []).forEach(q => {
        initialAnswers[`q${q.id}`] = '';
      });
      setUserAnswers(initialAnswers);

      setCurrentStep(2);
    } catch (error) {
      console.error('Error analyzing thought:', error);
      alert('Failed to analyze thought. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const allQuestionsAnswered = questions.length > 0 && 
    questions.every(q => userAnswers[`q${q.id}`]?.trim().length > 0);

  const handleGenerateBalancedThought = async () => {
    if (!allQuestionsAnswered) {
      alert('Please answer all questions first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateBalancedThought(
        automaticThought,
        userAnswers,
        distortions
      );

      setBalancedThought(result.balancedThought || '');
      setExplanation(result.explanation || '');
      setAffirmation(result.affirmation || '');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating balanced thought:', error);
      alert('Failed to generate balanced thought. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewWork = async () => {
    if (!balancedThought.trim()) {
      alert('Please create a balanced thought first');
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await analyzeThoughtChallengeWork(
        automaticThought,
        balancedThought,
        userAnswers
      );

      setWorkQuality(analysis);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error analyzing work:', error);
      setWorkQuality({
        quality: 'good',
        feedback: 'Your work shows genuine reflection.',
        suggestions: []
      });
      setCurrentStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSession = () => {
    try {
      const sessionData = {
        automaticThought,
        originalIntensity,
        balancedThought,
        balancedIntensity,
        distortions,
        userAnswers,
        explanation,
        affirmation,
        workQuality
      };

      saveThoughtChallengeSession(sessionData);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAutomaticThought('');
        setOriginalIntensity(5);
        setBalancedIntensity(2);
        setDistortions([]);
        setQuestions([]);
        setUserAnswers({});
        setBalancedThought('');
        setExplanation('');
        setAffirmation('');
        setWorkQuality(null);
        setCurrentStep(1);
        
        const loadedStats = getThoughtChallengeStats();
        setStats(loadedStats);
      }, 2000);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear this entry and start over?')) {
      setAutomaticThought('');
      setOriginalIntensity(5);
      setBalancedIntensity(2);
      setDistortions([]);
      setQuestions([]);
      setUserAnswers({});
      setBalancedThought('');
      setExplanation('');
      setAffirmation('');
      setWorkQuality(null);
      setCurrentStep(1);
    }
  };

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
            🤔 Thought Challenger
          </h1>
          <p className="text-navy/60 font-light text-lg max-w-3xl">
            Challenge your negative thoughts with dynamic, personalized questions. 
            Transform automatic thoughts into balanced, realistic perspectives.
          </p>
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
                ✓ Thought challenge session saved successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Section */}
        {stats && stats.totalSessions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 border-l-4 border-ocean p-6 mb-8"
          >
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 text-navy font-normal text-base mb-4 hover:text-navy/80 transition-colors"
            >
              <span>{showStats ? '▼' : '▶'}</span>
              <span>📊 Your Progress ({stats.totalSessions} sessions)</span>
            </button>
            
            {showStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-light text-navy mb-1">
                    {stats.totalSessions}
                  </div>
                  <div className="text-sm text-navy/60 font-light">
                    Total Sessions
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-light text-ocean mb-1">
                    {stats.averageIntensityReduction}
                  </div>
                  <div className="text-sm text-navy/60 font-light">
                    Avg. Intensity Reduction
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-light text-sky mb-1">
                    {stats.sessionsThisWeek}
                  </div>
                  <div className="text-sm text-navy/60 font-light">
                    Sessions This Week
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Steps */}
        {currentStep === 1 && (
          <ThoughtChallengerStep1
            automaticThought={automaticThought}
            setAutomaticThought={setAutomaticThought}
            originalIntensity={originalIntensity}
            setOriginalIntensity={setOriginalIntensity}
            isLoading={isLoading}
            onAnalyze={handleAnalyzeThought}
          />
        )}

        {currentStep === 2 && (
          <ThoughtChallengerStep2
            questions={questions}
            userAnswers={userAnswers}
            distortions={distortions}
            tripleColumnTip={tripleColumnTip}
            expandedQuestion={expandedQuestion}
            setExpandedQuestion={setExpandedQuestion}
            onAnswerChange={handleAnswerChange}
            allQuestionsAnswered={allQuestionsAnswered}
            isLoading={isLoading}
            onGenerate={handleGenerateBalancedThought}
          />
        )}

        {currentStep === 3 && (
          <ThoughtChallengerStep3
            automaticThought={automaticThought}
            originalIntensity={originalIntensity}
            balancedThought={balancedThought}
            setBalancedThought={setBalancedThought}
            balancedIntensity={balancedIntensity}
            setBalancedIntensity={setBalancedIntensity}
            explanation={explanation}
            affirmation={affirmation}
            isLoading={isLoading}
            onReview={handleReviewWork}
          />
        )}

        {currentStep === 4 && workQuality && (
          <ThoughtChallengerStep4
            workQuality={workQuality}
            automaticThought={automaticThought}
            balancedThought={balancedThought}
            originalIntensity={originalIntensity}
            balancedIntensity={balancedIntensity}
            onSave={handleSaveSession}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default ThoughtChallenger;
