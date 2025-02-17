import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OpeningScreen from './OpeningScreen';
import SignUpScreen from './SignUpScreen';
import SignInScreen from './SignInScreen';
import { DashboardScreen } from './DashboardScreen';
import WorkoutSelectionScreen from './WorkoutSelectionScreen';
import PoseEstimatorScreen from './PoseEstimatorScreen';
import ExerciseLibraryScreen from './ExerciseLibraryScreen';
import StartWorkoutScreen from './StartWorkout';
import { RoutineSetupScreen } from './RoutineSetupScreen';
import WorkoutHistoryScreen from './WorkoutHistoryScreen';
import WeightTrackerScreen from './WeightTrackerScreen';
import SettingsScreen from './SettingsScreen';
import MyWorkoutsScreen from './MyWorkoutsScreen';
import UserProfileScreen from './UserProfileScreen';
import ExerciseDetailScreen from './exercise/[exerciseId]';
import CreateWorkoutScreen from './createWorkout';
import { WorkoutDetailsScreen } from './WorkoutDetails';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }} testID="app-root">
      <NavigationContainer>
        <Stack.Navigator initialRouteName="OpeningScreen">
          <Stack.Screen name="OpeningScreen" component={OpeningScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ title: 'Sign Up' }} />
          <Stack.Screen name="SignInScreen" component={SignInScreen} options={{ title: 'Sign In' }} />
          <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={{ title: 'Dashboard' }} />
          <Stack.Screen name="WorkoutSelectionScreen" component={WorkoutSelectionScreen} options={{ title: 'Select Workout' }} />
          <Stack.Screen name="PoseEstimatorScreen" component={PoseEstimatorScreen} options={{ title: 'Pose Estimator' }} />
          <Stack.Screen name="ExerciseLibraryScreen" component={ExerciseLibraryScreen} options={{ title: 'Exercise Library' }} />
          <Stack.Screen name="StartWorkout" component={StartWorkoutScreen} options={{ title: 'Start Workout' }} />
          <Stack.Screen name="RoutineSetupScreen" component={RoutineSetupScreen} options={{ title: 'Routine Setup' }} />
          <Stack.Screen name="WorkoutHistoryScreen" component={WorkoutHistoryScreen} options={{ title: 'Workout History' }} />
          <Stack.Screen name="WeightTrackerScreen" component={WeightTrackerScreen} options={{ title: 'Weight Tracker' }} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
          <Stack.Screen name="MyWorkoutsScreen" component={MyWorkoutsScreen} options={{ title: 'My Workouts' }} />
          <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ title: 'User Profile' }} />
          <Stack.Screen name="ExerciseDetails" component={ExerciseDetailScreen} options={{ title: 'Exercise Detail' }} />
          <Stack.Screen name="createWorkout" component={CreateWorkoutScreen} options={{ title: 'Create Workout' }} />
          <Stack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} options={{ title: 'Workout Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
