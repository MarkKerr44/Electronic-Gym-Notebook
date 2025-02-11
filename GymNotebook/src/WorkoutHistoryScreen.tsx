// WorkoutHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

const WorkoutHistoryScreen: React.FC = () => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateAnim = React.useRef(new Animated.Value(50)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(translateAnim, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    loadWorkoutLogs();
  }, []);

  const loadWorkoutLogs = async () => {
    try {
      const logs = await AsyncStorage.getItem('workoutLogs');
      if (logs) {
        setWorkoutLogs(JSON.parse(logs));
      }
    } catch (error) {}
  };

  const handleToggleExpand = (index: number) => {
    if (expandedIndexes.includes(index)) {
      setExpandedIndexes(expandedIndexes.filter((i) => i !== index));
    } else {
      setExpandedIndexes([...expandedIndexes, index]);
    }
  };

  const handleClearHistory = async () => {
    try {
      await AsyncStorage.removeItem('workoutLogs');
      setWorkoutLogs([]);
    } catch (error) {}
  };

  const renderExerciseItem = (exercise: ExerciseLog) => {
    let totalReps = 0;
    exercise.sets.forEach((s) => {
      totalReps += s.actualReps;
    });
    return (
      <View style={styles.exerciseDetail}>
        <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
        <Text style={styles.exerciseSets}>Sets: {exercise.sets.length}</Text>
        <Text style={styles.exerciseTotalReps}>Total Reps: {totalReps}</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: WorkoutLog; index: number }) => {
    const isExpanded = expandedIndexes.includes(index);
    return (
      <Animated.View
        style={[
          styles.historyItem,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        <TouchableOpacity onPress={() => handleToggleExpand(index)} style={styles.historyHeader}>
          <Text style={styles.historyWorkoutName}>{item.workoutName}</Text>
          <Text style={styles.historyDate}>{new Date(item.date).toLocaleString()}</Text>
          <MaterialIcons
            name={isExpanded ? 'expand-less' : 'expand-more'}
            size={24}
            color="#FFFFFF"
            style={styles.expandIcon}
          />
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.historyDetails}>
            <Text style={styles.exerciseCount}>
              Exercises: {item.exercises.length}
            </Text>
            <View>
              {item.exercises.map((exercise) => (
                <View key={exercise.exerciseId}>{renderExerciseItem(exercise)}</View>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Workout History</Text>
        </View>
        {workoutLogs.length === 0 ? (
          <View style={styles.noHistoryContainer}>
            <Text style={styles.noHistoryText}>No completed workouts to show.</Text>
          </View>
        ) : (
          <FlatList
            data={workoutLogs.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )}
            renderItem={renderItem}
            keyExtractor={(item, idx) => item.workoutId + '-' + idx}
            contentContainerStyle={styles.listContainer}
          />
        )}
        <View style={styles.clearContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <Text style={styles.clearButtonText}>Clear All History</Text>
          </TouchableOpacity>
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
  noHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noHistoryText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  historyWorkoutName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#DDDDDD',
    marginRight: 8,
  },
  expandIcon: {},
  historyDetails: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  exerciseCount: {
    fontSize: 16,
    color: '#FFC371',
    marginBottom: 5,
  },
  exerciseDetail: {
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
  },
  exerciseTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseSets: {
    fontSize: 14,
    color: '#DDD',
  },
  exerciseTotalReps: {
    fontSize: 14,
    color: '#DDD',
  },
  clearContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  clearButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 15,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkoutHistoryScreen;
