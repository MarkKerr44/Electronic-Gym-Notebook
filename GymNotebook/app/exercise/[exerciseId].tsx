import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import exercisesData from '../../exercises.json'; 

const ExerciseDetailScreen: React.FC = () => {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams();

  const [exerciseData, setExerciseData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (exerciseId) {
      const foundExercise = exercisesData.find((exercise) => exercise.id === exerciseId);
      setExerciseData(foundExercise || null);
      setLoading(false);
    }
  }, [exerciseId]);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC371" />
      </View>
    );
  }

  if (!exerciseData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{exerciseData.name || 'Exercise'}</Text>
          <Text style={styles.categoryText}>{capitalize(exerciseData.category) || 'Category'}</Text>
        </View>

        <View style={styles.imageContainer}>
          {Array.isArray(exerciseData.images) && exerciseData.images.length > 0 ? (
            exerciseData.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises/${image}` }}
                style={styles.image}
              />
            ))
          ) : (
            <Text style={styles.noImageText}>No images available.</Text>
          )}
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {exerciseData.instructions.map((step, index) => (
              <Text key={index} style={styles.descriptionText}>
                {`${index + 1}. ${step}`}
              </Text>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Muscles Worked</Text>
            <View style={styles.musclesContainer}>
              <Text style={styles.muscleType}>Primary:</Text>
              <Text style={styles.muscleList}>{exerciseData.primaryMuscles.join(', ') || 'N/A'}</Text>
            </View>
            {exerciseData.secondaryMuscles.length > 0 && (
              <View style={styles.musclesContainer}>
                <Text style={styles.muscleType}>Secondary:</Text>
                <Text style={styles.muscleList}>{exerciseData.secondaryMuscles.join(', ')}</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.equipment) || 'Bodyweight'}</Text>
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Force</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.force) || 'N/A'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Level</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.level) || 'N/A'}</Text>
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.sectionTitle}>Mechanic</Text>
            <Text style={styles.infoText}>{capitalize(exerciseData.mechanic) || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)', 
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#FFC371',
    marginTop: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFC371',
    opacity: 0.9,
    shadowColor: '#FFC371',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10, 
  },
  noImageText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  detailBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFC371',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
  },
  infoText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  musclesContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  muscleType: {
    fontSize: 16,
    color: '#FFC371',
    fontWeight: 'bold',
    marginRight: 10,
  },
  muscleList: {
    fontSize: 16,
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 10,
  },
});

export default ExerciseDetailScreen;
