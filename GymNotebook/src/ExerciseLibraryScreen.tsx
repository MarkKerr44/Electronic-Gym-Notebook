// ExerciseLibraryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../components/BottomNavBar';
import exercisesData from '../exercises.json';

interface Exercise {
  id: string;
  name: string;
  force: string;
  level: string;
  mechanic: string | null;
  equipment: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

const ExerciseLibraryScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    force: '',
    level: '',
    equipment: '',
    mechanic: '',
  });

  const navigation = useNavigation();

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setExercises(exercisesData);
        setFilteredExercises(exercisesData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading exercises:', error);
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  useEffect(() => {
    let filtered = exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [searchTerm, selectedFilters, exercises]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const applyFilters = () => {
    setModalVisible(false);
  };

  const clearFilters = () => {
    setSelectedFilters({ force: '', level: '', equipment: '', mechanic: '' });
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() =>
        navigation.navigate('ExerciseDetails', {
          exerciseId: item.id,
        })
      }
    >
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const isFilterSelected = (type: keyof typeof selectedFilters, value: string) =>
    selectedFilters[type] === value;

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [type]: prevFilters[type] === value ? '' : value,
    }));
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises"
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={(text) => setSearchTerm(text)}
          />
          <TouchableOpacity onPress={toggleModal} style={styles.filterButton}>
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

        {loading ? (
          <ActivityIndicator size="large" color="#FFC371" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}

        <BottomNavBar index={index} setIndex={setIndex} />

        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Filter Exercises</Text>

              <ScrollView>
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Force:</Text>
                  <View style={styles.filterButtonGroup}>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('force', 'push') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('force', 'push')}
                    >
                      <Text style={styles.filterText}>Push</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('force', 'pull') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('force', 'pull')}
                    >
                      <Text style={styles.filterText}>Pull</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Level:</Text>
                  <View style={styles.filterButtonGroup}>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('level', 'beginner') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('level', 'beginner')}
                    >
                      <Text style={styles.filterText}>Beginner</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('level', 'intermediate') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('level', 'intermediate')}
                    >
                      <Text style={styles.filterText}>Intermediate</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('level', 'advanced') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('level', 'advanced')}
                    >
                      <Text style={styles.filterText}>Advanced</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Equipment:</Text>
                  <View style={styles.filterButtonGroup}>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('equipment', 'dumbbell') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('equipment', 'dumbbell')}
                    >
                      <Text style={styles.filterText}>Dumbbell</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('equipment', 'machine') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('equipment', 'machine')}
                    >
                      <Text style={styles.filterText}>Machine</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Mechanic:</Text>
                  <View style={styles.filterButtonGroup}>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('mechanic', 'isolation') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('mechanic', 'isolation')}
                    >
                      <Text style={styles.filterText}>Isolation</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.filterOption,
                        isFilterSelected('mechanic', 'compound') && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleFilter('mechanic', 'compound')}
                    >
                      <Text style={styles.filterText}>Compound</Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable style={styles.applyButton} onPress={applyFilters}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </Pressable>
                <Pressable style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>Clear Filters</Text>
                </Pressable>
              </View>
            </View>
          </View>
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
    paddingTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  filterButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: '#FFC371',
    borderRadius: 50,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  activeFilter: {
    backgroundColor: '#FFC371',
    padding: 5,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  activeFilterText: {
    color: '#000',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#302b63',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    color: '#FFC371',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  filterButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterOption: {
    backgroundColor: '#FFC371',
  },
  filterText: {
    color: '#fff',
  },
  modalActions: {
    marginTop: 20,
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#FFC371',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ExerciseLibraryScreen;
