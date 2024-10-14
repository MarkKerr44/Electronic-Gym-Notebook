import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface Exercise {
  id: number;
  name: string;
  description: string;
  category: number;
  muscles: number[];
  muscles_secondary: number[];
  equipment: number[];
  images: string[];
}

const { width } = Dimensions.get('window');

const ExerciseDetailScreen: React.FC = () => {
  const router = useRouter();
  const { exercise } = useLocalSearchParams(); 

  if (!exercise) {
    return (
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>Exercise not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Parse the exercise data
  let exerciseData: Exercise;
  try {
    exerciseData = JSON.parse(exercise as string);
  } catch (error) {
    console.error('Error parsing exercise data:', error);
    return (
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid exercise data.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{exerciseData.name}</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {exerciseData.images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.imageCarousel}
            >
              {exerciseData.images.map((imageUri, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={styles.exerciseImage}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialIcons name="fitness-center" size={60} color="#ffffff" />
            </View>
          )}

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {exerciseData.description.replace(/<[^>]*>?/gm, '')}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Muscles Worked</Text>
            <Text style={styles.infoText}>
              {exerciseData.muscles.length > 0
                ? getMuscleNames(exerciseData.muscles).join(', ')
                : 'N/A'}
            </Text>
          </View>

          {exerciseData.muscles_secondary.length > 0 && (
            <View style={styles.infoContainer}>
              <Text style={styles.sectionTitle}>Secondary Muscles</Text>
              <Text style={styles.infoText}>
                {getMuscleNames(exerciseData.muscles_secondary).join(', ')}
              </Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <Text style={styles.infoText}>
              {exerciseData.equipment.length > 0
                ? getEquipmentNames(exerciseData.equipment).join(', ')
                : 'Bodyweight'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const getMuscleNames = (muscleIds: number[]) => {
  const muscles: { [key: number]: string } = {
    1: 'Biceps brachii',
    2: 'Anterior Deltoid',
    3: 'Serratus anterior',
    4: 'Pectoralis major',
    5: 'Triceps brachii',
    6: 'Rectus abdominis',
    7: 'Gastrocnemius',
    8: 'Gluteus maximus',
    9: 'Hamstrings',
    10: 'Latissimus dorsi',
    11: 'Obliquus externus abdominis',
    12: 'Quadriceps femoris',
    13: 'Deltoid',
    14: 'Trapezius',
    15: 'Brachialis',
    16: 'Obliquus internus abdominis',
    17: 'Soleus',
  };

  return muscleIds.map((id) => muscles[id] || 'Unknown Muscle');
};

const getEquipmentNames = (equipmentIds: number[]) => {
  const equipment: { [key: number]: string } = {
    1: 'Barbell',
    2: 'SZ-Bar',
    3: 'Dumbbell',
    4: 'Gym mat',
    5: 'Swiss Ball',
    6: 'Pull-up bar',
    7: 'Bodyweight',
    8: 'Bench',
    9: 'Incline bench',
    10: 'Kettlebell',
    11: 'Machine',
    13: 'Cable',
    14: 'Elliptical Machine',
    15: 'Exercise Ball',
    16: 'Ez-Bar',
    17: 'Foam Roll',
    18: 'Bands',
    19: 'Sled Machine',
  };

  return equipmentIds.map((id) => equipment[id] || 'Unknown Equipment');
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 20,
  },
  backText: {
    color: '#FFC371',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  imageCarousel: {
    height: 250,
    marginTop: 20,
  },
  exerciseImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: width,
    height: 250,
    backgroundColor: '#4C4C4C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#FFC371',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#ffffff',
  },
});

export default ExerciseDetailScreen;
