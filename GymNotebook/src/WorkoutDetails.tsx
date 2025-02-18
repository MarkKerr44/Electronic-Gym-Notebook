import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Platform,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { ThemeContext } from '../context/ThemeProvider';
import { getThemeColors } from '../context/themeHelpers';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

function WorkoutDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { workoutId } = route.params as { workoutId: string };
  const { theme } = useContext(ThemeContext);
  const { gradient, textColor, boxBackground, buttonGradient } = getThemeColors(theme);

  const modalBackground =
    theme === 'light'
      ? 'rgba(255,255,255,0.9)'
      : 'rgba(25,25,25,0.9)';

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [exercisesData, setExercisesData] = useState<Exercise[]>([]);
  const [selectedExercisesInModal, setSelectedExercisesInModal] = useState<Exercise[]>([]);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editExercise, setEditExercise] = useState<Exercise | null>(null);
  const [tempSets, setTempSets] = useState(3);
  const [tempReps, setTempReps] = useState(10);
  const [tempRest, setTempRest] = useState(60);

  useEffect(() => {
    loadWorkout();
    loadExercisesData();
  }, []);

  const loadWorkout = async () => {
    try {
      const stored = await AsyncStorage.getItem('workouts');
      const parsed: Workout[] = stored ? JSON.parse(stored) : [];
      const found = parsed.find((w) => w.id === workoutId);
      if (found) {
        setWorkout(found);
        setWorkoutName(found.name);
      } else {
        Alert.alert('Workout not found');
        navigation.goBack();
      }
    } catch {}
  };

  const loadExercisesData = async () => {
    const data = await import('../exercises.json');
    setExercisesData(data.default);
  };

  const saveWorkout = async (updated: Workout) => {
    try {
      const stored = await AsyncStorage.getItem('workouts');
      const parsed: Workout[] = stored ? JSON.parse(stored) : [];
      const idx = parsed.findIndex((w) => w.id === workoutId);
      if (idx !== -1) {
        parsed[idx] = updated;
        await AsyncStorage.setItem('workouts', JSON.stringify(parsed));
        setWorkout(updated);
      }
    } catch {}
  };

  const handleEditWorkoutName = () => {
    setIsEditingName(true);
  };

  const handleSaveWorkoutName = () => {
    if (workout) {
      const updated = { ...workout, name: workoutName };
      saveWorkout(updated);
      setIsEditingName(false);
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (workout) {
      const updatedExercises = workout.exercises.filter((e) => e.id !== exerciseId);
      const updated = { ...workout, exercises: updatedExercises };
      saveWorkout(updated);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditExercise(exercise);
    setTempSets(exercise.sets);
    setTempReps(exercise.reps);
    setTempRest(exercise.rest);
    setEditModalVisible(true);
  };

  const handleAddExercises = () => {
    setModalVisible(true);
  };

  const addExercisesToWorkout = () => {
    if (workout) {
      const newExercises = selectedExercisesInModal.map((ex) => ({
        ...ex,
        id: Date.now().toString() + Math.random().toString(),
        sets: 3,
        reps: 10,
        rest: 60,
      }));
      const updated = { ...workout, exercises: [...workout.exercises, ...newExercises] };
      saveWorkout(updated);
      setSelectedExercisesInModal([]);
      setModalVisible(false);
    }
  };

  const toggleExerciseSelection = (ex: Exercise) => {
    const isSelected = selectedExercisesInModal.some((s) => s.id === ex.id);
    if (isSelected) {
      setSelectedExercisesInModal(selectedExercisesInModal.filter((s) => s.id !== ex.id));
    } else {
      setSelectedExercisesInModal([...selectedExercisesInModal, ex]);
    }
  };

  const renderExerciseItem = ({ item, drag }: RenderItemParams<Exercise>) => (
    <View style={[styles.exerciseCard, { backgroundColor: boxBackground }]}>
      <TouchableOpacity style={styles.exerciseInfo} onLongPress={drag} onPress={() => handleEditExercise(item)}>
        <Text style={[styles.exerciseName, { color: textColor }]}>{item.name}</Text>
        <Text style={[styles.setsRepsText, { color: textColor }]}>
          {item.sets} sets x {item.reps} reps
        </Text>
        <Text style={[styles.restText, { color: textColor }]}>Rest: {item.rest} seconds</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteExerciseButton} onPress={() => handleDeleteExercise(item.id)}>
        <MaterialIcons name="delete" size={24} color="#ff5f6d" />
      </TouchableOpacity>
    </View>
  );

  if (!workout) return null;

  return (
    <LinearGradient colors={gradient} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.workoutHeader,
            { backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color={textColor} />
          </TouchableOpacity>
          {isEditingName ? (
            <TextInput
              style={[styles.workoutNameInput, { color: textColor, borderBottomColor: textColor }]}
              value={workoutName}
              onChangeText={(v) => setWorkoutName(v)}
              onSubmitEditing={handleSaveWorkoutName}
              onBlur={handleSaveWorkoutName}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={handleEditWorkoutName} style={styles.workoutNameTouch}>
              <Text style={[styles.workoutName, { color: textColor }]}>{workout.name}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleAddExercises} style={styles.addButtonHeader}>
            <LinearGradient colors={buttonGradient} style={styles.addButtonGradient}>
              <MaterialIcons name="add" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <DraggableFlatList
            data={workout.exercises}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              if (workout) {
                const updated = { ...workout, exercises: data };
                saveWorkout(updated);
              }
            }}
            renderItem={renderExerciseItem}
            contentContainerStyle={styles.draggableList}
            enableLayoutAnimations={false}
          />
        </View>
        <View style={styles.startWorkoutButtonContainer}>
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={() => navigation.push('StartWorkout', { workoutId: workout.id })}
          >
            <LinearGradient colors={buttonGradient} style={styles.startWorkoutButtonGradient}>
              <MaterialIcons name="play-circle-filled" size={30} color="#fff" />
              <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Modal visible={isModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: modalBackground }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Exercises</Text>
              <FlatList
                data={exercisesData}
                keyExtractor={(item) => item.id}
                extraData={selectedExercisesInModal}
                renderItem={({ item: ex }) => {
                  const isSelected = selectedExercisesInModal.some((s) => s.id === ex.id);
                  return (
                    <TouchableOpacity style={styles.exerciseListItem} onPress={() => toggleExerciseSelection(ex)}>
                      <Text style={{ color: textColor }}>{ex.name}</Text>
                      {isSelected && <MaterialIcons name="check" size={20} color="#ff5f6d" />}
                    </TouchableOpacity>
                  );
                }}
                style={styles.exerciseList}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <LinearGradient colors={buttonGradient} style={styles.modalButtonGradient}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={addExercisesToWorkout}>
                  <LinearGradient colors={buttonGradient} style={styles.modalButtonGradient}>
                    <Text style={styles.modalButtonText}>Add</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal visible={isEditModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: modalBackground }]}>
              {editExercise && (
                <>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Edit {editExercise.name}</Text>
                  <View style={styles.editField}>
                    <Text style={[styles.editLabel, { color: textColor }]}>Sets:</Text>
                    <TextInput
                      style={[styles.editInput, { color: textColor, borderBottomColor: textColor }]}
                      value={tempSets ? tempSets.toString() : ''}
                      keyboardType="numeric"
                      onChangeText={(val) => {
                        if (val === '') setTempSets(0);
                        else setTempSets(parseInt(val, 10) || 0);
                      }}
                      clearButtonMode="never"
                    />
                  </View>
                  <View style={styles.editField}>
                    <Text style={[styles.editLabel, { color: textColor }]}>Reps:</Text>
                    <TextInput
                      style={[styles.editInput, { color: textColor, borderBottomColor: textColor }]}
                      value={tempReps ? tempReps.toString() : ''}
                      keyboardType="numeric"
                      onChangeText={(val) => {
                        if (val === '') setTempReps(0);
                        else setTempReps(parseInt(val, 10) || 0);
                      }}
                      clearButtonMode="never"
                    />
                  </View>
                  <View style={styles.editField}>
                    <Text style={[styles.editLabel, { color: textColor }]}>Rest:</Text>
                    <TextInput
                      style={[styles.editInput, { color: textColor, borderBottomColor: textColor }]}
                      value={tempRest ? tempRest.toString() : ''}
                      keyboardType="numeric"
                      onChangeText={(val) => {
                        if (val === '') setTempRest(0);
                        else setTempRest(parseInt(val, 10) || 0);
                      }}
                      clearButtonMode="never"
                    />
                  </View>
                  <View style={styles.modalButtonRow}>
                    <TouchableOpacity style={styles.modalButton} onPress={() => setEditModalVisible(false)}>
                      <LinearGradient colors={buttonGradient} style={styles.modalButtonGradient}>
                        <Text style={styles.modalButtonText}>Cancel</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        if (workout && editExercise) {
                          const updatedExercises = workout.exercises.map((x) => {
                            if (x.id === editExercise.id) {
                              return { ...x, sets: tempSets, reps: tempReps, rest: tempRest };
                            }
                            return x;
                          });
                          const updated = { ...workout, exercises: updatedExercises };
                          saveWorkout(updated);
                        }
                        setEditModalVisible(false);
                      }}
                    >
                      <LinearGradient colors={buttonGradient} style={styles.modalButtonGradient}>
                        <Text style={styles.modalButtonText}>Save</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
  },
  backButton: {
    marginRight: 10,
  },
  workoutNameTouch: {
    flex: 1,
    marginHorizontal: 10,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  workoutNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    borderBottomWidth: 1,
  },
  addButtonHeader: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addButtonGradient: {
    padding: 8,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
  },
  draggableList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    marginBottom: 4,
  },
  setsRepsText: {
    fontSize: 14,
  },
  restText: {
    fontSize: 14,
  },
  deleteExerciseButton: {
    padding: 5,
  },
  startWorkoutButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  startWorkoutButton: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    borderRadius: 8,
  },
  startWorkoutButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  exerciseList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  editLabel: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  editInput: {
    borderBottomWidth: 1,
    flex: 1,
  },
});

export { WorkoutDetailsScreen };
