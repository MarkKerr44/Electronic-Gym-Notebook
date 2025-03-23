import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ExerciseSelectionModal from '../../src/components/ExerciseSelectionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

describe('ExerciseSelectionModal', () => {
    const mockProps = {
        visible: true,
        onClose: jest.fn(),
        onAddExercises: jest.fn(),
        onToggleExercise: jest.fn(),
        existingExerciseIds: new Set(['1']),
        defaultSets: '3',
        defaultReps: '10',
        defaultRest: '60'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(
            <ExerciseSelectionModal {...mockProps} />
        );

        expect(getByText('Select Exercises')).toBeTruthy();
        expect(getByText('Create Custom Exercise')).toBeTruthy();
        expect(getByPlaceholderText('Search exercises')).toBeTruthy();
    });

    it('handles search input', () => {
        const { getByPlaceholderText } = render(
            <ExerciseSelectionModal {...mockProps} />
        );

        const searchInput = getByPlaceholderText('Search exercises');
        fireEvent.changeText(searchInput, 'bench press');
        
        expect(searchInput.props.value).toBe('bench press');
    });


    it('handles custom exercise creation', async () => {
        const { getByText, getByPlaceholderText } = render(
            <ExerciseSelectionModal {...mockProps} />
        );

        fireEvent.press(getByText('Create Custom Exercise'));

        const input = getByPlaceholderText('Enter exercise name');
        fireEvent.changeText(input, 'My Custom Exercise');

        fireEvent.press(getByText('Create'));

        await waitFor(() => {
            expect(AsyncStorage.setItem).toHaveBeenCalled();
        });
    });

    it('handles exercise selection', () => {
        const { getByText } = render(
            <ExerciseSelectionModal {...mockProps} />
        );

        const exerciseName = 'Bench Press';
        fireEvent.press(getByText(exerciseName));

        expect(mockProps.onToggleExercise).toHaveBeenCalled();
    });

    it('handles adding selected exercises', () => {
        const { getByText } = render(
            <ExerciseSelectionModal {...mockProps} />
        );

        fireEvent.press(getByText('Add 0 Exercises'));

        expect(mockProps.onAddExercises).toHaveBeenCalledWith([]);
    });

});