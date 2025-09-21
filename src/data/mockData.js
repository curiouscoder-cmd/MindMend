// Centralized Mock Data for MindMend AI
// This file contains all mock data used throughout the application

export const mockUsers = {
  currentUser: {
    id: 'user_001',
    name: 'Alex',
    age: 22,
    location: 'Mumbai, India',
    joinDate: '2024-01-15',
    preferences: {
      language: 'en',
      notifications: true,
      voiceEnabled: true,
      theme: 'light'
    },
    personalityTraits: {
      openness: 7,
      conscientiousness: 8,
      extraversion: 5,
      agreeableness: 9,
      neuroticism: 6
    }
  }
};

export const mockMoodHistory = [
  'anxious', 'stressed', 'calm', 'happy', 'sad', 'anxious', 'calm',
  'happy', 'stressed', 'calm', 'anxious', 'happy', 'calm', 'stressed'
];

export const mockJournalEntries = [
  {
    id: 'journal_001',
    date: '2024-01-20',
    mood: 'anxious',
    content: 'Had a tough day with exams coming up. Feeling overwhelmed with all the preparation.',
    tags: ['exam', 'stress', 'academic'],
    sentiment: 0.3
  },
  {
    id: 'journal_002',
    date: '2024-01-19',
    mood: 'calm',
    content: 'Tried the breathing exercise today. It really helped me feel more centered.',
    tags: ['breathing', 'exercise', 'calm'],
    sentiment: 0.8
  },
  {
    id: 'journal_003',
    date: '2024-01-18',
    mood: 'happy',
    content: 'Great day with friends! Feeling grateful for the support system I have.',
    tags: ['friends', 'gratitude', 'social'],
    sentiment: 0.9
  }
];

export const mockCBTExercises = [
  {
    id: 'breathing_4_7_8',
    title: '4-7-8 Breathing Technique',
    mood: 'anxious',
    duration: '5 minutes',
    difficulty: 'beginner',
    category: 'breathing',
    steps: [
      'Sit comfortably with your back straight',
      'Exhale completely through your mouth',
      'Close your mouth and inhale through your nose for 4 counts',
      'Hold your breath for 7 counts',
      'Exhale through your mouth for 8 counts',
      'Repeat this cycle 3-4 times'
    ],
    outcome: 'Reduced anxiety and increased calm',
    technique: 'Breathing exercise',
    audioGuided: true,
    voiceInstructions: true
  },
  {
    id: 'grounding_5_4_3_2_1',
    title: '5-4-3-2-1 Grounding Technique',
    mood: 'anxious',
    duration: '5 minutes',
    difficulty: 'beginner',
    category: 'grounding',
    steps: [
      'Name 5 things you can see around you',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste'
    ],
    outcome: 'Feel more grounded and present',
    technique: 'Mindfulness grounding',
    audioGuided: true,
    voiceInstructions: true
  },
  {
    id: 'progressive_relaxation',
    title: 'Progressive Muscle Relaxation',
    mood: 'stressed',
    duration: '15 minutes',
    difficulty: 'intermediate',
    category: 'relaxation',
    steps: [
      'Find a comfortable position lying down',
      'Start with your toes - tense for 5 seconds, then relax',
      'Move to your calves - tense and relax',
      'Continue with thighs, abdomen, hands, arms, shoulders',
      'Finish with your face and head',
      'Notice the difference between tension and relaxation'
    ],
    outcome: 'Physical and mental relaxation',
    technique: 'Progressive muscle relaxation',
    audioGuided: true,
    voiceInstructions: true
  },
  {
    id: 'thought_challenging',
    title: 'Thought Challenging Exercise',
    mood: 'sad',
    duration: '10 minutes',
    difficulty: 'intermediate',
    category: 'cognitive',
    steps: [
      'Identify the negative thought you\'re having',
      'Write down evidence that supports this thought',
      'Write down evidence that contradicts this thought',
      'Consider alternative, more balanced perspectives',
      'Create a more realistic, balanced thought',
      'Notice how this new thought makes you feel'
    ],
    outcome: 'More balanced thinking patterns',
    technique: 'Cognitive restructuring',
    audioGuided: false,
    voiceInstructions: false
  },
  {
    id: 'gratitude_practice',
    title: 'Daily Gratitude Practice',
    mood: 'happy',
    duration: '8 minutes',
    difficulty: 'beginner',
    category: 'positive',
    steps: [
      'Write down 3 things you\'re grateful for today',
      'For each item, write why you\'re grateful',
      'Think about how these things positively impact your life',
      'Visualize these positive aspects',
      'Share your gratitude with someone if possible'
    ],
    outcome: 'Increased positive emotions and life satisfaction',
    technique: 'Positive psychology',
    audioGuided: true,
    voiceInstructions: true
  }
];

