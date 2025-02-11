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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface BottomNavBarProps {
  index: number;
  setIndex: (index: number) => void;
}

const ACTIVE_COLOR = '#2196F3';

const tabs = [
  { key: 'home', title: 'Home', icon: 'home', route: 'DashboardScreen' },
  { key: 'workout', title: 'Workout', icon: 'fitness-center', route: 'WorkoutSelectionScreen' },
  {
    key: 'posture',
    title: 'Posture',
    icon: 'radar',
    route: 'PoseEstimatorScreen',
  },
  {
    key: 'library',
    title: 'Library',
    icon: 'menu-book',
    route: 'ExerciseLibraryScreen',
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
  }, [index, tabWidth, translateValue]);

  const handleTabPress = (tabIndex: number) => {
    if (index === tabIndex) return;
    setIndex(tabIndex);
    navigation.navigate(tabs[tabIndex].route);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#232526', '#414345']}
        style={styles.gradientBackground}
      />

      <View style={styles.tabContainer}>
        {tabs.map((tab, tabIndex) => {
          const isActive = index === tabIndex;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tabIndex)}
              style={styles.tabButton}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name={tab.icon}
                  size={30}
                  color={isActive ? ACTIVE_COLOR : '#B0B0B0'}
                  style={isActive && styles.activeIcon}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? ACTIVE_COLOR : '#B0B0B0' },
                  ]}
                >
                  {tab.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.activeIndicator,
          {
            width: tabWidth,
            transform: [{ translateX: translateValue }],
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
    paddingHorizontal: 20,
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
});

export default BottomNavBar;
