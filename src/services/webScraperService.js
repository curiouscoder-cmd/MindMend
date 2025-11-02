/**
 * Web Scraper Service for CBT Techniques
 * Fetches and structures CBT data from reliable sources
 */

/**
 * Get Triple-Column Technique data with examples
 */
export const getTripleColumnData = () => {
  return {
    name: 'Triple-Column Technique',
    description: 'A foundational CBT tool for challenging automatic negative thoughts',
    source: 'David D. Burns - Feeling Good',
    columns: [
      {
        id: 1,
        title: 'Automatic Thought',
        description: 'The negative thought that pops into your mind automatically',
        examples: [
          'I failed the exam, I am a failure',
          'Nobody likes me',
          'I will never be good enough',
          'Everything I do is wrong'
        ],
        tips: [
          'Write the exact thought, not a summary',
          'Include emotional intensity (0-100)',
          'Note when and where it occurred',
          'Be specific and honest'
        ]
      },
      {
        id: 2,
        title: 'Evidence For & Against',
        description: 'Examine facts objectively from both sides',
        examples: [
          'Evidence FOR: I got a C on the exam',
          'Evidence AGAINST: I passed 5 other exams this semester',
          'Evidence FOR: My friend seemed quiet today',
          'Evidence AGAINST: They texted me yesterday asking to hang out'
        ],
        tips: [
          'List evidence that supports the thought',
          'List evidence that contradicts it',
          'Be objective - stick to facts only',
          'Avoid assumptions and interpretations',
          'Look for both sides equally'
        ]
      },
      {
        id: 3,
        title: 'Balanced Thought',
        description: 'A realistic, compassionate perspective',
        examples: [
          'I struggled with this exam, but I\'ve done well in other areas',
          'My friend might be tired, not upset with me',
          'I\'m learning and improving, not perfect',
          'I made a mistake, but that doesn\'t define me'
        ],
        tips: [
          'Acknowledge any truth in the original thought',
          'Incorporate evidence you found',
          'Be realistic, not overly positive',
          'Use compassionate language',
          'This becomes your new default thought'
        ]
      }
    ]
  };
};

/**
 * Get Socratic Questioning Framework
 */
export const getSocraticQuestioningFramework = () => {
  return {
    name: 'Socratic Questioning',
    description: 'Ask yourself powerful questions to challenge distorted thinking',
    categories: [
      {
        id: 'evidence',
        name: 'Evidence Questions',
        description: 'Examine the factual basis of your thought',
        questions: [
          'What evidence do I have that this thought is true?',
          'What evidence contradicts this thought?',
          'Am I confusing a thought with a fact?',
          'What would I tell someone else with this evidence?'
        ]
      },
      {
        id: 'alternatives',
        name: 'Alternative Perspective Questions',
        description: 'Generate different ways of looking at the situation',
        questions: [
          'What is another way I could look at this situation?',
          'What would a friend say about this?',
          'What would I say to a friend in this situation?',
          'What am I not considering?'
        ]
      },
      {
        id: 'consequences',
        name: 'Consequence Questions',
        description: 'Reality-test catastrophic thinking',
        questions: [
          'What is the worst that could realistically happen?',
          'Could I handle it if that happened?',
          'What is most likely to happen?',
          'Will this matter in a week/month/year?'
        ]
      },
      {
        id: 'self-compassion',
        name: 'Self-Compassion Questions',
        description: 'Access kindness and perspective',
        questions: [
          'What would I tell a good friend in this situation?',
          'Am I being as kind to myself as I would be to others?',
          'What do I need to hear right now?',
          'What are my strengths in this situation?'
        ]
      },
      {
        id: 'perspective',
        name: 'Perspective Questions',
        description: 'Gain broader context',
        questions: [
          'Is this thought helpful or harmful?',
          'Am I mind-reading or fortune-telling?',
          'What is the bigger picture here?',
          'What would I think about this if I were calm?'
        ]
      }
    ]
  };
};

/**
 * Get Common Cognitive Distortions with detailed explanations
 */
