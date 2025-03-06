import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import exercisesData from '../../exercises.json';

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

interface CustomExercise {
  id: string;
  name: string;
  isCustom: boolean;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  level: string;
  category: string;
  instructions: string[];
}

interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddExercises: (exercises: Exercise[]) => void;
  defaultSets: string;
  defaultReps: string;
  defaultRest: string;
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
  visible,
  onClose,
  onAddExercises,
  defaultSets,
  defaultReps,
  defaultRest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<(Exercise | CustomExercise)[]>(exercisesData);
  const [selectedExercises, setSelectedExercises] = useState<(Exercise | CustomExercise)[]>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    force: '',
    level: '',
    equipment: '',
    mechanic: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  useEffect(() => {
    const loadCustomExercises = async () => {
      try {
        const storedExercises = await AsyncStorage.getItem('customExercises');
        if (storedExercises) {
          const parsedExercises = JSON.parse(storedExercises);
          setCustomExercises(parsedExercises);
                    setFilteredExercises([...parsedExercises, ...exercisesData]);
        }
      } catch (error) {
        console.error('Error loading custom exercises:', error);
      }
    };

    loadCustomExercises();
  }, [visible]);

  const saveCustomExercise = async (name: string) => {
    try {
      const id = `custom_${Date.now()}_${name.replace(/\s+/g, '_')}`;
      const newExercise: CustomExercise = {
        id,
        name,
        isCustom: true,
        primaryMuscles: [],
        secondaryMuscles: [],
        equipment: 'custom',
        level: 'beginner',
        category: 'strength',
        instructions: []
      };
      
      const updatedExercises = [...customExercises, newExercise];
      setCustomExercises(updatedExercises);
      
      setFilteredExercises([...updatedExercises, ...exercisesData]);
      
      await AsyncStorage.setItem('customExercises', JSON.stringify(updatedExercises));
      
      setNewExerciseName('');
      setIsCreateModalVisible(false);
      
      setSelectedExercises(prev => [...prev, newExercise]);
    } catch (error) {
      console.error('Error saving custom exercise:', error);
      Alert.alert('Error', 'Failed to save custom exercise.');
    }
  };

  const handleCreateExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name.');
      return;
    }
    saveCustomExercise(newExerciseName.trim());
  };

  useEffect(() => {
    let allExercises = [...customExercises, ...exercisesData];
    
    if (searchTerm) {
      allExercises = allExercises.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedFilters.force || selectedFilters.level || 
        selectedFilters.equipment || selectedFilters.mechanic) {
      allExercises = allExercises.filter(ex => {
        if ('isCustom' in ex && ex.isCustom) return true;
        
        let match = true;
        if (selectedFilters.force && 'force' in ex) {
          match = match && ex.force === selectedFilters.force;
        }
        if (selectedFilters.level) {
          match = match && ex.level === selectedFilters.level;
        }
        if (selectedFilters.equipment) {
          match = match && ex.equipment === selectedFilters.equipment;
        }
        if (selectedFilters.mechanic && 'mechanic' in ex) {
          match = match && ex.mechanic === selectedFilters.mechanic;
        }
        return match;
      });
    }
    
    setFilteredExercises(allExercises);
  }, [searchTerm, selectedFilters, customExercises]);

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

  const handleAddExercises = () => {
    onAddExercises(selectedExercises);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercises</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.createExerciseButton}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.createExerciseGradient}>
              <MaterialIcons name="add-circle" size={22} color="#fff" />
              <Text style={styles.createExerciseText}>Create Custom Exercise</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={24} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises"
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={styles.filterButton}>
              <MaterialIcons name="filter-list" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.activeFiltersContainer}>
            {Object.entries(selectedFilters).map(
              ([key, value]) =>
                value && (
                  <View key={key} style={styles.activeFilter}>
                    <Text style={styles.activeFilterText}>{value}</Text>
                  </View>
                )
            )}
          </View>
          
          {showFilters && (
            <View style={styles.filterModalOverlay}>
              <View style={styles.filterModalContent}>
                <View style={styles.filterModalHeader}>
                  <Text style={styles.filterModalTitle}>Filter Exercises</Text>
                  <TouchableOpacity onPress={() => setShowFilters(false)}>
                    <MaterialIcons name="close" size={24} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.filterScrollView}>
                  <View style={styles.filterCategoryContainer}>
                    <Text style={styles.filterCategoryTitle}>Force</Text>
                    <View style={styles.filterOptionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('force', 'push') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('force', 'push')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('force', 'push') && styles.filterChipTextSelected
                        ]}>Push</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('force', 'pull') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('force', 'pull')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('force', 'pull') && styles.filterChipTextSelected
                        ]}>Pull</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.filterCategoryContainer}>
                    <Text style={styles.filterCategoryTitle}>Level</Text>
                    <View style={styles.filterOptionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('level', 'beginner') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('level', 'beginner')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('level', 'beginner') && styles.filterChipTextSelected
                        ]}>Beginner</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('level', 'intermediate') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('level', 'intermediate')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('level', 'intermediate') && styles.filterChipTextSelected
                        ]}>Intermediate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('level', 'advanced') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('level', 'advanced')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('level', 'advanced') && styles.filterChipTextSelected
                        ]}>Advanced</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.filterCategoryContainer}>
                    <Text style={styles.filterCategoryTitle}>Equipment</Text>
                    <View style={styles.filterOptionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('equipment', 'dumbbell') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('equipment', 'dumbbell')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('equipment', 'dumbbell') && styles.filterChipTextSelected
                        ]}>Dumbbell</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('equipment', 'machine') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('equipment', 'machine')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('equipment', 'machine') && styles.filterChipTextSelected
                        ]}>Machine</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.filterCategoryContainer}>
                    <Text style={styles.filterCategoryTitle}>Mechanic</Text>
                    <View style={styles.filterOptionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('mechanic', 'isolation') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('mechanic', 'isolation')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('mechanic', 'isolation') && styles.filterChipTextSelected
                        ]}>Isolation</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterChip,
                          isFilterSelected('mechanic', 'compound') && styles.filterChipSelected
                        ]}
                        onPress={() => toggleFilter('mechanic', 'compound')}
                      >
                        <Text style={[
                          styles.filterChipText,
                          isFilterSelected('mechanic', 'compound') && styles.filterChipTextSelected
                        ]}>Compound</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.filterActionButtons}>
                  <TouchableOpacity 
                    style={styles.clearFiltersButton} 
                    onPress={clearFilters}
                  >
                    <Text style={styles.clearFiltersText}>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.applyFiltersButton} 
                    onPress={() => setShowFilters(false)}
                  >
                    <Text style={styles.applyFiltersText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          <FlatList
            data={filteredExercises}
            renderItem={({ item }) => {
              const isSelected = selectedExercises.some((e) => e.id === item.id);
              const isCustom = 'isCustom' in item && item.isCustom;
              
              return (
                <TouchableOpacity
                  style={[
                    styles.exerciseItem, 
                    isSelected && styles.exerciseItemSelected,
                    isCustom && styles.customExerciseItem
                  ]}
                  onPress={() => {
                    const exists = selectedExercises.find((e) => e.id === item.id);
                    if (exists) {
                      setSelectedExercises((prev) => prev.filter((e) => e.id !== item.id));
                    } else {
                      setSelectedExercises((prev) => [...prev, item]);
                    }
                  }}
                >
                  <View style={styles.exerciseNameContainer}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    {isCustom && <Text style={styles.customBadge}>Custom</Text>}
                  </View>
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
          
          <TouchableOpacity 
            style={styles.addSelectedExercisesButton} 
            onPress={handleAddExercises}
          >
            <Text style={styles.addSelectedExercisesButtonText}>
              Add {selectedExercises.length} Exercises
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={isCreateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.createModalOverlay}>
          <View style={styles.createModalContent}>
            <Text style={styles.createModalTitle}>Create Custom Exercise</Text>
            
            <Text style={styles.createModalLabel}>Exercise Name</Text>
            <TextInput
              style={styles.createModalInput}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="Enter exercise name"
              placeholderTextColor="#999"
            />
            
            <View style={styles.createModalButtons}>
              <TouchableOpacity 
                style={styles.createModalCancelButton} 
                onPress={() => {
                  setIsCreateModalVisible(false);
                  setNewExerciseName('');
                }}
              >
                <Text style={styles.createModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createModalSaveButton} 
                onPress={handleCreateExercise}
              >
                <Text style={styles.createModalSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center' 
  },
  modalContent: { 
    flex: 1, 
    backgroundColor: '#333333', 
    borderRadius: 8, 
    padding: 20, 
    marginVertical: 20, 
    marginHorizontal: 10 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  modalTitle: { 
    fontSize: 20, 
    color: '#ffffff', 
    fontWeight: 'bold' 
  },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 10 
  },
  searchInput: { 
    flex: 1, 
    color: '#ffffff', 
    marginLeft: 10, 
    fontSize: 16 
  },
  filterButton: { 
    marginLeft: 10 
  },
  activeFiltersContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 10 
  },
  activeFilter: { 
    backgroundColor: '#FFC371', 
    borderRadius: 8, 
    padding: 5, 
    marginRight: 5, 
    marginBottom: 5 
  },
  activeFilterText: { 
    color: '#000', 
    fontSize: 14 
  },
  modalListContainer: { 
    paddingBottom: 20 
  },
  exerciseItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 10, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    borderRadius: 8, 
    marginBottom: 10 
  },
  exerciseItemSelected: { 
    backgroundColor: 'rgba(255, 255, 255, 0.2)' 
  },
  exerciseName: { 
    fontSize: 18, 
    color: '#ffffff', 
    fontWeight: 'bold' 
  },
  addSelectedExercisesButton: { 
    backgroundColor: '#FF5F6D', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10 
  },
  addSelectedExercisesButtonText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
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
  createExerciseButton: {
    marginBottom: 10,
  },
  createExerciseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  createExerciseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customBadge: {
    backgroundColor: '#FF5F6D',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  customExerciseItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF5F6D',
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createModalContent: {
    width: '90%',
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
  },
  createModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC371',
    marginBottom: 20,
    textAlign: 'center',
  },
  createModalLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  createModalInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  createModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createModalCancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  createModalSaveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    alignItems: 'center',
  },
  createModalCancelText: {
    color: '#fff',
    fontSize: 16,
  },
  createModalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ExerciseSelectionModal;