// AI Feedback Loop Service for MindMend AI
// Continuously improves AI recommendations based on user feedback and outcomes

import databaseService from './databaseService';
import { GeminiService } from './geminiService';

class FeedbackLoopService {
  constructor() {
    this.feedbackQueue = [];
    this.learningModel = {
      userPreferences: new Map(),
      exerciseEffectiveness: new Map(),
      moodTriggers: new Map(),
      successPatterns: new Map()
    };
    
    this.initializeLearningModel();
  }

  async initializeLearningModel() {
    // Load existing feedback data to initialize the model
    try {
      const existingFeedback = await databaseService.getData('feedbackData') || [];
      this.processFeedbackBatch(existingFeedback);
    } catch (error) {
      console.error('Error initializing learning model:', error);
    }
  }

  // Collect user feedback on AI recommendations
  async collectRecommendationFeedback(userId, recommendationId, feedback) {
    const feedbackEntry = {
      id: `feedback_${Date.now()}`,
      userId,
      recommendationId,
      type: 'recommendation',
      rating: feedback.rating, // 1-5 scale
      helpful: feedback.helpful, // boolean
      used: feedback.used, // boolean
      outcome: feedback.outcome, // 'improved', 'no_change', 'worse'
      comments: feedback.comments || '',
      timestamp: new Date().toISOString(),
      context: {
        userMood: feedback.userMood,
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        recentActivity: feedback.recentActivity
      }
    };

    try {
      // Save to database
      await databaseService.saveData('feedbackData', feedbackEntry);
      
      // Add to processing queue
      this.feedbackQueue.push(feedbackEntry);
      
      // Process feedback immediately for real-time learning
      this.processFeedback(feedbackEntry);
      
      return feedbackEntry;
    } catch (error) {
      console.error('Error collecting recommendation feedback:', error);
      return null;
    }
  }

  // Collect feedback on exercise effectiveness
  async collectExerciseFeedback(userId, exerciseId, feedback) {
    const feedbackEntry = {
      id: `exercise_feedback_${Date.now()}`,
      userId,
      exerciseId,
      type: 'exercise',
      moodBefore: feedback.moodBefore,
      moodAfter: feedback.moodAfter,
      difficulty: feedback.difficulty, // 1-5 scale
      engagement: feedback.engagement, // 1-5 scale
      effectiveness: feedback.effectiveness, // 1-5 scale
      completionRate: feedback.completionRate, // 0-100%
      timeSpent: feedback.timeSpent, // minutes
      comments: feedback.comments || '',
      timestamp: new Date().toISOString(),
      context: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        stressLevel: feedback.stressLevel,
        environment: feedback.environment // 'home', 'work', 'public', etc.
      }
    };

