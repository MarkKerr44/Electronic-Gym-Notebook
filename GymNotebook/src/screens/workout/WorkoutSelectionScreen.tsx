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
  Easing
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from '../../components/BottomNavBar';
import { ThemeContext } from '../../context/ThemeProvider';
import { getThemeColors } from '../../context/themeHelpers';

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
  const [index, setIndex] = useState(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(100)).current;
  const navigation = useNavigation();

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
  };

  const renderPremadeWorkoutItem = ({ item }: { item: PremadeWorkout }) => (
    <TouchableOpacity
      style={[styles.premadeWorkoutItem, { backgroundColor: cardBackground }]}
      onPress={() => handleSelectPremadeWorkout(item)}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: translateAnim }] }}>
        <Image source={{ uri: item.image }} style={styles.premadeWorkoutImage} />
        <View style={styles.premadeWorkoutInfo}>
          <Text style={[styles.premadeWorkoutName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.premadeWorkoutDescription, { color: secondaryTextColor }]}>
            {item.description}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={gradient} style={styles.gradientBackground}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <LinearGradient colors={headerGradient} style={styles.headerContainer}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={[styles.headerTitle, { color: textColor }]}>Workout Selection</Text>
              <Text style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
                Create new workouts or choose premade ones
              </Text>
            </Animated.View>
          </LinearGradient>

          <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
            <TouchableOpacity style={styles.createWorkoutButton} onPress={handleCreateNewWorkout}>
              <LinearGradient colors={buttonGradient} style={styles.createWorkoutButtonGradient}>
                <MaterialIcons name="fitness-center" size={32} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.createWorkoutButtonText}>Create New Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
            <TouchableOpacity style={styles.myWorkoutsButton} onPress={handleMyWorkouts}>
              <LinearGradient colors={buttonGradient} style={styles.myWorkoutsButtonGradient}>
                <MaterialIcons name="list" size={32} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.myWorkoutsButtonText}>My Workouts</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.sectionTitle, { color: secondaryTextColor }]}>Premade Workouts</Text>
            <FlatList
              data={premadeWorkouts}
              renderItem={renderPremadeWorkoutItem}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.premadeWorkoutsList}
              showsHorizontalScrollIndicator={false}
            />
          </Animated.View>

          <TouchableOpacity
            style={[styles.statsButton, { backgroundColor: highlightSolid }]}
            onPress={handleExerciseStats}
          >
            <MaterialIcons name="analytics" size={24} color={textColor} style={styles.buttonIcon} />
            <Text style={[styles.statsButtonText, { color: textColor }]}>Exercise Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: highlightSolid }]}
            onPress={handleViewWorkoutHistory}
          >
            <Text style={[styles.historyButtonText, { color: textColor }]}>View Workout History</Text>
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

export default WorkoutSelectionScreen;
