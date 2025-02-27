import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebaseConfig';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

export interface Workout {
  id?: string;
  name: string;
  exercises: Exercise[];
  createdAt: Timestamp;
  userId: string;
}

export const workoutService = {
  async saveWorkout(workout: Omit<Workout, 'id' | 'createdAt' | 'userId'>) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const workoutData = {
        ...workout,
        userId,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'workouts'), workoutData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  },

  async deleteWorkout(workoutId: string) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      await deleteDoc(doc(db, 'workouts', workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  async getUserWorkouts() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting workouts:', error);
      throw error;
    }
  },

  async getWorkoutById(workoutId: string) {
    try {
      const docRef = doc(db, 'workouts', workoutId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting workout:', error);
      throw error;
    }
  },

  async updateWorkout(workoutId: string, updates: Partial<Workout>) {
    try {
      const docRef = doc(db, 'workouts', workoutId);
      await updateDoc(docRef, {
        ...updates,
        lastModified: new Date()
      });
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  }
};