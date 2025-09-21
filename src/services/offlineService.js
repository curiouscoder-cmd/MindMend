// Offline-First Service for MindMend
// Provides basic CBT exercises and journaling when offline

class OfflineService {
  constructor() {
    this.dbName = 'MindMendOfflineDB';
    this.version = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWhenOnline();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
    
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('exercises')) {
          const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
          exerciseStore.createIndex('mood', 'mood', { unique: false });
          exerciseStore.createIndex('completed', 'completed', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('journalEntries')) {
          const journalStore = db.createObjectStore('journalEntries', { keyPath: 'id' });
          journalStore.createIndex('date', 'date', { unique: false });
          journalStore.createIndex('mood', 'mood', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('moodHistory')) {
          const moodStore = db.createObjectStore('moodHistory', { keyPath: 'id' });
          moodStore.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('userProgress')) {
          db.createObjectStore('userProgress', { keyPath: 'id' });
        }
        
        // Populate with offline CBT exercises after transaction completes
        request.transaction.oncomplete = () => {
          this.populateOfflineExercises(db);
        };
      };
    });
  }

  populateOfflineExercises(db) {
    const transaction = db.transaction(['exercises'], 'readwrite');
    const store = transaction.objectStore('exercises');
    
    const offlineExercises = [
      {
        id: 'breathing_4_7_8',
        title: '4-7-8 Breathing Technique',
        mood: 'anxious',
        duration: '5 minutes',
        difficulty: 'beginner',
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
        offline: true
      },
      {
        id: 'grounding_5_4_3_2_1',
        title: '5-4-3-2-1 Grounding Technique',
        mood: 'anxious',
        duration: '5 minutes',
        difficulty: 'beginner',
        steps: [
          'Name 5 things you can see around you',
          'Name 4 things you can touch',
          'Name 3 things you can hear',
          'Name 2 things you can smell',
          'Name 1 thing you can taste'
        ],
        outcome: 'Feel more grounded and present',
        technique: 'Mindfulness grounding',
        offline: true
      },
      {
        id: 'progressive_relaxation',
        title: 'Progressive Muscle Relaxation',
        mood: 'stressed',
        duration: '15 minutes',
        difficulty: 'intermediate',
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
        offline: true
      },
      {
        id: 'thought_challenging',
        title: 'Thought Challenging Exercise',
        mood: 'sad',
        duration: '10 minutes',
        difficulty: 'intermediate',
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
        offline: true
      },
      {
        id: 'gratitude_practice',
        title: 'Daily Gratitude Practice',
        mood: 'happy',
        duration: '8 minutes',
        difficulty: 'beginner',
        steps: [
          'Write down 3 things you\'re grateful for today',
          'For each item, write why you\'re grateful',
          'Think about how these things positively impact your life',
          'Visualize these positive aspects',
          'Share your gratitude with someone if possible'
        ],
        outcome: 'Increased positive emotions and life satisfaction',
        technique: 'Positive psychology',
        offline: true
      },
      {
        id: 'self_compassion',
        title: 'Self-Compassion Break',
        mood: 'sad',
        duration: '10 minutes',
        difficulty: 'beginner',
        steps: [
          'Place your hand on your heart',
          'Acknowledge: "This is a moment of suffering"',
          'Remember: "Suffering is part of human experience"',
          'Offer yourself kindness: "May I be kind to myself"',
          'Speak to yourself as you would a good friend',
          'Take three deep, calming breaths'
        ],
        outcome: 'Increased self-compassion and emotional resilience',
        technique: 'Self-compassion therapy',
        offline: true
      }
    ];

    offlineExercises.forEach(exercise => {
      store.add(exercise);
    });
  }

  // Save data locally
  async saveData(storeName, data) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get data from local storage
  async getData(storeName, key = null) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = key ? store.get(key) : store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get exercises by mood
  async getExercisesByMood(mood) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(['exercises'], 'readonly');
    const store = transaction.objectStore('exercises');
    const index = store.index('mood');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(mood);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save journal entry
  async saveJournalEntry(entry) {
    const journalEntry = {
      id: Date.now(),
      content: entry.content,
      mood: entry.mood,
      date: new Date().toISOString(),
      synced: false
    };
    
    return this.saveData('journalEntries', journalEntry);
  }

  // Save mood entry
  async saveMoodEntry(mood) {
    const moodEntry = {
      id: Date.now(),
      mood: mood,
      date: new Date().toISOString(),
      synced: false
    };
    
    return this.saveData('moodHistory', moodEntry);
  }

  // Update user progress
  async updateProgress(progress) {
    const progressData = {
      id: 'current',
      ...progress,
      lastUpdated: new Date().toISOString(),
      synced: false
    };
    
    return this.saveData('userProgress', progressData);
  }

  // Get user progress
  async getProgress() {
    const progress = await this.getData('userProgress', 'current');
    return progress || {
      completedExercises: 0,
      calmPoints: 0,
      streak: 0,
      level: 1
    };
  }

  // Get all journal entries
  async getJournalEntries() {
    return this.getData('journalEntries');
  }

  // Get mood history
  async getMoodHistory() {
    return this.getData('moodHistory');
  }

  // Sync data when online
  async syncWhenOnline() {
    if (!this.isOnline) return;
    
    try {
      // Get unsynced data
      const journalEntries = await this.getJournalEntries();
      const moodHistory = await this.getMoodHistory();
      const progress = await this.getProgress();
      
      const unsyncedJournal = journalEntries.filter(entry => !entry.synced);
      const unsyncedMoods = moodHistory.filter(entry => !entry.synced);
      
      // Here you would sync with your backend/cloud storage
      console.log('Syncing offline data:', {
        journalEntries: unsyncedJournal.length,
        moodEntries: unsyncedMoods.length,
        progress: !progress.synced
      });
      
      // Mark as synced (simplified - in production, only mark after successful sync)
      unsyncedJournal.forEach(entry => {
        entry.synced = true;
        this.saveData('journalEntries', entry);
      });
      
      unsyncedMoods.forEach(entry => {
        entry.synced = true;
        this.saveData('moodHistory', entry);
      });
      
      if (progress && !progress.synced) {
        progress.synced = true;
        this.saveData('userProgress', progress);
      }
      
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  // Check if online
  isOnlineMode() {
    return this.isOnline;
  }

  // Get offline capabilities status
  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      dbReady: !!this.db,
      features: {
        exercises: true,
        journaling: true,
        moodTracking: true,
        progressTracking: true,
        aiChat: false,
        community: false
      }
    };
  }
}

// Create singleton instance
const offlineService = new OfflineService();

export default offlineService;
