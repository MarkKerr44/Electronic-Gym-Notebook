import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { workoutService } from '../../services/workoutService';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCREEN_WIDTH = Dimensions.get('window').width;

type RoutineType = 'fixedDays' | 'cycle';

interface WorkoutReference {
  id: string;
  name: string;
}

interface RoutineTemplate {
  name: string;
  type: RoutineType;
  schedule: WorkoutReference[];
  cycleItems?: WorkoutReference[];
}

function RoutineSetupScreen() {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [routineType, setRoutineType] = useState<RoutineType>('fixedDays');
  const [routineName, setRoutineName] = useState('');
  const [schedule, setSchedule] = useState<WorkoutReference[]>(Array(7).fill(null));
  const [cycleItems, setCycleItems] = useState<WorkoutReference[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<{ id: string; name: string }[]>([]);
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [workoutSelectionMode, setWorkoutSelectionMode] = useState<'day' | 'cycle'>('day');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    setLoading(true);
    try {
      const fetchedWorkouts = await workoutService.getUserWorkouts();
      console.log('Fetched workouts from Firestore:', fetchedWorkouts);
      
      if (fetchedWorkouts && fetchedWorkouts.length > 0) {
        const workoutsToUse = fetchedWorkouts.map(workout => ({
          id: workout.id || String(Math.random()),
          name: workout.name
        }));
        
        setAllWorkouts(workoutsToUse);
      } else {
        console.log('No workouts found in Firestore');
        setAllWorkouts([]);
      }
    } catch (error) {
      console.error('Error loading workouts from Firestore:', error);
      setAllWorkouts([]);
      Alert.alert('Error', 'Failed to load your workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleRoutineTypeChange(type: RoutineType) {
    setRoutineType(type);
    setSchedule(Array(7).fill(null));
    setCycleItems([]);
  }

  function handleOpenWorkoutModal(mode: 'day' | 'cycle', dayIndex?: number) {
    setWorkoutSelectionMode(mode);
    if (dayIndex !== undefined) setSelectedDayIndex(dayIndex);
    setWorkoutModalVisible(true);
  }

  function handleSelectWorkout(workoutId: string, workoutName: string) {
    if (workoutSelectionMode === 'day') {
      const updatedSchedule = [...schedule];
      updatedSchedule[selectedDayIndex] = { id: workoutId, name: workoutName };
      setSchedule(updatedSchedule);
    } else {
      setCycleItems([...cycleItems, { id: workoutId, name: workoutName }]);
    }
    setWorkoutModalVisible(false);
  }

  function handleSelectRest() {
    if (workoutSelectionMode === 'day') {
      const updatedSchedule = [...schedule];
      updatedSchedule[selectedDayIndex] = { id: 'rest', name: 'Rest' };
      setSchedule(updatedSchedule);
    } else {
      setCycleItems([...cycleItems, { id: 'rest', name: 'Rest' }]);
    }
    setWorkoutModalVisible(false);
  }

  function handleRemoveCycleItem(index: number) {
    setCycleItems(cycleItems.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    if (routineType === 'fixedDays' && !schedule.some(day => day !== null)) {
      Alert.alert('Error', 'Please select at least one workout or rest day');
      return;
    }
    if (routineType === 'cycle' && cycleItems.length === 0) {
      Alert.alert('Error', 'Please add at least one workout or rest day to your cycle');
      return;
    }
    const template: RoutineTemplate = {
      name: routineName.trim(),
      type: routineType,
      schedule: [...schedule],
      ...(routineType === 'cycle' && { cycleItems: [...cycleItems] })
    };

    try {
      const existing = await AsyncStorage.getItem('savedRoutines');
      let newRoutines = existing ? JSON.parse(existing) : [];
      newRoutines.push(template);
      await AsyncStorage.setItem('savedRoutines', JSON.stringify(newRoutines));

      Alert.alert('Success', 'Routine created!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('RoutineCalendarScreen' as never, {
            routineToApply: template
          })
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save routine');
    }
  }

  if (loading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC371" />
            <Text style={styles.loadingText}>Loading your workouts...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (allWorkouts.length === 0) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Routine</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.noWorkoutsContainer}>
            <Text style={styles.noWorkoutsText}>No workouts found. Please create a workout first.</Text>
            <TouchableOpacity
              style={styles.createWorkoutButton}
              onPress={() => navigation.navigate('CreateWorkoutScreen' as never)}
            >
              <Text style={styles.createWorkoutButtonText}>Create a Workout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Routine</Text>
            <View style={styles.placeholder} />
          </View>
          <TextInput
            style={styles.nameInput}
            placeholder="Routine Name"
            placeholderTextColor="#999"
            value={routineName}
            onChangeText={setRoutineName}
          />
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, routineType === 'fixedDays' && styles.activeType]}
              onPress={() => handleRoutineTypeChange('fixedDays')}
            >
              <Text style={styles.typeText}>Fixed Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, routineType === 'cycle' && styles.activeType]}
              onPress={() => handleRoutineTypeChange('cycle')}
            >
              <Text style={styles.typeText}>Cycle</Text>
            </TouchableOpacity>
          </View>
          {routineType === 'fixedDays' ? (
            <View style={styles.fixedDaysContainer}>
              {DAYS.map((day, index) => (
                <View key={day} style={styles.dayRow}>
                  <Text style={styles.dayText}>{day}</Text>
                  <TouchableOpacity
                    style={styles.workoutButton}
                    onPress={() => handleOpenWorkoutModal('day', index)}
                  >
                    <Text style={styles.workoutButtonText}>
                      {schedule[index] ? schedule[index].name : 'Select Action'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.cycleContainer}>
              <Text style={styles.cycleInstructions}>
                Add workouts or rest in order. This sequence will repeat for the week.
              </Text>
              <TouchableOpacity
                style={styles.addCycleButton}
                onPress={() => handleOpenWorkoutModal('cycle')}
              >
                <MaterialIcons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addCycleButtonText}>Add Workout/Rest</Text>
              </TouchableOpacity>
              <View style={styles.cycleItems}>
                {cycleItems.map((item, index) => (
                  <View key={index} style={styles.cycleItemContainer}>
                    <Text style={styles.cycleItemText}>{item.name}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveCycleItem(index)}
                    >
                      <MaterialIcons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Routine</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <Modal visible={workoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalInner}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Action</Text>
              <TouchableOpacity onPress={() => setWorkoutModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: SCREEN_WIDTH * 0.7 }}>
              <TouchableOpacity
                style={styles.workoutOption}
                onPress={() => handleSelectRest()}
              >
                <Text style={styles.workoutOptionText}>Rest</Text>
                <MaterialIcons name="arrow-forward" size={24} color="#FF5F6D" />
              </TouchableOpacity>
              {allWorkouts.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  style={styles.workoutOption}
                  onPress={() => handleSelectWorkout(w.id, w.name)}
                >
                  <Text style={styles.workoutOptionText}>{w.name}</Text>
                  <MaterialIcons name="arrow-forward" size={24} color="#FF5F6D" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold'
  },
  placeholder: {
    width: 24
  },
  noWorkoutsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  noWorkoutsText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20
  },
  createWorkoutButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  createWorkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 20
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20
  },
  typeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  activeType: {
    backgroundColor: '#FF5F6D'
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  fixedDaysContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  dayText: {
    color: '#fff',
    width: 100
  },
  workoutButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10
  },
  workoutButtonText: {
    color: '#fff'
  },
  cycleContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15
  },
  cycleInstructions: {
    color: '#fff',
    marginBottom: 15
  },
  addCycleButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 15
  },
  addCycleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10
  },
  cycleItems: {
    gap: 10
  },
  cycleItemContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center'
  },
  cycleItemText: {
    flex: 1,
    color: '#fff'
  },
  removeButton: {
    padding: 5
  },
  saveButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center'
  },
  modalInner: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 20,
    margin: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold'
  },
  workoutOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  workoutOptionText: {
    color: '#fff',
    fontSize: 16,
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
});

export default RoutineSetupScreen;
