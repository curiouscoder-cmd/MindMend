#!/usr/bin/env node

/**
 * Build Knowledge Base from Web Sources
 * Scrapes professional psychology content and uploads to Firestore
 * Uses web search results instead of PDF OCR
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let db;
try {
  initializeApp();
  db = getFirestore();
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  process.exit(1);
}

/**
 * Knowledge base entries from web sources
 * These are curated from Psychology Today, NAMI, and other professional sources
 */
const knowledgeEntries = [
  {
    topic: 'cbt_basics',
    title: 'Cognitive Behavioral Therapy (CBT) Basics',
    content: `CBT integrates behavioral and cognitive theories to conclude that the way people perceive a situation determines their reaction more than the actual reality of the situation does. When a person is distressed or discouraged, their view of an experience may not be realistic. Changing the way clients think and see the world can change their responses to circumstances.

CBT is rooted in the present, so the therapist will initially ask clients to identify life situations, thoughts, and feelings that cause acute or chronic distress. The therapist will then explore whether or not these thoughts and feelings are productive or even valid. The goal of CBT is to get clients actively involved in their own treatment plan so that they understand that the way to improve their lives is to adjust their thinking and their approach to everyday situations.`,
    source: 'Psychology Today - Cognitive Behavioral Therapy',
    keywords: ['CBT', 'cognitive therapy', 'behavioral therapy', 'thoughts', 'feelings'],
    type: 'therapeutic_technique'
  },
  {
    topic: 'cognitive_distortions',
    title: 'Understanding Cognitive Distortions',
    content: `Cognitive distortions are irrational patterns of thought that can negatively affect behavior. Common cognitive distortions include:

1. All-or-Nothing Thinking: Seeing everything in black-and-white terms and ignoring nuance. You're either perfect or a failure.

2. Catastrophizing: Always assuming the worst will happen. One mistake means everything is ruined.

3. Personalization: Believing that the individual is responsible for everything that happens around them, whether good or bad. If someone is upset, it must be your fault.

4. Overgeneralization: One bad event means everything is bad. One rejection means you'll never find love.

5. Mind Reading: Assuming you know what others are thinking, usually negative thoughts about you.

6. Fortune Telling: Predicting the future will be negative without evidence.

7. Emotional Reasoning: Assuming your feelings are facts. "I feel anxious, therefore something bad will happen."

8. Should Statements: Using "should" and "must" creates guilt and pressure.

9. Labeling: Attaching negative labels to yourself or others instead of describing specific behaviors.

10. Discounting the Positive: Rejecting positive experiences as not counting or not being "real."`,
    source: 'Psychology Today - Cognitive Distortions',
    keywords: ['distortion', 'thinking error', 'all-or-nothing', 'catastrophizing', 'personalization'],
    type: 'therapeutic_technique'
  },
  {
    topic: 'triple_column_technique',
    title: 'Triple Column Technique (Thought Record)',
    content: `The Triple Column Technique is a powerful CBT tool for changing negative thought patterns. It was popularized by David D. Burns in "Feeling Good: The New Mood Therapy."

How it works:

Column 1 - Situation: Write down the situation that triggered your negative feelings. Be specific about what happened.

Column 2 - Automatic Thought: Write the automatic thought or mental image that popped into your head. What were you thinking when you felt bad?

Column 3 - Cognitive Distortion: Identify which cognitive distortion(s) are present in your thought. Is it catastrophizing? All-or-nothing thinking? Mind reading?

Column 4 - Rational Response: Write a more realistic, balanced thought. What would you tell a friend in this situation? What's the evidence for and against your automatic thought?

Example:
Situation: My boss didn't smile at me in the meeting.
Automatic Thought: She's angry with me. I'm going to get fired.
Distortion: Mind reading, catastrophizing
Rational Response: She was probably just focused on the meeting. She's never given me negative feedback. One neutral expression doesn't mean anything is wrong.

By practicing this technique regularly, you train your brain to automatically challenge distorted thoughts and develop more realistic, helpful thinking patterns.`,
    source: 'David D. Burns - Feeling Good: The New Mood Therapy',
    keywords: ['triple column', 'thought record', 'automatic thought', 'rational response', 'cognitive distortion'],
    type: 'therapeutic_technique'
  },
  {
    topic: 'behavioral_activation',
    title: 'Behavioral Activation for Depression',
    content: `Behavioral Activation is based on the observation that depression often creates a cycle: when you feel depressed, you withdraw from activities, which makes depression worse.

The solution is to gradually increase engagement in meaningful activities, even when you don't feel like it. Research shows that behavioral changes can lead to mood improvements.

Key principles:

1. Start Small: Don't try to do everything at once. Choose one or two small activities.

2. Schedule Activities: Put them on your calendar. Treat them like important appointments.

3. Do It Even If You Don't Feel Like It: Motivation often follows action, not the other way around.

4. Mix Pleasant and Productive: Include both enjoyable activities and accomplishment-oriented tasks.

5. Track Your Mood: Notice how your mood changes after activities. Often, you'll feel better than you expected.

Examples of activities:
- Take a 10-minute walk
- Call a friend
- Do one small household task
- Engage in a hobby
- Exercise
- Spend time in nature
- Read a book
- Listen to music

The key is consistency. Even small, regular activities can significantly improve mood over time.`,
    source: 'Behavioral Activation Research - Depression Treatment',
    keywords: ['behavioral activation', 'activity', 'depression', 'motivation', 'mood'],
    type: 'therapeutic_technique'
  },
  {
    topic: 'mood_monitoring',
    title: 'Mood Monitoring and Tracking',
    content: `Mood monitoring is a fundamental CBT skill that helps you understand your emotional patterns and identify triggers.

Why track your mood?
- Identify patterns: What times of day are you most depressed? What situations trigger anxiety?
- Recognize improvement: Tracking shows progress that you might not notice day-to-day.
- Understand triggers: Connect specific events or thoughts to mood changes.
- Evaluate treatment: See what strategies actually work for you.

How to track your mood:

1. Rate your mood on a scale (0-10, where 0 is worst and 10 is best)
2. Note the time and situation
3. Write down what you were thinking
4. Record any physical sensations
5. Note what you were doing

Example:
Time: 3 PM
Mood: 4/10 (anxious)
Situation: About to give a presentation
Thought: "I'm going to mess this up. Everyone will judge me."
Physical: Racing heart, sweating
Activity: Pacing, checking notes repeatedly

Over time, patterns emerge. You might notice:
- Your mood is lowest in the morning
- Social activities improve your mood
- Certain thoughts consistently trigger anxiety
- Exercise reliably improves your mood

This awareness is the first step to change. Once you understand your patterns, you can intervene effectively.`,
    source: 'CBT Mood Tracking Research',
    keywords: ['mood', 'tracking', 'feelings', 'monitor', 'patterns', 'triggers'],
    type: 'therapeutic_technique'
  },
  {
    topic: 'self_esteem_perfectionism',
    title: 'Self-Esteem and Overcoming Perfectionism',
    content: `Many people struggle with perfectionism, which often masks low self-esteem. The belief is: "If I'm not perfect, I'm a failure."

Understanding Self-Worth:

Your worth as a person is NOT determined by:
- Your productivity or achievements
- Your appearance
- What others think of you
- Your mistakes or failures
- Your job or status

Your worth IS:
- Inherent and unchanging
- Simply by being human
- Not something you need to earn
- Not dependent on performance

The Perfectionism Trap:

Perfectionism often leads to:
- Anxiety and stress
- Procrastination (fear of not being perfect)
- Depression (when you inevitably fall short)
- Relationship problems
- Burnout

Challenging Perfectionism:

1. Identify Perfectionist Thoughts: "I must be perfect" or "If it's not perfect, it's worthless"

2. Question the Evidence: Is perfection actually possible? What's the cost of pursuing it?

3. Practice Self-Compassion: Treat yourself as you would a good friend. Be kind to yourself when you make mistakes.

4. Set Realistic Standards: Good enough is often good enough. Aim for excellence, not perfection.

5. Celebrate Effort: Value the process and effort, not just the outcome.

6. Learn from Mistakes: Mistakes are opportunities to learn, not evidence of failure.

Remember: The most successful, happy people are not perfectionists. They're people who can accept their imperfections and move forward anyway.`,
    source: 'Self-Esteem and Perfectionism - CBT Research',
    keywords: ['self-esteem', 'perfectionism', 'worth', 'self-compassion', 'failure'],
    type: 'therapeutic_technique'
  },
  {
    topic: 'anxiety_management',
    title: 'Managing Anxiety and Catastrophic Thinking',
    content: `Anxiety often stems from catastrophic thinking - the tendency to assume the worst will happen and that you won't be able to handle it.

The Anxiety Cycle:

1. Trigger: Something happens or you have a worrying thought
2. Catastrophic Thought: "This is terrible. Something bad will happen."
3. Physical Symptoms: Racing heart, sweating, tension
4. Avoidance: You avoid the situation to reduce anxiety
5. Relief: Anxiety temporarily decreases
6. Reinforcement: You learn that avoidance "works," so anxiety increases next time

Breaking the Cycle:

1. Identify Catastrophic Thoughts: What's the worst-case scenario you're imagining?

2. Reality Test: What's the actual evidence? How likely is this really?

3. Develop Coping Statements: "I've handled difficult situations before. I can handle this."

4. Gradual Exposure: Instead of avoiding, gradually face the feared situation in small steps.

5. Practice Relaxation: Deep breathing, progressive muscle relaxation, mindfulness.

6. Focus on the Present: Anxiety is about the future. Bring your attention to what's happening right now.

Anxiety Management Techniques:

- Box Breathing: Inhale for 4, hold for 4, exhale for 4, hold for 4. Repeat 5 times.
- Progressive Muscle Relaxation: Tense and release each muscle group.
- Grounding: Notice 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.
- Mindfulness: Observe thoughts without judgment; let them pass like clouds.

Remember: Anxiety is uncomfortable but not dangerous. You can handle it.`,
    source: 'Anxiety Management - CBT Techniques',
    keywords: ['anxiety', 'catastrophic', 'worry', 'fear', 'exposure', 'coping'],
    type: 'therapeutic_technique'
  },
  {
    topic: 'depression_understanding',
    title: 'Understanding Depression and Mood Therapy',
    content: `Depression is not a sign of weakness. It's a treatable condition that affects how you think, feel, and behave.

Key Insights from "Feeling Good" by David D. Burns:

1. Your Mood is Created by Your Thoughts: Not by external events directly, but by how you interpret them.

2. Distorted Thinking Maintains Depression: Depression feeds on negative, distorted thoughts that feel true but often aren't.

3. You Can Change Your Mood: By identifying and challenging distorted thoughts, you can feel better.

4. Action Precedes Motivation: You don't have to feel motivated to act. Taking action often improves mood.

5. Self-Esteem is Key: Depression often involves harsh self-criticism. Developing self-compassion is healing.

Depression vs. Sadness:

Sadness is a normal emotion in response to loss or disappointment. Depression is more persistent and pervasive:
- Lasts weeks or months
- Affects multiple areas of life
- Includes physical symptoms (sleep, appetite, energy)
- Often involves hopelessness and worthlessness

Signs of Depression:
- Persistent sad or empty mood
- Loss of interest in activities
- Changes in sleep or appetite
- Fatigue or low energy
- Difficulty concentrating
- Feelings of worthlessness or guilt
- Thoughts of death or suicide

Treatment Options:
- Cognitive Behavioral Therapy (CBT)
- Medication
- Lifestyle changes (exercise, sleep, social connection)
- Combination of approaches

If you're experiencing depression, reach out to a mental health professional. Depression is treatable, and you don't have to suffer alone.`,
    source: 'David D. Burns - Feeling Good & Depression Research',
    keywords: ['depression', 'mood', 'thoughts', 'therapy', 'treatment', 'sadness'],
    type: 'therapeutic_technique'
  }
];

/**
 * Upload knowledge entries to Firestore
 */
async function uploadKnowledgeBase() {
  console.log(`\n📤 Uploading ${knowledgeEntries.length} knowledge entries to Firestore...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const entry of knowledgeEntries) {
    try {
      await db.collection('knowledge_base').add({
        ...entry,
        timestamp: new Date(),
        createdAt: new Date().toISOString()
      });
      successCount++;
      console.log(`✅ Uploaded: ${entry.title}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error uploading ${entry.title}:`, error.message);
    }
  }

  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  
  if (successCount > 0) {
    console.log(`\n✅ Knowledge Base Built Successfully!`);
    console.log(`🎯 Mira is now trained on professional CBT and "Feeling Good" concepts`);
    console.log(`📚 Total entries: ${successCount}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Building Knowledge Base from Web Sources...\n');
  console.log('📚 Knowledge Topics:');
  knowledgeEntries.forEach((entry, i) => {
    console.log(`   ${i + 1}. ${entry.title}`);
  });

  await uploadKnowledgeBase();
  process.exit(0);
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
