import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper: normalize incoming distortion type/name to our canonical keys
const normalizeType = (raw) => {
  if (!raw) return '';
  const s = String(raw).toLowerCase().trim();
  // remove non-alphanumerics to improve matching
  const compact = s.replace(/[^a-z]+/g, '-');
  const aliases = {
    'all-or-nothing': 'all-or-nothing',
    'black-and-white-thinking': 'all-or-nothing',
    'black-and-white': 'all-or-nothing',
    'overgeneralization': 'overgeneralization',
    'over-generalization': 'overgeneralization',
    'mental-filter': 'mental-filter',
    'filtering': 'mental-filter',
    'disqualifying-the-positive': 'disqualifying-positive',
    'disqualifying-positive': 'disqualifying-positive',
    'jumping-to-conclusions': 'jumping-to-conclusions',
    'mind-reading': 'jumping-to-conclusions',
    'mindreading': 'jumping-to-conclusions',
    'fortune-telling': 'jumping-to-conclusions',
    'magnification': 'magnification',
    'catastrophizing': 'magnification',
    'catastrophe-thinking': 'magnification',
    'emotional-reasoning': 'emotional-reasoning',
    'should-statements': 'should-statements',
    'shoulding': 'should-statements',
    'labeling': 'labeling',
    'labelling': 'labeling',
    'personalization': 'personalization',
    'personalisation': 'personalization',
  };
  return aliases[compact] || aliases[s.replace(/\s+/g, '-')] || compact;
};

// Distortion-specific questions
const questionsByDistortion = {
  'all-or-nothing': {
    name: 'All-or-Nothing Thinking',
    questions: [
      {
        question: "Is this thought really 100% true, or are there shades of gray?",
        hint: "Think about partial successes or times when it wasn't completely true"
      },
      {
        question: "Can you identify any middle ground or exceptions to this extreme view?",
        hint: "Consider: Have there been times when it was only partially true?"
      },
      {
        question: "If a friend said this about themselves, would you see it as black-or-white?",
        hint: "What more balanced perspective would you offer them?"
      }
    ]
  },
  'overgeneralization': {
    name: 'Overgeneralization',
    questions: [
      {
        question: "How many times has this actually happened? Is it really 'always'?",
        hint: "Try to count specific instances - you might be surprised"
      },
      {
        question: "What are some times when the opposite was true?",
        hint: "List at least 2-3 counterexamples"
      },
      {
        question: "If this happened once or twice, does that really mean it will happen forever?",
        hint: "Consider: What's the actual pattern versus your fear?"
      }
    ]
  },
  'mental-filter': {
    name: 'Mental Filter',
    questions: [
      {
        question: "What positive or neutral things am I ignoring in this situation?",
        hint: "Force yourself to list at least 3 things that weren't negative"
      },
      {
        question: "Am I focusing on one negative detail and ignoring the bigger picture?",
        hint: "What would a 'zoomed out' view look like?"
      },
      {
        question: "If I had to find 3 neutral or positive aspects, what would they be?",
        hint: "Even small things count - someone smiled, task completed, learned something"
      }
    ]
  },
  'disqualifying-positive': {
    name: 'Disqualifying the Positive',
    questions: [
      {
        question: "Am I dismissing positive experiences by saying they 'don't count'?",
        hint: "Why wouldn't they count? Would you discount a friend's success this way?"
      },
      {
        question: "What good things have happened that I'm minimizing or explaining away?",
        hint: "List them even if you want to say 'but it was luck' or 'anyone could do it'"
      },
      {
        question: "If a friend accomplished this, would I think it 'doesn't count'?",
        hint: "Would you dismiss their achievement as easily?"
      }
    ]
  },
  'jumping-to-conclusions': {
    name: 'Jumping to Conclusions',
    questions: [
      {
        question: "What actual evidence do I have for this conclusion?",
        hint: "Facts only - not assumptions, feelings, or mind-reading"
      },
      {
        question: "Am I mind-reading (assuming I know what others think) without real evidence?",
        hint: "Have they actually said this, or am I guessing?"
      },
      {
        question: "Am I fortune-telling (predicting the future) without facts?",
        hint: "What has actually happened vs. what I fear will happen?"
      }
    ]
  },
  'magnification': {
    name: 'Magnification (Catastrophizing)',
    questions: [
      {
        question: "Am I exaggerating the importance or likelihood of this problem?",
        hint: "What's the actual worst-case vs. what I'm imagining?"
      },
      {
        question: "What's the realistic worst, best, and most likely outcome?",
        hint: "Most things fall in the 'most likely' category, not the extremes"
      },
      {
        question: "Have I confused a disappointment with a disaster?",
        hint: "Disaster = life-threatening. Disappointment = uncomfortable but manageable"
      }
    ]
  },
  'emotional-reasoning': {
    name: 'Emotional Reasoning',
    questions: [
      {
        question: "Just because I feel this way, does that make it true?",
        hint: "Feelings are real, but they aren't always accurate reflections of reality"
      },
      {
        question: "What facts contradict this feeling?",
        hint: "List objective evidence that goes against the emotion"
      },
      {
        question: "What would I see if I looked at this without emotions clouding my view?",
        hint: "Imagine you're a neutral observer watching a movie of this situation"
      }
    ]
  },
  'should-statements': {
    name: 'Should Statements',
    questions: [
      {
        question: "Where did this 'should' rule come from? Is it realistic?",
        hint: "Who made this rule? Is it actually helpful or just pressuring you?"
      },
      {
        question: "What happens when I use 'should' to motivate myself?",
        hint: "Does it make you feel motivated or guilty and resentful?"
      },
      {
        question: "Am I setting an impossible standard that even others can't meet?",
        hint: "Would you expect a friend to follow this 'should'?"
      }
    ]
  },
  'labeling': {
    name: 'Labeling',
    questions: [
      {
        question: "Am I defining my entire self based on one action or mistake?",
        hint: "You're not 'a failure' - you failed at one thing"
      },
      {
        question: "Would I use this harsh label for a friend who did the same thing?",
        hint: "What would you call them? Probably something kinder"
      },
      {
        question: "What are some of my positive qualities that this label ignores?",
        hint: "List 3-5 things you're good at or times you've succeeded"
      }
    ]
  },
  'personalization': {
    name: 'Personalization',
    questions: [
      {
        question: "Am I taking responsibility for something outside my control?",
        hint: "What factors were genuinely in your control vs. external?"
      },
      {
        question: "What other factors contributed to this situation?",
        hint: "Other people? Circumstances? Timing? Bad luck?"
      },
      {
        question: "Would I blame a friend this much if they were in the same situation?",
        hint: "You'd probably see it more accurately for them"
      }
    ]
  }
};