    try {
      await databaseService.saveData('feedbackData', feedbackEntry);
      this.feedbackQueue.push(feedbackEntry);
      this.processFeedback(feedbackEntry);
      
      return feedbackEntry;
    } catch (error) {
      console.error('Error collecting exercise feedback:', error);
      return null;
    }
  }

  // Collect implicit feedback from user behavior
  async collectImplicitFeedback(userId, action, context) {
    const implicitFeedback = {
      id: `implicit_${Date.now()}`,
      userId,
      type: 'implicit',
      action: action.type, // 'skip', 'complete', 'repeat', 'share', etc.
      target: action.target, // exercise ID, recommendation ID, etc.
      duration: action.duration,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        sessionDuration: context.sessionDuration,
        previousActions: context.previousActions || []
      }
    };

    try {
      await databaseService.saveData('feedbackData', implicitFeedback);
      this.processFeedback(implicitFeedback);
      
      return implicitFeedback;
    } catch (error) {
      console.error('Error collecting implicit feedback:', error);
      return null;
    }
  }

  // Process individual feedback entry
  processFeedback(feedback) {
    const userId = feedback.userId;

    switch (feedback.type) {
      case 'recommendation':
        this.updateRecommendationModel(userId, feedback);
        break;
      case 'exercise':
        this.updateExerciseModel(userId, feedback);
        break;
      case 'implicit':
        this.updateImplicitModel(userId, feedback);
        break;
    }

    // Update user preferences
    this.updateUserPreferences(userId, feedback);
  }

  updateRecommendationModel(userId, feedback) {
    const key = `${userId}_${feedback.recommendationId}`;
    const existing = this.learningModel.userPreferences.get(key) || {
      totalRatings: 0,
      averageRating: 0,
      helpfulCount: 0,
      usedCount: 0,
      outcomes: { improved: 0, no_change: 0, worse: 0 }
    };

    // Update statistics
    existing.totalRatings++;
    existing.averageRating = (existing.averageRating * (existing.totalRatings - 1) + feedback.rating) / existing.totalRatings;
    
    if (feedback.helpful) existing.helpfulCount++;
    if (feedback.used) existing.usedCount++;
    if (feedback.outcome) existing.outcomes[feedback.outcome]++;

    this.learningModel.userPreferences.set(key, existing);
  }

  updateExerciseModel(userId, feedback) {
    const key = `${userId}_${feedback.exerciseId}`;
    const existing = this.learningModel.exerciseEffectiveness.get(key) || {
      completions: 0,
      averageEffectiveness: 0,
      averageEngagement: 0,
      moodImprovement: 0,
      optimalTimeOfDay: new Map(),
      optimalContext: new Map()
    };

    existing.completions++;
    existing.averageEffectiveness = (existing.averageEffectiveness * (existing.completions - 1) + feedback.effectiveness) / existing.completions;
    existing.averageEngagement = (existing.averageEngagement * (existing.completions - 1) + feedback.engagement) / existing.completions;
    
    // Calculate mood improvement
    if (feedback.moodBefore && feedback.moodAfter) {
      const improvement = this.calculateMoodImprovement(feedback.moodBefore, feedback.moodAfter);
      existing.moodImprovement = (existing.moodImprovement * (existing.completions - 1) + improvement) / existing.completions;
    }

    // Track optimal timing
    const timeOfDay = feedback.context.timeOfDay;
    const timeCount = existing.optimalTimeOfDay.get(timeOfDay) || 0;
    existing.optimalTimeOfDay.set(timeOfDay, timeCount + 1);

    this.learningModel.exerciseEffectiveness.set(key, existing);
  }

  updateImplicitModel(userId, feedback) {
    const pattern = `${feedback.action}_${feedback.target}`;
    const existing = this.learningModel.successPatterns.get(pattern) || {
      frequency: 0,
      contexts: new Map(),
      outcomes: new Map()
    };

    existing.frequency++;
    
    // Track context patterns
    const contextKey = `${feedback.context.timeOfDay}_${feedback.context.sessionDuration}`;
    const contextCount = existing.contexts.get(contextKey) || 0;
    existing.contexts.set(contextKey, contextCount + 1);

    this.learningModel.successPatterns.set(pattern, existing);
  }

  updateUserPreferences(userId, feedback) {
    const userKey = `user_${userId}`;
    const existing = this.learningModel.userPreferences.get(userKey) || {
      preferredExerciseTypes: new Map(),
      optimalTiming: new Map(),
      responsePatterns: new Map(),
      engagementFactors: new Map()
    };

    // Update based on feedback type and context
    if (feedback.type === 'exercise' && feedback.effectiveness >= 4) {
      const exerciseType = this.getExerciseType(feedback.exerciseId);
      const count = existing.preferredExerciseTypes.get(exerciseType) || 0;
      existing.preferredExerciseTypes.set(exerciseType, count + 1);
    }

    this.learningModel.userPreferences.set(userKey, existing);
  }

  calculateMoodImprovement(moodBefore, moodAfter) {
    const moodScores = { 
      happy: 9, calm: 7, neutral: 5, stressed: 3, anxious: 2, sad: 1 
    };
    
    const scoreBefore = moodScores[moodBefore] || 5;
    const scoreAfter = moodScores[moodAfter] || 5;
    
    return scoreAfter - scoreBefore;
  }

  getExerciseType(exerciseId) {
    // Map exercise IDs to types
    const typeMap = {
      'breathing': 'breathing',
      'grounding': 'mindfulness',
      'progressive': 'relaxation',
      'thought': 'cognitive',
      'gratitude': 'positive'
    };

    for (const [key, type] of Object.entries(typeMap)) {
      if (exerciseId.includes(key)) return type;
    }
    
    return 'general';
  }

  // Generate improved recommendations based on learned patterns
  async generateImprovedRecommendations(userId, currentContext) {
    try {
      const userPreferences = this.learningModel.userPreferences.get(`user_${userId}`);
      const exerciseData = Array.from(this.learningModel.exerciseEffectiveness.entries())
        .filter(([key]) => key.startsWith(userId))
        .map(([key, data]) => ({ exerciseId: key.split('_')[1], ...data }));

      // Create context for AI
      const learningContext = {
        userPreferences: userPreferences ? Object.fromEntries(userPreferences.preferredExerciseTypes) : {},
        exerciseEffectiveness: exerciseData.reduce((acc, item) => {
          acc[item.exerciseId] = {
            effectiveness: item.averageEffectiveness,
            engagement: item.averageEngagement,
            moodImprovement: item.moodImprovement
          };
          return acc;
        }, {}),
        currentContext,
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay()
      };

      // Generate AI recommendations with learning context
      const prompt = `
        Based on this user's feedback patterns and preferences, generate personalized recommendations:
        
        User Learning Data: ${JSON.stringify(learningContext)}
        Current Context: ${JSON.stringify(currentContext)}
        
        Generate 3 highly personalized recommendations that:
        1. Align with proven effective exercises for this user
        2. Consider optimal timing based on past success
        3. Account for current mood and context
        4. Include confidence scores based on historical data
        
        Format as JSON array with: title, description, exerciseId, confidence, reasoning
      `;

      const aiRecommendations = await GeminiService.generateAdvancedRecommendations(prompt);
      
      // Enhance with local learning data
      return this.enhanceRecommendationsWithLearning(aiRecommendations, userId);
      
    } catch (error) {
      console.error('Error generating improved recommendations:', error);
      return this.getFallbackRecommendations(userId);
    }
  }

  enhanceRecommendationsWithLearning(recommendations, userId) {
    return recommendations.map(rec => {
      const exerciseKey = `${userId}_${rec.exerciseId}`;
      const exerciseData = this.learningModel.exerciseEffectiveness.get(exerciseKey);
      
      if (exerciseData) {
        rec.personalizedConfidence = Math.round(
          (exerciseData.averageEffectiveness / 5) * 100
        );
        rec.historicalSuccess = exerciseData.completions;
        rec.averageMoodImprovement = exerciseData.moodImprovement;
      }
      
      return rec;
    });
  }

  getFallbackRecommendations(userId) {
    return [
      {
        title: "Personalized Breathing Exercise",
        description: "A breathing technique tailored to your preferences",
        exerciseId: "breathing_personalized",
        confidence: 75,
        reasoning: "Based on general effectiveness patterns"
      }
    ];
  }

  // Get learning insights for user
  getUserLearningInsights(userId) {
    const userKey = `user_${userId}`;
    const userPrefs = this.learningModel.userPreferences.get(userKey);
    const userExercises = Array.from(this.learningModel.exerciseEffectiveness.entries())
      .filter(([key]) => key.startsWith(userId));

    return {
      totalFeedback: this.feedbackQueue.filter(f => f.userId === userId).length,
      preferredExerciseTypes: userPrefs ? 
        Array.from(userPrefs.preferredExerciseTypes.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3) : [],
      mostEffectiveExercises: userExercises
        .sort(([,a], [,b]) => b.averageEffectiveness - a.averageEffectiveness)
        .slice(0, 3)
        .map(([key, data]) => ({
          exerciseId: key.split('_')[1],
          effectiveness: data.averageEffectiveness,
          completions: data.completions
        })),
      learningProgress: this.calculateLearningProgress(userId),
      nextOptimizations: this.suggestOptimizations(userId)
    };
  }

  calculateLearningProgress(userId) {
    const userFeedback = this.feedbackQueue.filter(f => f.userId === userId);
    const totalFeedback = userFeedback.length;
    
    if (totalFeedback === 0) return 0;
    
    const positiveFeedback = userFeedback.filter(f => 
      (f.rating && f.rating >= 4) || 
      (f.effectiveness && f.effectiveness >= 4) ||
      f.helpful === true
    ).length;
    
    return Math.round((positiveFeedback / totalFeedback) * 100);
  }

  suggestOptimizations(userId) {
    const insights = this.getUserLearningInsights(userId);
    const suggestions = [];

    if (insights.totalFeedback < 10) {
      suggestions.push("Continue providing feedback to improve personalization");
    }

    if (insights.preferredExerciseTypes.length > 0) {
      const topType = insights.preferredExerciseTypes[0][0];
      suggestions.push(`Focus more on ${topType} exercises for better results`);
    }

    if (insights.learningProgress < 70) {
      suggestions.push("Try different exercise types to find what works best for you");
    }

    return suggestions;
  }

  // Export learning model for analysis
  exportLearningModel() {
    return {
      userPreferences: Object.fromEntries(this.learningModel.userPreferences),
      exerciseEffectiveness: Object.fromEntries(this.learningModel.exerciseEffectiveness),
      moodTriggers: Object.fromEntries(this.learningModel.moodTriggers),
      successPatterns: Object.fromEntries(this.learningModel.successPatterns),
      totalFeedback: this.feedbackQueue.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Process feedback in batches for performance
  processFeedbackBatch(feedbackArray) {
    feedbackArray.forEach(feedback => this.processFeedback(feedback));
  }
}

// Create singleton instance
const feedbackLoopService = new FeedbackLoopService();

export default feedbackLoopService;
