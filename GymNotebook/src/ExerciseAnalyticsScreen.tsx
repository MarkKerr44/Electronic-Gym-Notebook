import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ExerciseData {
  date: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
}

export default function ExerciseAnalyticsScreen({ route }) {
  const { exerciseId, exerciseName } = route.params;
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseData[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadExerciseHistory();
  }, [exerciseId]);

  const loadExerciseHistory = async () => {
    try {
      const logs = await AsyncStorage.getItem('workoutLogs');
      if (logs) {
        const allLogs = JSON.parse(logs);
        const exerciseData: ExerciseData[] = [];

        allLogs.forEach(log => {
          const exercise = log.exercises.find(e => e.exerciseId === exerciseId);
          if (exercise && exercise.sets && exercise.sets.length > 0) {
            const validWeights = exercise.sets
              .map(s => s.weight)
              .filter(w => typeof w === 'number' && !isNaN(w));

            if (validWeights.length > 0) {
              const maxWeight = Math.max(...validWeights);
              const totalVolume = exercise.sets.reduce((sum, set) => 
                sum + ((set.weight || 0) * (set.actualReps || 0)), 0);
              const totalReps = exercise.sets.reduce((sum, set) => 
                sum + (set.actualReps || 0), 0);

              exerciseData.push({
                date: log.date,
                maxWeight: maxWeight || 0,
                totalVolume: totalVolume || 0,
                totalReps: totalReps || 0
              });
            }
          }
        });

        const validData = exerciseData
          .filter(data => !isNaN(data.maxWeight) && !isNaN(data.totalVolume))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setExerciseHistory(validData);
      }
    } catch (error) {
      console.error('Error loading exercise history:', error);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{exerciseName} Progress</Text>
        </View>
        
        {exerciseHistory.length > 0 ? (
          <ScrollView>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Max Weight Progress</Text>
              <LineChart
                data={{
                  labels: exerciseHistory.map(h => 
                    new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  ),
                  datasets: [{
                    data: exerciseHistory.map(h => h.maxWeight || 0)
                  }]
                }}
                width={Dimensions.get('window').width - 40}
                height={220}
                yAxisSuffix="kg"
                chartConfig={{
                  backgroundColor: '#302b63',
                  backgroundGradientFrom: '#302b63',
                  backgroundGradientTo: '#24243e',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#FFC371"
                  }
                }}
                bezier
                style={styles.chart}
              />
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Total Volume Progress</Text>
              <LineChart
                data={{
                  labels: exerciseHistory.map(h => 
                    new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  ),
                  datasets: [{
                    data: exerciseHistory.map(h => h.totalVolume)
                  }]
                }}
                width={Dimensions.get('window').width - 40}
                height={220}
                chartConfig={{
                  backgroundColor: '#302b63',
                  backgroundGradientFrom: '#302b63',
                  backgroundGradientTo: '#24243e',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 195, 113, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                style={styles.chart}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No history available for this exercise</Text>
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
    paddingVertical: 15,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
  },
  chartContainer: {
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    color: '#FFC371',
    marginBottom: 10,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#FFF',
    fontSize: 16,
  },
});