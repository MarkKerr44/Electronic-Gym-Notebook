import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ExerciseSummary {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  bestWeight: number;
  lastVolume: number;
}

export default function ExerciseStatsScreen() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const logs = await AsyncStorage.getItem('workoutLogs');
      if (logs) {
        const allLogs = JSON.parse(logs);
        const exerciseMap = new Map<string, ExerciseSummary>();

        allLogs.forEach(log => {
          log.exercises.forEach(exercise => {
            if (!exercise.sets || exercise.sets.length === 0) return;

            const validWeights = exercise.sets
              .map(s => s.weight || 0)
              .filter(w => !isNaN(w));

            if (validWeights.length > 0) {
              const maxWeight = Math.max(...validWeights);
              const totalVolume = exercise.sets.reduce((sum, set) => 
                sum + ((set.weight || 0) * (set.actualReps || 0)), 0);

              if (!exerciseMap.has(exercise.exerciseId)) {
                exerciseMap.set(exercise.exerciseId, {
                  exerciseId: exercise.exerciseId,
                  exerciseName: exercise.exerciseName,
                  lastWeight: maxWeight,
                  bestWeight: maxWeight,
                  lastVolume: totalVolume
                });
              } else {
                const existing = exerciseMap.get(exercise.exerciseId)!;
                exerciseMap.set(exercise.exerciseId, {
                  ...existing,
                  lastWeight: maxWeight,
                  bestWeight: Math.max(existing.bestWeight, maxWeight),
                  lastVolume: totalVolume
                });
              }
            }
          });
        });

        setExercises(Array.from(exerciseMap.values()));
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

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

        {exercises.length > 0 ? (
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
});