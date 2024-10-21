
import React, { useState, useRef } from 'react';
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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { VictoryChart, VictoryLine } from 'victory-native';
import Svg from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';
import { MaterialIcons } from '@expo/vector-icons';
import NotificationPanel from '../components/NotificationPanel';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Personal Record!',
      message: 'Congratulations! You lifted 200lbs today.',
      read: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), 
    },
    {
      id: '2',
      title: 'Workout Streak!',
      message: 'You have completed workouts for 7 days in a row.',
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), 
    },
    {
      id: '3',
      title: 'Monthly Goal Achieved',
      message: 'Great job! You achieved your monthly workout goal.',
      read: false,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
    },
  ]);
  const [isNotificationPanelVisible, setNotificationPanelVisible] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = () => {
    setNotificationPanelVisible(true);
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.topBar}>
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handleNotificationPress}
                >
                  <MaterialIcons name="notifications" size={28} color="#ffffff" />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.push('SettingsScreen')}
                >
                  <MaterialIcons name="settings" size={28} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.welcomeContainer}>
              <LottieView
                source={require('../assets/animations/welcome_animation.json')}
                autoPlay
                loop
                style={styles.welcomeAnimation}
              />
              <Text style={styles.welcomeText}>Welcome Back!</Text>
            </View>

            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>5</Text>
                <Text style={styles.summaryLabel}>Workouts this Week</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>2,500</Text>
                <Text style={styles.summaryLabel}>Calories Burned</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>7</Text>
                <Text style={styles.summaryLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Weekly Progress</Text>
              <Svg width={width - 40} height={200}>
                <VictoryChart
                  height={200}
                  width={width - 40}
                  padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
                >
                  <VictoryLine
                    data={[
                      { day: 'Mon', workouts: 1 },
                      { day: 'Tue', workouts: 2 },
                      { day: 'Wed', workouts: 1 },
                      { day: 'Thu', workouts: 3 },
                      { day: 'Fri', workouts: 2 },
                      { day: 'Sat', workouts: 0 },
                      { day: 'Sun', workouts: 1 },
                    ]}
                    x="day"
                    y="workouts"
                    style={{
                      data: { stroke: '#FF5F6D', strokeWidth: 3 },
                    }}
                    animate={{
                      duration: 2000,
                      onLoad: { duration: 1000 },
                    }}
                  />
                </VictoryChart>
              </Svg>
            </View>
              
              {/* Change this... */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>
                "Push yourself because no one else is going to do it for you."
              </Text>
            </View>

            <View style={styles.upcomingWorkoutContainer}>
              <Text style={styles.upcomingTitle}>Next Workout</Text>
              <Text style={styles.upcomingWorkoutText}>Full Body Blast</Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.push('WorkoutDetailScreen')}
              >
                <Text style={styles.startButtonText}>View Workout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isNotificationPanelVisible}
          onRequestClose={() => setNotificationPanelVisible(false)}
        >
          <NotificationPanel
            notifications={notifications}
            setNotifications={setNotifications}
            onClose={() => setNotificationPanelVisible(false)}
          />
        </Modal>

        <BottomNavBar index={index} setIndex={setIndex} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80, 
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 20,
  },
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
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeAnimation: {
    width: 150,
    height: 150,
  },
  welcomeText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  summaryNumber: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 5,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    marginTop: 30,
  },
  chartTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quoteContainer: {
    backgroundColor: '#FF5F6D',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    color: '#ffffff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  upcomingWorkoutContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  upcomingTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  upcomingWorkoutText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#FF5F6D',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  startButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default DashboardScreen;
