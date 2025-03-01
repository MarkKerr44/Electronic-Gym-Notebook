import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useNavigationState } from '@react-navigation/native';

const ACTIVE_COLOR = '#2196F3';

const tabs = [
  { key: 'home', title: 'Home', icon: 'home', route: 'DashboardScreen' },
  { key: 'workout', title: 'Workout', icon: 'fitness-center', route: 'WorkoutSelectionScreen' },
  { key: 'posture', title: 'Posture', icon: 'radar', route: 'PoseEstimatorScreen' },
  { key: 'library', title: 'Library', icon: 'menu-book', route: 'ExerciseLibraryScreen' },
];

const BottomNavBar: React.FC = () => {
  const navigation = useNavigation();
  const dimensions = Dimensions.get('window');
  const width = dimensions?.width ?? 400; // Provide fallback value
  const tabWidth = width / tabs.length;

  const routeIndex = useNavigationState((state) => {
    const currentRoute = state.routes[state.index];
    return tabs.findIndex((t) => t.route === currentRoute.name);
  });

  const translateValue = useRef(new Animated.Value(routeIndex * tabWidth)).current;

  useEffect(() => {
    Animated.timing(translateValue, {
      toValue: routeIndex * tabWidth,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [routeIndex, tabWidth, translateValue]);

  const handleTabPress = (tabIndex: number) => {
    navigation.navigate(tabs[tabIndex].route as never);
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          testID={`tab-${tab.key}`}
          style={[
            styles.tab,
            routeIndex === tabs.findIndex(t => t.route === tab.route) && styles.activeTab
          ]}
          onPress={() => navigation.navigate(tab.route)}
        >
          <MaterialIcons
            name={tab.icon}
            size={24}
            color={routeIndex === tabs.findIndex(t => t.route === tab.route) ? ACTIVE_COLOR : '#B0B0B0'}
          />
          <Text style={[
            styles.tabText,
            routeIndex === tabs.findIndex(t => t.route === tab.route) && styles.activeTabText
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 4,
    backgroundColor: ACTIVE_COLOR,
    borderRadius: 2,
  },
  activeIcon: {
    shadowColor: '#2196F3',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  activeTab: {
    borderTopColor: ACTIVE_COLOR,
    borderTopWidth: 2
  },
  activeTabText: {
    color: ACTIVE_COLOR
  }
});

export default BottomNavBar;
