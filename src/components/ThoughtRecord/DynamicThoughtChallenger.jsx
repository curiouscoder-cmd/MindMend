import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateDynamicQuestionsForThought,
  generatePersonalizedBalancedThought,
  generateCopingStatements,
  evaluateThoughtWork
} from '../../services/dynamicQuestionGenerator';
import { detectDistortions } from '../../services/distortionDetection';
import DistortionBadge from './DistortionBadge';

const DynamicThoughtChallenger = ({ onBack = null, prefilledThought = null }) => {
  // Step 1: Input
  const [automaticThought, setAutomaticThought] = useState(prefilledThought || '');
  const [originalIntensity, setOriginalIntensity] = useState(5);
  const [distortions, setDistortions] = useState([]);

  // Step 2: Dynamic Questions
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [keyInsight, setKeyInsight] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Step 3: Balanced Thought
  const [balancedThought, setBalancedThought] = useState('');
  const [balancedIntensity, setBalancedIntensity] = useState(2);
  const [explanation, setExplanation] = useState('');
  const [affirmation, setAffirmation] = useState('');

  // Step 4: Coping Statements
  const [copingStatements, setCopingStatements] = useState([]);

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle analyzing thought
  const handleAnalyzeThought = async () => {
    if (!automaticThought.trim()) {
      alert('Please enter a thought');
      return;
    }

    setIsLoading(true);
    try {
      // Detect distortions
      const distortionResult = await detectDistortions(automaticThought);
      setDistortions(distortionResult.distortions || []);

      // Generate dynamic questions
      const questionsResult = await generateDynamicQuestionsForThought(
        automaticThought,
        distortionResult.distortions || []
      );
      setQuestions(questionsResult.questions || []);
      setKeyInsight(questionsResult.keyInsight || '');

      // Initialize answers
      const initialAnswers = {};
      (questionsResult.questions || []).forEach(q => {
        initialAnswers[`q${q.id}`] = '';
      });
      setUserAnswers(initialAnswers);

      setCurrentStep(2);
    } catch (error) {
      console.error('Error:', error);
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

  const handleGenerateBalanced = async () => {
    if (!allQuestionsAnswered) {
      alert('Please answer all questions');
      return;
    }

    setIsLoading(true);
    try {
      const result = await generatePersonalizedBalancedThought(
        automaticThought,
        userAnswers,
        distortions
      );

      setBalancedThought(result.balancedThought || '');
      setExplanation(result.explanation || '');
      setAffirmation(result.affirmation || '');

      // Generate coping statements
      const copingResult = await generateCopingStatements(
        automaticThought,
        distortions,
        'general'
      );
      setCopingStatements(copingResult.statements || []);

      setCurrentStep(3);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate balanced thought');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!balancedThought.trim()) {
      alert('Please create a balanced thought first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await evaluateThoughtWork(
        automaticThought,
        balancedThought,
        userAnswers,
        distortions
      );

      setEvaluation(result);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error:', error);
      setEvaluation({
        quality: 'good',
        feedback: 'Your work shows genuine reflection.',
        strengths: [],
        suggestions: []
      });
      setCurrentStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
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
        copingStatements,
        evaluation,
        timestamp: new Date().toISOString()
      };

      // Save to localStorage
      const sessions = JSON.parse(localStorage.getItem('dynamicThoughtSessions') || '[]');
      sessions.unshift({
        id: Date.now().toString(),
        ...sessionData,
        createdAt: Date.now()
      });

      if (sessions.length > 50) sessions.pop();
      localStorage.setItem('dynamicThoughtSessions', JSON.stringify(sessions));

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset
        setAutomaticThought('');
        setOriginalIntensity(5);
        setBalancedIntensity(2);
        setDistortions([]);
        setQuestions([]);
        setUserAnswers({});
        setBalancedThought('');
        setExplanation('');
        setAffirmation('');
        setCopingStatements([]);
        setEvaluation(null);
        setCurrentStep(1);
      }, 2000);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save session');
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear and start over?')) {
      setAutomaticThought('');
      setOriginalIntensity(5);
      setBalancedIntensity(2);
      setDistortions([]);
      setQuestions([]);
      setUserAnswers({});
      setBalancedThought('');
      setExplanation('');
      setAffirmation('');
      setCopingStatements([]);
      setEvaluation(null);
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
            🧠 Dynamic Thought Challenger
          </h1>
          <p className="text-navy/60 font-light text-lg max-w-3xl">
            Challenge your thoughts with AI-powered, personalized questions that adapt to your specific situation.
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
                ✓ Session saved successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Input Thought */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white/60 border-l-4 border-navy p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 flex items-center justify-center border-2 border-navy bg-navy text-white text-sm font-normal">
                  1
                </div>
                <h2 className="text-2xl font-normal text-navy tracking-wider uppercase">
                  Your Thought
                </h2>
              </div>

              <textarea
                value={automaticThought}
                onChange={(e) => setAutomaticThought(e.target.value)}
                placeholder="What's the negative thought you want to challenge?"
                className="w-full h-32 p-4 bg-white/80 border border-navy/20 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy transition-all resize-none rounded mb-6"
              />

              <div className="mb-6">
                <label className="text-sm font-normal text-navy/60 mb-3 block">
                  Intensity: {originalIntensity}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={originalIntensity}
                  onChange={(e) => setOriginalIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-navy/10 rounded-lg"
                />
              </div>

              <button
                onClick={handleAnalyzeThought}
                disabled={!automaticThought.trim() || isLoading}
                className="w-full bg-navy text-white py-3 px-6 font-normal text-sm hover:bg-navy/90 disabled:bg-navy/30 transition-all rounded"
              >
                {isLoading ? 'Analyzing...' : 'Generate Dynamic Questions →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Answer Questions */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {distortions.length > 0 && (
              <div className="bg-white/60 border-l-4 border-ocean p-6">
                <h3 className="text-sm font-normal text-navy/60 mb-3 tracking-wider uppercase">
                  Distortions Found
                </h3>
                <div className="flex flex-wrap gap-2">
                  {distortions.map((d, i) => (
                    <DistortionBadge key={i} distortion={d} showConfidence={true} />
                  ))}
                </div>
              </div>
            )}

            {keyInsight && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                <p className="text-blue-800 font-light">
                  💡 <strong>Key Insight:</strong> {keyInsight}
                </p>
              </div>
            )}

            <div className="bg-white/60 border-l-4 border-navy p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 flex items-center justify-center border-2 border-navy bg-navy text-white text-sm font-normal">
                  2
                </div>
                <h2 className="text-2xl font-normal text-navy tracking-wider uppercase">
                  Answer Questions
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {questions.map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border border-navy/10 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                      className="w-full p-4 bg-navy/5 hover:bg-navy/10 transition-colors flex items-center justify-between text-left"
                    >
                      <div className="flex-1">
                        <p className="text-navy font-normal text-sm">{q.question}</p>
                        <p className="text-xs text-navy/50 font-light mt-1">{q.category}</p>
                      </div>
                      <motion.svg
                        animate={{ rotate: expandedQuestion === idx ? 180 : 0 }}
                        className="w-4 h-4 text-navy/60 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {expandedQuestion === idx && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-navy/10 p-4 bg-white space-y-3"
                        >
                          <p className="text-xs text-navy/60 font-light italic">
                            💡 {q.purpose}
                          </p>
                          <textarea
                            value={userAnswers[`q${q.id}`] || ''}
                            onChange={(e) => handleAnswerChange(`q${q.id}`, e.target.value)}
                            placeholder="Your answer..."
                            className="w-full h-24 p-3 bg-navy/5 border border-navy/10 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy/30 transition-all resize-none rounded"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleGenerateBalanced}
                disabled={!allQuestionsAnswered || isLoading}
                className="w-full bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 disabled:bg-ocean/30 transition-all rounded"
              >
                {isLoading ? 'Generating...' : 'Create Balanced Thought →'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Balanced Thought & Coping */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 p-6 rounded">
                <h3 className="text-sm font-normal text-red-800 mb-2 uppercase tracking-wider">
                  Original
                </h3>
                <p className="text-red-900 font-light text-sm mb-3">{automaticThought}</p>
                <div className="text-lg font-light text-red-700">Intensity: {originalIntensity}/10</div>
              </div>

              <div className="bg-green-50 border border-green-200 p-6 rounded">
                <h3 className="text-sm font-normal text-green-800 mb-2 uppercase tracking-wider">
                  Balanced
                </h3>
                <textarea
                  value={balancedThought}
                  onChange={(e) => setBalancedThought(e.target.value)}
                  placeholder="Edit if needed..."
                  className="w-full h-20 p-3 bg-white border border-green-200 text-green-900 placeholder:text-green-700/40 font-light text-sm focus:outline-none focus:border-green-400 transition-all resize-none rounded mb-3"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-700 font-light">New Intensity:</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={balancedIntensity}
                    onChange={(e) => setBalancedIntensity(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-green-200 rounded-lg"
                  />
                  <span className="text-lg font-light text-green-700 w-8">{balancedIntensity}</span>
                </div>
              </div>
            </div>

            {explanation && (
              <div className="bg-blue-50 border border-blue-200 p-6 rounded">
                <h3 className="text-sm font-normal text-blue-800 mb-2 uppercase tracking-wider">
                  How This Helps
                </h3>
                <p className="text-blue-900 font-light text-sm">{explanation}</p>
              </div>
            )}

            {affirmation && (
              <div className="bg-purple-50 border border-purple-200 p-6 rounded">
                <h3 className="text-sm font-normal text-purple-800 mb-2 uppercase tracking-wider">
                  💪 Affirmation
                </h3>
                <p className="text-purple-900 font-light text-sm italic">{affirmation}</p>
              </div>
            )}

            {copingStatements.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded">
                <h3 className="text-sm font-normal text-yellow-800 mb-3 uppercase tracking-wider">
                  Coping Statements
                </h3>
                <ul className="space-y-2">
                  {copingStatements.map((stmt, i) => (
                    <li key={i} className="flex items-start gap-2 text-yellow-900 font-light text-sm">
                      <span className="text-yellow-600 mt-1">✓</span>
                      <span>{stmt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={!balancedThought.trim() || isLoading}
              className="w-full bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 disabled:bg-ocean/30 transition-all rounded"
            >
              {isLoading ? 'Evaluating...' : 'Review & Save →'}
            </button>
          </motion.div>
        )}

        {/* Step 4: Evaluation */}
        {currentStep === 4 && evaluation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className={`p-6 rounded ${
              evaluation.quality === 'excellent' ? 'bg-green-50 border border-green-200' :
              evaluation.quality === 'good' ? 'bg-blue-50 border border-blue-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              <h3 className={`text-lg font-normal uppercase tracking-wider mb-2 ${
                evaluation.quality === 'excellent' ? 'text-green-800' :
                evaluation.quality === 'good' ? 'text-blue-800' :
                'text-yellow-800'
              }`}>
                {evaluation.quality === 'excellent' ? '⭐ Excellent!' :
                 evaluation.quality === 'good' ? '👍 Good Work!' :
                 '💭 Keep Reflecting'}
              </h3>
              <p className={`font-light text-sm ${
                evaluation.quality === 'excellent' ? 'text-green-900' :
                evaluation.quality === 'good' ? 'text-blue-900' :
                'text-yellow-900'
              }`}>
                {evaluation.feedback}
              </p>
            </div>

            {evaluation.strengths?.length > 0 && (
              <div className="bg-green-50 border border-green-200 p-6 rounded">
                <h3 className="text-sm font-normal text-green-800 mb-3 uppercase tracking-wider">
                  ✨ Strengths
                </h3>
                <ul className="space-y-2">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-green-900 font-light text-sm">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.suggestions?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded">
                <h3 className="text-sm font-normal text-yellow-800 mb-3 uppercase tracking-wider">
                  💡 Suggestions
                </h3>
                <ul className="space-y-2">
                  {evaluation.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-yellow-900 font-light text-sm">
                      <span className="text-yellow-600 mt-1">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 transition-all rounded"
              >
                💾 Save Session
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-white/60 text-navy/60 py-3 px-6 font-normal text-sm hover:bg-white border border-navy/20 transition-all rounded"
              >
                🔄 Start Over
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DynamicThoughtChallenger;
