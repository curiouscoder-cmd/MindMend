import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BDIResults from './BDIResults';
import { processAssessment } from '../../utils/bdiScoring';

const BDIAssessment = ({ onBack, user }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [direction, setDirection] = useState(1);
  
  const bdiQuestions = [
    // Section 1: Thoughts and Feelings (1-10)
    { id: 1, section: 'Thoughts and Feelings', question: 'Feeling sad or down in the dumps', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 2, section: 'Thoughts and Feelings', question: 'Feeling unhappy or blue', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 3, section: 'Thoughts and Feelings', question: 'Crying spells or tearfulness', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 4, section: 'Thoughts and Feelings', question: 'Feeling discouraged', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 5, section: 'Thoughts and Feelings', question: 'Feeling hopeless', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 6, section: 'Thoughts and Feelings', question: 'Low self-esteem', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 7, section: 'Thoughts and Feelings', question: 'Feeling worthless or inadequate', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 8, section: 'Thoughts and Feelings', question: 'Guilt or shame', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 9, section: 'Thoughts and Feelings', question: 'Criticizing yourself or blaming yourself', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 10, section: 'Thoughts and Feelings', question: 'Difficulty making decisions', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    
    // Section 2: Activities and Personal Relationships (11-17)
    { id: 11, section: 'Activities and Personal Relationships', question: 'Loss of interest in family, friends or colleagues', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 12, section: 'Activities and Personal Relationships', question: 'Loneliness', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 13, section: 'Activities and Personal Relationships', question: 'Spending less time with family or friends', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 14, section: 'Activities and Personal Relationships', question: 'Loss of motivation', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 15, section: 'Activities and Personal Relationships', question: 'Loss of interest in work or other activities', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 16, section: 'Activities and Personal Relationships', question: 'Avoiding work or other activities', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 17, section: 'Activities and Personal Relationships', question: 'Loss of pleasure or satisfaction in life', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    
    // Section 3: Physical Symptoms (18-22)
    { id: 18, section: 'Physical Symptoms', question: 'Feeling tired', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 19, section: 'Physical Symptoms', question: 'Difficulty sleeping or sleeping too much', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 20, section: 'Physical Symptoms', question: 'Decreased or increased appetite', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 21, section: 'Physical Symptoms', question: 'Loss of interest in sex', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 22, section: 'Physical Symptoms', question: 'Worrying about your health', options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    
    // Section 4: Suicidal Urges (23-25)
    { id: 23, section: 'Suicidal Urges', question: 'Do you have any suicidal thoughts?', isCritical: true, options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 24, section: 'Suicidal Urges', question: 'Would you like to end your life?', isCritical: true, options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] },
    { id: 25, section: 'Suicidal Urges', question: 'Do you have a plan for harming yourself?', isCritical: true, options: ['Not at all', 'Somewhat', 'Moderately', 'A lot', 'Extremely'] }
  ];

  const currentQuestion = bdiQuestions[currentQuestionIndex];
  const totalQuestions = bdiQuestions.length;

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Check for critical responses
    if (currentQuestion.isCritical && value >= 2) {
      setShowCrisisAlert(true);
    }

    // Auto-advance to next question after a brief delay
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setDirection(1);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        completeAssessment(newAnswers);
      }
    }, 400);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const completeAssessment = (finalAnswers) => {
    // Process assessment with proper scoring logic
    const results = processAssessment(finalAnswers);
    setAssessmentResults(results);
    setIsComplete(true);
    
    // Save to localStorage with full results
    const assessment = {
      userId: user?.uid,
      ...results,
      answers: finalAnswers
    };
    
    const history = JSON.parse(localStorage.getItem('bdiHistory') || '[]');
    history.push(assessment);
    localStorage.setItem('bdiHistory', JSON.stringify(history));
  };

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const answeredCount = Object.keys(answers).length;

  if (isComplete && assessmentResults) {
    return (
      <BDIResults 
        results={assessmentResults}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy/5 via-ocean/5 to-sky/10 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="mb-12 text-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-navy/50 hover:text-navy mb-8 font-normal mx-auto transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          
          <h1 className="text-5xl font-light text-navy mb-4 tracking-tight">
            Burns Depression Checklist
          </h1>
          <p className="text-navy/60 text-base font-light">
            Answer based on how you've been feeling over the past two weeks
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-xs text-navy/50 mb-3 font-normal">
            <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-navy/5 h-0.5 overflow-hidden">
            <motion.div
              className="h-full bg-navy"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Section Badge */}
            <div className="mb-6">
              <span className="text-xs text-navy/50 font-normal tracking-widest uppercase">
                {currentQuestion.section}
              </span>
            </div>

            {/* Question */}
            <div className={`p-10 transition-all ${
              currentQuestion.isCritical 
                ? 'bg-red-50/50 border-l-4 border-red-500' 
                : 'bg-white/40 border-l-4 border-navy/20'
            }`}>
              {currentQuestion.isCritical && (
                <div className="flex items-center gap-2 mb-6 text-red-600">
                  <span className="text-lg">⚠</span>
                  <span className="font-normal text-xs uppercase tracking-wider">Critical Assessment</span>
                </div>
              )}
              
              <h2 className="text-3xl font-light text-navy mb-10 leading-relaxed">
                {currentQuestion.question}
              </h2>

              <p className="text-xs font-normal text-navy/40 mb-6 tracking-wider uppercase">
                Select your response
              </p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-5 transition-all duration-200 border-l-2 ${
                      answers[currentQuestion.id] === index
                        ? 'bg-navy text-white border-navy shadow-md'
                        : currentQuestion.isCritical
                        ? 'bg-white/60 hover:bg-white border-red-200 hover:border-red-400 text-navy'
                        : 'bg-white/60 hover:bg-white border-navy/10 hover:border-navy/30 text-navy'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full transition-all ${
                        answers[currentQuestion.id] === index
                          ? 'bg-white'
                          : 'bg-navy/20'
                      }`} />
                      <span className={`text-base font-normal ${
                        answers[currentQuestion.id] === index ? 'text-white' : 'text-navy'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Back Button */}
            {currentQuestionIndex > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handlePrevious}
                className="mt-8 px-6 py-3 font-normal text-sm transition-all bg-transparent hover:bg-navy/5 text-navy/60 hover:text-navy border border-navy/10"
              >
                ← Previous
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Crisis Alert */}
        {showCrisisAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 max-w-md bg-red-50 border-l-4 border-red-600 p-6 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">⚠</span>
              <div>
                <h4 className="font-normal text-red-900 mb-2 text-base">Crisis Support Available</h4>
                <p className="text-sm text-red-800 mb-3 font-light">
                  If you're having thoughts of self-harm, please reach out for help immediately.
                </p>
                <div className="text-sm font-normal text-red-900 bg-white p-3 border-l-2 border-red-400">
                  National Suicide Prevention Lifeline: 988
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BDIAssessment;
