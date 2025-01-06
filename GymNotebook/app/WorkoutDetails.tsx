import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  rest: number
}

interface Workout {
  id: string
  name: string
  exercises: Exercise[]
}

export default function WorkoutDetailsScreen() {
  const router = useRouter()
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [workoutName, setWorkoutName] = useState<string>('')
  const [isModalVisible, setModalVisible] = useState<boolean>(false)
  const [exercisesData, setExercisesData] = useState<Exercise[]>([])
  const [selectedExercisesInModal, setSelectedExercisesInModal] = useState<Exercise[]>([])
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false)
  const [editExercise, setEditExercise] = useState<Exercise | null>(null)
  const [tempSets, setTempSets] = useState<number>(3)
  const [tempReps, setTempReps] = useState<number>(10)
  const [tempRest, setTempRest] = useState<number>(60)

  useEffect(() => {
    loadWorkout()
  }, [])

  useEffect(() => {
    loadExercisesData()
  }, [])

  const loadWorkout = async () => {
    try {
      const storedWorkouts = await AsyncStorage.getItem('workouts')
      const parsedWorkouts: Workout[] = storedWorkouts ? JSON.parse(storedWorkouts) : []
      const foundWorkout = parsedWorkouts.find((w) => w.id === workoutId)
      if (foundWorkout) {
        setWorkout(foundWorkout)
        setWorkoutName(foundWorkout.name)
      } else {
        Alert.alert('Workout not found')
        router.back()
      }
    } catch (error) {}
  }

  const loadExercisesData = async () => {
    const data = await import('../exercises.json')
    setExercisesData(data.default)
  }

  const saveWorkout = async (updatedWorkout: Workout) => {
    try {
      const storedWorkouts = await AsyncStorage.getItem('workouts')
      const parsedWorkouts: Workout[] = storedWorkouts ? JSON.parse(storedWorkouts) : []
      const workoutIndex = parsedWorkouts.findIndex((w) => w.id === workoutId)
      if (workoutIndex !== -1) {
        parsedWorkouts[workoutIndex] = updatedWorkout
        await AsyncStorage.setItem('workouts', JSON.stringify(parsedWorkouts))
        setWorkout(updatedWorkout)
      }
    } catch (error) {}
  }

  const handleEditWorkoutName = () => {
    setIsEditingName(true)
  }

  const handleSaveWorkoutName = () => {
    if (workout) {
      const updatedWorkout = { ...workout, name: workoutName }
      saveWorkout(updatedWorkout)
      setIsEditingName(false)
    }
  }

  const handleDeleteExercise = (exerciseId: string) => {
    if (workout) {
      const updatedExercises = workout.exercises.filter((e) => e.id !== exerciseId)
      const updatedWorkout = { ...workout, exercises: updatedExercises }
      saveWorkout(updatedWorkout)
    }
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditExercise(exercise)
    setTempSets(exercise.sets)
    setTempReps(exercise.reps)
    setTempRest(exercise.rest)
    setEditModalVisible(true)
  }

  const handleAddExercises = () => {
    setModalVisible(true)
  }

  const addExercisesToWorkout = () => {
    if (workout) {
      const newExercises = selectedExercisesInModal.map((exercise) => ({
        ...exercise,
        id: Date.now().toString() + Math.random().toString(),
        sets: 3,
        reps: 10,
        rest: 60,
      }))
      const updatedWorkout = { ...workout, exercises: [...workout.exercises, ...newExercises] }
      saveWorkout(updatedWorkout)
      setSelectedExercisesInModal([])
      setModalVisible(false)
    }
  }

  const renderExerciseItem = ({ item, drag }: RenderItemParams<Exercise>) => {
    return (
      <View style={styles.exerciseCard}>
        <TouchableOpacity style={styles.exerciseInfo} onLongPress={drag} onPress={() => handleEditExercise(item)}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.setsRepsText}>
            {item.sets} sets x {item.reps} reps
          </Text>
          <Text style={styles.restText}>Rest: {item.rest} seconds</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteExerciseButton} onPress={() => handleDeleteExercise(item.id)}>
          <MaterialIcons name="delete" size={24} color="#ff5f6d" />
        </TouchableOpacity>
      </View>
    )
  }

  if (!workout) return null

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          {isEditingName ? (
            <TextInput
              style={styles.workoutNameInput}
              value={workoutName}
              onChangeText={setWorkoutName}
              onSubmitEditing={handleSaveWorkoutName}
              onBlur={handleSaveWorkoutName}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={handleEditWorkoutName}>
              <Text style={styles.workoutName}>{workout.name}</Text>
            </TouchableOpacity>
          )}
        </View>
        <DraggableFlatList
          data={workout.exercises}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => {
            if (workout) {
              const updatedWorkout = { ...workout, exercises: data }
              saveWorkout(updatedWorkout)
            }
          }}
          renderItem={renderExerciseItem}
          containerStyle={styles.draggableList}
        />
        <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercises}>
          <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.addExerciseButtonGradient}>
            <MaterialIcons name="add-circle" size={30} color="#fff" />
            <Text style={styles.addExerciseButtonText}>Add Exercises</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.startWorkoutButtonContainer}>
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={() => {
              router.push({ pathname: '/StartWorkout', params: { workoutId: workout.id } })
            }}
          >
            <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.startWorkoutButtonGradient}>
              <MaterialIcons name="play-circle-filled" size={30} color="#fff" />
              <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Modal visible={isModalVisible} transparent={true} animationType="slide">
          <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Exercises</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={exercisesData}
                renderItem={({ item }) => {
                  const isSelected = selectedExercisesInModal.some((e) => e.id === item.id)
                  return (
                    <TouchableOpacity
                      style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedExercisesInModal((prevSelected) => prevSelected.filter((e) => e.id !== item.id))
                        } else {
                          setSelectedExercisesInModal((prevSelected) => [...prevSelected, item])
                        }
                      }}
                    >
                      <Text style={styles.exerciseName}>{item.name}</Text>
                      <MaterialIcons
                        name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                        size={24}
                        color={isSelected ? '#FFC371' : '#ffffff'}
                      />
                    </TouchableOpacity>
                  )
                }}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                style={styles.exerciseList}
              />
              <TouchableOpacity style={styles.addSelectedExercisesButton} onPress={addExercisesToWorkout}>
                <Text style={styles.addSelectedExercisesButtonText}>
                  Add {selectedExercisesInModal.length} Exercises
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        <Modal visible={isEditModalVisible} transparent={true} animationType="slide">
          <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Exercise</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={tempSets.toString()}
                  onChangeText={(text) => setTempSets(Number(text))}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={tempReps.toString()}
                  onChangeText={(text) => setTempReps(Number(text))}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Rest (seconds)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={tempRest.toString()}
                  onChangeText={(text) => setTempRest(Number(text))}
                />
              </View>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  if (workout && editExercise) {
                    const updatedExercises = workout.exercises.map((e) => {
                      if (e.id === editExercise.id) {
                        return {
                          ...e,
                          sets: tempSets,
                          reps: tempReps,
                          rest: tempRest,
                        }
                      } else {
                        return e
                      }
                    })
                    const updatedWorkout = { ...workout, exercises: updatedExercises }
                    saveWorkout(updatedWorkout)
                    setEditModalVisible(false)
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    marginRight: 10,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  workoutNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
    borderBottomWidth: 1,
    flex: 1,
  },
  draggableList: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
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
  deleteExerciseButton: {
    padding: 5,
  },
  addExerciseButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  addExerciseButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    width: '90%',
  },
  addExerciseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  startWorkoutButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  startWorkoutButton: {
    alignSelf: 'stretch',
  },
  startWorkoutButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
  },
  startWorkoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
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
})
