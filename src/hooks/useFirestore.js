import { useState, useEffect } from 'react';
import { 
  getUserProfile, 
  updateUserProgress, 
  saveMoodEntry,
  getMoodHistory,
  subscribeMoodEntries 
} from '../services/firestoreService.js';

export const useUserProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  return { profile, loading, error };
};

export const useMoodHistory = (userId, days = 30) => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadMoods = async () => {
      try {
        const data = await getMoodHistory(userId, days);
        setMoods(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadMoods();
  }, [userId, days]);

  return { moods, loading, error };
};

export const useMoodSubscription = (userId) => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMoodEntries(userId, (data) => {
      setMoods(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  return { moods, loading };
};
