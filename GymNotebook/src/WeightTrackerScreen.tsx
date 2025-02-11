// WeightTrackerScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Switch,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

type Unit = 'kg' | 'lbs';

const WeightTrackerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [newWeight, setNewWeight] = useState('');
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [unit, setUnit] = useState<Unit>('kg');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  useEffect(() => {
    loadWeightEntries();
    loadUnitPreference();
  }, []);

  useEffect(() => {
    if (weightEntries.length > 0) {
      const updatedEntries = weightEntries.map(entry => ({
        ...entry,
        weight: unit === 'kg' ? convertToKg(entry.weight) : convertToLbs(entry.weight),
      }));
      setWeightEntries(updatedEntries);
      saveWeightEntries(updatedEntries);
    }
  }, [unit]);

  const loadUnitPreference = async () => {
    try {
      const storedUnit = await AsyncStorage.getItem('weightUnit');
      if (storedUnit === 'kg' || storedUnit === 'lbs') {
        setUnit(storedUnit);
      }
    } catch (error) {
      console.error('Error loading unit preference:', error);
    }
  };

  const saveUnitPreference = async (selectedUnit: Unit) => {
    try {
      await AsyncStorage.setItem('weightUnit', selectedUnit);
    } catch (error) {
      console.error('Error saving unit preference:', error);
    }
  };

  const loadWeightEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('weightEntries');
      if (storedEntries) {
        const parsedEntries: WeightEntry[] = JSON.parse(storedEntries);
        parsedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setWeightEntries(parsedEntries);
      }
    } catch (error) {
      console.error('Error loading weight entries:', error);
    }
  };

  const saveWeightEntries = async (entries: WeightEntry[]) => {
    try {
      await AsyncStorage.setItem('weightEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving weight entries:', error);
    }
  };

  const handleAddWeight = async () => {
    const weightNumber = parseFloat(newWeight);
    if (isNaN(weightNumber) || weightNumber <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight.');
      return;
    }

    const entryDate = selectedDate.toLocaleDateString();
    const entry: WeightEntry = {
      id: Date.now().toString(),
      weight: unit === 'kg' ? weightNumber : convertToKg(weightNumber),
      date: entryDate,
    };
    const updatedEntries = [entry, ...weightEntries];

    try {
      await AsyncStorage.setItem('weightEntries', JSON.stringify(updatedEntries));
      await AsyncStorage.setItem('currentWeight', entry.weight.toString());
      setWeightEntries(updatedEntries);
      setNewWeight('');
      Alert.alert('Weight Added', 'Your weight entry has been saved.');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const toggleUnit = () => {
    const newUnit: Unit = unit === 'kg' ? 'lbs' : 'kg';
    setUnit(newUnit);
    saveUnitPreference(newUnit);
  };

  const convertToLbs = (kg: number): number => {
    return parseFloat((kg * 2.20462).toFixed(1));
  };

  const convertToKg = (lbs: number): number => {
    return parseFloat((lbs / 2.20462).toFixed(1));
  };

  const formatWeight = (weight: number): string => {
    return unit === 'kg' ? `${weight} kg` : `${convertToLbs(weight)} lbs`;
  };

  const onChangeDate = (event: any, selected: Date | undefined) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const renderItem = ({ item }: { item: WeightEntry }) => (
    <View style={styles.listItem}>
      <View style={styles.itemLeft}>
        <Ionicons name="fitness" size={24} color="#fff" />
        <Text style={styles.itemWeight}>{formatWeight(item.weight)}</Text>
      </View>
      <Text style={styles.itemDate}>{item.date}</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Weight Tracker</Text>
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Unit: {unit}</Text>
          <Switch
            value={unit === 'lbs'}
            onValueChange={toggleUnit}
            thumbColor="#fff"
            trackColor={{ false: '#767577', true: '#81b0ff' }}
          />
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={`Enter your weight (${unit})`}
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={newWeight}
            onChangeText={setNewWeight}
            returnKeyType="done"
            onSubmitEditing={handleAddWeight}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddWeight}>
            <Ionicons name="add-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={styles.dateButtonText}>Select Date: {selectedDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>History</Text>
          {weightEntries.length === 0 ? (
            <Text style={styles.noEntriesText}>No weight entries yet.</Text>
          ) : (
            <FlatList
              data={weightEntries}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 50,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  historyContainer: {
    flex: 1,
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
  },
  noEntriesText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemWeight: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: '500',
  },
  itemDate: {
    color: '#ccc',
    fontSize: 14,
  },
  separator: {
    height: 10,
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5F6D',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default WeightTrackerScreen;
