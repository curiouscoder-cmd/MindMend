import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BDIAssessment = ({ onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Simplified BDI-II questions (21 questions, 4 options each)
  const questions = [
    {
      id: 0,
      question: "Sadness",
      options: [
        { value: 0, text: "I do not feel sad" },
        { value: 1, text: "I feel sad much of the time" },
        { value: 2, text: "I am sad all the time" },
        { value: 3, text: "I am so sad or unhappy that I can't stand it" }
      ]
    },
    {
      id: 1,
      question: "Pessimism",
      options: [
        { value: 0, text: "I am not discouraged about my future" },
        { value: 1, text: "I feel more discouraged about my future than I used to" },
        { value: 2, text: "I do not expect things to work out for me" },
        { value: 3, text: "I feel my future is hopeless and will only get worse" }
      ]
    },
    {
      id: 2,
      question: "Past Failure",
      options: [
        { value: 0, text: "I do not feel like a failure" },
        { value: 1, text: "I have failed more than I should have" },
        { value: 2, text: "As I look back, I see a lot of failures" },
        { value: 3, text: "I feel I am a total failure as a person" }
      ]
    },
    {
      id: 3,
      question: "Loss of Pleasure",
      options: [
        { value: 0, text: "I get as much pleasure as I ever did from things I enjoy" },
        { value: 1, text: "I don't enjoy things as much as I used to" },
        { value: 2, text: "I get very little pleasure from things I used to enjoy" },
        { value: 3, text: "I can't get any pleasure from things I used to enjoy" }
      ]
    },
    {
      id: 4,
      question: "Guilty Feelings",
      options: [
        { value: 0, text: "I don't feel particularly guilty" },
        { value: 1, text: "I feel guilty over many things I have done or should have done" },
        { value: 2, text: "I feel quite guilty most of the time" },
        { value: 3, text: "I feel guilty all of the time" }
      ]
    },
    {
      id: 5,
      question: "Punishment Feelings",
      options: [
        { value: 0, text: "I don't feel I am being punished" },
        { value: 1, text: "I feel I may be punished" },
        { value: 2, text: "I expect to be punished" },
        { value: 3, text: "I feel I am being punished" }
      ]
    },
    {
      id: 6,
      question: "Self-Dislike",
      options: [
        { value: 0, text: "I feel the same about myself as ever" },
        { value: 1, text: "I have lost confidence in myself" },
        { value: 2, text: "I am disappointed in myself" },
        { value: 3, text: "I dislike myself" }
      ]
    },
    {
      id: 7,
      question: "Self-Criticalness",
      options: [
        { value: 0, text: "I don't criticize or blame myself more than usual" },
        { value: 1, text: "I am more critical of myself than I used to be" },
        { value: 2, text: "I criticize myself for all of my faults" },
        { value: 3, text: "I blame myself for everything bad that happens" }
      ]
    },
    {
      id: 8,
      question: "Crying",
      options: [
        { value: 0, text: "I don't cry anymore than I used to" },
        { value: 1, text: "I cry more than I used to" },
        { value: 2, text: "I cry over every little thing" },
        { value: 3, text: "I feel like crying, but I can't" }
      ]
    },
    {
      id: 9,
      question: "Agitation",
      options: [
        { value: 0, text: "I am no more restless or wound up than usual" },
        { value: 1, text: "I feel more restless or wound up than usual" },
        { value: 2, text: "I am so restless or agitated that it's hard to stay still" },
        { value: 3, text: "I am so restless or agitated that I have to keep moving or doing something" }
      ]
    }
  ];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate and show results
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (finalAnswers) => {
    const totalScore = Object.values(finalAnswers).reduce((sum, val) => sum + val, 0);
    
    // Save to localStorage
    const bdiScores = JSON.parse(localStorage.getItem('bdiScores') || '[]');
    bdiScores.push({
      value: totalScore,
      date: new Date().toISOString(),
      timestamp: Date.now()
    });
    localStorage.setItem('bdiScores', JSON.stringify(bdiScores));

    setShowResults(true);
    
    if (onComplete) {
      onComplete(totalScore);
    }
  };

  const getTotalScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  };

  const getScoreInterpretation = (score) => {
    if (score <= 13) {
      return {
        level: 'Minimal',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        message: 'Your responses suggest minimal depression. Keep up the good work with your mental wellness practices!'
      };
    } else if (score <= 19) {
      return {
        level: 'Mild',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        message: 'Your responses suggest mild depression. Continue using CBT exercises and consider reaching out for support.'
      };
    } else if (score <= 28) {
      return {
        level: 'Moderate',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        message: 'Your responses suggest moderate depression. We recommend speaking with a mental health professional.'
      };
    } else {
      return {
        level: 'Severe',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        message: 'Your responses suggest severe depression. Please reach out to a mental health professional as soon as possible.'
      };
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const score = getTotalScore();
  const interpretation = getScoreInterpretation(score);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {!showResults ? (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-navy/20 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-light text-navy">BDI Assessment</h2>
                <button
                  onClick={onClose}
                  className="text-navy/60 hover:text-navy text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-navy/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-ocean"
                />
              </div>
              <p className="text-xs text-navy/60 mt-2">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>

            {/* Question */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-normal text-navy mb-6">
                    {questions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        className="w-full text-left p-4 border-2 border-navy/20 rounded-lg hover:border-ocean hover:bg-ocean/5 transition-all"
                      >
                        <p className="text-sm text-navy">{option.text}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {currentQuestion > 0 && (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="mt-6 text-sm text-navy/60 hover:text-navy"
                >
                  ← Previous Question
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results */
          <div className="p-6">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-block"
              >
                <div className="text-6xl mb-4">📊</div>
              </motion.div>
              <h2 className="text-2xl font-light text-navy mb-2">Assessment Complete</h2>
              <p className="text-navy/60 text-sm">Your BDI score has been recorded</p>
            </div>

            {/* Score Display */}
            <div className={`${interpretation.bg} ${interpretation.border} border-2 rounded-lg p-6 mb-6`}>
              <div className="text-center mb-4">
                <p className="text-sm text-navy/60 mb-2">Your Score</p>
                <p className={`text-5xl font-light ${interpretation.color} mb-2`}>{score}</p>
                <p className={`text-lg font-normal ${interpretation.color}`}>{interpretation.level} Depression</p>
              </div>
              <p className="text-sm text-navy/80 text-center">{interpretation.message}</p>
            </div>

            {/* Score Range Reference */}
            <div className="bg-navy/5 rounded-lg p-4 mb-6">
              <p className="text-xs font-normal text-navy/60 mb-2">Score Interpretation:</p>
              <div className="space-y-1 text-xs text-navy/70">
                <p>• 0-13: Minimal depression</p>
                <p>• 14-19: Mild depression</p>
                <p>• 20-28: Moderate depression</p>
                <p>• 29-63: Severe depression</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-ocean text-white py-3 px-6 rounded-lg hover:bg-ocean/90 transition-all"
              >
                View Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setShowResults(false);
                }}
                className="flex-1 bg-white border-2 border-navy/20 text-navy py-3 px-6 rounded-lg hover:bg-navy/5 transition-all"
              >
                Retake Assessment
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-navy/50 text-center mt-4">
              ⚠️ This is a screening tool, not a diagnostic instrument. Please consult a mental health professional for proper evaluation.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BDIAssessment;
