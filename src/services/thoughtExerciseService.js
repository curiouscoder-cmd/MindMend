import { db } from './firebaseConfig';
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';

/**
 * Save complete thought-challenging exercise session to Firestore
 */
export const saveThoughtExerciseSession = async (userId, sessionData) => {
  try {
    if (!userId) {
      console.error('❌ User ID is required to save exercise session');
      return null;
    }

    console.log('💾 Saving thought exercise session...');

    const exerciseRef = collection(db, 'users', userId, 'thoughtExercises');
    
    const docData = {
      // Automatic Thought
      automaticThought: sessionData.automaticThought || '',
      thoughtIntensity: sessionData.thoughtIntensity || 0,
      
      // Distortions
      distortions: sessionData.distortions || [],
      primaryDistortion: sessionData.distortions?.[0]?.name || null,
      
      // Socratic Questions & Answers
      questions: sessionData.questions || [],
      userAnswers: sessionData.userAnswers || {},
      
      // Rational Response
      rationalResponse: sessionData.rationalResponse || '',
      responseIntensity: sessionData.responseIntensity || 0,
      
      // Metadata
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      isComplete: !!sessionData.rationalResponse,
      
      // For AI Coach context
      exerciseType: 'triple-column-technique',
      version: 1
    };

    const docRef = await addDoc(exerciseRef, docData);
    console.log('✅ Exercise session saved:', docRef.id);

    return {
      id: docRef.id,
      ...docData
    };

  } catch (error) {
    console.error('❌ Error saving exercise session:', error);
    return null;
  }
};

/**
 * Update exercise session with rational response
 */
export const updateThoughtExerciseSession = async (userId, sessionId, updates) => {
  try {
    if (!userId || !sessionId) {
      console.error('❌ User ID and Session ID are required');
      return null;
    }

    console.log('📝 Updating exercise session...');

    const docRef = doc(db, 'users', userId, 'thoughtExercises', sessionId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      isComplete: !!updates.rationalResponse
    };

    await updateDoc(docRef, updateData);
    console.log('✅ Exercise session updated');

    return updateData;

  } catch (error) {
    console.error('❌ Error updating exercise session:', error);
    return null;
  }
};

/**
 * Get all thought exercise sessions for a user
 */
