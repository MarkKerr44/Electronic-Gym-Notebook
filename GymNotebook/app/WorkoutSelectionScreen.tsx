import React from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface PremadeWorkout {
  id: string;
  name: string;
  description: string;
  exercises: string[];
  image: string;
}

const premadeWorkouts: PremadeWorkout[] = [
  {
    id: 'legs',
    name: 'Legs',
    description: 'Target your legs with intense exercises.',
    exercises: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises'],
    image: 'https://example.com/legs_workout.jpg',
  },
  {
    id: 'arms',
    name: 'Arms',
    description: 'Pump those biceps, triceps, and forearms.',
    exercises: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls'],
    image: 'https://example.com/arms_workout.jpg',
  },
  {
    id: 'full_body',
    name: 'Full Body',
    description: 'Full body workout for all muscle groups.',
    exercises: ['Deadlifts', 'Pull-ups', 'Push-ups', 'Squats'],
    image: 'https://example.com/full_body_workout.jpg',
  },
];

const WorkoutSelectionScreen: React.FC = () => {
  const [index, setIndex] = React.useState(1);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateAnim = React.useRef(new Animated.Value(100)).current;
  const router = useRouter(); 

  React.useEffect(() => {
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
    router.push('/createWorkout'); 
  };

  const handleMyWorkouts = () => {
    router.push('/MyWorkoutsScreen'); 
  };

  const handleSelectPremadeWorkout = (workout: PremadeWorkout) => {
    console.log('Navigate to Premade Workout Details', workout);
  };

  const renderPremadeWorkoutItem = ({ item }: { item: PremadeWorkout }) => (
    <TouchableOpacity
      style={styles.premadeWorkoutItem}
      onPress={() => handleSelectPremadeWorkout(item)}
    >
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: translateAnim }] }}
      >
        <Image source={{ uri: item.image }} style={styles.premadeWorkoutImage} />
        <View style={styles.premadeWorkoutInfo}>
          <Text style={styles.premadeWorkoutName}>{item.name}</Text>
          <Text style={styles.premadeWorkoutDescription}>{item.description}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LinearGradient colors={['#0f0c29', '#302b63']} style={styles.headerContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.headerTitle}>Workout Selection</Text>
              <Text style={styles.headerSubtitle}>
                Create new workouts or choose premade ones
              </Text>
            </Animated.View>
          </LinearGradient>

          <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
            <TouchableOpacity style={styles.createWorkoutButton} onPress={handleCreateNewWorkout}>
              <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.createWorkoutButtonGradient}>
                <MaterialIcons name="fitness-center" size={32} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.createWorkoutButtonText}>Create New Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
            <TouchableOpacity style={styles.myWorkoutsButton} onPress={handleMyWorkouts}>
              <LinearGradient colors={['#FF5F6D', '#FFC371']} style={styles.myWorkoutsButtonGradient}>
                <MaterialIcons name="list" size={32} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.myWorkoutsButtonText}>My Workouts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.sectionTitle}>Premade Workouts</Text>
            <FlatList
              data={premadeWorkouts}
              renderItem={renderPremadeWorkoutItem}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.premadeWorkoutsList}
              showsHorizontalScrollIndicator={false}
            />
          </Animated.View>

          <TouchableOpacity style={styles.historyButton}>
            <Text style={styles.historyButtonText}>View Workout History</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNavBar index={index} setIndex={setIndex} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#333333',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FFD700',
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
    color: '#FFC371',
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  premadeWorkoutsList: {
    paddingHorizontal: 20,
  },
  premadeWorkoutItem: {
    flexDirection: 'column',
    backgroundColor: '#4C4C4C',
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
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  premadeWorkoutDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  historyButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 60,
    backgroundColor: '#FFC371',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 18,
    color: '#302b63',
    fontWeight: 'bold',
  },
});

export default WorkoutSelectionScreen;
