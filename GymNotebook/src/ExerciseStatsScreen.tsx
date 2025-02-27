import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { workoutService } from './services/workoutService';
import type { ExerciseSummary } from './services/workoutService';

export default function ExerciseStatsScreen() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const exerciseStats = await workoutService.getExerciseStats();
      setExercises(exerciseStats);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const renderExerciseItem = ({ item }: { item: ExerciseSummary }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => navigation.navigate('ExerciseAnalytics', {
        exerciseId: item.exerciseId,
        exerciseName: item.exerciseName
      })}
    >
      <Text style={styles.exerciseName}>{item.exerciseName}</Text>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>Best: {item.bestWeight}kg</Text>
        <Text style={styles.statText}>Last: {item.lastWeight}kg</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#FFC371" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exercise Stats</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC371" />
            <Text style={styles.loadingText}>Loading exercise stats...</Text>
          </View>
        ) : exercises.length > 0 ? (
          <FlatList
            data={exercises}
            renderItem={renderExerciseItem}
            keyExtractor={item => item.exerciseId}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No exercise history available</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  list: {
    padding: 20,
  },
  exerciseItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginRight: 10,
  },
  statText: {
    color: '#FFC371',
    marginHorizontal: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFC371',
    fontSize: 16,
    marginTop: 10,
  },
});