export const mockAIPersonas = {
  therapist: {
    id: 'dr_maya',
    name: 'Dr. Maya Sharma',
    role: 'Clinical Psychologist',
    avatar: '👩‍⚕️',
    personality: 'Warm, professional, uses CBT techniques',
    specialization: 'Anxiety and Depression',
    experience: '15 years',
    voiceId: 'elevenlabs_voice_1', // ElevenLabs voice ID
    color: 'bg-blue-100 text-blue-800'
  },
  peers: [
    {
      id: 'arjun',
      name: 'Arjun Kumar',
      role: 'Engineering Student',
      avatar: '👨‍🎓',
      personality: 'Supportive, deals with academic pressure',
      background: 'IIT Delhi, 3rd year Computer Science',
      challenges: ['Academic stress', 'Career pressure'],
      voiceId: 'elevenlabs_voice_2',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'priya',
      name: 'Priya Patel',
      role: 'Working Professional',
      avatar: '👩‍💼',
      personality: 'Empathetic, anxiety management expert',
      background: 'Software Engineer at tech startup',
      challenges: ['Work stress', 'Social anxiety'],
      voiceId: 'elevenlabs_voice_3',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'rohit',
      name: 'Rohit Singh',
      role: 'Freelancer',
      avatar: '👨‍💻',
      personality: 'Practical, stress management focused',
      background: 'Digital marketing consultant',
      challenges: ['Work-life balance', 'Financial stress'],
      voiceId: 'elevenlabs_voice_4',
      color: 'bg-orange-100 text-orange-800'
    }
  ]
};

export const mockGroupTherapySessions = [
  {
    id: 'academic_stress',
    title: 'Managing Academic Pressure',
    description: 'Strategies for handling exam stress and academic expectations',
    icon: '📚',
    participants: ['dr_maya', 'arjun', 'priya'],
    duration: '45 minutes',
    topics: [
      'Time management techniques',
      'Dealing with failure and setbacks',
      'Balancing expectations vs reality',
      'Building resilience'
    ]
  },
  {
    id: 'social_anxiety',
    title: 'Overcoming Social Anxiety',
    description: 'Building confidence in social situations',
    icon: '👥',
    participants: ['dr_maya', 'priya', 'rohit'],
    duration: '40 minutes',
    topics: [
      'Understanding social anxiety triggers',
      'Gradual exposure techniques',
      'Building social confidence',
      'Communication skills'
    ]
  },
  {
    id: 'work_life_balance',
    title: 'Work-Life Balance',
    description: 'Managing professional stress and personal well-being',
    icon: '⚖️',
    participants: ['dr_maya', 'rohit', 'priya'],
    duration: '50 minutes',
    topics: [
      'Setting boundaries',
      'Stress management at work',
      'Personal time importance',
      'Career vs personal life'
    ]
  }
];

export const mockEmotionalTwins = {
  resilientGrower: {
    twinPersonality: "A resilient individual on a journey of self-discovery and emotional growth, showing remarkable commitment to mental wellness through consistent self-reflection and proactive help-seeking behavior.",
    strengths: ["Self-awareness", "Emotional intelligence", "Commitment to growth", "Resilience"],
    growthAreas: ["Stress management", "Emotional regulation", "Self-compassion"],
    motivationalMessage: "Your emotional twin sees incredible potential in your journey. You're not just surviving challenges - you're growing stronger through them!",
    avatar: "🌱",
    insights: "Your dedication to mental wellness shows remarkable self-awareness and emotional maturity beyond your years.",
    recommendations: [
      "Practice daily mindfulness meditation for 5-10 minutes",
      "Keep a gratitude journal to reinforce positive patterns",
      "Schedule weekly self-compassion check-ins",
      "Celebrate small wins in your wellness journey"
    ],
    moodPatterns: {
      dominant: "calm",
      secondary: ["happy", "anxious"],
      triggers: ["academic pressure", "social situations"],
      strengths: ["morning positivity", "evening reflection"]
    }
  }
};

