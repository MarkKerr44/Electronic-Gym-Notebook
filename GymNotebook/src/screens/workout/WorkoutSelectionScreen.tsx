// WorkoutSelectionScreen.tsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Animated,
  Easing,
  Alert,
  Modal
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import { ThemeContext } from '../../context/ThemeProvider';
import { getThemeColors } from '../../context/themeHelpers';
import { workoutService } from '../../services/workoutService';

interface PremadeWorkout {
  id: string;
  name: string;
  description: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: number;
    rest: number;
  }[];
  image: any;
}

const premadeWorkouts: PremadeWorkout[] = [
  {
    id: 'arms_workout',
    name: 'Arms Blast',
    description: 'Complete arm workout targeting biceps and triceps.',
    exercises: [
      {
        id: 'Barbell_Curl',
        name: 'Barbell Curl',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: 'Tricep_Pushdown_Bar',
        name: 'Tricep Pushdown (Bar)',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: 'Hammer_Curl',
        name: 'Hammer Curl',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: 'Skull_Crushers_Dumbbells',
        name: 'Skull Crushers (Dumbbells)',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: 'Cable_Curl_with_Rope',
        name: 'Cable Curl with Rope',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: 'Tricep_Pushdown_Rope',
        name: 'Tricep Pushdown (Rope)',
        sets: 3,
        reps: 12,
        rest: 60
      }
    ],
    image: require('../../../assets/images/arms_workout.jpg'),
  },
  {
    id: 'legs_workout',
    name: 'Leg Day',
    description: 'Build strong legs with this comprehensive workout.',
    exercises: [
      {
        id: 'Bodyweight_Squat',
        name: 'Bodyweight Squat',
        sets: 4,
        reps: 15,
        rest: 90
      },
      {
        id: 'Bulgarian_Split_Squat',
        name: 'Bulgarian Split Squat',
        sets: 3,
        reps: 12,
        rest: 90
      },
      {
        id: 'Goblet_Squat',
        name: 'Goblet Squat',
        sets: 3,
        reps: 12,
        rest: 90
      },
      {
        id: 'Deadlift',
        name: 'Deadlift',
        sets: 4,
        reps: 8,
        rest: 120
      },
      {
        id: 'Dumbbell_Deadlift',
        name: 'Dumbbell Deadlift',
        sets: 3,
        reps: 12,
        rest: 90
      },
      {
        id: 'Bulgarian_Split_Squat',
        name: 'Bulgarian Split Squat (Other Leg)',
        sets: 3,
        reps: 12,
        rest: 90
      }
    ],
    image: require('../../../assets/images/legs_workout.jpg'),
  },
  {
    id: 'full_body',
    name: 'Full Body Workout',
    description: 'Complete full body workout targeting all major muscle groups.',
    exercises: [
      {
        id: 'Bench_Press',
        name: 'Bench Press',
        sets: 4,
        reps: 10,
        rest: 90
      },
      {
        id: 'Deadlift',
        name: 'Deadlift',
        sets: 4,
        reps: 8,
        rest: 120
      },
      {
        id: 'Overhead_Press',
        name: 'Overhead Press',
        sets: 3,
        reps: 10,
        rest: 90
      },
      {
        id: 'Lat_Pulldown',
        name: 'Lat Pulldown',
        sets: 3,
        reps: 12,
        rest: 90
      },
      {
        id: 'Barbell_Curl',
        name: 'Barbell Curl',
        sets: 3,
        reps: 12,
        rest: 60
      },
      {
        id: 'Tricep_Pushdown_Bar',
        name: 'Tricep Pushdown (Bar)',
        sets: 3,
        reps: 12,
        rest: 60
      }
    ],
    image: require('../../../assets/images/full_body_workout.jpg'),
  }
];

