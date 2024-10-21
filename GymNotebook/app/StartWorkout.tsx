import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: {
    setNumber: number;
    actualReps: number;
  }[];
}

interface WorkoutLog {
  workoutId: string;
  workoutName: string;
  date: string;
  exercises: ExerciseLog[];
}

const StartWorkoutScreen: React.FC = () => {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSetNumber, setCurrentSetNumber] = useState<number>(1);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restTimeLeft, setRestTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [actualReps, setActualReps] = useState<string>('');

  useEffect(() => {
    loadWorkout();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadWorkout = async () => {
    try {
      const storedWorkouts = await AsyncStorage.getItem('workouts');
      const parsedWorkouts: Workout[] = storedWorkouts ? JSON.parse(storedWorkouts) : [];
      const foundWorkout = parsedWorkouts.find((w) => w.id === workoutId);
      if (foundWorkout) {
        setWorkout(foundWorkout);
      } else {
        Alert.alert('Workout not found');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load workout', error);
    }
  };

  const startRestTimer = (restTime: number) => {
    setIsResting(true);
    setRestTimeLeft(restTime);
    timerRef.current = setInterval(() => {
      setRestTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          setIsResting(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleCompleteSet = () => {
    const currentExercise = workout!.exercises[currentExerciseIndex];
    const reps = parseInt(actualReps) || currentExercise.reps;

    setExerciseLogs((prevLogs) => {
      const existingLog = prevLogs.find((log) => log.exerciseId === currentExercise.id);
      if (existingLog) {
        existingLog.sets.push({ setNumber: currentSetNumber, actualReps: reps });
        return [...prevLogs];
      } else {
        const newLog: ExerciseLog = {
          exerciseId: currentExercise.id,
          exerciseName: currentExercise.name,
          sets: [{ setNumber: currentSetNumber, actualReps: reps }],
        };
        return [...prevLogs, newLog];
      }
    });

    setActualReps('');
    if (currentSetNumber < currentExercise.sets) {
      startRestTimer(currentExercise.rest);
      setCurrentSetNumber(currentSetNumber + 1);
    } else {
      if (currentExerciseIndex < workout!.exercises.length - 1) {
        startRestTimer(currentExercise.rest);
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setCurrentSetNumber(1);
      } else {
        saveWorkoutLog();
      }
    }
  };

  const saveWorkoutLog = async () => {
    const workoutLog: WorkoutLog = {
      workoutId: workout!.id,
      workoutName: workout!.name,
      date: new Date().toISOString(),
      exercises: exerciseLogs,
    };

    try {
      const existingLogs = await AsyncStorage.getItem('workoutLogs');
      let logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(workoutLog);
      await AsyncStorage.setItem('workoutLogs', JSON.stringify(logs));
      Alert.alert('Workout completed!', 'Your workout has been logged.');
      router.replace('/'); 
    } catch (error) {
      console.error('Failed to save workout log', error);
    }
  };

  if (!workout) {
    return null;
  }

  const currentExercise = workout.exercises[currentExerciseIndex];

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{workout.name}</Text>
        </View>

        <View style={styles.exerciseContainer}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.setsRepsText}>
            Set {currentSetNumber} of {currentExercise.sets}
          </Text>
          <Text style={styles.setsRepsText}>
            Target Reps: {currentExercise.reps}
          </Text>
          {isResting ? (
            <View style={styles.restContainer}>
              <Text style={styles.restText}>Rest Time: {restTimeLeft} seconds</Text>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Actual Reps:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={actualReps}
                onChangeText={setActualReps}
                placeholder="Enter reps completed"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.completeSetButton}
                onPress={handleCompleteSet}
              >
                <Text style={styles.completeSetButtonText}>Complete Set</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  exerciseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  exerciseName: {
    fontSize: 28,
    color: '#FFC371',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  setsRepsText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  restContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  restText: {
    fontSize: 24,
    color: '#FF5F6D',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 30,
    width: '100%',
  },
  inputLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
  },
  completeSetButton: {
    backgroundColor: '#FF5F6D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeSetButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StartWorkoutScreen;
