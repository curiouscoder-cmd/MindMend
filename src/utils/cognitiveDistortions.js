// Cognitive Distortion Types (Based on David Burns' "Feeling Good")

export const DISTORTION_TYPES = {
  ALL_OR_NOTHING: {
    id: 'all-or-nothing',
    name: 'All-or-Nothing Thinking',
    description: 'Seeing things in black-and-white categories. If your performance falls short of perfect, you see yourself as a total failure.',
    examples: [
      'I failed one test, so I\'m a complete failure',
      'If I\'m not the best, I\'m the worst',
      'I made one mistake, so the whole project is ruined'
    ],
    keywords: ['always', 'never', 'complete', 'total', 'every', 'all', 'nothing', 'perfect', 'worst', 'best']
  },
  OVERGENERALIZATION: {
    id: 'overgeneralization',
    name: 'Overgeneralization',
    description: 'Seeing a single negative event as a never-ending pattern of defeat.',
    examples: [
      'I didn\'t get this job, I\'ll never get hired',
      'This relationship failed, I\'ll always be alone',
      'I messed up once, I always mess up'
    ],
    keywords: ['always', 'never', 'every time', 'everyone', 'nobody', 'everywhere', 'everything']
  },
  MENTAL_FILTER: {
    id: 'mental-filter',
    name: 'Mental Filter',
    description: 'Picking out a single negative detail and dwelling on it exclusively, so your vision of reality becomes darkened.',
    examples: [
      'I got 9/10 positive reviews but focused only on the negative one',
      'The party was great but I said one awkward thing',
      'I did well but made one small mistake'
    ],
    keywords: ['but', 'except', 'only', 'just', 'however', 'still']
  },
  DISQUALIFYING_POSITIVE: {
    id: 'disqualifying-positive',
    name: 'Disqualifying the Positive',
    description: 'Rejecting positive experiences by insisting they "don\'t count" for some reason.',
    examples: [
      'They only complimented me to be nice',
      'I got lucky, it doesn\'t mean I\'m good',
      'Anyone could have done that'
    ],
    keywords: ['just', 'only', 'luck', 'fluke', 'doesn\'t count', 'anyone could', 'doesn\'t mean']
  },
  JUMPING_TO_CONCLUSIONS: {
    id: 'jumping-to-conclusions',
    name: 'Jumping to Conclusions',
    description: 'Making negative interpretations without actual evidence (mind reading or fortune telling).',
    examples: [
      'They didn\'t reply, they must hate me',
      'I know this will go badly',
      'They think I\'m stupid'
    ],
    keywords: ['must', 'probably', 'will', 'going to', 'know', 'think', 'assume']
  },
  MAGNIFICATION: {
    id: 'magnification',
    name: 'Magnification (Catastrophizing)',
    description: 'Exaggerating the importance of things (such as your mistakes or someone else\'s achievements).',
    examples: [
      'This is the worst thing that could happen',
      'My life is ruined',
      'This is a disaster'
    ],
    keywords: ['disaster', 'catastrophe', 'terrible', 'horrible', 'worst', 'ruined', 'devastating']
  },
  EMOTIONAL_REASONING: {
    id: 'emotional-reasoning',
    name: 'Emotional Reasoning',
    description: 'Assuming that your negative emotions reflect the way things really are: "I feel it, therefore it must be true."',
    examples: [
      'I feel stupid, so I must be stupid',
      'I feel like a failure, so I am one',
      'I feel guilty, so I must have done something wrong'
    ],
    keywords: ['feel like', 'feel', 'must be', 'seems like', 'appears']
  },
  SHOULD_STATEMENTS: {
    id: 'should-statements',
    name: 'Should Statements',
    description: 'Trying to motivate yourself with "shoulds" and "shouldn\'ts," as if you had to be punished before you could do anything.',
    examples: [
      'I should be better at this',
      'I must work harder',
      'I ought to be more successful'
    ],
    keywords: ['should', 'shouldn\'t', 'must', 'mustn\'t', 'ought', 'have to', 'need to']
  },
  LABELING: {
    id: 'labeling',
    name: 'Labeling and Mislabeling',
    description: 'An extreme form of overgeneralization. Instead of describing your error, you attach a negative label to yourself.',
    examples: [
      'I\'m a loser',
      'I\'m a failure',
      'I\'m worthless'
    ],
    keywords: ['I\'m a', 'I am a', 'loser', 'failure', 'idiot', 'stupid', 'worthless', 'useless']
  },
  PERSONALIZATION: {
    id: 'personalization',
    name: 'Personalization',
    description: 'Seeing yourself as the cause of some negative external event for which you were not primarily responsible.',
    examples: [
      'The project failed because of me',
      'It\'s my fault they\'re upset',
      'I ruined everything'
    ],
    keywords: ['my fault', 'because of me', 'I caused', 'I ruined', 'I\'m responsible']
  }
};

// Get all distortions as array
export const getAllDistortions = () => Object.values(DISTORTION_TYPES);

// Get distortion by ID
export const getDistortionById = (id) => {
  return Object.values(DISTORTION_TYPES).find(d => d.id === id);
};

// Simple keyword-based detection (fallback if AI is unavailable)
export const detectDistortionsLocally = (thought) => {
  const thoughtLower = thought.toLowerCase();
  const detectedDistortions = [];

  Object.values(DISTORTION_TYPES).forEach(distortion => {
    const matchCount = distortion.keywords.filter(keyword => 
      thoughtLower.includes(keyword.toLowerCase())
    ).length;

    if (matchCount > 0) {
      detectedDistortions.push({
        type: distortion.id,
        name: distortion.name,
        confidence: Math.min(matchCount * 0.3, 0.9),
        explanation: `Detected keywords: ${distortion.keywords.filter(k => thoughtLower.includes(k.toLowerCase())).join(', ')}`
      });
    }
  });

  // Sort by confidence and return top 3
  return detectedDistortions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
};
