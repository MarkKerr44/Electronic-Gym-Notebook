import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, getDoc, updateDoc, orderBy, limit } from 'firebase/firestore';
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
  },

  async saveWorkoutLog(workoutLog: WorkoutLog) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const workoutData = {
        userId,
        workoutId: workoutLog.workoutId,
        workoutName: workoutLog.workoutName,
        date: new Date(workoutLog.date),
        exercises: workoutLog.exercises
      };

      const docRef = await addDoc(collection(db, 'workoutLogs'), workoutData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving workout log:', error);
      throw error;
    }
  },

  async getWorkoutLogs(exerciseId?: string) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      let q;
      if (exerciseId) {
        // Simple query while waiting for index
        q = query(
          collection(db, 'workoutLogs'),
          where('userId', '==', userId),
          orderBy('date', 'desc'),
          limit(50) // Limit results to prevent performance issues
        );
      } else {
        q = query(
          collection(db, 'workoutLogs'),
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // If exerciseId is provided, filter in memory
      if (exerciseId) {
        return logs.filter(log => 
          log.exercises?.some(ex => ex.exerciseId === exerciseId)
        );
      }

      return logs;
    } catch (error) {
      console.error('Error getting workout logs:', error);
      // Return empty array instead of throwing
      return [];
    }
  },

  async updateCalendarWorkout(date: string, workout: any) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const calendarRef = collection(db, 'calendar');
      const docRef = await addDoc(calendarRef, {
        userId,
        date,
        workout,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error updating calendar:', error);
      throw error;
    }
  }
};