export const getCognitiveDistortionsLibrary = () => {
  return {
    distortions: [
      {
        id: 'all-or-nothing',
        name: 'All-or-Nothing Thinking',
        description: 'Seeing things in black-and-white categories with no middle ground',
        examples: [
          'If I\'m not perfect, I\'m a failure',
          'Either I\'m a complete success or a total failure',
          'One mistake ruins everything'
        ],
        challengeQuestions: [
          'Is there a gray area I\'m missing?',
          'What would a realistic middle ground look like?',
          'Am I using absolute words like "always" or "never"?'
        ],
        reframingTips: [
          'Replace "always/never" with "sometimes/usually"',
          'Look for the spectrum between extremes',
          'Acknowledge partial successes'
        ]
      },
      {
        id: 'overgeneralization',
        name: 'Overgeneralization',
        description: 'Viewing a single negative event as a never-ending pattern',
        examples: [
          'I failed once, so I\'ll always fail',
          'This always happens to me',
          'I\'ll never be good at this'
        ],
        challengeQuestions: [
          'Is this one event really a pattern?',
          'Can I think of times this didn\'t happen?',
          'Am I using "always" or "never" incorrectly?'
        ],
        reframingTips: [
          'Look for exceptions to the pattern',
          'Use specific language: "This time" instead of "always"',
          'Separate this event from past ones'
        ]
      },
      {
        id: 'labeling',
        name: 'Labeling',
        description: 'Creating negative self-image based on errors or setbacks',
        examples: [
          'I\'m a failure',
          'I\'m stupid',
          'I\'m a loser',
          'I\'m broken'
        ],
        challengeQuestions: [
          'Am I defining my entire self based on one action?',
          'Would I use this label for a friend?',
          'What are my positive qualities this label ignores?'
        ],
        reframingTips: [
          'Separate action from identity: "I made a mistake" not "I am a mistake"',
          'Be specific: "I struggled with this task" not "I\'m bad at everything"',
          'Remember your complexity and many qualities'
        ]
      },
      {
        id: 'emotional-reasoning',
        name: 'Emotional Reasoning',
        description: 'Taking emotions as evidence for truth',
        examples: [
          'I feel anxious, so something bad will happen',
          'I feel like a failure, so I am one',
          'I feel scared, so it must be dangerous'
        ],
        challengeQuestions: [
          'Is my feeling the same as a fact?',
          'What would the evidence say if I ignore my feeling?',
          'Why am I having this feeling?'
        ],
        reframingTips: [
          'Separate feeling from fact: "I feel anxious, but that doesn\'t mean..."',
          'Look for actual evidence',
          'Acknowledge the feeling without believing it'
        ]
      },
      {
        id: 'catastrophizing',
        name: 'Catastrophizing',
        description: 'Exaggerating the importance of negative events',
        examples: [
          'This is a disaster',
          'Everything is ruined',
          'I can\'t handle this',
          'This is the worst thing that could happen'
        ],
        challengeQuestions: [
          'On a scale of 1-10, how bad is this really?',
          'What\'s the most likely outcome?',
          'Have I handled difficult things before?'
        ],
        reframingTips: [
          'Reality check: Rate actual severity',
          'Perspective: Will this matter in a month?',
          'Remember past coping: I\'ve handled hard things'
        ]
      },
      {
        id: 'mind-reading',
        name: 'Mind Reading',
        description: 'Assuming you know what others are thinking',
        examples: [
          'They think I\'m stupid',
          'Everyone judges me',
          'They don\'t like me'
        ],
        challengeQuestions: [
          'Do I have actual evidence of what they\'re thinking?',
          'Could I ask them instead of assuming?',
          'What else might they be thinking?'
        ],
        reframingTips: [
          'Ask for evidence: "What proof do I have?"',
          'Check assumptions: "I could ask them..."',
          'Consider alternatives: "Another possibility is..."'
        ]
      }
    ]
  };
};

/**
 * Get CBT Techniques and Exercises
 */
