import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TextInput,
  Modal
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotificationService } from '../../services/NotificationService';

type RootStackParamList = {
  RoutineCalendarScreen: { routineToApply?: Routine } | undefined;
  DashboardScreen: undefined;
  WorkoutHistoryScreen: { highlightLogId?: string };
};

type DayWorkout = {
  name: string;
  status: 'scheduled' | 'completed' | 'missed';
  workoutLogId?: string;
};

interface Routine {
  name: string;
  type: 'fixedDays' | 'cycle';
  schedule: string[];
  cycleItems?: string[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAYS_TO_FILL = 30;
const SPACING = { xs: 8, sm: 12, md: 16, lg: 24 };
const STATUS_COLORS: { [key: string]: string } = {
  scheduled: '#3498db',
  completed: '#2ecc71',
  missed: '#e74c3c'
};

function getStatusIcon(status: string) {
  if (status === 'completed') return 'check-circle';
  if (status === 'missed') return 'highlight-off';
  return 'schedule';
}

const colorPalette = [
  '#3498db','#2ecc71','#e74c3c','#9b59b6','#f1c40f','#1abc9c',
  '#e67e22','#FF69B4','#8e44ad','#2c3e50','#FFC371','#4BB543'
];

export default function RoutineCalendarScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [allWorkouts, setAllWorkouts] = useState<{ [date: string]: DayWorkout[] }>({});
  const [allSavedWorkouts, setAllSavedWorkouts] = useState<{ id: string; name: string }[]>([]);
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [legendColors, setLegendColors] = useState<{ [workoutName: string]: string }>({});
  const [currentDate, setCurrentDate] = useState('');
  const [modalWorkouts, setModalWorkouts] = useState<DayWorkout[]>([]);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [showDayModal, setShowDayModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const notificationService = useNotificationService();

  useEffect(() => {
    loadData();
    checkWeeklyCompletion();
  }, []);

  useEffect(() => {
    const params = route.params as { routineToApply?: Routine };
    if (params?.routineToApply) {
      applyRoutine(params.routineToApply);
      navigation.setParams({ routineToApply: undefined });
    }
  }, [route.params]);

  async function loadData() {
    const dataWorkouts = await AsyncStorage.getItem('workouts');
    if (dataWorkouts) {
      const arr = JSON.parse(dataWorkouts).map((w: any) => ({ id: w.id, name: w.name }));
      setAllSavedWorkouts(arr);
    }
    const dataCalendar = await AsyncStorage.getItem('allCalendarWorkouts');
    if (dataCalendar) {
      const parsed = JSON.parse(dataCalendar);
      setAllWorkouts(parsed);
      setMarkedDates(generateMarkedDates(parsed));
    }
    const dataRoutines = await AsyncStorage.getItem('savedRoutines');
    if (dataRoutines) {
      setSavedRoutines(JSON.parse(dataRoutines));
    }
  }



  async function applyRoutine(routine: Routine) {
    const today = new Date();
    const updatedWorkouts = { ...allWorkouts };
    for (let i = 0; i < DAYS_TO_FILL; i++) {
      const loopDate = new Date();
      loopDate.setDate(today.getDate() + i);
      const dateString = formatDate(loopDate);
      if (loopDate < today || updatedWorkouts[dateString]?.length > 0) continue;
      let dayWorkout = '';
      if (routine.type === 'fixedDays') {
        dayWorkout = routine.schedule[loopDate.getDay()];
      } else {
        const cycleLength = routine.cycleItems?.length || 0;
        if (cycleLength === 0) continue;
        const dayInCycle = i % cycleLength;
        dayWorkout = routine.cycleItems![dayInCycle];
      }
      if (dayWorkout?.trim()) {
        updatedWorkouts[dateString] = [{ name: dayWorkout, status: 'scheduled' }];
      }
    }
    await AsyncStorage.setItem('allCalendarWorkouts', JSON.stringify(updatedWorkouts));
    setAllWorkouts(updatedWorkouts);
    setMarkedDates(generateMarkedDates(updatedWorkouts));
  }

  function generateMarkedDates(data: { [date: string]: DayWorkout[] }) {
    const finalMarked: { [key: string]: any } = {};
    const usedColors: { [key: string]: string } = {};
    Object.keys(data).forEach(date => {
      if (!finalMarked[date]) {
        finalMarked[date] = {
          dots: [],
          customStyles: {
            container: {
              backgroundColor: data[date].some(w => w.status === 'missed')
                ? 'rgba(231, 76, 60, 0.1)'
                : data[date].some(w => w.status === 'completed')
                  ? 'rgba(46, 204, 113, 0.1)'
                  : 'transparent'
            }
          }
        };
      }
      data[date].forEach((workout, index) => {
        if (!usedColors[workout.name]) {
          usedColors[workout.name] =
            colorPalette[Object.keys(usedColors).length % colorPalette.length];
        }
        let dotColor = usedColors[workout.name];
        if (workout.status === 'missed') {
          dotColor = STATUS_COLORS.missed;
        } else if (workout.status === 'completed') {
          dotColor = STATUS_COLORS.completed;
        }
        finalMarked[date].dots.push({
          key: `${workout.name}-${index}`,
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
      finalMarked[todayStr].selectedColor = 'rgba(52, 152, 219, 0.2)';
    }
    return finalMarked;
  }

  const checkWeeklyCompletion = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const scheduledCount = Object.entries(allWorkouts)
      .filter(([date]) => new Date(date) >= startOfWeek)
      .reduce((acc, [_, workouts]) => acc + workouts.length, 0);
      
    const completedCount = Object.entries(allWorkouts)
      .filter(([date]) => new Date(date) >= startOfWeek)
      .reduce((acc, [_, workouts]) => 
        acc + workouts.filter(w => w.status === 'completed').length, 0);

    if (scheduledCount > 0 && scheduledCount === completedCount) {
      notificationService.notifyWeeklyStreak(1); 
    }
  };

  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function handleDayPress(day: DateData) {
    const list = allWorkouts[day.dateString] || [];
    const completedWorkouts = list.filter(w => w.status === 'completed');
    if (completedWorkouts.length > 0 && completedWorkouts[0].workoutLogId) {
      navigation.navigate('WorkoutHistoryScreen', {
        highlightLogId: completedWorkouts[0].workoutLogId
      });
      return;
    }
    setCurrentDate(day.dateString);
    setModalWorkouts(list);
    if (list.length === 0) {
      setShowAddModal(true);
    } else {
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

  async function clearFutureWorkouts() {
    const today = new Date();
    const updatedWorkouts = { ...allWorkouts };
    Object.keys(updatedWorkouts).forEach(dateStr => {
      const workoutDate = new Date(dateStr);
      if (workoutDate >= today) {
        updatedWorkouts[dateStr] = updatedWorkouts[dateStr].filter(
          w => w.status !== 'scheduled'
        );
        if (updatedWorkouts[dateStr].length === 0) {
          delete updatedWorkouts[dateStr];
        }
      }
    });
    await AsyncStorage.setItem('allCalendarWorkouts', JSON.stringify(updatedWorkouts));
    setAllWorkouts(updatedWorkouts);
    setMarkedDates(generateMarkedDates(updatedWorkouts));
  }

  async function switchRoutine(newRoutine: Routine) {
    await clearFutureWorkouts();
    await applyRoutine(newRoutine);
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
            <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Routine Calendar</Text>
          <TouchableOpacity onPress={() => setShowRoutineModal(true)} style={styles.headerBackButton}>
            <MaterialIcons name="auto-fix-high" size={24} color="#ffffff" />
          </TouchableOpacity>
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
            selectedDayBackgroundColor: '#3498db',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
            todayTextColor: '#3498db'
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
            <MaterialIcons name={getStatusIcon('completed')} size={20} color={STATUS_COLORS.completed} />
            <Text style={styles.legendStatusText}>Completed</Text>
            <View style={{ width: SPACING.md }} />
            <MaterialIcons name={getStatusIcon('missed')} size={20} color={STATUS_COLORS.missed} />
            <Text style={styles.legendStatusText}>Missed</Text>
            <View style={{ width: SPACING.md }} />
            <MaterialIcons name={getStatusIcon('scheduled')} size={20} color={STATUS_COLORS.scheduled} />
            <Text style={styles.legendStatusText}>Scheduled</Text>
          </View>
        </View>
        <Modal
          visible={showDayModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDayModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.sheetTitle}>{currentDate}</Text>
                <TouchableOpacity onPress={() => setShowDayModal(false)}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                {modalWorkouts.map((w, i) => (
                  <View style={styles.workoutRow} key={i.toString()}>
                    <Text style={styles.workoutText}>{w.name}</Text>
                    <TouchableOpacity style={styles.statusIcon} onPress={() => toggleStatus(i)}>
                      <MaterialIcons name={getStatusIcon(w.status)} size={24} color={STATUS_COLORS[w.status]} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeWorkout(i)}>
                      <MaterialIcons name="delete" size={24} color="#ff5f6d" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.addButtonSheet} onPress={handleAddWorkout}>
                <Text style={styles.addButtonText}>Add Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.sheetTitle}>Add Workout</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
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
              <ScrollView style={{ maxHeight: 300 }}>
                {allSavedWorkouts.map(w => (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.workoutItem}
                    onPress={() => {
                      saveNewWorkout(w.name);
                      setShowAddModal(false);
                    }}
                  >
                    <Text style={styles.workoutItemLabel}>{w.name}</Text>
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
        <Modal
          visible={showRoutineModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRoutineModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.sheetTitle}>Routine Management</Text>
                <TouchableOpacity onPress={() => setShowRoutineModal(false)}>
                  <MaterialIcons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, styles.clearButton]}
                onPress={async () => {
                  await clearFutureWorkouts();
                  setShowRoutineModal(false);
                }}
              >
                <MaterialIcons name="clear-all" size={24} color="#fff" />
                <Text style={styles.actionButtonText}>Clear Future Workouts</Text>
              </TouchableOpacity>
              <Text style={[styles.sheetSubtitle, { marginTop: SPACING.md }]}>
                Switch to a Different Routine
              </Text>
              <Text style={styles.sheetSubtext}>
                This will clear future scheduled workouts and apply the new routine
              </Text>
              <ScrollView style={{ maxHeight: 300, marginTop: SPACING.sm }}>
                {savedRoutines.map((routine, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.routineButton}
                    onPress={() => {
                      switchRoutine(routine);
                      setShowRoutineModal(false);
                    }}
                  >
                    <View style={styles.routineInfo}>
                      <Text style={styles.routineName}>{routine.name}</Text>
                      <Text style={styles.routineType}>
                        {routine.type === 'fixedDays' ? 'Weekly Schedule' : 'Cycle'}
                      </Text>
                    </View>
                    <MaterialIcons name="swap-horiz" size={24} color="#3498db" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
    justifyContent: 'space-between'
  },
  headerBackButton: {
    padding: SPACING.xs
  },
  headerTitle: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold'
  },
  calendar: {
    borderRadius: 10,
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.md
  },
  legendContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm
  },
  legendTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs
  },
  legendScroll: {
    marginBottom: SPACING.xs
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  legendColorBox: {
    width: 16,
    height: 16,
    marginRight: SPACING.xs,
    borderRadius: 4
  },
  legendText: {
    color: '#fff',
    fontSize: 14
  },
  legendStatusRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendStatusText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: SPACING.xs
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  sheetSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: SPACING.md
  },
  sheetSubtext: {
    color: '#999',
    fontSize: 12,
    marginTop: 2
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  workoutText: {
    color: '#fff',
    flex: 1,
    fontSize: 16
  },
  statusIcon: {
    marginRight: SPACING.sm
  },
  addButtonSheet: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#24243e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.md,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  addInput: {
    backgroundColor: '#3A3A3A',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    marginBottom: SPACING.xs
  },
  workoutItemLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: SPACING.sm
  },
  createWorkoutButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm
  },
  createWorkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.xs
  },
  chooseButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  chooseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.sm
  },
  clearButton: {
    backgroundColor: '#e74c3c'
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: SPACING.sm
  },
  routineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: '#3A3A3A',
    borderRadius: 12,
    marginBottom: SPACING.xs
  },
  routineInfo: {
    flex: 1
  },
  routineName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  routineType: {
    color: '#999',
    fontSize: 14,
    marginTop: 2
  }
});
