// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../context/ThemeProvider'; 
import OpeningScreen from './OpeningScreen';
import SignUpScreen from './SignUpScreen';
import SignInScreen from './SignInScreen';
import { DashboardScreen } from './DashboardScreen';
import WorkoutSelectionScreen from './WorkoutSelectionScreen';
import PoseEstimatorScreen from './PoseEstimatorScreen';
import ExerciseLibraryScreen from './ExerciseLibraryScreen';
import StartWorkoutScreen from './StartWorkout';
import RoutineSetupScreen from './RoutineSetupScreen';
import WorkoutHistoryScreen from './WorkoutHistoryScreen';
import WeightTrackerScreen from './WeightTrackerScreen';
import SettingsScreen from './SettingsScreen';
import MyWorkoutsScreen from './MyWorkoutsScreen';
import UserProfileScreen from './UserProfileScreen';
import ExerciseDetailScreen from './exercise/[exerciseId]';
import CreateWorkoutScreen from './createWorkout';
import { WorkoutDetailsScreen } from './WorkoutDetails';
import AppearanceScreen from './AppearanceScreen';
import AccountScreen from './AccountScreen';
import RoutineCalendarScreen from './RoutineCalendarScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }} testID="app-root">
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="OpeningScreen"
            screenOptions={{ animation: 'none',
              headerShown: false
             }}
          >
            <Stack.Screen
              name="OpeningScreen"
              component={OpeningScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUpScreen"
              component={SignUpScreen}
              options={{ title: 'Sign Up' }}
            />
            <Stack.Screen
              name="SignInScreen"
              component={SignInScreen}
              options={{ title: 'Sign In' }}
            />
            <Stack.Screen
              name="DashboardScreen"
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen
              name="WorkoutSelectionScreen"
              component={WorkoutSelectionScreen}
              options={{ title: 'Select Workout' }}
            />
            <Stack.Screen
              name="PoseEstimatorScreen"
              component={PoseEstimatorScreen}
              options={{ title: 'Pose Estimator' }}
            />
            <Stack.Screen
              name="ExerciseLibraryScreen"
              component={ExerciseLibraryScreen}
              options={{ title: 'Exercise Library' }}
            />
            <Stack.Screen
              name="StartWorkout"
              component={StartWorkoutScreen}
              options={{ title: 'Start Workout' }}
            />
            <Stack.Screen
              name="RoutineSetupScreen"
              component={RoutineSetupScreen}
              options={{ title: 'Routine Setup' }}
            />
            <Stack.Screen
              name="WorkoutHistoryScreen"
              component={WorkoutHistoryScreen}
              options={{ title: 'Workout History' }}
            />
            <Stack.Screen
              name="WeightTrackerScreen"
              component={WeightTrackerScreen}
              options={{ title: 'Weight Tracker' }}
            />
            <Stack.Screen
              name="SettingsScreen"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen
              name="MyWorkoutsScreen"
              component={MyWorkoutsScreen}
              options={{ title: 'My Workouts' }}
            />
            <Stack.Screen
              name="UserProfileScreen"
              component={UserProfileScreen}
              options={{ title: 'User Profile' }}
            />
            <Stack.Screen
              name="ExerciseDetails"
              component={ExerciseDetailScreen}
              options={{ title: 'Exercise Detail' }}
            />
            <Stack.Screen
              name="createWorkout"
              component={CreateWorkoutScreen}
              options={{ title: 'Create Workout' }}
            />
            <Stack.Screen
              name="WorkoutDetails"
              component={WorkoutDetailsScreen}
              options={{ title: 'Workout Details' }}
            />
            <Stack.Screen
              name="AppearanceScreen"
              component={AppearanceScreen}
              options={{ title: 'Appearance' }}
            />
            <Stack.Screen
              name="AccountScreen"
              component={AccountScreen}
              options={{ title: 'Account' }}
            />
            <Stack.Screen
              name="RoutineCalendarScreen"
              component={RoutineCalendarScreen}
              options={{ title: 'Routine Calendar' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
