import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePersonalizedDistortionExplanation, generateDynamicDistortionQuestions } from '../../services/distortionDetection';

// Normalize incoming types/names to canonical keys used below
const normalizeType = (raw) => {
  if (!raw) return '';
  const s = String(raw).toLowerCase().trim();
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

const DistortionExplainer = ({ distortion, isOpen, onClose, automaticThought = null }) => {
  const [personalizedExplanation, setPersonalizedExplanation] = React.useState(null);
  const [dynamicQuestions, setDynamicQuestions] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && automaticThought && distortion) {
      loadPersonalizedContent();
    }
  }, [isOpen, automaticThought, distortion]);

  const loadPersonalizedContent = async () => {
    setIsLoading(true);
    try {
      const [explanationResult, questionsResult] = await Promise.all([
        generatePersonalizedDistortionExplanation(automaticThought, distortion.name || distortion.type),
        generateDynamicDistortionQuestions(automaticThought, distortion.name || distortion.type)
      ]);
      
      setPersonalizedExplanation(explanationResult.explanation);
      setDynamicQuestions(questionsResult.questions);
    } catch (error) {
      console.error('Error loading personalized content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!distortion) return null;

  const explanations = {
    'all-or-nothing': {
      name: 'All-or-Nothing Thinking',
      description: 'Seeing things in black-and-white categories with no middle ground.',
      redFlags: [
        '"Always", "never", "completely"',
        '"I am not a person made for this"',
        '"This is either perfect or worthless"',
        '"If I\'m not the best, I\'m a failure"'
      ],
      challenge: [
        'Replace with: "This time I...", "In this situation..."',
        'Or: "I struggle with... but I\'m also good at..."',
        'Look for the gray area: "Sometimes I...", "It depends on..."'
      ]
    },
    'overgeneralization': {
      name: 'Overgeneralization',
      description: 'Viewing a single negative event as a never-ending pattern.',
      redFlags: [
        '"Every time I try, I fail"',
        '"This always happens to me"',
        '"I\'ll never be good at this"',
        '"This one mistake means I\'m hopeless"'
      ],
      challenge: [
        'Look for exceptions: "Last time I succeeded at..."',
        'Use specific language: "This time" instead of "always"',
        'Separate events: "This situation is different from..."'
      ]
    },
    'mental-filter': {
      name: 'Mental Filter',
      description: 'Dwelling exclusively on negative details while ignoring positives.',
      redFlags: [
        'Focusing only on criticism, ignoring praise',
        '"Nobody appreciated my effort"',
        '"The one bad thing ruins everything"',
        'Replaying mistakes while forgetting successes'
      ],
      challenge: [
        'List 3 positive things that also happened',
        'Ask: "What did I do well today?"',
        'Balance: "Yes, AND I also..."'
      ]
    },
    'disqualifying-positive': {
      name: 'Disqualifying the Positive',
      description: 'Rejecting positive experiences as not counting.',
      redFlags: [
        '"That doesn\'t count, anyone could do it"',
        '"They were just being nice"',
        '"It was just luck"',
        '"That\'s not a real accomplishment"'
      ],
      challenge: [
        'Accept the compliment: "Thank you, I worked hard on that"',
        'Acknowledge effort: "I did prepare for this"',
        'Recognize skill: "I have developed this ability"'
      ]
    },
    'jumping-to-conclusions': {
      name: 'Jumping to Conclusions',
      description: 'Making negative interpretations without evidence.',
      redFlags: [
        'Mind reading: "They think I\'m stupid"',
        'Fortune telling: "This will go terribly"',
        '"I know what will happen"',
        'Assuming without asking'
      ],
      challenge: [
        'Ask for evidence: "What proof do I have?"',
        'Check your assumptions: "I could ask them..."',
        'Consider alternatives: "Another possibility is..."'
      ]
    },
    'magnification': {
      name: 'Magnification (Catastrophizing)',
      description: 'Exaggerating the importance or consequences of negative events.',
      redFlags: [
        '"This is a disaster"',
        '"This is the worst thing that could happen"',
        '"I can\'t handle this"',
        '"Everything is ruined"'
      ],
      challenge: [
        'Reality check: "On a scale of 1-10, how bad is this really?"',
        'Perspective: "Will this matter in a week/month/year?"',
        'Coping: "I\'ve handled difficult things before"'
      ]
    },
    'emotional-reasoning': {
      name: 'Emotional Reasoning',
      description: 'Taking emotions as evidence for truth.',
      redFlags: [
        '"I feel anxious, so something bad will happen"',
        '"I feel like a failure, so I am one"',
        '"I feel scared, so it must be dangerous"',
        'Treating feelings as facts'
      ],
      challenge: [
        'Separate feeling from fact: "I feel anxious, but that doesn\'t mean..."',
        'Question the emotion: "Why do I feel this way?"',
        'Look for evidence: "What\'s the actual evidence?"'
      ]
    },
    'should-statements': {
      name: 'Should Statements',
      description: 'Using "should" and "must" to pressure yourself.',
      redFlags: [
        '"I should be perfect"',
        '"I must not make mistakes"',
        '"I should have known better"',
        '"I ought to be able to handle this"'
      ],
      challenge: [
        'Replace with: "I would prefer to...", "I\'d like to..."',
        'Be realistic: "I\'m human and make mistakes"',
        'Self-compassion: "I did my best with what I knew"'
      ]
    },
    'labeling': {
      name: 'Labeling',
      description: 'Creating negative self-image based on errors or setbacks.',
      redFlags: [
        '"I\'m a failure"',
        '"I\'m stupid"',
        '"I\'m a loser"',
        '"I\'m worthless"'
      ],
      challenge: [
        'Separate action from identity: "I made a mistake, not I am a mistake"',
        'Be specific: "I struggled with this task, not I\'m bad at everything"',
        'Remember complexity: "I\'m a person with many qualities"'
      ]
    },
    'personalization': {
      name: 'Personalization',
      description: 'Taking responsibility for things outside your control.',
      redFlags: [
        '"It\'s my fault they\'re upset"',
        '"I caused this to happen"',
        '"I\'m responsible for their happiness"',
        '"If I had done differently, this wouldn\'t have happened"'
      ],
      challenge: [
        'Check responsibility: "What was actually in my control?"',
        'Acknowledge others: "They have their own choices and feelings"',
        'Realistic: "I can only control my own actions"'
      ]
    }
  };

  const info = explanations[normalizeType(distortion.type || distortion.name)] || {
    name: distortion.name,
    description: distortion.explanation,
    redFlags: [],
    challenge: []
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-navy to-ocean p-6 text-white sticky top-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-normal tracking-tight">
                    {info.name}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Personalized Explanation */}
                {isLoading ? (
                  <div className="flex items-center gap-2 text-navy/60">
                    <div className="animate-spin w-4 h-4 border-2 border-navy border-t-transparent rounded-full"></div>
                    <span className="text-sm font-light">Generating personalized insights...</span>
                  </div>
                ) : personalizedExplanation ? (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <h3 className="text-sm font-normal text-blue-800 mb-2 uppercase tracking-wider">
                      💡 Your Personalized Insight
                    </h3>
                    <p className="text-blue-900 font-light text-sm leading-relaxed">
                      {personalizedExplanation}
                    </p>
                  </div>
                ) : null}

                {/* Description */}
                <div>
                  <p className="text-navy/80 font-light leading-relaxed">
                    {info.description}
                  </p>
                </div>

                {/* Dynamic Questions */}
                {dynamicQuestions && dynamicQuestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-normal text-navy mb-3 flex items-center gap-2">
                      <span className="text-purple-500">🤔</span> Questions to Challenge This
                    </h3>
                    <ul className="space-y-3">
                      {dynamicQuestions.map((q, idx) => (
                        <li key={idx} className="bg-purple-50 border border-purple-200 p-3 rounded">
                          <p className="text-navy font-normal text-sm mb-1">{q.question}</p>
                          <p className="text-navy/60 font-light text-xs italic">{q.hint}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Red Flags */}
                {info.redFlags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-normal text-navy mb-3 flex items-center gap-2">
                      <span className="text-red-500">🚩</span> Red Flags
                    </h3>
                    <ul className="space-y-2">
                      {info.redFlags.map((flag, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-navy/70 font-light">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Challenge It */}
                {info.challenge.length > 0 && (
                  <div>
                    <h3 className="text-lg font-normal text-navy mb-3 flex items-center gap-2">
                      <span className="text-green-500">💡</span> How to Challenge It
                    </h3>
                    <ul className="space-y-2">
                      {info.challenge.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-navy/70 font-light">
                          <span className="text-green-400 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-navy/5 p-4 border-t border-navy/10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-navy text-white font-normal text-sm hover:bg-navy/90 transition-colors rounded"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DistortionExplainer;
