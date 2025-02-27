// MyWorkoutsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Animated,
  Easing,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { workoutService } from './services/workoutService';

interface Workout {
  id: string;
  name: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    rest: number;
  }[];
}

const MyWorkoutsScreen: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateAnim = React.useRef(new Animated.Value(100)).current;
  const navigation = useNavigation();

  useEffect(() => {
    loadWorkouts();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(translateAnim, {
      toValue: 0,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const loadWorkouts = async () => {
    try {
      const fetchedWorkouts = await workoutService.getUserWorkouts();
      setWorkouts(fetchedWorkouts);
    } catch (error) {
      console.error('Failed to load workouts:', error);
      Alert.alert('Error', 'Failed to load workouts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await workoutService.deleteWorkout(workoutId);
              setWorkouts(workouts.filter(workout => workout.id !== workoutId));
            } catch (error) {
              console.error('Failed to delete workout:', error);
              Alert.alert('Error', 'Failed to delete workout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSelectWorkout = (workout: Workout) => {
    navigation.navigate('WorkoutDetails', { workoutId: workout.id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkouts().then(() => setRefreshing(false));
  };

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateAnim }] }}>
      <TouchableOpacity
        style={styles.workoutItem}
        onPress={() => handleSelectWorkout(item)}
        activeOpacity={0.8}
      >
        <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.workoutItemGradient}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <Text style={styles.exerciseCount}>{item.exercises.length} Exercises</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteWorkout(item.id)}
          >
            <MaterialIcons name="delete" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Workouts</Text>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC371" />
            <Text style={styles.loadingText}>Loading workouts...</Text>
          </View>
        ) : workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no saved workouts yet.</Text>
            <TouchableOpacity
              style={styles.createWorkoutButton}
              onPress={() => navigation.navigate('createWorkout')}
            >
              <Text style={styles.createWorkoutButtonText}>Create a Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.workoutList}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutList: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  workoutItem: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
  },
  workoutInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#FFD700',
  },
  deleteButton: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  createWorkoutButton: {
    backgroundColor: '#FFC371',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 16,
  },
  createWorkoutButtonText: {
    fontSize: 18,
    color: '#302b63',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#CCCCCC',
    marginTop: 10,
  },
});

export default MyWorkoutsScreen;
