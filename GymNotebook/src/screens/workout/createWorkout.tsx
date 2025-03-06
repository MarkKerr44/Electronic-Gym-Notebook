import React, { useState, useEffect, useRef } from 'react';
import * as RN from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import exercisesData from '../../../exercises.json';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { workoutService } from '../../services/workoutService';
import ExerciseSelectionModal from '../../components/ExerciseSelectionModal';

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

interface CreateWorkoutScreenProps {
  initialExercises?: Exercise[];
}

const CreateWorkoutScreen: React.FC<CreateWorkoutScreenProps> = ({ 
  initialExercises = [] 
}) => {
  const navigation = useNavigation();
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState(initialExercises);
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
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    force: '',
    level: '',
    equipment: '',
    mechanic: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pendingDeletion, setPendingDeletion] = useState<number | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  const deletionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTerm === '') {
      let filtered = exercisesData;
      
      if (selectedFilters.force) {
        filtered = filtered.filter((exercise) => exercise.force === selectedFilters.force);
      }
      if (selectedFilters.level) {
        filtered = filtered.filter((exercise) => exercise.level === selectedFilters.level);
      }
      if (selectedFilters.equipment) {
        filtered = filtered.filter((exercise) => exercise.equipment === selectedFilters.equipment);
      }
      if (selectedFilters.mechanic) {
        filtered = filtered.filter((exercise) => exercise.mechanic === selectedFilters.mechanic);
      }
      
      setFilteredExercises(filtered);
    } else {
      let filtered = exercisesData.filter((ex) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (selectedFilters.force) {
        filtered = filtered.filter((exercise) => exercise.force === selectedFilters.force);
      }
      if (selectedFilters.level) {
        filtered = filtered.filter((exercise) => exercise.level === selectedFilters.level);
      }
      if (selectedFilters.equipment) {
        filtered = filtered.filter((exercise) => exercise.equipment === selectedFilters.equipment);
      }
      if (selectedFilters.mechanic) {
        filtered = filtered.filter((exercise) => exercise.mechanic === selectedFilters.mechanic);
      }
      
      setFilteredExercises(filtered);
    }
  }, [searchTerm, selectedFilters]);

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

  const removeExercise = (id: string) => {
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setExerciseToDelete(id);
            
            if (deletionTimeoutRef.current) {
              clearTimeout(deletionTimeoutRef.current);
            }
            
            deletionTimeoutRef.current = setTimeout(() => {
              setSelectedExercises((current) => 
                current.filter(exercise => exercise.id !== id)
              );
              setExerciseToDelete(null);
            }, 100);
          }
        }
      ]
    );
  };

  useEffect(() => {
    return () => {
      if (deletionTimeoutRef.current) {
        clearTimeout(deletionTimeoutRef.current);
      }
    };
  }, []);

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
      style={[
        styles.exerciseCard,
        exerciseToDelete === item.id && styles.deletingExercise 
      ]} 
      key={item.id} 
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
          removeExercise(item.id); 
        }} 
        style={styles.deleteButton}
        disabled={exerciseToDelete === item.id}
      >
        <MaterialIcons 
          name="delete" 
          size={24} 
          color={exerciseToDelete === item.id ? "#999" : "#FF5F6D"} 
        />
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

  const handleSaveWorkout = async () => {
    if (workoutName.trim() === "") {
      Alert.alert("Please enter a workout name.");
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert("Please add at least one exercise.");
      return;
    }

    try {
      setIsSaving(true);
      const workout = {
        name: workoutName,
        exercises: selectedExercises
      };

      await workoutService.saveWorkout(workout);
      
      setWorkoutName("");
      setSelectedExercises([]);
      Alert.alert(
        "Success", 
        "Workout saved successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert(
        "Error",
        "Failed to save workout. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isFilterSelected = (type: keyof typeof selectedFilters, value: string) =>
    selectedFilters[type] === value;

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [type]: prevFilters[type] === value ? '' : value,
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({ force: '', level: '', equipment: '', mechanic: '' });
  };

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
        
        <SegmentedControl />
        
        {viewMode === 'exercises' && (
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.exercisesContainer}>
              {/* Input fields for workout name */}
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
              
              {/* Default settings card */}
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Default Settings</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 5 }}>
                    <Text style={styles.fieldLabel}>Sets</Text>
                    <TextInput
                      style={styles.workoutNameInput}
                      value={defaultSets}
                      onChangeText={setDefaultSets}
                      keyboardType="numeric"
                      placeholder="3"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 5 }}>
                    <Text style={styles.fieldLabel}>Reps</Text>
                    <TextInput
                      style={styles.workoutNameInput}
                      value={defaultReps}
                      onChangeText={setDefaultReps}
                      keyboardType="numeric"
                      placeholder="10"
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <Text style={styles.fieldLabel}>Rest (sec)</Text>
                    <TextInput
                      style={styles.workoutNameInput}
                      value={defaultRest}
                      onChangeText={setDefaultRest}
                      keyboardType="numeric"
                      placeholder="60"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>
              
              {/* Add Exercise button */}
              <TouchableOpacity style={styles.addExerciseButton} onPress={() => setIsAddModalVisible(true)}>
                <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.addExerciseGradient}>
                  <MaterialIcons name="add-circle" size={30} color="#fff" />
                  <Text style={styles.addExerciseText}>Add Exercises</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Save Workout button */}
              <TouchableOpacity
                style={[
                  styles.saveWorkoutButton,
                  isSaving && { opacity: 0.7 }
                ]}
                onPress={handleSaveWorkout}
                disabled={isSaving}
              >
                <Text style={styles.saveWorkoutButtonText}>
                  {isSaving ? 'Saving...' : 'Save Workout'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
        
        {viewMode === 'view' && (
          <View style={styles.viewContainer}>
            <Text style={styles.sectionTitle}>Selected Exercises</Text>
            {selectedExercises.length === 0 ? (
              <Text style={styles.emptyText}>No exercises selected.</Text>
            ) : (
              <DraggableFlatList
                data={selectedExercises}
                renderItem={({ item, index, drag }) => renderSelectedExercise({ item, index, drag })}
                keyExtractor={(item) => item.id}
                onDragEnd={({ data }) => setSelectedExercises(data)}
                contentContainerStyle={styles.exerciseListContainer}
              />
            )}
          </View>
        )}
        
        {viewMode === 'stats' && (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            
            {/* Save Workout button */}
            <TouchableOpacity
              style={[
                styles.saveWorkoutButton,
                isSaving && { opacity: 0.7 }
              ]}
              onPress={handleSaveWorkout}
              disabled={isSaving}
            >
              <Text style={styles.saveWorkoutButtonText}>
                {isSaving ? 'Saving...' : 'Save Workout'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
      
      {/* Rest of your modals remain the same */}
      <ExerciseSelectionModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddExercises={(exercises) => {
          const newSelected = exercises.map((ex) => ({
            ...ex,
            sets: parseInt(defaultSets) || 3,
            reps: parseInt(defaultReps) || 10,
            rest: parseInt(defaultRest) || 60
          }));
          setSelectedExercises((prev) => [...prev, ...newSelected]);
          setIsAddModalVisible(false);
        }}
        defaultSets={defaultSets}
        defaultReps={defaultReps}
        defaultRest={defaultRest}
      />
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
  exerciseCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10, 
    marginHorizontal: 20 
  },
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
  saveWorkoutButton: { 
    backgroundColor: '#FFC371', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginHorizontal: 20, 
    marginBottom: 20, 
    opacity: 1 
  },
  saveWorkoutButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  listContainer: { paddingBottom: 20 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center' },
  modalContent: { flex: 1, backgroundColor: '#333333', borderRadius: 8, padding: 20, marginVertical: 20, marginHorizontal: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 20, color: '#ffffff', fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 10, marginBottom: 10 },
  searchInput: { flex: 1, color: '#ffffff', marginLeft: 10, fontSize: 16 },
  filterButton: { marginLeft: 10 },
  activeFiltersContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  activeFilter: { backgroundColor: '#FFC371', borderRadius: 8, padding: 5, marginRight: 5, marginBottom: 5 },
  activeFilterText: { color: '#000', fontSize: 14 },
  filtersSection: { marginBottom: 10 },
  filterGroup: { marginBottom: 10 },
  filterLabel: { color: '#fff', fontSize: 16, marginBottom: 5 },
  filterButtonGroup: { flexDirection: 'row' },
  filterOption: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 10, marginRight: 5 },
  selectedFilterOption: { backgroundColor: '#FFC371' },
  filterText: { color: '#fff' },
  clearFiltersButton: { backgroundColor: '#FF5F6D', borderRadius: 8, padding: 10, alignItems: 'center', marginTop: 10 },
  clearFiltersText: { color: '#fff', fontSize: 16 },
  modalListContainer: { paddingBottom: 20 },
  exerciseItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginBottom: 10 },
  exerciseItemSelected: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  addSelectedExercisesButton: { backgroundColor: '#FF5F6D', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addSelectedExercisesButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  filterModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFC371',
  },
  filterScrollView: {
    maxHeight: '70%',
  },
  filterCategoryContainer: {
    marginBottom: 20,
  },
  filterCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  filterChipSelected: {
    backgroundColor: '#FFC371',
    borderColor: '#FF5F6D',
  },
  filterChipText: {
    color: '#fff',
    fontSize: 16,
  },
  filterChipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  filterActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearFiltersButton: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(255,95,109,0.2)',
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#FF5F6D',
  },
  applyFiltersButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF5F6D',
    borderRadius: 25,
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#FF5F6D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  applyFiltersText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewContainer: {
    flex: 1,
    paddingTop: 10,
  },
  exerciseListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, 
  },
  deletingExercise: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,95,109,0.2)',
  },
});

export default CreateWorkoutScreen;
