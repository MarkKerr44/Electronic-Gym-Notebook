import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import exercisesData from '../exercises.json';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

interface Exercise {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  level: string;
  category: string;
  instructions: string[];
}

interface SelectedExercise extends Exercise {
  sets: number;
  reps: number;
  rest: number; 
}

const CreateWorkoutScreen: React.FC = () => {
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exercisesData);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedExercisesInModal, setSelectedExercisesInModal] = useState<Exercise[]>([]);

  const [isSaveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [workoutName, setWorkoutName] = useState<string>('');

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredExercises(exercisesData);
    } else {
      const filtered = exercisesData.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchTerm]);

 
  const addExercisesToWorkout = () => {
    const newSelectedExercises = selectedExercisesInModal.map((exercise) => ({
      ...exercise,
      sets: 3, 
      reps: 10, 
      rest: 60, 
    }));
    setSelectedExercises((prevExercises) => [...prevExercises, ...newSelectedExercises]);
    setSelectedExercisesInModal([]); 
    setModalVisible(false);
  };

  const removeExerciseFromWorkout = (index: number) => {
    setSelectedExercises((prevExercises) => prevExercises.filter((_, i) => i !== index));
  };

  const toggleExerciseSelection = (exercise: Exercise) => {
    const isAlreadySelected = selectedExercisesInModal.find((e) => e.id === exercise.id);
    if (isAlreadySelected) {
      setSelectedExercisesInModal((prevSelected) =>
        prevSelected.filter((e) => e.id !== exercise.id)
      );
    } else {
      setSelectedExercisesInModal((prevSelected) => [...prevSelected, exercise]);
    }
  };

  const calculateWorkoutStats = () => {
    const muscleGroups: { [key: string]: { primary: number; secondary: number } } = {};

    selectedExercises.forEach((exercise) => {
      exercise.primaryMuscles.forEach((muscle) => {
        if (!muscleGroups[muscle]) muscleGroups[muscle] = { primary: 0, secondary: 0 };
        muscleGroups[muscle].primary += 1;
      });
      exercise.secondaryMuscles.forEach((muscle) => {
        if (!muscleGroups[muscle]) muscleGroups[muscle] = { primary: 0, secondary: 0 };
        muscleGroups[muscle].secondary += 1;
      });
    });

    return muscleGroups;
  };

  const muscleStats = calculateWorkoutStats();

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Workout</Text>
        </View>

        <TouchableOpacity style={styles.addExerciseButton} onPress={() => setModalVisible(true)}>
          <LinearGradient
            colors={['#FF5F6D', '#FFC371']}
            style={styles.addExerciseButtonGradient}
          >
            <MaterialIcons name="add-circle" size={30} color="#fff" />
            <Text style={styles.addExerciseButtonText}>Add Exercises</Text>
          </LinearGradient>
        </TouchableOpacity>

        <ScrollView style={styles.selectedExercisesContainer}>
          <Text style={styles.sectionTitle}>Selected Exercises</Text>
          {selectedExercises.length === 0 ? (
            <Text style={styles.emptyText}>No exercises added yet.</Text>
          ) : (
            selectedExercises.map((exercise, index) => (
              <View key={index} style={styles.selectedExerciseCard}>
                <View style={styles.selectedExerciseInfo}>
                  <Text style={styles.selectedExerciseName}>{exercise.name}</Text>
                  <Text style={styles.setsRepsText}>
                    {exercise.sets} sets x {exercise.reps} reps
                  </Text>
                  <Text style={styles.restText}>Rest: {exercise.rest} seconds</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeExerciseButton}
                  onPress={() => removeExerciseFromWorkout(index)}
                >
                  <MaterialIcons name="delete" size={24} color="#ff5f6d" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Workout Stats</Text>
          <ScrollView style={styles.statsScroll}>
            {Object.keys(muscleStats).map((muscle, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.muscleName}>{muscle}</Text>
                <Text style={styles.muscleStat}>
                  Primary: {muscleStats[muscle].primary}, Secondary: {muscleStats[muscle].secondary}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.saveWorkoutButton}
          onPress={() => setSaveModalVisible(true)}
        >
          <Text style={styles.saveWorkoutButtonText}>Save Workout</Text>
        </TouchableOpacity>

        <Modal visible={isModalVisible} transparent={true} animationType="slide">
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Exercises</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={24} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search exercises"
                  placeholderTextColor="#999"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>

              <FlatList
                data={filteredExercises}
                renderItem={({ item }) => {
                  const isSelected = selectedExercisesInModal.some((e) => e.id === item.id);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.exerciseItem,
                        isSelected && styles.exerciseItemSelected,
                      ]}
                      onPress={() => toggleExerciseSelection(item)}
                    >
                      <Text style={styles.exerciseName}>{item.name}</Text>
                      <MaterialIcons
                        name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={isSelected ? '#FFC371' : '#ffffff'}
                      />
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                style={styles.exerciseList}
              />

              <TouchableOpacity
                style={styles.addSelectedExercisesButton}
                onPress={addExercisesToWorkout}
              >
                <Text style={styles.addSelectedExercisesButtonText}>
                  Add {selectedExercisesInModal.length} Exercises
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal visible={isSaveModalVisible} transparent={true} animationType="slide">
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Save Workout</Text>
                <TouchableOpacity onPress={() => setSaveModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Workout Name</Text>
                <TextInput
                  style={styles.input}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  placeholder="Enter workout name"
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={async () => {
                  if (workoutName.trim() === '') {
                    Alert.alert('Please enter a workout name.');
                    return;
                  }
                  const workout = {
                    id: Date.now().toString(),
                    name: workoutName,
                    exercises: selectedExercises,
                  };

                  try {
                    const existingWorkouts = await AsyncStorage.getItem('workouts');
                    let workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
                    workouts.push(workout);
                    await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
                    setSelectedExercises([]);
                    setWorkoutName('');
                    setSaveModalVisible(false);
                    Alert.alert('Workout saved successfully!');
                  } catch (error) {
                    console.log('Error saving workout:', error);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Save Workout</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addExerciseButton: {
    marginBottom: 20,
  },
  addExerciseButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  addExerciseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  selectedExercisesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#ffc371',
    marginBottom: 10,
  },
  selectedExerciseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedExerciseInfo: {
    flex: 1,
  },
  selectedExerciseName: {
    fontSize: 18,
    color: '#ffffff',
  },
  setsRepsText: {
    fontSize: 14,
    color: '#cccccc',
  },
  restText: {
    fontSize: 14,
    color: '#cccccc',
  },
  removeExerciseButton: {
    padding: 5,
  },
  statsContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 22,
    color: '#ffc371',
    marginBottom: 10,
  },
  statsScroll: {
    maxHeight: 150,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  muscleName: {
    fontSize: 16,
    color: '#ffffff',
  },
  muscleStat: {
    fontSize: 16,
    color: '#cccccc',
  },
  saveWorkoutButton: {
    backgroundColor: '#FFC371',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveWorkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    marginLeft: 10,
    fontSize: 16,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  listContainer: {
    paddingBottom: 20,
  },
  addSelectedExercisesButton: {
    backgroundColor: '#FF5F6D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addSelectedExercisesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF5F6D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#cccccc',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CreateWorkoutScreen;
