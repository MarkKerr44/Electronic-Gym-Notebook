import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomNavBar from '../components/BottomNavBar';
import NotificationPanel from '../components/NotificationPanel';
import { ThemeContext } from '../context/ThemeProvider';
import { getThemeColors } from '../context/themeHelpers';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function DashboardScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { gradient, textColor, boxBackground, accent } = getThemeColors(theme);
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
      navigation.navigate('UserProfileScreen');
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
    <LinearGradient colors={gradient} style={styles.gradientBackground}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.topBar}>
              <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
                  <MaterialIcons name="notifications" size={28} color={textColor} />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('UserProfileScreen')}>
                  <MaterialIcons name="account-circle" size={28} color={textColor} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SettingsScreen')}>
                  <MaterialIcons name="settings" size={28} color={textColor} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('RoutineCalendarScreen')}>
              <View style={[styles.calendarContainer, { backgroundColor: boxBackground }]}>
                <Text style={[styles.calendarTitle, { color: textColor }]}>Your Routine This Week</Text>
                <View style={styles.dayRow}>
                  {DAYS.map((day, i) => (
                    <View key={day} style={styles.dayCard}>
                      <Text style={[styles.dayName, { color: textColor }]}>{day}</Text>
                      <Text style={[styles.dayWorkout, { color: textColor }]}>{renderRoutineDay(i)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.setRoutineButton, { backgroundColor: accent }]} onPress={() => navigation.navigate('RoutineSetupScreen')}>
              <Text style={[styles.setRoutineButtonText, { color: '#ffffff' }]}>Set Routine</Text>
            </TouchableOpacity>
            <View style={[styles.upcomingWorkoutContainer, { backgroundColor: boxBackground }]}>
              <Text style={[styles.upcomingTitle, { color: textColor }]}>Next Workout</Text>
              <Text style={[styles.upcomingWorkoutText, { color: textColor }]}>{nextWorkout}</Text>
              <TouchableOpacity style={[styles.startButton, { backgroundColor: accent }]} onPress={() => {
                  if (nextWorkout === 'No upcoming workout set') return;
                  navigation.navigate('WorkoutDetailScreen');
                }}>
                <Text style={[styles.startButtonText, { color: '#ffffff' }]}>View Workout</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.weightTrackerButton, { backgroundColor: accent }]} onPress={() => navigation.navigate('WeightTrackerScreen')}>
              <Text style={[styles.weightTrackerButtonText, { color: '#ffffff' }]}>Go to Weight Tracker</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
        <Modal visible={isNotificationPanelVisible} transparent animationType="slide">
          <NotificationPanel notifications={notifications} setNotifications={setNotifications} onClose={() => setNotificationPanelVisible(false)} />
        </Modal>
        <Modal visible={showOnboarding} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: '#333333' }]}>
              <Text style={[styles.modalText, { color: '#ffffff' }]}>It's your first time here! Would you like to enter your info? (recommended)</Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: accent }]} onPress={() => handleOnboardingChoice(true)}>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: accent }]} onPress={() => handleOnboardingChoice(false)}>
                  <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>No</Text>
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
  badge: { position: 'absolute', right: -6, top: -6, backgroundColor: '#FF5F6D', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, minWidth: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  calendarContainer: { borderRadius: 12, padding: 15, marginTop: 20 },
  calendarTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCard: { width: 45, alignItems: 'center', marginBottom: 10 },
  dayName: { fontSize: 14, fontWeight: 'bold' },
  dayWorkout: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  setRoutineButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginTop: 20, alignSelf: 'center' },
  setRoutineButtonText: { fontSize: 16, fontWeight: '600' },
  upcomingWorkoutContainer: { borderRadius: 12, padding: 20, marginTop: 20, alignItems: 'center' },
  upcomingTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  upcomingWorkoutText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  startButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  startButtonText: { fontSize: 16, fontWeight: '600' },
  weightTrackerButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginTop: 20, alignSelf: 'center' },
  weightTrackerButtonText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', borderRadius: 16, padding: 20 },
  modalText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  modalButton: { borderRadius: 8, padding: 10, minWidth: 60, alignItems: 'center' },
});

export { DashboardScreen };
