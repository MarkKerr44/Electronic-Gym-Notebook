import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { workoutService } from '../../services/workoutService';
import type { ExerciseData } from '../../services/workoutService';
import { Timestamp } from 'firebase/firestore';

function parseDate(raw: any): Date {
  if (raw && typeof raw === 'object' && 'toDate' in raw) {
    return (raw as Timestamp).toDate();
  }

  if (typeof raw === 'string') {
    const parts = raw.split('/');
    if (parts.length === 3) {
      return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }
  }

  return new Date(raw);
}

export default function ExerciseAnalyticsScreen({ route }) {
  const { exerciseId, exerciseName } = route.params;
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    loadExerciseHistory();
  }, [exerciseId]);

  const loadExerciseHistory = async () => {
    try {
      setIsLoading(true);
      const history = await workoutService.getExerciseHistory(exerciseId);
      setExerciseHistory(history);
    } catch (error) {
      console.error('Error loading exercise history:', error);
    } finally {
      setIsLoading(false);
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
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFC371" />
            <Text style={styles.loadingText}>Loading exercise history...</Text>
          </View>
        ) : exerciseHistory.length > 0 ? (
          <ScrollView>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Max Weight Progress</Text>
              <LineChart
                data={{
                  labels: exerciseHistory.map(h => 
                    parseDate(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
                    parseDate(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 10,
  },
});