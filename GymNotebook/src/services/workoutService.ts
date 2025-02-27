import { collection, addDoc, getDocs, query, where, deleteDoc, doc, Timestamp, getDoc, updateDoc, orderBy, limit, writeBatch } from 'firebase/firestore';
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

export interface ExerciseSummary {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  bestWeight: number;
  lastVolume: number;
  lastDate?: string;
}

export interface ExerciseData {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
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
        q = query(
          collection(db, 'workoutLogs'),
          where('userId', '==', userId),
          orderBy('date', 'desc'),
          limit(50) 
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

      if (exerciseId) {
        return logs.filter(log => 
          log.exercises?.some(ex => ex.exerciseId === exerciseId)
        );
      }

      return logs;
    } catch (error) {
      console.error('Error getting workout logs:', error);
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
  },

  async clearWorkoutHistory() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const q = query(
        collection(db, 'workoutLogs'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      let operationCount = 0;
      
      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        operationCount++;
        
        if (operationCount === 500) {
          await batch.commit();
          operationCount = 0;
        }
      }
      
      if (operationCount > 0) {
        await batch.commit();
      }

      const calendarQ = query(
        collection(db, 'calendar'),
        where('userId', '==', userId)
      );
      
      const calendarSnapshot = await getDocs(calendarQ);
      const calendarBatch = writeBatch(db);
      operationCount = 0;
      
      for (const doc of calendarSnapshot.docs) {
        calendarBatch.delete(doc.ref);
        operationCount++;
        
        if (operationCount === 500) {
          await calendarBatch.commit();
          operationCount = 0;
        }
      }
      
      if (operationCount > 0) {
        await calendarBatch.commit();
      }
    } catch (error) {
      console.error('Error clearing workout history:', error);
      throw error;
    }
  },

  async getExerciseStats(): Promise<ExerciseSummary[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const q = query(
        collection(db, 'workoutLogs'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      const exerciseMap = new Map<string, ExerciseSummary>();

      snapshot.docs.forEach(doc => {
        const log = doc.data();
        log.exercises?.forEach(exercise => {
          if (!exercise.sets || exercise.sets.length === 0) return;

          const validWeights = exercise.sets
            .map(s => s.weight || 0)
            .filter(w => !isNaN(w));

          if (validWeights.length > 0) {
            const maxWeight = Math.max(...validWeights);
            const totalVolume = exercise.sets.reduce((sum, set) => 
              sum + ((set.weight || 0) * (set.actualReps || 0)), 0);

            if (!exerciseMap.has(exercise.exerciseId)) {
              exerciseMap.set(exercise.exerciseId, {
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                lastWeight: maxWeight,
                bestWeight: maxWeight,
                lastVolume: totalVolume,
                lastDate: log.date
              });
            } else {
              const existing = exerciseMap.get(exercise.exerciseId)!;
              exerciseMap.set(exercise.exerciseId, {
                ...existing,
                lastWeight: maxWeight,
                bestWeight: Math.max(existing.bestWeight, maxWeight),
                lastVolume: totalVolume,
                lastDate: log.date
              });
            }
          }
        });
      });

      return Array.from(exerciseMap.values());
    } catch (error) {
      console.error('Error getting exercise stats:', error);
      throw error;
    }
  },

  async getExerciseHistory(exerciseId: string): Promise<ExerciseData[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('User not authenticated');

      const q = query(
        collection(db, 'workoutLogs'),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const exerciseData: ExerciseData[] = [];

      snapshot.docs.forEach(doc => {
        const log = doc.data();
        const exercise = log.exercises?.find(e => e.exerciseId === exerciseId);

        if (exercise?.sets?.length > 0) {
          const validSets = exercise.sets.filter(s => 
            typeof s.weight === 'number' && 
            !isNaN(s.weight) &&
            typeof s.actualReps === 'number' &&
            !isNaN(s.actualReps)
          );

          if (validSets.length > 0) {
            const maxWeight = Math.max(...validSets.map(s => s.weight));
            const totalVolume = validSets.reduce((sum, set) => 
              sum + (set.weight * set.actualReps), 0);
            const totalReps = validSets.reduce((sum, set) => 
              sum + set.actualReps, 0);

            exerciseData.push({
              date: log.date,
              maxWeight,
              totalVolume,
              totalReps
            });
          }
        }
      });

      return exerciseData
        .filter(data => !isNaN(data.maxWeight) && !isNaN(data.totalVolume))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    } catch (error) {
      console.error('Error getting exercise history:', error);
      throw error;
    }
  }
};