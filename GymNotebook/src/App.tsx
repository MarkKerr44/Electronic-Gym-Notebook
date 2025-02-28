// App.tsx
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './context/ThemeProvider'; 
import { NotificationProvider } from './context/NotificationContext';
import OpeningScreen from './screens/auth/OpeningScreen';
import SignUpScreen from './screens/auth/SignUpScreen';
import SignInScreen from './screens/auth/SignInScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import AccountScreen from './screens/auth/AccountScreen';
import { DashboardScreen } from './screens/main/DashboardScreen';
import WorkoutSelectionScreen from './screens/workout/WorkoutSelectionScreen';
import StartWorkoutScreen from './screens/workout/StartWorkout';
import WorkoutHistoryScreen from './screens/workout/WorkoutHistoryScreen';
import RoutineSetupScreen from './screens/workout/RoutineSetupScreen';
import MyWorkoutsScreen from './screens/workout/MyWorkoutsScreen';
import CreateWorkoutScreen from './screens/workout/createWorkout';
import { WorkoutDetailsScreen } from './screens/workout/WorkoutDetails';
import RoutineCalendarScreen from './screens/workout/RoutineCalendarScreen';
import WeightTrackerScreen from './screens/analytics/WeightTrackerScreen';
import ExerciseAnalyticsScreen from './screens/analytics/ExerciseAnalyticsScreen';
import ExerciseStatsScreen from './screens/analytics/ExerciseStatsScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import UserProfileScreen from './screens/auth/UserProfileScreen';
import AppearanceScreen from './screens/settings/AppearanceScreen';
import PoseEstimatorScreen from './screens/pose/PoseEstimatorScreen';
import ExerciseLibraryScreen from './screens/exercise/ExerciseLibraryScreen';
import ExerciseDetailScreen from './screens/exercise/[exerciseId]';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="OpeningScreen" screenOptions={{ animation: 'none', headerShown: false }}>
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
              <Stack.Screen
                name="ExerciseAnalytics"
                component={ExerciseAnalyticsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ExerciseStatsScreen"
                component={ExerciseStatsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
                options={{ title: 'Forgot Password' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
}

export default App;
