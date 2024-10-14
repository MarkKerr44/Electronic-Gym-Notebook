// ExerciseLibraryScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomNavBar from '../components/BottomNavBar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Import useRouter

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

const ExerciseLibraryScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(3);
  const router = useRouter(); 

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        let exerciseResults: Exercise[] = [];
        let nextUrl = 'https://wger.de/api/v2/exercise/?language=2&limit=100';

        while (nextUrl) {
          const response = await fetch(nextUrl);
          const data = await response.json();

          const filteredData = data.results.filter(
            (exercise: any) => exercise.name && exercise.description
          );

          const mappedExercises = filteredData.map((exercise: any) => ({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            category: exercise.category,
            muscles: exercise.muscles,
            muscles_secondary: exercise.muscles_secondary,
            equipment: exercise.equipment,
            images: [], 
          }));

          exerciseResults = [...exerciseResults, ...mappedExercises];
          nextUrl = data.next;
        }

        const imageResponse = await fetch(
          'https://wger.de/api/v2/exerciseimage/?limit=1000'
        );
        const imageData = await imageResponse.json();

        exerciseResults = exerciseResults.map((exercise) => {
          const exerciseImages = imageData.results
            .filter((image: any) => image.exercise === exercise.id)
            .map((image: any) => `https://wger.de${image.image}`); 

          return {
            ...exercise,
            images: exerciseImages,
          };
        });

        setExercises(exerciseResults);
        setFilteredExercises(exerciseResults);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      setFilteredExercises(
        exercises.filter((exercise) =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, exercises]);

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() =>
        router.push({
          pathname: '/exercise',
          params: { exercise: JSON.stringify(item) },
        })
      }
    >
      {item.images.length > 0 ? (
        <Image
          source={{ uri: item.images[0] }}
          style={styles.exerciseImage}
          onError={(e) => {
            console.error('Image load error:', e.nativeEvent.error);
          }}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <MaterialIcons name="fitness-center" size={30} color="#ffffff" />
        </View>
      )}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
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
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FFC371" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}

        <BottomNavBar index={index} setIndex={setIndex} />
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80, 
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#4C4C4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ExerciseLibraryScreen;
