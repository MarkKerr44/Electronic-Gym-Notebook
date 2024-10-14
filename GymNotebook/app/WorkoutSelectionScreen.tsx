// screens/WorkoutSelectionScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, SafeAreaView, ScrollView, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';

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
    description: 'A high-intensity workout focusing on quads, hamstrings, and calves.',
    exercises: ['Squats', 'Lunges', 'Leg Press', 'Calf Raises'],
    image: 'https://example.com/legs_workout.jpg'
  },
  {
    id: 'arms',
    name: 'Arms',
    description: 'Pump those biceps, triceps, and forearms with this targeted arm workout.',
    exercises: ['Bicep Curls', 'Tricep Extensions', 'Hammer Curls'],
    image: 'https://example.com/arms_workout.jpg'
  },
  {
    id: 'full_body',
    name: 'Full Body',
    description: 'An effective workout that hits all major muscle groups.',
    exercises: ['Deadlifts', 'Pull-ups', 'Push-ups', 'Squats'],
    image: 'https://example.com/full_body_workout.jpg'
  }
];

const WorkoutSelectionScreen: React.FC = () => {
  const [index, setIndex] = React.useState(1);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateAnim = React.useRef(new Animated.Value(100)).current;

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
    console.log('Navigate to Create New Workout Screen');
  };

  const handleSelectPremadeWorkout = (workout: PremadeWorkout) => {
    console.log('Navigate to Premade Workout Details', workout);
  };

  const renderPremadeWorkoutItem = ({ item }: { item: PremadeWorkout }) => (
    <TouchableOpacity style={styles.premadeWorkoutItem} onPress={() => handleSelectPremadeWorkout(item)}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateAnim }] }}>
        <Image source={{ uri: item.image }} style={styles.premadeWorkoutImage} />
        <View style={styles.premadeWorkoutInfo}>
          <Text style={styles.premadeWorkoutName}>{item.name}</Text>
          <Text style={styles.premadeWorkoutDescription}>{item.description}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient colors={['#8B0000', '#FF6347']} style={styles.headerContainer}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.headerTitle}>Workout Selection</Text>
            <Text style={styles.headerSubtitle}>Build Your Own or Choose a Premade Workout</Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
          <TouchableOpacity style={styles.createWorkoutButton} onPress={handleCreateNewWorkout}>
            <LinearGradient colors={['#FF6347', '#FFD700']} style={styles.createWorkoutButtonGradient}>
              <MaterialIcons name="fitness-center" size={32} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.createWorkoutButtonText}>Create New Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>Premade Workouts</Text>
          <FlatList
            data={premadeWorkouts}
            renderItem={renderPremadeWorkoutItem}
            keyExtractor={item => item.id}
            horizontal
            contentContainerStyle={styles.premadeWorkoutsList}
            showsHorizontalScrollIndicator={false}
          />
        </Animated.View>
      </ScrollView>

      <BottomNavBar index={index} setIndex={setIndex} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 24,
    color: '#FFD700',
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
});

export default WorkoutSelectionScreen;