import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationPanel from '../components/NotificationPanel';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelVisible, setNotificationPanelVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [routine, setRoutine] = useState([]);
  const [nextWorkout, setNextWorkout] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    setShowOnboarding(true);
    loadNotifications();
    loadRoutine();
  }, []);

  async function loadNotifications() {
    const data = [];
    setNotifications(data);
  }

  async function loadRoutine() {
    try {
      const stored = await AsyncStorage.getItem('userRoutine');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRoutine(parsed);
        setNextWorkout(calculateNextWorkout(parsed));
      } else {
        setRoutine([]);
        setNextWorkout('No upcoming workout set');
      }
    } catch {
      setRoutine([]);
      setNextWorkout('No upcoming workout set');
    }
  }

  function calculateNextWorkout(r) {
    const todayIndex = new Date().getDay();
    for (let i = 0; i < 7; i++) {
      const checkIndex = (todayIndex + i) % 7;
      if (r[checkIndex] && r[checkIndex].trim().length > 0) {
        return `${DAYS[checkIndex]}: ${r[checkIndex]}`;
      }
    }
    return 'No upcoming workout set';
  }

  async function handleOnboardingChoice(accepted) {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
    } catch {}
    if (accepted) {
      router.push('/UserProfileScreen');
    }
  }

  function handleNotificationPress() {
    setNotificationPanelVisible(true);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  function renderRoutineDay(dayIndex) {
    if (routine.length === 7 && routine[dayIndex]) {
      return routine[dayIndex].trim().length > 0 ? routine[dayIndex] : 'Off Day';
    }
    return 'Not Set';
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.topBar}>
              <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
                  <MaterialIcons name="notifications" size={28} color="#ffffff" />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push('/UserProfileScreen')}
                >
                  <MaterialIcons name="account-circle" size={28} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push('SettingsScreen')}
                >
                  <MaterialIcons name="settings" size={28} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.calendarContainer}>
              <Text style={styles.calendarTitle}>Your Routine This Week</Text>
              <View style={styles.dayRow}>
                {DAYS.map((day, i) => (
                  <View key={day} style={styles.dayCard}>
                    <Text style={styles.dayName}>{day}</Text>
                    <Text style={styles.dayWorkout}>{renderRoutineDay(i)}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.setRoutineButton}
                onPress={() => router.push('/RoutineSetupScreen')}
              >
                <Text style={styles.setRoutineButtonText}>Set Routine</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.upcomingWorkoutContainer}>
              <Text style={styles.upcomingTitle}>Next Workout</Text>
              <Text style={styles.upcomingWorkoutText}>{nextWorkout}</Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                  if (nextWorkout === 'No upcoming workout set') return;
                  router.push('WorkoutDetailScreen');
                }}
              >
                <Text style={styles.startButtonText}>View Workout</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.weightTrackerButton}
              onPress={() => router.push('WeightTrackerScreen')}
            >
              <Text style={styles.weightTrackerButtonText}>Go to Weight Tracker</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
        <Modal visible={isNotificationPanelVisible} transparent animationType="slide">
          <NotificationPanel
            notifications={notifications}
            setNotifications={setNotifications}
            onClose={() => setNotificationPanelVisible(false)}
          />
        </Modal>
        <Modal visible={showOnboarding} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                It's your first time here! Would you like to enter your info? (recommended)
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalButton} onPress={() => handleOnboardingChoice(true)}>
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => handleOnboardingChoice(false)}>
                  <Text style={styles.modalButtonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <BottomNavBar index={index} setIndex={setIndex} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: { paddingBottom: 80 },
  container: { flex: 1, paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 10, paddingTop: 10 },
  iconContainer: { flexDirection: 'row' },
  iconButton: { marginLeft: 20 },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  calendarContainer: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 15, marginTop: 20 },
  calendarTitle: { fontSize: 18, color: '#ffffff', fontWeight: 'bold', marginBottom: 10 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCard: {
    width: 45,
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
  dayWorkout: { fontSize: 12, color: '#fff', marginTop: 4, textAlign: 'center' },
  setRoutineButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  setRoutineButtonText: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  upcomingWorkoutContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  upcomingTitle: { fontSize: 18, color: '#ffffff', fontWeight: 'bold', marginBottom: 10 },
  upcomingWorkoutText: { fontSize: 16, color: '#ffffff', marginBottom: 20, textAlign: 'center' },
  startButton: { backgroundColor: '#FF5F6D', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  startButtonText: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  weightTrackerButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    alignSelf: 'center',
  },
  weightTrackerButtonText: { fontSize: 16, color: '#ffffff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#333333', borderRadius: 16, padding: 20 },
  modalText: { fontSize: 18, color: '#ffffff', marginBottom: 20, textAlign: 'center' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: { backgroundColor: '#FF5F6D', borderRadius: 8, padding: 10, minWidth: 60, alignItems: 'center' },
  modalButtonText: { color: '#ffffff', fontWeight: 'bold' },
});
