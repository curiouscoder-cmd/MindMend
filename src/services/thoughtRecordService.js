import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';

const COLLECTION_NAME = 'thoughtRecords';

// Save thought record to Firestore
export const saveThoughtRecordToFirestore = async (userId, thoughtRecord) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId,
      automaticThought: thoughtRecord.automaticThought,
      distortions: thoughtRecord.distortions,
      rationalResponse: thoughtRecord.rationalResponse,
      aiSuggestion: thoughtRecord.aiSuggestion || '',
      createdAt: serverTimestamp(),
      timestamp: new Date().toISOString()
    });

    console.log('✅ Thought record saved to Firestore:', docRef.id);
    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('❌ Error saving thought record to Firestore:', error);
    throw error;
  }
};

// Get all thought records for a user
export const getThoughtRecordsFromFirestore = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const records = [];

    querySnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Retrieved ${records.length} thought records from Firestore`);
    return records;
  } catch (error) {
    console.error('❌ Error getting thought records from Firestore:', error);
    return [];
  }
};

// Delete a thought record from Firestore
export const deleteThoughtRecordFromFirestore = async (recordId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, recordId));
    console.log('✅ Thought record deleted from Firestore');
    return true;
  } catch (error) {
    console.error('❌ Error deleting thought record from Firestore:', error);
    return false;
  }
};

// Get thought record statistics for a user
export const getThoughtRecordStatsFromFirestore = async (userId) => {
  try {
    const records = await getThoughtRecordsFromFirestore(userId);
    
    if (records.length === 0) {
      return {
        totalRecords: 0,
        distortionCounts: {},
        recentRecords: [],
        mostCommonDistortion: null
      };
    }

    // Count distortion occurrences
    const distortionCounts = {};
    records.forEach(record => {
      if (record.distortions) {
        record.distortions.forEach(distortion => {
          distortionCounts[distortion.type] = (distortionCounts[distortion.type] || 0) + 1;
        });
      }
    });

    const mostCommonDistortion = Object.keys(distortionCounts).sort((a, b) => 
      distortionCounts[b] - distortionCounts[a]
    )[0];

    return {
      totalRecords: records.length,
      distortionCounts,
      recentRecords: records.slice(0, 10),
      mostCommonDistortion
    };
  } catch (error) {
    console.error('❌ Error calculating stats from Firestore:', error);
    return {
      totalRecords: 0,
      distortionCounts: {},
      recentRecords: [],
      mostCommonDistortion: null
    };
  }
};
