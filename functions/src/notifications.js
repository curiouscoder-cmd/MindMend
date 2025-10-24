// Firebase Cloud Messaging - Push Notifications
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './admin.js';

/**
 * Send push notification to user
 */
export const sendNotification = onRequest({ 
  cors: true,
  timeoutSeconds: 30,
}, async (req, res) => {
  try {
    const { userId, title, body, data = {}, imageUrl } = req.body;
    
    if (!userId || !title || !body) {
      return res.status(400).json({ error: 'userId, title, and body are required' });
    }
    
    // Get user's FCM tokens
    const userDoc = await db.collection('users').doc(userId).get();
    const fcmTokens = userDoc.data()?.fcmTokens || [];
    
    if (fcmTokens.length === 0) {
      return res.status(404).json({ error: 'No FCM tokens found for user' });
    }
    
    // Build notification payload
    const message = {
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      tokens: fcmTokens,
    };
    
    // Send to all user's devices
    const response = await getMessaging().sendEachForMulticast(message);
    
    console.log(`Sent ${response.successCount} notifications to ${userId}`);
    
    // Remove invalid tokens
    if (response.failureCount > 0) {
      const tokensToRemove = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          tokensToRemove.push(fcmTokens[idx]);
        }
      });
      
      if (tokensToRemove.length > 0) {
        await db.collection('users').doc(userId).update({
          fcmTokens: fcmTokens.filter(token => !tokensToRemove.includes(token)),
        });
      }
    }
    
    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
    
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
});

/**
 * Register FCM token for user
 */
export const registerToken = onRequest({ 
  cors: true,
  timeoutSeconds: 10,
}, async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ error: 'userId and token are required' });
    }
    
    const userRef = db.collection('users').doc(userId);
    
    // Add token to user's tokens array (avoid duplicates)
    await userRef.update({
      fcmTokens: FieldValue.arrayUnion(token),
      lastTokenUpdate: new Date().toISOString(),
    });
    
    console.log(`Registered FCM token for user ${userId}`);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Register token error:', error);
    res.status(500).json({ 
      error: 'Failed to register token',
      details: error.message 
    });
  }
});

/**
 * Trigger: Send daily wellness reminder
 */
export const sendDailyReminder = onRequest({ 
  cors: true,
  timeoutSeconds: 300,
}, async (req, res) => {
  try {
    // Get all users with notifications enabled
    const usersSnapshot = await db.collection('users')
      .where('preferences.notificationsEnabled', '==', true)
      .get();
    
    const messages = [];
    const reminderMessages = [
      {
        title: '🌅 Good morning!',
        body: 'How are you feeling today? Take a moment to check in with yourself.',
      },
      {
        title: '💚 Wellness Check',
        body: 'Remember to breathe. You\'re doing great!',
      },
      {
        title: '🧘 Mindful Moment',
        body: 'Take 2 minutes for a quick breathing exercise.',
      },
      {
        title: '✨ Daily Reminder',
        body: 'Your mental health matters. How can Mira support you today?',
      },
    ];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const fcmTokens = userData.fcmTokens || [];
      
      if (fcmTokens.length > 0) {
        const reminder = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
        
        messages.push({
          notification: reminder,
          data: {
            type: 'daily_reminder',
            timestamp: new Date().toISOString(),
          },
          tokens: fcmTokens,
        });
      }
    });
    
    // Send all notifications
    let totalSuccess = 0;
    for (const message of messages) {
      const response = await getMessaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
    }
    
    console.log(`Sent ${totalSuccess} daily reminders to ${messages.length} users`);
    
    res.json({
      success: true,
      userCount: messages.length,
      notificationsSent: totalSuccess,
    });
    
  } catch (error) {
    console.error('Daily reminder error:', error);
    res.status(500).json({ 
      error: 'Failed to send daily reminders',
      details: error.message 
    });
  }
});

/**
 * Trigger: Notify on streak milestone
 */
export const onStreakMilestone = onDocumentUpdated('users/{userId}', async (event) => {
  try {
    const before = event.data.before.data();
    const after = event.data.after.data();
    
    const oldStreak = before.progress?.streak || 0;
    const newStreak = after.progress?.streak || 0;
    
    // Check for milestone (7, 14, 30, 60, 90, 180, 365 days)
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    const achievedMilestone = milestones.find(m => newStreak >= m && oldStreak < m);
    
    if (achievedMilestone && after.fcmTokens?.length > 0) {
      const message = {
        notification: {
          title: `🔥 ${achievedMilestone}-Day Streak!`,
          body: `Amazing! You've maintained your wellness journey for ${achievedMilestone} days. Keep it up!`,
        },
        data: {
          type: 'streak_milestone',
          streak: newStreak.toString(),
          milestone: achievedMilestone.toString(),
        },
        tokens: after.fcmTokens,
      };
      
      await getMessaging().sendEachForMulticast(message);
      console.log(`Sent streak milestone notification to user ${event.params.userId}`);
    }
  } catch (error) {
    console.error('Streak milestone notification error:', error);
  }
});

/**
 * Trigger: Notify on crisis detection
 */
export const onCrisisDetected = onDocumentCreated('crisisInterventions/{interventionId}', async (event) => {
  try {
    const intervention = event.data.data();
    const userId = intervention.userId;
    
    const userDoc = await db.collection('users').doc(userId).get();
    const fcmTokens = userDoc.data()?.fcmTokens || [];
    
    if (fcmTokens.length > 0) {
      const message = {
        notification: {
          title: '🆘 Crisis Support Available',
          body: 'We\'re here for you. Immediate support resources are available.',
        },
        data: {
          type: 'crisis_support',
          urgency: 'critical',
          interventionId: event.params.interventionId,
        },
        tokens: fcmTokens,
        android: {
          priority: 'high',
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
        },
      };
      
      await getMessaging().sendEachForMulticast(message);
      console.log(`Sent crisis notification to user ${userId}`);
    }
  } catch (error) {
    console.error('Crisis notification error:', error);
  }
});
