import React, { useState, useEffect } from 'react';
import * as RN from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import exercisesData from '../exercises.json';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';

const {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Keyboard
} = RN;

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
  const navigation = useNavigation();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [viewMode, setViewMode] = useState<'exercises' | 'view' | 'stats'>('exercises');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exercisesData);
  const [selectedExercisesInModal, setSelectedExercisesInModal] = useState<Exercise[]>([]);
  const [tempFilterType, setTempFilterType] = useState<'mostRecent' | 'oldest' | 'heaviest' | 'lightest'>('mostRecent');
  const [filterType, setFilterType] = useState<'mostRecent' | 'oldest' | 'heaviest' | 'lightest'>('mostRecent');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<{ exercise: SelectedExercise; index: number } | null>(null);
  const [tempSets, setTempSets] = useState('');
  const [tempReps, setTempReps] = useState('');
  const [tempRest, setTempRest] = useState('');
  const [defaultSets, setDefaultSets] = useState('3');
  const [defaultReps, setDefaultReps] = useState('10');
  const [defaultRest, setDefaultRest] = useState('60');

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredExercises(exercisesData);
    } else {
      const filtered = exercisesData.filter((ex) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchTerm]);

  const addExercisesToWorkout = () => {
    const newSelected = selectedExercisesInModal.map((ex) => ({
      ...ex,
      sets: parseInt(defaultSets) || 3,
      reps: parseInt(defaultReps) || 10,
      rest: parseInt(defaultRest) || 60
    }));
    setSelectedExercises((prev) => [...prev, ...newSelected]);
    setSelectedExercisesInModal([]);
    setIsAddModalVisible(false);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateWorkoutStats = () => {
    const stats: { [key: string]: { primary: number; secondary: number; exercises: SelectedExercise[] } } = {};
    selectedExercises.forEach((ex) => {
      ex.primaryMuscles.forEach((muscle) => {
        const cap = muscle.charAt(0).toUpperCase() + muscle.slice(1);
        if (!stats[cap]) stats[cap] = { primary: 0, secondary: 0, exercises: [] };
        stats[cap].primary += 1;
        stats[cap].exercises.push(ex);
      });
      ex.secondaryMuscles.forEach((muscle) => {
        const cap = muscle.charAt(0).toUpperCase() + muscle.slice(1);
        if (!stats[cap]) stats[cap] = { primary: 0, secondary: 0, exercises: [] };
        stats[cap].secondary += 1;
        stats[cap].exercises.push(ex);
      });
    });
    return stats;
  };

  const workoutStats = calculateWorkoutStats();

  const updateExercise = () => {
    if (!editingExercise) return;
    const updatedExercise = {
      ...editingExercise.exercise,
      sets: parseInt(tempSets) || editingExercise.exercise.sets,
      reps: parseInt(tempReps) || editingExercise.exercise.reps,
      rest: parseInt(tempRest) || editingExercise.exercise.rest
    };
    setSelectedExercises(prev => {
      const updated = [...prev];
      updated[editingExercise.index] = updatedExercise;
      return updated;
    });
    setIsEditModalVisible(false);
    setEditingExercise(null);
  };

  const renderSelectedExercise = ({ item, index, drag }: { item: SelectedExercise; index: number; drag?: () => void }) => (
    <TouchableOpacity 
      style={styles.exerciseCard} 
      key={index}
      onPress={() => {
        setEditingExercise({ exercise: item, index });
        setTempSets(item.sets.toString());
        setTempReps(item.reps.toString());
        setTempRest(item.rest.toString());
        setIsEditModalVisible(true);
      }}
      onLongPress={drag}
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetails}>
          {item.sets} sets × {item.reps} reps | {item.rest}s rest
        </Text>
      </View>
      <TouchableOpacity 
        onPress={(e) => {
          e.stopPropagation();
          removeExercise(index);
        }} 
        style={styles.deleteButton}
      >
        <MaterialIcons name="delete" size={24} color="#FF5F6D" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderStatRow = (
    muscle: string,
    stat: { primary: number; secondary: number; exercises: SelectedExercise[] }
  ) => (
    <TouchableOpacity
      style={styles.statRow}
      key={muscle}
      onPress={() => Alert.alert(muscle, stat.exercises.map(e => e.name).join(', '))}
    >
      <Text style={styles.statCell}>{muscle}</Text>
      <Text style={styles.statCell}>{stat.primary}</Text>
      <Text style={styles.statCell}>{stat.secondary}</Text>
    </TouchableOpacity>
  );

  const SegmentedControl = () => (
    <View style={styles.segmentedControl}>
      <TouchableOpacity
        style={[styles.segmentButton, viewMode === 'exercises' && styles.segmentButtonActive]}
        onPress={() => setViewMode('exercises')}
      >
        <Text style={[styles.segmentText, viewMode === 'exercises' && styles.segmentTextActive]}>Exercises</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segmentButton, viewMode === 'view' && styles.segmentButtonActive]}
        onPress={() => setViewMode('view')}
      >
        <Text style={[styles.segmentText, viewMode === 'view' && styles.segmentTextActive]}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segmentButton, viewMode === 'stats' && styles.segmentButtonActive]}
        onPress={() => setViewMode('stats')}
      >
        <Text style={[styles.segmentText, viewMode === 'stats' && styles.segmentTextActive]}>Stats</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('WorkoutSelectionScreen')}>
            <MaterialIcons name="arrow-back" size={30} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Workout</Text>
          <View style={{ width: 30 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <SegmentedControl />
          {viewMode === 'exercises' && (
            <View style={styles.exercisesContainer}>
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Workout Name</Text>
                <TextInput
                  style={styles.workoutNameInput}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  placeholder="Enter workout name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Default Settings</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TextInput
                    style={[styles.workoutNameInput, { flex: 1, marginRight: 5 }]}
                    value={defaultSets}
                    onChangeText={setDefaultSets}
                    keyboardType="numeric"
                    placeholder="Sets"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.workoutNameInput, { flex: 1, marginHorizontal: 5 }]}
                    value={defaultReps}
                    onChangeText={setDefaultReps}
                    keyboardType="numeric"
                    placeholder="Reps"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.workoutNameInput, { flex: 1, marginLeft: 5 }]}
                    value={defaultRest}
                    onChangeText={setDefaultRest}
                    keyboardType="numeric"
                    placeholder="Rest"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.addExerciseButton} onPress={() => setIsAddModalVisible(true)}>
                <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.addExerciseGradient}>
                  <MaterialIcons name="add-circle" size={30} color="#fff" />
                  <Text style={styles.addExerciseText}>Add Exercises</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          {viewMode === 'view' && (
            <View style={styles.exercisesContainer}>
              <Text style={styles.sectionTitle}>Selected Exercises</Text>
              {selectedExercises.length === 0 ? (
                <Text style={styles.emptyText}>No exercises selected.</Text>
              ) : (
                <DraggableFlatList
                  data={selectedExercises}
                  renderItem={({ item, index, drag }) => renderSelectedExercise({ item, index, drag })}
                  keyExtractor={(item) => item.id}
                  onDragEnd={({ data }) => setSelectedExercises(data)}
                />
              )}
            </View>
          )}
          {viewMode === 'stats' && (
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Workout Stats</Text>
              {Object.keys(workoutStats).length === 0 ? (
                <Text style={styles.emptyText}>No stats available.</Text>
              ) : (
                <View style={styles.statsTable}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statHeaderCell}>Muscle</Text>
                    <Text style={styles.statHeaderCell}>Primary</Text>
                    <Text style={styles.statHeaderCell}>Secondary</Text>
                  </View>
                  {Object.keys(workoutStats).map((muscle) => renderStatRow(muscle, workoutStats[muscle]))}
                </View>
              )}
            </View>
          )}
          <TouchableOpacity
            style={styles.saveWorkoutButton}
            onPress={async () => {
              if (workoutName.trim() === "") {
                Alert.alert("Please enter a workout name.");
                return;
              }
              const workout = {
                id: Date.now().toString(),
                name: workoutName,
                exercises: selectedExercises
              };
              try {
                const existingWorkouts = await AsyncStorage.getItem("workouts");
                let workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
                workouts.push(workout);
                await AsyncStorage.setItem("workouts", JSON.stringify(workouts));
                setWorkoutName("");
                setSelectedExercises([]);
                Alert.alert("Workout saved successfully!");
              } catch (error) {
                console.log("Error saving workout:", error);
              }
            }}
          >
            <Text style={styles.saveWorkoutButtonText}>Save Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <Modal visible={isAddModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exercises</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
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
                    style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
                    onPress={() => {
                      const exists = selectedExercisesInModal.find((e) => e.id === item.id);
                      if (exists) {
                        setSelectedExercisesInModal((prev) => prev.filter((e) => e.id !== item.id));
                      } else {
                        setSelectedExercisesInModal((prev) => [...prev, item]);
                      }
                    }}
                  >
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <MaterialIcons
                      name={isSelected ? "check-box" : "check-box-outline-blank"}
                      size={24}
                      color={isSelected ? "#FFC371" : "#ffffff"}
                    />
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalListContainer}
            />
            <TouchableOpacity style={styles.addSelectedExercisesButton} onPress={addExercisesToWorkout}>
              <Text style={styles.addSelectedExercisesButtonText}>Add {selectedExercisesInModal.length} Exercises</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal visible={isEditModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView 
          style={styles.modalContainer} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Exercise</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.exerciseName}>
              {editingExercise?.exercise.name}
            </Text>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Sets</Text>
              <TextInput
                style={styles.workoutNameInput}
                value={tempSets}
                onChangeText={setTempSets}
                keyboardType="numeric"
                placeholder="Number of sets"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.workoutNameInput}
                value={tempReps}
                onChangeText={setTempReps}
                keyboardType="numeric"
                placeholder="Number of reps"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Rest (seconds)</Text>
              <TextInput
                style={styles.workoutNameInput}
                value={tempRest}
                onChangeText={setTempRest}
                keyboardType="numeric"
                placeholder="Rest time in seconds"
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity 
              style={styles.saveWorkoutButton}
              onPress={updateExercise}
            >
              <Text style={styles.saveWorkoutButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  backButton: { marginRight: 20 },
  scrollContainer: { paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, justifyContent: 'space-between', marginHorizontal: 20 },
  headerTitle: { fontSize: 32, color: '#ffffff', fontWeight: 'bold' },
  segmentedControl: { flexDirection: 'row', marginHorizontal: 20, borderWidth: 1, borderColor: '#FFC371', borderRadius: 8, overflow: 'hidden', marginBottom: 20 },
  segmentButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  segmentButtonActive: { backgroundColor: '#FFC371' },
  segmentText: { fontSize: 16, color: '#ffffff' },
  segmentTextActive: { fontWeight: 'bold', color: '#000000' },
  exercisesContainer: {},
  inputCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 20, marginHorizontal: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 4 },
  inputLabel: { fontSize: 18, color: '#FFC371', marginBottom: 10 },
  workoutNameInput: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 12, fontSize: 18, color: '#ffffff' },
  addExerciseButton: { marginHorizontal: 20, marginBottom: 20 },
  addExerciseGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 8 },
  addExerciseText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  section: { marginHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 24, color: '#FFC371', marginBottom: 10, fontWeight: 'bold' },
  emptyText: { color: '#ffffff', fontSize: 16 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 8, marginBottom: 10 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 18, color: '#ffffff', fontWeight: 'bold' },
  exerciseDetails: { fontSize: 14, color: '#cccccc' },
  deleteButton: { padding: 5 },
  statsContainer: { marginHorizontal: 20, marginBottom: 20 },
  statsTable: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 10 },
  statHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#FFC371', paddingBottom: 5, marginBottom: 5 },
  statHeaderCell: { flex: 1, fontSize: 16, color: '#ffffff', fontWeight: 'bold', textAlign: 'center' },
  statRow: { flexDirection: 'row', paddingVertical: 5 },
  statCell: { flex: 1, fontSize: 16, color: '#cccccc', textAlign: 'center' },
  saveWorkoutButton: { backgroundColor: '#FFC371', padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 20, marginBottom: 20 },
  saveWorkoutButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center' },
  modalContent: { flex: 1, backgroundColor: '#333333', borderRadius: 8, padding: 20, marginVertical: 20, marginHorizontal: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 20, color: '#ffffff', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 10, marginBottom: 10 },
  searchInput: { flex: 1, color: '#ffffff', marginLeft: 10, fontSize: 16 },
  modalListContainer: { paddingBottom: 20 },
  exerciseItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginBottom: 10 },
  exerciseItemSelected: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  addSelectedExercisesButton: { backgroundColor: '#FF5F6D', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addSelectedExercisesButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});

export default CreateWorkoutScreen;
