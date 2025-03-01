import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';

class FirebaseService {
  getCurrentUserId() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  async saveWorkout(workout: { name: string; exercises: any[] }) {
    try {
      const userId = this.getCurrentUserId();
      const workoutData = {
        userId,
        name: workout.name,
        exercises: workout.exercises,
        createdAt: Timestamp.now(),
        lastModified: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, 'workouts'), workoutData);
      return docRef.id;
    } catch (error) {
      console.error('Error in saveWorkout:', error);
      throw error;
    }
  }

  async getUserWorkouts() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      orderBy('lastModified', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async saveExerciseLog(exerciseLog: any) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const logData = {
        userId,
        ...exerciseLog,
        date: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, 'exerciseLogs'), logData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving exercise log:', error);
      throw error;
    }
  }

  async getExerciseHistory(exerciseId: string) {
    try {
      const userId = this.getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const qy = query(
        collection(db, 'exerciseLogs'),
        where('userId', '==', userId),
        where('exerciseId', '==', exerciseId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(qy);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting exercise history:', error);
      throw error;
    }
  }

  async saveWorkoutLog(workoutLog: any) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const workoutData = {
      userId,
      workoutId: workoutLog.workoutId,
      workoutName: workoutLog.workoutName,
      date: Timestamp.fromDate(new Date(workoutLog.date)),
      exercises: workoutLog.exercises,
    };
    return await addDoc(collection(db, 'workoutLogs'), workoutData);
  }

  async getLastWorkoutOfType(workoutId: string) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const qy = query(
      collection(db, 'workoutLogs'),
      where('userId', '==', userId),
      where('workoutId', '==', workoutId),
      orderBy('date', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(qy);
    return snapshot.empty
      ? null
      : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async getPreviousBest(exerciseId: string) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const qy = query(
      collection(db, 'workoutLogs'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(qy);
    let maxWeight = 0;
    let repsAtMaxWeight = 0;
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      data.exercises.forEach((exercise: any) => {
        if (exercise.exerciseId === exerciseId) {
          exercise.sets.forEach((set: any) => {
            if (set.weight > maxWeight) {
              maxWeight = set.weight;
              repsAtMaxWeight = set.actualReps;
            }
          });
        }
      });
    });
    return { weight: maxWeight, reps: repsAtMaxWeight };
  }

  async updateCalendarWorkout(date: string, workout: any) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const calendarRef = collection(db, 'calendar');
    const qy = query(
      calendarRef,
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const snapshot = await getDocs(qy);
    if (snapshot.empty) {
      await addDoc(calendarRef, {
        userId,
        date,
        workouts: [workout],
      });
    } else {
      const doc = snapshot.docs[0];
      const existingWorkouts = doc.data().workouts || [];
      existingWorkouts.push(workout);
      await doc.ref.update({ workouts: existingWorkouts });
    }
  }
}

export const firebaseService = new FirebaseService();