const baseStyles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  createWorkoutButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createWorkoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
  createWorkoutButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  myWorkoutsButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  myWorkoutsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  myWorkoutsButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  premadeWorkoutsList: {
    paddingHorizontal: 20,
  },
  premadeWorkoutItem: {
    flexDirection: 'column',
    borderRadius: 16,
    padding: 10,
    marginRight: 15,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  premadeWorkoutImage: {
    width: '100%',
    height: 140,
    borderRadius: 16,
  },
  premadeWorkoutInfo: {
    marginTop: 10,
  },
  premadeWorkoutName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  premadeWorkoutDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  statsButton: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 60,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const WorkoutSelectionScreen: React.FC = () => {
  const [index, setIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(100)).current;
  const navigation = useNavigation();
  const [selectedWorkout, setSelectedWorkout] = useState<PremadeWorkout | null>(null);

  const { theme } = useContext(ThemeContext);
  const {
    gradient,
    textColor,
    headerGradient,
    buttonGradient,
    cardBackground,
    secondaryTextColor,
    highlightSolid,
  } = getThemeColors(theme);

  const themedStyles = {
    alertContainer: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 20,
      marginVertical: 20,
    },
    alertTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: textColor,
      textAlign: 'center',
      marginBottom: 10,
    },
    alertDescription: {
      fontSize: 16,
      color: secondaryTextColor,
      textAlign: 'center',
      marginBottom: 20,
    },
    exerciseList: {
      marginTop: 10,
    },
    exerciseItem: {
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 4,
    },
    exerciseDetails: {
      fontSize: 14,
      color: secondaryTextColor,
    },
    alertMessage: {
      color: textColor,
      fontSize: 16,
      textAlign: 'center',
    }
  };

  useEffect(() => {
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

  const handleCreateNewWorkout = () => {
    navigation.navigate('createWorkout');
  };

  const handleMyWorkouts = () => {
    navigation.navigate('MyWorkoutsScreen');
  };

  const handleViewWorkoutHistory = () => {
    navigation.navigate('WorkoutHistoryScreen');
  };

  const handleExerciseStats = () => {
    navigation.navigate('ExerciseStatsScreen');
  };

  const handleSelectPremadeWorkout = (workout: PremadeWorkout) => {
    setSelectedWorkout(workout);
  };

  const renderPremadeWorkoutItem = ({ item }: { item: PremadeWorkout }) => (
    <TouchableOpacity
      style={[baseStyles.premadeWorkoutItem, { backgroundColor: cardBackground }]}
      onPress={() => handleSelectPremadeWorkout(item)}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateAnim }] }}>
        <Image source={item.image} style={baseStyles.premadeWorkoutImage} />
        <View style={baseStyles.premadeWorkoutInfo}>
          <Text style={[baseStyles.premadeWorkoutName, { color: textColor }]}>{item.name}</Text>
          <Text style={[baseStyles.premadeWorkoutDescription, { color: secondaryTextColor }]}>
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={gradient} style={baseStyles.gradientBackground}>
      <SafeAreaView style={[baseStyles.safeArea, { backgroundColor: 'transparent' }]}>
        <ScrollView contentContainerStyle={baseStyles.scrollContainer}>
          <LinearGradient colors={headerGradient} style={baseStyles.headerContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={[baseStyles.headerTitle, { color: textColor }]}>Workout Selection</Text>
              <Text style={[baseStyles.headerSubtitle, { color: secondaryTextColor }]}>
                Create new workouts or choose premade ones
              </Text>
            </Animated.View>
          </LinearGradient>

          <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
            <TouchableOpacity style={baseStyles.createWorkoutButton} onPress={handleCreateNewWorkout}>
              <LinearGradient colors={buttonGradient} style={baseStyles.createWorkoutButtonGradient}>
                <MaterialIcons name="fitness-center" size={32} color="#FFFFFF" style={baseStyles.buttonIcon} />
                <Text style={baseStyles.createWorkoutButtonText}>Create New Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
            <TouchableOpacity style={baseStyles.myWorkoutsButton} onPress={handleMyWorkouts}>
              <LinearGradient colors={buttonGradient} style={baseStyles.myWorkoutsButtonGradient}>
                <MaterialIcons name="list" size={32} color="#FFFFFF" style={baseStyles.buttonIcon} />
                <Text style={baseStyles.myWorkoutsButtonText}>My Workouts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[baseStyles.sectionTitle, { color: secondaryTextColor }]}>Premade Workouts</Text>
            <FlatList
              data={premadeWorkouts}
              renderItem={renderPremadeWorkoutItem}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={baseStyles.premadeWorkoutsList}
              showsHorizontalScrollIndicator={false}
            />
          </Animated.View>

          <TouchableOpacity
            style={[baseStyles.statsButton, { backgroundColor: highlightSolid }]}
            onPress={handleExerciseStats}
          >
            <MaterialIcons name="analytics" size={24} color={textColor} style={baseStyles.buttonIcon} />
            <Text style={[baseStyles.statsButtonText, { color: textColor }]}>Exercise Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[baseStyles.historyButton, { backgroundColor: highlightSolid }]}
            onPress={handleViewWorkoutHistory}
          >
            <Text style={[baseStyles.historyButtonText, { color: textColor }]}>View Workout History</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNavBar index={index} setIndex={setIndex} />
      </SafeAreaView>
      {selectedWorkout && (
        <Modal
          visible={!!selectedWorkout}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedWorkout(null)}
        >
          <View style={[styles.modalOverlay]}>
            <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
              <ScrollView>
                <Text style={[styles.modalTitle, { color: textColor }]}>{selectedWorkout.name}</Text>
                <Text style={[styles.modalDescription, { color: secondaryTextColor }]}>
                  {selectedWorkout.description}
                </Text>
                <View style={styles.exerciseList}>
                  {selectedWorkout.exercises.map((ex) => (
                    <View key={ex.id} style={styles.exerciseItem}>
                      <Text style={[styles.exerciseName, { color: textColor }]}>{ex.name}</Text>
                      <Text style={[styles.exerciseDetails, { color: secondaryTextColor }]}>
                        {ex.sets} sets × {ex.reps} reps ({ex.rest}s rest)
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={() => setSelectedWorkout(null)}
                >
                  <LinearGradient colors={buttonGradient} style={styles.modalButtonGradient}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={async () => {
                    try {
                      await workoutService.saveWorkout({
                        name: selectedWorkout.name,
                        exercises: selectedWorkout.exercises
                      });
                      setSelectedWorkout(null);
                      Alert.alert('Success', 'Workout added to your collection!', [
                        { text: 'View My Workouts', onPress: () => navigation.navigate('MyWorkoutsScreen') },
                        { text: 'OK' }
                      ]);
                    } catch (error) {
                      console.error('Error saving workout:', error);
                      Alert.alert('Error', 'Failed to save workout. Please try again.');
                    }
                  }}
                >
                  <LinearGradient colors={buttonGradient} style={styles.modalButtonGradient}>
                    <Text style={styles.modalButtonText}>Add to My Workouts</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  ...baseStyles,
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  exerciseList: {
    marginTop: 10,
  },
  exerciseItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  exerciseDetails: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkoutSelectionScreen;
