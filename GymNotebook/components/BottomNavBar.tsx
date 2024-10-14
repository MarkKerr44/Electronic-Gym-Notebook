// components/BottomNavBar.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Easing,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface BottomNavBarProps {
  index: number;
  setIndex: (index: number) => void;
}

const tabs = [
  { key: 'home', title: 'Home', icon: 'home', screen: 'DashboardScreen' },
  {
    key: 'workout',
    title: 'Workout',
    icon: 'fitness-center',
    screen: 'WorkoutSelectionScreen',
  },
  {
    key: 'progress',
    title: 'Progress',
    icon: 'bar-chart',
    screen: 'GymEquipmentDetectorScreen',
  },
  {
    key: 'notes',
    title: 'Notes',
    icon: 'notes',
    screen: 'ExerciseLibraryScreen',
  },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ index, setIndex }) => {
  const { width } = Dimensions.get('window');
  const tabWidth = width / tabs.length;
  const translateValue = React.useRef(new Animated.Value(index * tabWidth)).current;
  const navigation = useNavigation();

  React.useEffect(() => {
    Animated.timing(translateValue, {
      toValue: index * tabWidth,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handleTabPress = (tabIndex: number) => {
    if (index === tabIndex) return;
    setIndex(tabIndex);
    navigation.navigate(tabs[tabIndex].screen as never);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#232526', '#414345']} // Dark gray gradient
        style={styles.gradientBackground}
      />

      {/* Tab Icons */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, tabIndex) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tabIndex)}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={tab.icon}
                size={30}
                color={index === tabIndex ? '#FFD700' : '#B0B0B0'} // Gold for active, light gray for inactive
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: index === tabIndex ? '#FFD700' : '#B0B0B0' },
                ]}
              >
                {tab.title}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Indicator */}
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            transform: [
              {
                translateX: translateValue,
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: 'transparent',
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
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  tabContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  tabButton: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width / tabs.length,
    height: 4,
    backgroundColor: '#FFD700', // Gold color for the active indicator
    left: 0,
  },
});

export default BottomNavBar;
