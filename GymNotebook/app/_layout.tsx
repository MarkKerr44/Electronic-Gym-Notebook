import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Stack>
        <Stack.Screen name="DashboardScreen" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="WorkoutSelectionScreen" options={{ title: 'Workouts' }} />
        <Stack.Screen name="PoseEstimatorScreen" options={{ title: 'Posture' }} />
        <Stack.Screen name="ExerciseLibraryScreen" options={{ title: 'Library' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