export const getCBTTechniques = () => {
  return {
    techniques: [
      {
        id: 'triple-column',
        name: 'Triple-Column Technique',
        difficulty: 'Beginner',
        timeRequired: '10-15 minutes',
        description: 'Challenge automatic thoughts by examining evidence',
        steps: [
          'Write your automatic negative thought',
          'List evidence that supports it',
          'List evidence that contradicts it',
          'Create a balanced, realistic thought',
          'Practice using the balanced thought'
        ]
      },
      {
        id: 'thought-record',
        name: 'Thought Record',
        difficulty: 'Intermediate',
        timeRequired: '15-20 minutes',
        description: 'Detailed analysis of thoughts, feelings, and behaviors',
        steps: [
          'Identify the situation',
          'Write the automatic thought',
          'Rate belief in the thought (0-100%)',
          'Identify emotions and rate intensity',
          'Find evidence for and against',
          'Create a balanced thought',
          'Rate new belief in balanced thought'
        ]
      },
      {
        id: 'behavioral-activation',
        name: 'Behavioral Activation',
        difficulty: 'Beginner',
        timeRequired: '5-10 minutes',
        description: 'Schedule activities to improve mood',
        steps: [
          'List activities you enjoy',
          'Schedule them in your calendar',
          'Do them even if you don\'t feel like it',
          'Notice how your mood changes',
          'Gradually increase activities'
        ]
      },
      {
        id: 'exposure',
        name: 'Exposure Therapy',
        difficulty: 'Advanced',
        timeRequired: '20-30 minutes',
        description: 'Gradually face feared situations',
        steps: [
          'Identify your fear or anxiety',
          'Create a hierarchy of feared situations',
          'Start with the least feared',
          'Stay in the situation until anxiety decreases',
          'Move to the next level'
        ]
      }
    ]
  };
};

/**
 * Get Thought-Challenging Prompts based on distortion type
 */
export const getThoughtChallengingPrompts = (distortionType) => {
  const prompts = {
    'all-or-nothing': [
      'What would the middle ground look like?',
      'Can I find evidence of partial success?',
      'What if I rated this on a scale instead of extremes?'
    ],
    'overgeneralization': [
      'When has this NOT happened?',
      'Is this really a pattern or just this one time?',
      'What would I tell someone else in this situation?'
    ],
    'labeling': [
      'Am I defining my entire self by one action?',
      'What are 5 positive things about me?',
      'Would I call a friend this name for the same mistake?'
    ],
    'emotional-reasoning': [
      'What would the facts say if I ignore my feeling?',
      'Is my emotion the same as reality?',
      'What evidence contradicts what I\'m feeling?'
    ],
    'catastrophizing': [
      'What\'s the most likely outcome?',
      'Have I handled difficult things before?',
      'Will this matter in a year?'
    ],
    'mind-reading': [
      'Do I actually know what they\'re thinking?',
      'Could I ask them instead of guessing?',
      'What else might they be thinking?'
    ]
  };

  return prompts[distortionType] || [
    'What evidence supports this thought?',
    'What evidence contradicts this thought?',
    'What would I tell a friend with this thought?'
  ];
};

/**
 * Get affirmations and coping statements
 */
export const getCopingStatements = () => {
  return {
    general: [
      'I can handle this one step at a time',
      'This feeling will pass',
      'I\'ve overcome challenges before',
      'I\'m doing the best I can',
      'This thought is not a fact',
      'I deserve compassion, especially from myself'
    ],
    anxiety: [
      'I am safe right now',
      'Anxiety is uncomfortable but not dangerous',
      'I can breathe through this',
      'This will pass'
    ],
    depression: [
      'My feelings are temporary',
      'I can take small steps',
      'I matter and my life has value',
      'This is the depression talking, not the truth'
    ],
    shame: [
      'I made a mistake, I\'m not a mistake',
      'Everyone makes mistakes',
      'I can learn and grow from this',
      'I deserve forgiveness, including from myself'
    ]
  };
};
