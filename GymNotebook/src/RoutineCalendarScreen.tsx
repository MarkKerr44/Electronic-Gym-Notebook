import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal, Dimensions, TextInput } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  RoutineCalendarScreen: { routineToApply?: Routine } | undefined;
  DashboardScreen: undefined;
};

type DayWorkout = {
  name: string;
  status: 'scheduled' | 'completed' | 'missed';
};

interface Routine {
  name: string;
  type: 'fixedDays' | 'cycle';
  schedule: string[];
  cycleItems?: string[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAYS_TO_FILL = 30;

export default function RoutineCalendarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [allWorkouts, setAllWorkouts] = useState<{ [date: string]: DayWorkout[] }>({});
  const [allSavedWorkouts, setAllSavedWorkouts] = useState<{ id: string; name: string }[]>([]);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [modalWorkouts, setModalWorkouts] = useState<DayWorkout[]>([]);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [legendColors, setLegendColors] = useState<{ [workoutName: string]: string }>({});
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const colorPalette = [
    '#3498db','#2ecc71','#e74c3c','#9b59b6','#f1c40f','#1abc9c',
    '#e67e22','#FF69B4','#8e44ad','#2c3e50','#FFC371','#4BB543'
  ];

  useEffect(() => {
    loadSavedWorkouts();
    loadStoredCalendar();
    loadSavedRoutines();
  }, []);

  useEffect(() => {
    const params = route.params as { routineToApply?: Routine };
    if (params?.routineToApply) {
      applyRoutine(params.routineToApply);
      navigation.setParams({ routineToApply: undefined });
    }
  }, [route.params]);

  async function loadSavedWorkouts() {
    const data = await AsyncStorage.getItem('workouts');
    if (data) {
      const arr = JSON.parse(data);
      const minimal = arr.map((w: any) => ({ id: w.id, name: w.name }));
      setAllSavedWorkouts(minimal);
    }
  }

  async function loadStoredCalendar() {
    const data = await AsyncStorage.getItem('allCalendarWorkouts');
    if (data) {
      const parsed = JSON.parse(data);
      setAllWorkouts(parsed);
      setMarkedDates(generateMarkedDates(parsed));
    }
  }

  async function loadSavedRoutines() {
    try {
      const data = await AsyncStorage.getItem('savedRoutines');
      if (data) {
        setSavedRoutines(JSON.parse(data));
      }
    } catch (error) {}
  }


  useEffect(() => {
    const loadInitialData = async () => {
      await loadSavedWorkouts();
      await loadStoredCalendar();
      await loadSavedRoutines();
    };
    loadInitialData();
  }, []); 
  
  useEffect(() => {
    const params = route.params as { routineToApply?: Routine };
    if (params?.routineToApply) {
      applyRoutine(params.routineToApply);
      navigation.setParams({ routineToApply: undefined });
    }
  }, [route.params]); 

  async function applyRoutine(routine: Routine) {
    const today = new Date();
    const updatedWorkouts = { ...allWorkouts };
    
    for (let i = 0; i < DAYS_TO_FILL; i++) {
      const loopDate = new Date();
      loopDate.setDate(today.getDate() + i);
      const dateString = formatDate(loopDate);
  
      if (loopDate < today || updatedWorkouts[dateString]?.length > 0) {
        continue;
      }
  
      let dayWorkout: string;
      if (routine.type === 'fixedDays') {
        const dayOfWeek = loopDate.getDay(); 
        dayWorkout = routine.schedule[dayOfWeek];
      } else {
        const cycleLength = routine.cycleItems?.length || 0;
        if (cycleLength === 0) continue;
        const dayInCycle = i % cycleLength;
        dayWorkout = routine.cycleItems![dayInCycle];
      }
  
      if (dayWorkout?.trim()) {
        updatedWorkouts[dateString] = [{
          name: dayWorkout,
          status: 'scheduled'
        }];
      }
    }
  
    try {
      await AsyncStorage.setItem('allCalendarWorkouts', JSON.stringify(updatedWorkouts));
      setAllWorkouts(updatedWorkouts);
      setMarkedDates(generateMarkedDates(updatedWorkouts));
      setShowRoutineModal(false);
    } catch (error) {
      console.error('Failed to save routine:', error);
    }
  }
  

  function generateMarkedDates(data: { [date: string]: DayWorkout[] }) {
    const finalMarked: { [key: string]: any } = {};
    const usedColors: { [key: string]: string } = {};

    Object.keys(data).forEach(date => {
      if (!finalMarked[date]) finalMarked[date] = { dots: [] };
      data[date].forEach(workout => {
        if (!usedColors[workout.name]) {
          usedColors[workout.name] =
            colorPalette[Object.keys(usedColors).length % colorPalette.length];
        }
        let dotColor = usedColors[workout.name];
        if (workout.status === 'missed') {
          dotColor = '#555';
        }
        finalMarked[date].dots.push({
          key: workout.name,
          color: dotColor,
          selectedDotColor: dotColor
        });
      });
    });

    setLegendColors(usedColors);

    const today = new Date();
    const todayStr = formatDate(today);
    if (finalMarked[todayStr]) {
      finalMarked[todayStr].selected = true;
      finalMarked[todayStr].selectedColor = '#3c40c6';
    }
    return finalMarked;
  }

  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function handleDayPress(day: DateData) {
    const list = allWorkouts[day.dateString] || [];
    setCurrentDate(day.dateString);
    if (list.length === 0) {
      setModalWorkouts([]);
      setShowAddModal(true);
    } else {
      setModalWorkouts(list);
      setShowDayModal(true);
    }
  }

  function handleAddWorkout() {
    setNewWorkoutName('');
    setShowAddModal(true);
  }

  function saveNewWorkout(name: string) {
    const arr = [...modalWorkouts];
    arr.push({ name, status: 'scheduled' });
    const updatedAll = { ...allWorkouts, [currentDate]: arr };
    setAllWorkouts(updatedAll);
    setModalWorkouts(arr);
    setMarkedDates(generateMarkedDates(updatedAll));
    AsyncStorage.setItem('allCalendarWorkouts', JSON.stringify(updatedAll));
  }

  function removeWorkout(i: number) {
    const arr = [...modalWorkouts];
    arr.splice(i, 1);
    const updatedAll = { ...allWorkouts, [currentDate]: arr };
    setAllWorkouts(updatedAll);
    setModalWorkouts(arr);
    setMarkedDates(generateMarkedDates(updatedAll));
    AsyncStorage.setItem('allCalendarWorkouts', JSON.stringify(updatedAll));
  }

  function toggleStatus(i: number) {
    const arr = [...modalWorkouts];
    const current = arr[i].status;
    if (current === 'scheduled') arr[i].status = 'completed';
    else if (current === 'completed') arr[i].status = 'missed';
    else arr[i].status = 'scheduled';
    const updatedAll = { ...allWorkouts, [currentDate]: arr };
    setAllWorkouts(updatedAll);
    setModalWorkouts(arr);
    setMarkedDates(generateMarkedDates(updatedAll));
    AsyncStorage.setItem('allCalendarWorkouts', JSON.stringify(updatedAll));
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Routine Calendar</Text>
          <View style={{ width: 24 }} />
        </View>
        <Calendar
          style={styles.calendar}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: '#24243e',
            calendarBackground: '#24243e',
            textSectionTitleColor: '#ffffff',
            dayTextColor: '#ffffff',
            monthTextColor: '#ffffff',
            arrowColor: '#ffffff',
            textDisabledColor: '#777',
            selectedDayBackgroundColor: '#3c40c6',
            textDayFontSize: 18,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14
          }}
        />
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <ScrollView horizontal style={styles.legendScroll}>
            {Object.keys(legendColors).map(name => (
              <View style={styles.legendItem} key={name}>
                <View style={[styles.legendColorBox, { backgroundColor: legendColors[name] }]} />
                <Text style={styles.legendText}>{name}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.legendStatusRow}>
            <View style={[styles.legendStatusBox, { backgroundColor: '#4BB543' }]} />
            <Text style={styles.legendStatusText}>Completed</Text>
            <View style={[styles.legendStatusBox, { backgroundColor: '#555', marginLeft: 20 }]} />
            <Text style={styles.legendStatusText}>Missed</Text>
            <View style={[styles.legendStatusBox, { backgroundColor: '#999', marginLeft: 20 }]} />
            <Text style={styles.legendStatusText}>Scheduled</Text>
          </View>
        </View>
        <Modal visible={showDayModal} transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.addModalInner}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{currentDate}</Text>
                <TouchableOpacity
                  style={styles.modalCloseIcon}
                  onPress={() => setShowDayModal(false)}
                >
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 300, marginBottom: 10 }}>
                {modalWorkouts.map((w, i) => (
                  <View style={styles.workoutRow} key={i.toString()}>
                    <Text style={styles.workoutText}>{w.name}</Text>
                    <TouchableOpacity onPress={() => toggleStatus(i)} style={styles.statusButton}>
                      <Text style={styles.statusButtonText}>{w.status}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeWorkout(i)} style={styles.removeButton}>
                      <MaterialIcons name="delete" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={handleAddWorkout} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={showAddModal} transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.addModalInner, { width: SCREEN_WIDTH * 0.9 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Workout</Text>
                <TouchableOpacity
                  style={styles.modalCloseIcon}
                  onPress={() => setShowAddModal(false)}
                >
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.addInput}
                placeholder="Search workouts..."
                placeholderTextColor="#999"
                value={newWorkoutName}
                onChangeText={setNewWorkoutName}
              />
              <ScrollView style={styles.workoutsList} showsVerticalScrollIndicator={false}>
                {allSavedWorkouts.map(w => (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.workoutItem}
                    onPress={() => {
                      saveNewWorkout(w.name);
                      setShowAddModal(false);
                    }}
                  >
                    <View style={styles.workoutItemContent}>
                      <MaterialIcons name="fitness-center" size={24} color="#fff" />
                      <Text style={styles.workoutItemText}>{w.name}</Text>
                    </View>
                    <MaterialIcons name="add-circle" size={24} color="#3498db" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.createWorkoutButton}
                onPress={() => {
                  if (newWorkoutName.trim()) {
                    saveNewWorkout(newWorkoutName.trim());
                    setNewWorkoutName('');
                  }
                  setShowAddModal(false);
                }}
              >
                <MaterialIcons name="add" size={24} color="#fff" />
                <Text style={styles.createWorkoutButtonText}>Create New Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={showRoutineModal} transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.addModalInner}>
              <Text style={styles.modalTitle}>Apply Routine</Text>
              <Text style={styles.modalText}>
                This will fill your calendar for the next {DAYS_TO_FILL} days
              </Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {savedRoutines.map((routine, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.chooseButton}
                    onPress={() => applyRoutine(routine)}
                  >
                    <Text style={styles.chooseButtonText}>{routine.name}</Text>
                    <Text style={styles.legendText}>
                      {routine.type === 'fixedDays' ? 'Weekly Schedule' : 'Cycle'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowRoutineModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  headerBackButton: { padding: 10 },
  headerTitle: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  calendar: { borderRadius: 10, marginHorizontal: 10, marginBottom: 20 },
  legendContainer: { paddingHorizontal: 20, marginBottom: 10 },
  legendTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  legendScroll: { marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  legendColorBox: { width: 16, height: 16, marginRight: 5, borderRadius: 4 },
  legendText: { color: '#fff', fontSize: 14 },
  legendStatusRow: { flexDirection: 'row', alignItems: 'center' },
  legendStatusBox: { width: 16, height: 16, borderRadius: 4 },
  legendStatusText: { color: '#fff', fontSize: 14, marginLeft: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  addModalInner: {
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    padding: 20,
    maxHeight: SCREEN_WIDTH * 1.1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 15
  },
  modalCloseIcon: { padding: 5 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  modalText: { color: '#fff', fontSize: 16, marginBottom: 15, textAlign: 'center' },
  workoutsList: { maxHeight: SCREEN_WIDTH * 0.7 },
  addInput: {
    backgroundColor: '#3A3A3A',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    marginBottom: 10
  },
  workoutItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  workoutItemText: { color: '#fff', fontSize: 16, marginLeft: 15, fontWeight: '500' },
  createWorkoutButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  createWorkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  chooseButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8
  },
  chooseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalCloseButton: {
    backgroundColor: '#ff5f6d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10
  },
  modalCloseButtonText: { color: '#fff', fontWeight: 'bold' },
  workoutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  workoutText: { color: '#fff', flex: 1, fontSize: 16 },
  statusButton: { backgroundColor: '#555', borderRadius: 8, padding: 8, marginRight: 8 },
  statusButtonText: { color: '#fff' },
  removeButton: { backgroundColor: '#ff5f6d', borderRadius: 8, padding: 8 },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
