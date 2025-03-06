import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import exercisesData from '../../../exercises.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { workoutService } from '../../services/workoutService';

const ExerciseDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { exerciseId } = route.params as { exerciseId: string };
  const [exerciseData, setExerciseData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      const foundExercise = exercisesData.find((exercise) => exercise.id === exerciseId);
      setExerciseData(foundExercise || null);
      setLoading(false);
    }
  }, [exerciseId]);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const loadUserWorkouts = async () => {
    setIsLoading(true);
    try {
      const workouts = await workoutService.getUserWorkouts();
      setUserWorkouts(workouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWorkout = async (workoutId: string, workoutName: string) => {
    if (!exerciseData) return;
    
    try {
      const workout = await workoutService.getWorkoutById(workoutId);
      if (!workout) return;
      
      const updatedExercises = [
        ...workout.exercises,
        {
          id: exerciseData.id,
          name: exerciseData.name,
          sets: 3,
          reps: 10,
          rest: 60
        }
      ];
      
      await workoutService.updateWorkout(workoutId, { exercises: updatedExercises });
      
      Alert.alert(
        'Success',
        `Added ${exerciseData.name} to "${workoutName}"`,
        [{ text: 'OK' }]
      );
      
      setWorkoutModalVisible(false);
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      Alert.alert('Error', 'Failed to add exercise to workout');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC371" />
      </View>
    );
  }

  if (!exerciseData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.navigate('ExerciseLibraryScreen')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFC371" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{exerciseData.name || 'Exercise'}</Text>
        </View>
        <Text style={styles.categoryText}>{capitalize(exerciseData.category) || 'Category'}</Text>
        <View style={styles.imageContainer}>
          {Array.isArray(exerciseData.images) && exerciseData.images.length > 0 ? (
            exerciseData.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises/${image}` }}
                style={styles.image}
              />
            ))
          ) : (
            <Text style={styles.noImageText}>No images available.</Text>
          )}
        </View>
        <View style={styles.detailsCard}>
          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {exerciseData.instructions.map((step: string, index: number) => (
              <Text key={index} style={styles.descriptionText}>
                {`${index + 1}. ${step}`}
              </Text>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Muscles Worked</Text>
            <View style={styles.musclesContainer}>
              <Text style={styles.muscleType}>Primary:</Text>
              <Text style={styles.muscleList}>
                {exerciseData.primaryMuscles && exerciseData.primaryMuscles.length > 0
                  ? exerciseData.primaryMuscles.map((m: string) => capitalize(m)).join(', ')
                  : 'N/A'}
              </Text>
            </View>
            {exerciseData.secondaryMuscles && exerciseData.secondaryMuscles.length > 0 && (
              <View style={styles.musclesContainer}>
                <Text style={styles.muscleType}>Secondary:</Text>
                <Text style={styles.muscleList}>
                  {exerciseData.secondaryMuscles.map((m: string) => capitalize(m)).join(', ')}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.equipment) || 'Bodyweight'}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Force</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.force) || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Level</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.level) || 'N/A'}</Text>
          </View>
          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Mechanic</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.mechanic) || 'N/A'}</Text>
          </View>
          <TouchableOpacity
            style={styles.addToWorkoutButton}
            onPress={() => {
              loadUserWorkouts();
              setWorkoutModalVisible(true);
            }}
          >
            <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.addToWorkoutGradient}>
              <MaterialIcons name="playlist-add" size={24} color="#FFFFFF" />
              <Text style={styles.addToWorkoutText}>Add to Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={workoutModalVisible}
        onRequestClose={() => setWorkoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.workoutModalContent}>
            <Text style={styles.modalTitle}>
              Add {exerciseData?.name} to Workout
            </Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFC371" />
            ) : userWorkouts.length === 0 ? (
              <View style={styles.emptyWorkoutsContainer}>
                <Text style={styles.emptyWorkoutsText}>
                  You don't have any saved workouts yet.
                </Text>
                <TouchableOpacity
                  style={styles.createWorkoutButton}
                  onPress={() => {
                    setWorkoutModalVisible(false);
                    navigation.navigate('CreateWorkoutScreen');
                  }}
                >
                  <Text style={styles.createWorkoutButtonText}>
                    Create a Workout
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={userWorkouts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.workoutItem}
                    onPress={() => handleAddToWorkout(item.id, item.name)}
                  >
                    <Text style={styles.workoutName}>{item.name}</Text>
                    <Text style={styles.workoutExercisesCount}>
                      {item.exercises.length} exercises
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setWorkoutModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#ffffff', fontSize: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 28, color: '#ffffff', fontWeight: 'bold', flex: 1, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  categoryText: { fontSize: 16, color: '#FFC371', textAlign: 'center', marginBottom: 20 },
  imageContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 },
  image: { width: 150, height: 150, margin: 5, borderRadius: 10, borderWidth: 2, borderColor: '#FFC371', shadowColor: '#FFC371', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  noImageText: { color: '#ffffff', fontSize: 16, textAlign: 'center' },
  detailsCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  detailBlock: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, color: '#FFC371', marginBottom: 10, fontWeight: 'bold' },
  descriptionText: { fontSize: 16, color: '#ffffff', lineHeight: 24 },
  infoText: { fontSize: 16, color: '#ffffff', marginBottom: 5 },
  musclesContainer: { flexDirection: 'row', marginBottom: 5, alignItems: 'center' },
  muscleType: { fontSize: 16, color: '#FFC371', fontWeight: 'bold', marginRight: 10 },
  muscleList: { fontSize: 16, color: '#ffffff', flex: 1, flexWrap: 'wrap' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 10 },
  addToWorkoutButton: {
    marginTop: 20,
  },
  addToWorkoutGradient: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToWorkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  workoutModalContent: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFC371',
    marginBottom: 20,
    textAlign: 'center',
  },
  workoutItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutExercisesCount: {
    color: '#cccccc',
    fontSize: 14,
    marginTop: 5,
  },
  emptyWorkoutsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyWorkoutsText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  createWorkoutButton: {
    backgroundColor: '#FFC371',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
  },
  createWorkoutButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ExerciseDetailScreen;