const SocraticQuestions = ({ automaticThought, distortions, onQualityChange, onAnswersChange, onSubmitAnswers }) => {
  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: ''
  });
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisFeedback, setAnalysisFeedback] = useState(null);

  // Get questions based on primary distortion
  const getQuestions = () => {
    if (!distortions || distortions.length === 0) {
      return [];
    }

    const d = distortions[0];
    const primaryDistortion = normalizeType(d.type || d.name);
    const distortionQuestions = questionsByDistortion[primaryDistortion];

    console.log('🔍 Primary distortion:', primaryDistortion, 'from', d);

    if (distortionQuestions) {
      return distortionQuestions.questions.slice(0, 3);
    }

    // Fallback: generic Socratic prompts
    return [
      { question: 'What facts support and contradict this thought?', hint: 'List objective evidence for and against it' },
      { question: 'If a friend had this thought, how would you respond?', hint: 'Write the balanced message you would give them' },
      { question: 'What is a more realistic, compassionate way to see this?', hint: 'Aim for balanced, not overly positive' },
    ];
  };

  const questions = getQuestions();

  const handleSubmitAnswers = async () => {
    setIsAnalyzing(true);
    setAnalysisFeedback(null);

    try {
      if (onSubmitAnswers) {
        const result = await onSubmitAnswers(answers);
        if (result.approved) {
          setAnalysisFeedback({
            type: 'success',
            message: result.message || '✅ Great reflection! You can now write your rational response.'
          });
        } else {
          setAnalysisFeedback({
            type: 'warning',
            message: result.message || '⚠️ Please provide more thoughtful answers.',
            suggestion: result.suggestion
          });
        }
      }
    } catch (error) {
      console.error('Error analyzing answers:', error);
      setAnalysisFeedback({
        type: 'error',
        message: 'Failed to analyze answers. Please try again.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateQuality = () => {
    const questionAnswers = [answers.q1, answers.q2, answers.q3];
    const filledAnswers = questionAnswers.filter(a => a.trim().length > 0).length;
    return Math.round((filledAnswers / 3) * 100);
  };

  const quality = calculateQuality();
  const allQuestionsAnswered = answers.q1.trim().length > 0 && answers.q2.trim().length > 0 && answers.q3.trim().length > 0;

  const handleAnswerChange = (id, value) => {
    const newAnswers = { ...answers, [id]: value };
    setAnswers(newAnswers);
    
    // Notify parent of quality change
    if (onQualityChange) {
      const newQuality = Math.round(
        (Object.values(newAnswers).filter(a => a.trim().length > 0).length / 3) * 100
      );
      onQualityChange(newQuality);
    }
    
    // Notify parent of answers change (for auto-population)
    if (onAnswersChange) {
      onAnswersChange(newAnswers);
    }
  };

  return (
    <div className="space-y-6">
      {/* Socratic Questions Section */}
      <div className="bg-white/80 border border-navy/20 p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🤔</span>
          <h3 className="text-lg font-normal text-navy tracking-wider uppercase">
            Challenge This Thought
          </h3>
        </div>

        <p className="text-navy/70 text-sm font-light mb-6 leading-relaxed">
          Use these questions to examine your thought from different angles. There's no right answer - just be honest with yourself.
        </p>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const answerId = `q${idx + 1}`;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-navy/10 rounded-lg overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                  className="w-full p-4 bg-navy/5 hover:bg-navy/10 transition-colors flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-normal text-navy/60 w-6 text-center">
                      {idx + 1}
                    </span>
                    <span className="text-navy font-normal text-sm">
                      {q.question}
                    </span>
                  </div>
                  <motion.svg
                    animate={{ rotate: expandedQuestion === idx ? 180 : 0 }}
                    className="w-4 h-4 text-navy/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </motion.svg>
                </button>

                {/* Question Content */}
                <AnimatePresence>
                  {expandedQuestion === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-navy/10 p-4 bg-white space-y-3"
                    >
                      <p className="text-xs text-navy/60 font-light italic">
                        💡 {q.hint}
                      </p>
                      <textarea
                        value={answers[answerId]}
                        onChange={(e) => handleAnswerChange(answerId, e.target.value)}
                        placeholder="Write your answer here..."
                        className="w-full h-24 p-3 bg-navy/5 border border-navy/10 text-navy placeholder:text-navy/40 font-light text-sm focus:outline-none focus:border-navy/30 transition-all resize-none rounded"
                      />
                      <p className="text-xs text-navy/50 font-light">
                        {answers[answerId].length} characters
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Submit Button */}
        {allQuestionsAnswered && (
          <div className="mt-6">
            <button
              onClick={handleSubmitAnswers}
              disabled={isAnalyzing}
              className="w-full bg-ocean text-white py-3 px-6 font-normal text-sm hover:bg-ocean/90 disabled:bg-ocean/50 disabled:cursor-not-allowed transition-all rounded"
            >
              {isAnalyzing ? '⏳ Analyzing Your Answers...' : '🔍 Analyze My Answers'}
            </button>
          </div>
        )}

        {/* Analysis Feedback */}
        {analysisFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded ${
              analysisFeedback.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : analysisFeedback.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <p className="text-sm font-normal">{analysisFeedback.message}</p>
            {analysisFeedback.suggestion && (
              <p className="text-xs mt-2 opacity-80">
                💡 {analysisFeedback.suggestion}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Quality Indicator */}
      <div className="bg-white/80 border border-navy/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-normal text-navy/60 uppercase tracking-wider">
            Reflection Quality
          </span>
          <span className="text-sm font-normal text-navy">
            {quality}%
          </span>
        </div>
        <div className="w-full h-2 bg-navy/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${quality}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-ocean to-sky"
          />
        </div>
        <p className="text-xs text-navy/50 font-light mt-2">
          {quality < 33 && 'Take your time - answer thoughtfully'}
          {quality >= 33 && quality < 66 && 'Good progress - keep going'}
          {quality >= 66 && quality < 100 && 'Almost there - complete all questions'}
          {quality === 100 && allQuestionsAnswered && 'All questions answered! Click "Analyze My Answers" above'}
        </p>
      </div>

    </div>
  );
};

export default SocraticQuestions;