export const mockVoiceAnalysis = {
  sampleAnalyses: [
    {
      text: "I'm feeling really overwhelmed with everything going on",
      primaryEmotion: "stressed",
      stressLevel: 8,
      urgency: "high",
      suggestedAction: "Take immediate steps to reduce stress - try the 4-7-8 breathing technique",
      confidence: 92,
      emotionalMarkers: ["overwhelmed", "everything"],
      tonalAnalysis: {
        pitch: "elevated",
        pace: "rapid",
        volume: "normal"
      }
    },
    {
      text: "I had a really good day today, feeling grateful",
      primaryEmotion: "happy",
      stressLevel: 2,
      urgency: "low",
      suggestedAction: "Amplify these positive feelings with a gratitude practice",
      confidence: 95,
      emotionalMarkers: ["good day", "grateful"],
      tonalAnalysis: {
        pitch: "normal",
        pace: "steady",
        volume: "warm"
      }
    }
  ]
};

export const mockCommunityData = {
  supportGroups: [
    {
      id: 'exam_stress',
      name: 'Exam Stress Support',
      members: 234,
      description: 'Support for students dealing with exam anxiety',
      category: 'Academic',
      isActive: true,
      recentActivity: '2 hours ago'
    },
    {
      id: 'social_anxiety',
      name: 'Social Confidence Circle',
      members: 189,
      description: 'Building confidence in social situations',
      category: 'Social',
      isActive: true,
      recentActivity: '30 minutes ago'
    },
    {
      id: 'work_stress',
      name: 'Professional Wellness',
      members: 156,
      description: 'Managing workplace stress and burnout',
      category: 'Professional',
      isActive: true,
      recentActivity: '1 hour ago'
    }
  ],
  successStories: [
    {
      id: 'story_001',
      title: 'From Anxiety to Confidence',
      author: 'Anonymous',
      category: 'Social Anxiety',
      excerpt: 'How I overcame social anxiety using CBT techniques...',
      likes: 45,
      comments: 12,
      timeAgo: '2 days ago'
    },
    {
      id: 'story_002',
      title: 'Managing Academic Pressure',
      author: 'Student_123',
      category: 'Academic Stress',
      excerpt: 'My journey through exam stress and finding balance...',
      likes: 67,
      comments: 23,
      timeAgo: '1 week ago'
    }
  ]
};

export const mockProgressData = {
  achievements: [
    {
      id: 'first_week',
      title: 'First Week Warrior',
      description: 'Completed 7 consecutive days of wellness activities',
      icon: '🏆',
      unlockedAt: '2024-01-22',
      rarity: 'common'
    },
    {
      id: 'mindful_master',
      title: 'Mindful Master',
      description: 'Completed 25 mindfulness exercises',
      icon: '🧘‍♀️',
      unlockedAt: '2024-01-25',
      rarity: 'rare'
    },
    {
      id: 'voice_pioneer',
      title: 'Voice Pioneer',
      description: 'First to use voice emotion analysis',
      icon: '🎤',
      unlockedAt: '2024-01-26',
      rarity: 'epic'
    }
  ],
  streaks: {
    current: 12,
    longest: 18,
    weeklyGoal: 7,
    monthlyGoal: 30
  },
  stats: {
    totalExercises: 45,
    totalMinutes: 380,
    favoriteTime: 'evening',
    mostUsedFeature: 'AI Coach',
    improvementScore: 78
  }
};

export const mockCrisisResources = {
  hotlines: [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      country: 'US',
      available: '24/7'
    },
    {
      name: 'AASRA',
      number: '91-22-27546669',
      country: 'India',
      available: '24/7'
    },
    {
      name: 'Sneha India',
      number: '91-44-24640050',
      country: 'India',
      available: '24/7'
    }
  ],
  immediateHelp: [
    'Call emergency services: 112 (India)',
    'Contact a trusted friend or family member',
    'Go to the nearest hospital emergency room',
    'Use crisis text line: Text HOME to 741741'
  ],
  breathingExercises: [
    {
      name: 'Box Breathing',
      steps: ['Inhale for 4', 'Hold for 4', 'Exhale for 4', 'Hold for 4'],
      duration: '2 minutes'
    },
    {
      name: '4-7-8 Technique',
      steps: ['Inhale for 4', 'Hold for 7', 'Exhale for 8'],
      duration: '3 minutes'
    }
  ]
};

// Export all mock data as a single object for easy importing
export const mockData = {
  users: mockUsers,
  moodHistory: mockMoodHistory,
  journalEntries: mockJournalEntries,
  cbtExercises: mockCBTExercises,
  aiPersonas: mockAIPersonas,
  groupTherapySessions: mockGroupTherapySessions,
  emotionalTwins: mockEmotionalTwins,
  voiceAnalysis: mockVoiceAnalysis,
  communityData: mockCommunityData,
  progressData: mockProgressData,
  crisisResources: mockCrisisResources
};

export default mockData;
