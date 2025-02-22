import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Keyboard,
  Pressable,
  Platform,
  Modal,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Swipeable } from 'react-native-gesture-handler';

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
}

type Unit = 'kg' | 'lbs';
type FilterType = 'mostRecent' | 'oldest' | 'heaviest' | 'lightest';

const WeightTrackerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [newWeight, setNewWeight] = useState('');
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [unit, setUnit] = useState<Unit>('kg');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('mostRecent');
  const [tempFilterType, setTempFilterType] = useState<FilterType>('mostRecent');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadWeightEntries();
    loadUnitPreference();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();
      }, 2000);
    });
  };

  const loadUnitPreference = async () => {
    try {
      const storedUnit = await AsyncStorage.getItem('weightUnit');
      if (storedUnit === 'kg' || storedUnit === 'lbs') {
        setUnit(storedUnit);
      }
    } catch (error) {}
  };

  const saveUnitPreference = async (selectedUnit: Unit) => {
    try {
      await AsyncStorage.setItem('weightUnit', selectedUnit);
    } catch (error) {}
  };

  const loadWeightEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('weightEntries');
      if (storedEntries) {
        const parsedEntries: WeightEntry[] = JSON.parse(storedEntries);
        setWeightEntries(parsedEntries);
      }
    } catch (error) {}
  };

  const saveWeightEntries = async (entries: WeightEntry[]) => {
    try {
      await AsyncStorage.setItem('weightEntries', JSON.stringify(entries));
    } catch (error) {}
  };

  const convertToLbs = (kg: number): number => parseFloat((kg * 2.20462).toFixed(1));
  const convertToKg = (lbs: number): number => parseFloat((lbs / 2.20462).toFixed(1));
  const formatWeight = (weight: number): string =>
    unit === 'kg' ? `${weight} kg` : `${convertToLbs(weight)} lbs`;

  const toggleUnit = () => {
    const newUnit: Unit = unit === 'kg' ? 'lbs' : 'kg';
    if (newWeight) {
      const weightNum = parseFloat(newWeight);
      if (!isNaN(weightNum)) {
        let converted = unit === 'kg' ? weightNum * 2.20462 : weightNum / 2.20462;
        setNewWeight(converted.toFixed(1));
      }
    }
    setUnit(newUnit);
    saveUnitPreference(newUnit);
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    return `${dayStr}/${monthStr}/${year}`;
  };

  const handleAddWeight = async () => {
    const weightNumber = parseFloat(newWeight);
    if (isNaN(weightNumber) || weightNumber <= 0) {
      showToast('Please enter a valid weight.', 'error');
      return;
    }
    const entryDate = formatDate(selectedDate);
    const entry: WeightEntry = {
      id: Date.now().toString(),
      weight: unit === 'kg' ? weightNumber : convertToKg(weightNumber),
      date: entryDate
    };
    const updatedEntries = [entry, ...weightEntries];
    try {
      await AsyncStorage.setItem('weightEntries', JSON.stringify(updatedEntries));
      setWeightEntries(updatedEntries);
      setNewWeight('');
      showToast('Your weight entry has been saved.', 'success');
      Keyboard.dismiss();
    } catch (error) {}
  };

  const onChangeDate = (event: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const updatedEntries = weightEntries.filter(entry => entry.id !== id);
    setWeightEntries(updatedEntries);
    await saveWeightEntries(updatedEntries);
  };

  const confirmDelete = (id: string) => {
    if (dontAskAgain) {
      handleDeleteEntry(id);
    } else {
      setPendingDeleteId(id);
      setDeleteModalVisible(true);
    }
  };

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(id)}>
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: WeightEntry }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.listItem}>
        <View style={styles.itemLeft}>
          <Ionicons name="fitness" size={24} color="#fff" />
          <Text style={styles.itemWeight}>{formatWeight(item.weight)}</Text>
        </View>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
    </Swipeable>
  );

  const parseDate = (dateStr: string): Date => {
    const parts = dateStr.split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const getSortedEntries = (): WeightEntry[] => {
    let entries = [...weightEntries];
    switch (filterType) {
      case 'mostRecent':
        entries.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
        break;
      case 'oldest':
        entries.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
        break;
      case 'heaviest':
        entries.sort((a, b) => b.weight - a.weight);
        break;
      case 'lightest':
        entries.sort((a, b) => a.weight - b.weight);
        break;
    }
    return entries;
  };

  const ListHeaderComponent = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weight Tracker</Text>
      </View>
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Entry</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.weightInput]}
              placeholder={`Weight (${unit})`}
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={newWeight}
              onChangeText={setNewWeight}
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.unitButton} onPress={toggleUnit}>
              <Text style={styles.unitButtonText}>Switch to {unit === 'kg' ? 'lbs' : 'kg'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
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
          <TouchableOpacity style={styles.addButton} onPress={handleAddWeight}>
            <Text style={styles.addButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Text style={[styles.toastText, toastType === 'success' ? styles.toastSuccess : styles.toastError]}>
            {toastMessage}
          </Text>
        </Animated.View>
      </View>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>History</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => { setTempFilterType(filterType); setFilterModalVisible(true); }}>
          <Ionicons name="filter" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={getSortedEntries()}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={<Text style={styles.noEntriesText}>No weight entries yet.</Text>}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
      {filterModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort Entries</Text>
            <Pressable style={[styles.modalOption, tempFilterType === 'mostRecent' && styles.modalOptionActive]} onPress={() => setTempFilterType('mostRecent')}>
              <Text style={styles.modalOptionText}>Most Recent</Text>
            </Pressable>
            <Pressable style={[styles.modalOption, tempFilterType === 'oldest' && styles.modalOptionActive]} onPress={() => setTempFilterType('oldest')}>
              <Text style={styles.modalOptionText}>Oldest</Text>
            </Pressable>
            <Pressable style={[styles.modalOption, tempFilterType === 'heaviest' && styles.modalOptionActive]} onPress={() => setTempFilterType('heaviest')}>
              <Text style={styles.modalOptionText}>Heaviest</Text>
            </Pressable>
            <Pressable style={[styles.modalOption, tempFilterType === 'lightest' && styles.modalOptionActive]} onPress={() => setTempFilterType('lightest')}>
              <Text style={styles.modalOptionText}>Lightest</Text>
            </Pressable>
            <TouchableOpacity style={styles.applyButton} onPress={() => { setFilterType(tempFilterType); setFilterModalVisible(false); }}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {deleteModalVisible && (
        <Modal transparent={true} animationType="fade" visible={deleteModalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalContent}>
              <Text style={styles.modalTitle}>Confirm Delete</Text>
              <Text style={styles.deleteModalText}>Are you sure you want to delete this entry?</Text>
              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setDontAskAgain(!dontAskAgain)}>
                <View style={[styles.checkbox, dontAskAgain && styles.checkboxChecked]}>
                  {dontAskAgain && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxLabel}>Don't ask me again</Text>
              </TouchableOpacity>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => { setDeleteModalVisible(false); setPendingDeleteId(null); }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButtonModal} onPress={() => { if (pendingDeleteId) { handleDeleteEntry(pendingDeleteId); } setDeleteModalVisible(false); setPendingDeleteId(null); }}>
                  <Text style={styles.deleteButtonModalText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  listContainer: { paddingBottom: 20 },
  listHeaderContainer: { marginTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  backIcon: { marginRight: 10 },
  headerTitle: { fontSize: 28, color: '#fff', fontWeight: '700' },
  cardWrapper: { position: 'relative', marginHorizontal: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4
  },
  cardTitle: { fontSize: 20, color: '#fff', fontWeight: '600', marginBottom: 15, textAlign: 'center' },
  inputRow: { flexDirection: 'row', marginBottom: 15 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18
  },
  weightInput: { flex: 2, marginRight: 10 },
  unitButton: {
    flex: 1,
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  unitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15
  },
  dateText: { color: '#fff', fontSize: 18, marginLeft: 10 },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#302b63',
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 10 },
  toastContainer: {
    position: 'absolute',
    bottom: -40,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 10
  },
  toastText: { fontSize: 16 },
  toastSuccess: { color: '#4BB543' },
  toastError: { color: '#FF3333' },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 10 },
  historyTitle: { fontSize: 22, color: '#fff', fontWeight: '600' },
  filterButton: { backgroundColor: '#FF5F6D', padding: 8, borderRadius: 8 },
  noEntriesText: { color: '#ccc', fontSize: 16, textAlign: 'center', marginTop: 20 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemWeight: { color: '#fff', fontSize: 18, marginLeft: 10, fontWeight: '500' },
  itemDate: { color: '#ccc', fontSize: 14 },
  separator: { height: 10 },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 10,
    marginVertical: 5
  },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#302b63',
    borderRadius: 10,
    padding: 20,
    width: '80%'
  },
  modalTitle: { fontSize: 22, color: '#FFC371', textAlign: 'center', marginBottom: 20 },
  modalOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  modalOptionActive: { backgroundColor: '#FF5F6D' },
  modalOptionText: { color: '#fff', fontSize: 16 },
  applyButton: {
    backgroundColor: '#FFC371',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10
  },
  applyButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center'
  },
  deleteModalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: { backgroundColor: '#FF5F6D' },
  checkboxLabel: { fontSize: 16, color: '#333' },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    flex: 1,
    alignItems: 'center'
  },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
  deleteButtonModal: {
    backgroundColor: '#FF5F6D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center'
  },
  deleteButtonModalText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default WeightTrackerScreen;
