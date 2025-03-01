import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  userId: string;
}

export const weightService = {
  async saveWeightEntry(entry: Omit<WeightEntry, 'id' | 'userId'>) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const docRef = await addDoc(collection(db, 'weightEntries'), {
        ...entry,
        userId,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving weight entry:', error);
      throw error;
    }
  },

  async getWeightEntries() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const q = query(
        collection(db, 'weightEntries'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WeightEntry[];
    } catch (error) {
      console.error('Error getting weight entries:', error);
      throw error;
    }
  },

  async deleteEntry(entryId: string) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await deleteDoc(doc(db, 'weightEntries', entryId));
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      throw error;
    }
  },

  async saveUserPreferences(preferences: { unit: 'kg' | 'lbs' }) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await setDoc(doc(db, 'userPreferences', userId), {
        ...preferences,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  },

  async getUserPreferences() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const docRef = doc(db, 'userPreferences', userId);
      const docSnap = await getDoc(docRef); 

      if (docSnap.exists()) {
        return docSnap.data().unit;
      }
      return 'kg'; 
    } catch (error) {
      if (error instanceof Error && error.message === 'User not authenticated') {
        throw error;
      }
      console.error('Error getting user preferences:', error);
      return 'kg'; 
    }
  }
};