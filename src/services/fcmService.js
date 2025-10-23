// Firebase Cloud Messaging Service - Frontend
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebaseConfig.js';

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Register FCM token with backend
 */
export const registerFCMToken = async (userId, token) => {
  try {
    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL;
    
    const response = await fetch(`${functionsUrl}/registerToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to register token');
    }
    
    console.log('✅ FCM token registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.warn('Firebase Messaging not supported');
    return () => {};
  }
  
  return onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    
    const { notification, data } = payload;
    
    // Show browser notification
    if (notification) {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icon-192.png',
        badge: '/badge-72.png',
        tag: data?.type || 'default',
        data: data,
      });
    }
    
    // Call custom callback
    if (callback) {
      callback(payload);
    }
  });
};

/**
 * Send notification to user (admin function)
 */
export const sendNotification = async (userId, title, body, data = {}) => {
  try {
    const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL;
    
    const response = await fetch(`${functionsUrl}/sendNotification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, body, data }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
    
    const result = await response.json();
    console.log('✅ Notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Initialize FCM for user
 */
export const initializeFCM = async (userId) => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    
    // Check if already granted
    if (Notification.permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      
      if (token) {
        await registerFCMToken(userId, token);
        return true;
      }
    }
    
    // Request permission
    const token = await requestNotificationPermission();
    if (token) {
      await registerFCMToken(userId, token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return false;
  }
};

export default {
  requestNotificationPermission,
  registerFCMToken,
  onForegroundMessage,
  sendNotification,
  initializeFCM,
};
