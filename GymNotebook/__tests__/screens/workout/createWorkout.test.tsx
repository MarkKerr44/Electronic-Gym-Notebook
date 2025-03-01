import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateWorkoutScreen from '../../../src/screens/workout/createWorkout';
import { workoutService } from '../../../src/services/workoutService';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  })
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-draggable-flatlist', () => 'DraggableFlatList');

jest.mock('../../../src/services/workoutService', () => ({
  workoutService: {
    saveWorkout: jest.fn()
  }
}));

jest.spyOn(Alert, 'alert');

describe('CreateWorkoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<CreateWorkoutScreen />);
    
    expect(getByText('Create Workout')).toBeTruthy();
    expect(getByPlaceholderText('Enter workout name')).toBeTruthy();
    expect(getByText('Add Exercises')).toBeTruthy();
  });

  it('validates workout name before saving', async () => {
    const { getByText } = render(<CreateWorkoutScreen />);
    
    const saveButton = getByText('Save Workout');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Please enter a workout name.');
    });
  });

  it('validates exercises before saving', async () => {
    const { getByText, getByPlaceholderText } = render(<CreateWorkoutScreen />);
    
    const nameInput = getByPlaceholderText('Enter workout name');
    fireEvent.changeText(nameInput, 'Test Workout');
    
    const saveButton = getByText('Save Workout');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Please add at least one exercise.');
    });
  });

  it('shows success message after saving workout', async () => {
    const mockExercise = {
      id: '1',
      name: 'Squat',
      sets: 3,
      reps: 10,
      rest: 60,
      primaryMuscles: ['quadriceps'],
      secondaryMuscles: ['glutes'],
      equipment: 'barbell',
      level: 'intermediate',
      category: 'strength',
      instructions: []
    };

    const { getByText, getByPlaceholderText, rerender } = render(
      <CreateWorkoutScreen initialExercises={[mockExercise]} />
    );
      
    const nameInput = getByPlaceholderText('Enter workout name');
    fireEvent.changeText(nameInput, 'Test Workout');

    (workoutService.saveWorkout as jest.Mock).mockResolvedValueOnce('workout-id');
      
    const saveButton = getByText('Save Workout');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Workout saved successfully!',
        expect.any(Array)
      );
    });

    expect(workoutService.saveWorkout).toHaveBeenCalledWith({
      name: 'Test Workout',
      exercises: [mockExercise]
    });
  });

  it('handles errors when saving workout', async () => {
    const mockExercise = {
      id: '1',
      name: 'Squat',
      sets: 3,
      reps: 10,
      rest: 60,
      primaryMuscles: ['quadriceps'],
      secondaryMuscles: ['glutes'],
      equipment: 'barbell',
      level: 'intermediate',
      category: 'strength',
      instructions: []
    };

    const { getByText, getByPlaceholderText } = render(
      <CreateWorkoutScreen initialExercises={[mockExercise]} />
    );
    
    // Setup workout data
    const nameInput = getByPlaceholderText('Enter workout name');
    fireEvent.changeText(nameInput, 'Test Workout');
    
    // Mock failed save
    (workoutService.saveWorkout as jest.Mock).mockRejectedValueOnce(new Error('Save failed'));
    
    const saveButton = getByText('Save Workout');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to save workout. Please try again.'
      );
    });

    // Verify workout service was called
    expect(workoutService.saveWorkout).toHaveBeenCalledWith({
      name: 'Test Workout',
      exercises: [mockExercise]
    });
  });

  it('switches between view modes correctly', () => {
    const { getByText } = render(<CreateWorkoutScreen />);
    
    const viewButton = getByText('View');
    fireEvent.press(viewButton);
    expect(getByText('Selected Exercises')).toBeTruthy();
    
    const statsButton = getByText('Stats');
    fireEvent.press(statsButton);
    expect(getByText('Workout Stats')).toBeTruthy();
    
    const exercisesButton = getByText('Exercises');
    fireEvent.press(exercisesButton);
    expect(getByText('Default Settings')).toBeTruthy();
  });
});