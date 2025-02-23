import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCREEN_WIDTH = Dimensions.get('window').width;

type RoutineType = 'fixedDays' | 'cycle';

interface RoutineTemplate {
  name: string;
  type: RoutineType;
  schedule: string[];
  cycleItems?: string[];
}

function RoutineSetupScreen() {
  const navigation = useNavigation();
  const [routineType, setRoutineType] = useState<RoutineType>('fixedDays');
  const [routineName, setRoutineName] = useState('');
  const [schedule, setSchedule] = useState<string[]>(Array(7).fill(''));
  const [cycleItems, setCycleItems] = useState<string[]>([]);
  const [tempCycleItem, setTempCycleItem] = useState('');

  const handleRoutineTypeChange = (type: RoutineType) => {
    setRoutineType(type);
    setSchedule(Array(7).fill(''));
    setCycleItems([]);
  };

  const handleAddCycleItem = () => {
    if (!tempCycleItem.trim()) return;
    setCycleItems([...cycleItems, tempCycleItem.trim()]);
    setTempCycleItem('');
  };

  const handleRemoveCycleItem = (index: number) => {
    setCycleItems(cycleItems.filter((_, i) => i !== index));
  };

  const generateCycleSchedule = (): string[] => {
    if (cycleItems.length === 0) return Array(7).fill('');
    return Array(7).fill('').map((_, i) => cycleItems[i % cycleItems.length]);
  };

  const handleSave = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }

    if (routineType === 'fixedDays' && !schedule.some(day => day.trim())) {
      Alert.alert('Error', 'Please add at least one workout day');
      return;
    }

    if (routineType === 'cycle' && cycleItems.length === 0) {
      Alert.alert('Error', 'Please add at least one cycle item');
      return;
    }

    const template: RoutineTemplate = {
      name: routineName.trim(),
      type: routineType,
      schedule: routineType === 'fixedDays' ? schedule : generateCycleSchedule(),
      ...(routineType === 'cycle' && { cycleItems })
    };

    try {
      await AsyncStorage.setItem('currentRoutine', JSON.stringify(template));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save routine');
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Routine</Text>
            <View style={styles.placeholder} />
          </View>

          <TextInput
            style={styles.nameInput}
            placeholder="Routine Name"
            placeholderTextColor="#999"
            value={routineName}
            onChangeText={setRoutineName}
          />

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, routineType === 'fixedDays' && styles.activeType]}
              onPress={() => handleRoutineTypeChange('fixedDays')}
            >
              <Text style={styles.typeText}>Fixed Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, routineType === 'cycle' && styles.activeType]}
              onPress={() => handleRoutineTypeChange('cycle')}
            >
              <Text style={styles.typeText}>Cycle</Text>
            </TouchableOpacity>
          </View>

          {routineType === 'fixedDays' ? (
            <View style={styles.fixedDaysContainer}>
              {DAYS.map((day, index) => (
                <View key={day} style={styles.dayRow}>
                  <Text style={styles.dayText}>{day}</Text>
                  <TextInput
                    style={styles.workoutInput}
                    placeholder="Rest"
                    placeholderTextColor="#999"
                    value={schedule[index]}
                    onChangeText={(text) => {
                      const newSchedule = [...schedule];
                      newSchedule[index] = text;
                      setSchedule(newSchedule);
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.cycleContainer}>
              <Text style={styles.cycleInstructions}>
                Add workouts in order (e.g., Push, Pull, Legs, Rest). This will repeat to fill the week.
              </Text>
              <View style={styles.cycleInputRow}>
                <TextInput
                  style={styles.cycleInput}
                  placeholder="Workout name"
                  placeholderTextColor="#999"
                  value={tempCycleItem}
                  onChangeText={setTempCycleItem}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddCycleItem}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cycleItems}>
                {cycleItems.map((item, index) => (
                  <View key={index} style={styles.cycleItemContainer}>
                    <Text style={styles.cycleItemText}>{item}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveCycleItem(index)}
                    >
                      <MaterialIcons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Routine</Text>
          </TouchableOpacity>
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeType: {
    backgroundColor: '#FF5F6D',
  },
  typeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fixedDaysContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayText: {
    color: '#fff',
    width: 100,
  },
  workoutInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
  },
  cycleContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
  },
  cycleInstructions: {
    color: '#fff',
    marginBottom: 15,
  },
  cycleInputRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  cycleInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cycleItems: {
    gap: 10,
  },
  cycleItemContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  cycleItemText: {
    flex: 1,
    color: '#fff',
  },
  removeButton: {
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RoutineSetupScreen;