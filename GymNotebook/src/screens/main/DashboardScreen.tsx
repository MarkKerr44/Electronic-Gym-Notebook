import React, { useContext, useState, useRef, useEffect } from 'react';
// Add the useFocusEffect hook to reload data when screen comes into focus
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomNavBar from '../../components/BottomNavBar';
import NotificationPanel from '../../components/NotificationPanel';
import { ThemeContext } from '../../context/ThemeProvider';
import { getThemeColors } from '../../context/themeHelpers';
import { useNotifications } from '../../context/NotificationContext';
import { workoutService } from '../../services/workoutService';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DayWorkout {
  name: string;
  status: 'scheduled' | 'completed' | 'missed';
  workoutLogId?: string;
}

interface WorkoutReference {
  id: string;
  name: string;
}

function DashboardScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { gradient, textColor, boxBackground, accent } = getThemeColors(theme);
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isNotificationPanelVisible, setNotificationPanelVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [routine, setRoutine] = useState([]);
  const [nextWorkout, setNextWorkout] = useState('Loading...');
  const [calendarWorkouts, setCalendarWorkouts] = useState<{[date: string]: DayWorkout[]}>({});
  const [nextWorkoutId, setNextWorkoutId] = useState<string | null>(null);
  const [weekDays, setWeekDays] = useState<{label: string, date: Date}[]>([]);

  // This effect runs only once at component mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    AsyncStorage.getItem('hasOnboarded').then(value => {
      if (value !== 'true') {
        setShowOnboarding(true);
      }
    }).catch(() => {
      setShowOnboarding(true);
    });
    
    // We'll remove loadRoutine() from here since we'll use useFocusEffect instead
  }, []);
  
  // Add this focus effect to reload data every time the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('Dashboard screen focused, reloading data...');
      loadRoutine();
      
      return () => {
        // Optional cleanup when screen loses focus
      };
    }, [])
  );

  // Update the weekDays calculation to also refresh on focus
  useFocusEffect(
    React.useCallback(() => {
      const generateWeekDays = () => {
        const today = new Date();
        const days = [];
        
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          
          days.push({
            label: DAYS[date.getDay()], 
            date: new Date(date) 
          });
        }
        
        setWeekDays(days);
      };
      
      generateWeekDays();
      
      // We'll handle the midnight update in the original useEffect
    }, [])
  );

  // Keep the original useEffect for the midnight timer
  useEffect(() => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeUntilMidnight = midnight.getTime() - new Date().getTime();
    
    const timer = setTimeout(() => {
      // Generate new weekdays at midnight
      const today = new Date();
      const days = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        days.push({
          label: DAYS[date.getDay()], 
          date: new Date(date) 
        });
      }
      
      setWeekDays(days);
    }, timeUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  // Update loadRoutine to properly clear old data and handle errors
  async function loadRoutine() {
    try {
      let userWorkouts: WorkoutReference[] = [];
      
      // Clear existing data first
      setRoutine([]);
      setNextWorkout('Loading...');
      setCalendarWorkouts({});
      
      // Try to fetch from Firestore first (preferred)
      try {
        console.log('Fetching workouts from Firestore...');
        const firestoreWorkouts = await workoutService.getUserWorkouts();
        if (firestoreWorkouts && firestoreWorkouts.length > 0) {
          userWorkouts = firestoreWorkouts.map(workout => ({
            id: workout.id,
            name: workout.name
          }));
          console.log(`Loaded ${userWorkouts.length} workouts from Firestore`);
        }
      } catch (firestoreError) {
        console.log('Could not load workouts from Firestore:', firestoreError);
      }
      
      // Load calendar data
      const calendarData = await AsyncStorage.getItem('allCalendarWorkouts');
      let parsedCalendar = {};
      
      if (calendarData) {
        parsedCalendar = JSON.parse(calendarData);
        console.log('Loaded calendar data:', Object.keys(parsedCalendar).length, 'days');
        setCalendarWorkouts(parsedCalendar);
      }
      
      // Use Firestore workouts if available, otherwise fall back to AsyncStorage
      if (userWorkouts.length > 0) {
        setRoutine(userWorkouts);
        const nextWorkoutInfo = calculateNextWorkout(
          userWorkouts,
          parsedCalendar
        );
        setNextWorkout(nextWorkoutInfo);
      } else {
        console.log('Falling back to AsyncStorage for routine data...');
        const stored = await AsyncStorage.getItem('userRoutine');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Loaded routine from AsyncStorage:', parsed.length, 'days');
          setRoutine(parsed);
          
          const nextWorkoutInfo = calculateNextWorkout(
            parsed,
            parsedCalendar
          );
          setNextWorkout(nextWorkoutInfo);
        } else {
          console.log('No routine data found in AsyncStorage');
          setRoutine([]);
          setNextWorkout('No upcoming workout set');
        }
      }
    } catch (error) {
      console.error('Error loading routine data:', error);
      setRoutine([]);
      setCalendarWorkouts({});
      setNextWorkout('No upcoming workout set');
    }
  }

  function calculateNextWorkout(basicRoutine: WorkoutReference[], calendarData: {[date: string]: DayWorkout[]}) {
    const today = new Date();
    const todayString = formatDate(today);
    
    if (calendarData[todayString]?.some(workout => 
        workout.status === 'scheduled' && workout.name !== 'Rest')) {
      const todayWorkouts = calendarData[todayString]
        .filter(w => w.status === 'scheduled' && w.name !== 'Rest');
      
      if (todayWorkouts.length > 0) {
        const firstWorkout = todayWorkouts[0];
        setNextWorkoutId(firstWorkout.id);
        return `Today: ${todayWorkouts.map(w => w.name).join(', ')}`;
      }
    }
    
    for (let i = 1; i <= 30; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      const dateString = formatDate(nextDate);
      
      if (calendarData[dateString]?.some(workout => 
          workout.status === 'scheduled' && workout.name !== 'Rest')) {
        const nextWorkouts = calendarData[dateString]
          .filter(w => w.status === 'scheduled' && w.name !== 'Rest');
        
        if (nextWorkouts.length > 0) {
          const firstWorkout = nextWorkouts[0];
          setNextWorkoutId(firstWorkout.id);
          
          const formattedDate = nextDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          });
          
          return `${formattedDate}: ${nextWorkouts.map(w => w.name).join(', ')}`;
        }
      }
    }
    
    if (basicRoutine && basicRoutine.length > 0) {
      const todayIndex = today.getDay();
      for (let i = 0; i < 7; i++) {
        const checkIndex = (todayIndex + i) % 7;
        if (basicRoutine[checkIndex] && basicRoutine[checkIndex].name && basicRoutine[checkIndex].name !== 'Rest') {
          setNextWorkoutId(basicRoutine[checkIndex].id);
          return `${DAYS[checkIndex]}: ${basicRoutine[checkIndex].name}`;
        }
      }
    }
    
    setNextWorkoutId(null);
    return 'No upcoming workout set';
  }
  
  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function handleNotificationPress() {
    setNotificationPanelVisible(true);
    markAllAsRead(); 
  }

  function renderRoutineDay(day: {label: string, date: Date}) {
    const dateString = formatDate(day.date);
    
    if (calendarWorkouts[dateString]?.length > 0) {
      const workouts = calendarWorkouts[dateString]
        .filter(w => w.name !== 'Rest')
        .map(w => w.name);
      
      if (workouts.length > 0) {
        if (workouts.length > 1) {
          return `${workouts.length} workouts`;
        }
        return workouts[0];
      } else {
        return calendarWorkouts[dateString].some(w => w.name === 'Rest') 
          ? 'Rest Day' 
          : 'Off Day';
      }
    }
    
    if (routine.length === 7) {
      const dayOfWeek = day.date.getDay(); 
      if (routine[dayOfWeek] && routine[dayOfWeek].name) {
        return routine[dayOfWeek].name;
      }
    }
    
    return 'Not Set';
  }

  function handleAsync(asyncFn: () => Promise<any>) {
    return () => {
      try {
        asyncFn();
      } catch (error) {
        console.error('Error in async handler:', error);
      }
    };
  }

  async function handleOnboardingChoice(accepted: boolean) {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
    } catch {}
    if (accepted) {
      navigation.navigate('UserProfileScreen');
    }
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
                  {weekDays.map((day, i) => (
                    <View key={i} style={styles.dayCard}>
                      <Text style={[styles.dayName, { color: textColor }]}>{day.label}</Text>
                      <Text 
                        style={[
                          styles.dayWorkout, 
                          { color: textColor },
                          i === 0 && styles.todayWorkout 
                        ]} 
                        numberOfLines={2} 
                        ellipsizeMode="tail"
                      >
                        {renderRoutineDay(day)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.setRoutineButton, { backgroundColor: accent }]} 
              onPress={() => navigation.navigate('RoutineSetupScreen')}
            >
              <Text style={[styles.setRoutineButtonText, { color: '#ffffff' }]}>Set Routine</Text>
            </TouchableOpacity>
            <View style={[styles.upcomingWorkoutContainer, { backgroundColor: boxBackground }]}>
              <Text style={[styles.upcomingTitle, { color: textColor }]}>Next Workout</Text>
              <Text style={[styles.upcomingWorkoutText, { color: textColor }]}>{nextWorkout}</Text>
              <TouchableOpacity 
                style={[
                  styles.startButton, 
                  { 
                    backgroundColor: accent,
                    opacity: nextWorkout === 'No upcoming workout set' ? 0.5 : 1 
                  }
                ]} 
                onPress={() => {
                  if (nextWorkout === 'No upcoming workout set' || !nextWorkoutId) return;
                  navigation.navigate('WorkoutDetails', { workoutId: nextWorkoutId });
                }}>
                <Text style={[styles.startButtonText, { color: '#ffffff' }]}>View Workout</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.weightTrackerButton, { backgroundColor: accent }]} 
              onPress={() => navigation.navigate('WeightTrackerScreen')}
            >
              <Text style={[styles.weightTrackerButtonText, { color: '#ffffff' }]}>Go to Weight Tracker</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
        <Modal visible={isNotificationPanelVisible} transparent animationType="slide">
          <NotificationPanel onClose={() => setNotificationPanelVisible(false)} />
        </Modal>
        <Modal visible={showOnboarding} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: '#333333' }]}>
              <Text style={[styles.modalText, { color: '#ffffff' }]}>
                It's your first time here! Would you like to enter your info? (recommended)
              </Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: accent }]} 
                  onPress={handleAsync(() => handleOnboardingChoice(true))}
                >
                  <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: accent }]} 
                  onPress={handleAsync(() => handleOnboardingChoice(false))}
                >
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
  dayWorkout: { fontSize: 12, marginTop: 4, textAlign: 'center', maxWidth: 45, height: 32 },
  todayWorkout: { fontWeight: 'bold', color: '#FFC371' },
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