export const getThoughtExerciseSessions = async (userId) => {
  try {
    if (!userId) {
      console.error('❌ User ID is required');
      return [];
    }

    console.log('📚 Fetching thought exercise sessions...');

    const exerciseRef = collection(db, 'users', userId, 'thoughtExercises');
    const q = query(exerciseRef, orderBy('timestamp', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const sessions = [];

    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('✅ Fetched', sessions.length, 'exercise sessions');
    return sessions;

  } catch (error) {
    console.error('❌ Error fetching exercise sessions:', error);
    return [];
  }
};

/**
 * Get recent thought exercise sessions for AI Coach context
 */
export const getRecentThoughtExercises = async (userId, limit = 5) => {
  try {
    if (!userId) {
      console.error('❌ User ID is required');
      return [];
    }

    console.log('📚 Fetching recent exercises for AI Coach context...');

    const exerciseRef = collection(db, 'users', userId, 'thoughtExercises');
    const q = query(
      exerciseRef,
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const sessions = [];

    querySnapshot.forEach((doc) => {
      if (sessions.length < limit) {
        sessions.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });

    console.log('✅ Fetched', sessions.length, 'recent exercises');
    return sessions;

  } catch (error) {
    console.error('❌ Error fetching recent exercises:', error);
    return [];
  }
};

/**
 * Get exercise context summary for AI Coach
 */
export const getExerciseContextForAICoach = async (userId) => {
  try {
    if (!userId) {
      console.error('❌ User ID is required');
      return null;
    }

    console.log('🧠 Building exercise context for AI Coach...');

    const recentExercises = await getRecentThoughtExercises(userId, 10);

    if (recentExercises.length === 0) {
      return null;
    }

    // Build context summary
    const context = {
      totalExercises: recentExercises.length,
      recentThoughts: recentExercises.slice(0, 3).map(ex => ({
        thought: ex.automaticThought,
        distortion: ex.primaryDistortion,
        intensity: ex.thoughtIntensity,
        response: ex.rationalResponse,
        date: ex.createdAt
      })),
      commonDistortions: getCommonDistortions(recentExercises),
      averageIntensityReduction: calculateAverageIntensityReduction(recentExercises),
      lastExerciseDate: recentExercises[0]?.createdAt,
      completedExercises: recentExercises.filter(ex => ex.isComplete).length,
      insights: generateInsights(recentExercises)
    };

    console.log('✅ Exercise context built:', context);
    return context;

  } catch (error) {
    console.error('❌ Error building exercise context:', error);
    return null;
  }
};

/**
 * Helper: Get most common distortions
 */
const getCommonDistortions = (exercises) => {
  const distortionCount = {};

  exercises.forEach(ex => {
    if (ex.primaryDistortion) {
      distortionCount[ex.primaryDistortion] = (distortionCount[ex.primaryDistortion] || 0) + 1;
    }
  });

  return Object.entries(distortionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([distortion, count]) => ({ distortion, count }));
};

/**
 * Helper: Calculate average intensity reduction
 */
const calculateAverageIntensityReduction = (exercises) => {
  const completedExercises = exercises.filter(ex => ex.isComplete && ex.responseIntensity !== undefined);
  
  if (completedExercises.length === 0) return 0;

  const totalReduction = completedExercises.reduce((sum, ex) => {
    return sum + (ex.thoughtIntensity - ex.responseIntensity);
  }, 0);

  return Math.round((totalReduction / completedExercises.length) * 10) / 10;
};

/**
 * Helper: Generate insights from exercises
 */
const generateInsights = (exercises) => {
  const insights = [];

  // Check if user is improving
  if (exercises.length >= 3) {
    const recent = exercises.slice(0, 3);
    const older = exercises.slice(3, 6);

    if (recent.length > 0 && older.length > 0) {
      const recentReduction = calculateAverageIntensityReduction(recent);
      const olderReduction = calculateAverageIntensityReduction(older);

      if (recentReduction > olderReduction) {
        insights.push('You\'re getting better at reducing thought intensity!');
      }
    }
  }

  // Check for patterns
  const distortions = getCommonDistortions(exercises);
  if (distortions.length > 0) {
    insights.push(`Your most common distortion is ${distortions[0].distortion}. Let's work on that.`);
  }

  // Check consistency
  const completedCount = exercises.filter(ex => ex.isComplete).length;
  if (completedCount === exercises.length) {
    insights.push('Great consistency! You\'re completing all your exercises.');
  }

  return insights;
};

/**
 * Format exercise context for AI Coach prompt
 */
export const formatExerciseContextForPrompt = (context) => {
  if (!context) return '';

  let prompt = '\n📋 **User\'s Recent Thought-Challenging Exercises:**\n';
  
  prompt += `- Total exercises completed: ${context.completedExercises}/${context.totalExercises}\n`;
  prompt += `- Average intensity reduction: ${context.averageIntensityReduction} points\n`;
  
  if (context.commonDistortions.length > 0) {
    prompt += `- Most common distortions: ${context.commonDistortions.map(d => d.distortion).join(', ')}\n`;
  }

  if (context.recentThoughts.length > 0) {
    prompt += '\n**Recent thoughts challenged:**\n';
    context.recentThoughts.forEach((thought, idx) => {
      prompt += `${idx + 1}. "${thought.thought}" (${thought.distortion})\n`;
      if (thought.response) {
        prompt += `   → Balanced: "${thought.response}"\n`;
      }
    });
  }

  if (context.insights.length > 0) {
    prompt += '\n**Insights:**\n';
    context.insights.forEach(insight => {
      prompt += `- ${insight}\n`;
    });
  }

  return prompt;
};
