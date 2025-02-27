import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { workoutService } from './services/workoutService';

interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: {
    setNumber: number;
    actualReps: number;
    weight: number;  
  }[];
}

interface WorkoutLog {
  workoutId: string;
  workoutName: string;
  date: string; 
  exercises: ExerciseLog[];
}

interface RouteParams {
  highlightLogId?: string;
}

interface Props {
  route?: {
    params?: RouteParams;
  };
}

const WorkoutHistoryScreen: React.FC<Props> = ({ route }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;
  const navigation = useNavigation();
  const listRef = useRef<FlatList<WorkoutLog>>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true
    }).start();
    Animated.timing(translateAnim, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true
    }).start();
    loadWorkoutLogs();
  }, []);

  useEffect(() => {
    if (route?.params?.highlightLogId) {
      highlightWorkout(route.params.highlightLogId);
    }
  }, [route?.params?.highlightLogId]);

  const loadWorkoutLogs = async () => {
    try {
      setIsLoading(true);
      const logs = await workoutService.getWorkoutLogs();
      setWorkoutLogs(logs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
    } catch (error) {
      console.error('Error loading workout logs:', error);
      Alert.alert(
        'Error',
        'Failed to load workout history. Please check your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const highlightWorkout = (logId: string) => {
    const index = workoutLogs.findIndex(log => log.workoutId === logId);
    if (index >= 0) {
      setExpandedIndexes([index]);
      listRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  const handleToggleExpand = (index: number) => {
    if (expandedIndexes.includes(index)) {
      setExpandedIndexes(expandedIndexes.filter(i => i !== index));
    } else {
      setExpandedIndexes([...expandedIndexes, index]);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all workout history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.clearWorkoutHistory();
              setWorkoutLogs([]);
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear workout history.');
            }
          }
        }
      ]
    );
  };

  const renderExerciseItem = (exercise: ExerciseLog) => {
    let totalReps = 0;
    let maxWeight = 0;
    let totalVolume = 0;  
  
    exercise.sets.forEach(s => {
      totalReps += s.actualReps;
      maxWeight = Math.max(maxWeight, s.weight);
      totalVolume += s.weight * s.actualReps;
    });
  
    return (
      <TouchableOpacity 
        style={styles.exerciseDetail}
        onPress={() => navigation.navigate('ExerciseAnalytics', {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName
        })}
      >
        <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
        <Text style={styles.exerciseSets}>Sets: {exercise.sets.length}</Text>
        <Text style={styles.exerciseStats}>Total Reps: {totalReps}</Text>
        <Text style={styles.exerciseStats}>Max Weight: {maxWeight}kg</Text>
        <Text style={styles.exerciseStats}>Total Volume: {totalVolume}kg</Text>
        
        <View style={styles.setsContainer}>
          {exercise.sets.map((set, index) => (
            <View key={index} style={styles.setRow}>
              <Text style={styles.setText}>
                Set {set.setNumber}: {set.weight}kg × {set.actualReps} reps
              </Text>
            </View>
          ))}
        </View>
        <MaterialIcons 
          name="analytics" 
          size={20} 
          color="#FFC371" 
          style={styles.analyticsIcon} 
        />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }: { item: WorkoutLog; index: number }) => {
    const isExpanded = expandedIndexes.includes(index);
    
    const workoutDate = new Date(item.date);
    const formattedDate = workoutDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return (
      <Animated.View
        style={[
          styles.historyItem,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }]
          }
        ]}
      >
        <TouchableOpacity onPress={() => handleToggleExpand(index)} style={styles.historyHeader}>
          <Text style={styles.historyWorkoutName}>{item.workoutName}</Text>
          <Text style={styles.historyDate}>{formattedDate}</Text>
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
              {item.exercises.map(exercise => (
                <View key={exercise.exerciseId}>{renderExerciseItem(exercise)}</View>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Workout History</Text>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC371" />
            <Text style={styles.loadingText}>Loading workout history...</Text>
          </View>
        ) : workoutLogs.length === 0 ? (
          <View style={styles.noHistoryContainer}>
            <Text style={styles.noHistoryText}>No completed workouts to show.</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
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
    flex: 1
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  backButton: {
    marginRight: 10
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  noHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noHistoryText: {
    fontSize: 18,
    color: '#FFFFFF'
  },
  listContainer: {
    paddingBottom: 20
  },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden'
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15
  },
  historyWorkoutName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1
  },
  historyDate: {
    fontSize: 12,
    color: '#DDDDDD',
    marginRight: 8
  },
  expandIcon: {},
  historyDetails: {
    paddingHorizontal: 15,
    paddingBottom: 10
  },
  exerciseCount: {
    fontSize: 16,
    color: '#FFC371',
    marginBottom: 5
  },
  exerciseDetail: {
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10
  },
  exerciseTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5
  },
  exerciseSets: {
    fontSize: 14,
    color: '#DDD'
  },
  exerciseTotalReps: {
    fontSize: 14,
    color: '#DDD'
  },
  clearContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  clearButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 15
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  exerciseStats: {
    fontSize: 14,
    color: '#DDD',
    marginBottom: 4,
  },
  setsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  setText: {
    fontSize: 14,
    color: '#DDD',
  },
  analyticsIcon: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFC371',
  },
});

export default WorkoutHistoryScreen;