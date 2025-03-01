import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import UserProfileScreen from '../../../src/screens/auth/UserProfileScreen';
import { userService } from '../../../src/services/userService';

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

jest.mock('../../../src/services/userService', () => ({
  userService: {
    getUserProfile: jest.fn(),
    saveUserProfile: jest.fn(),
  },
}));

describe('UserProfileScreen', () => {
  const mockProfile = {
    age: '25',
    sex: 'male',
    weight: '70',
    height: '175',
    isMetric: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (userService.getUserProfile as jest.Mock).mockResolvedValue(mockProfile);
  });

  it('renders loading state initially', () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    expect(getByText('Loading profile...')).toBeTruthy();
  });

  it('loads and displays user profile data', async () => {
    const { getByText, getByDisplayValue } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByDisplayValue('25')).toBeTruthy();
      expect(getByText('Male')).toBeTruthy();
      expect(getByDisplayValue('70')).toBeTruthy();
      expect(getByDisplayValue('175')).toBeTruthy();
    });
  });

  it('handles unit conversion when toggling metric switch', async () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      const weightInput = getByTestId('weight-value');
      const heightInput = getByTestId('height-value');
      expect(weightInput.props.value).toBe('70');
      expect(heightInput.props.value).toBe('175');
    });

    const metricSwitch = getByTestId('metric-switch');
    await act(async () => {
      fireEvent(metricSwitch, 'valueChange', false);
    });

    await waitFor(() => {
      const weightInput = getByTestId('weight-value');
      const heightInput = getByTestId('height-value');
      expect(weightInput.props.value).toBe('154');
      expect(heightInput.props.value).toBe('69');
    });
  });

  it('validates form before saving', async () => {
    const { getByTestId, getByText, findByText } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByTestId('age-input')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.changeText(getByTestId('age-input'), '');
    });

    const saveButton = getByTestId('save-button');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    const errorMessage = await findByText('Please fill in all fields.');
    expect(errorMessage).toBeTruthy();
  });

  it('shows BMI when toggling BMI display', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Show BMI')).toBeTruthy();
    });

    const bmiButton = getByText('Show BMI');
    fireEvent.press(bmiButton);

    // This is the BMI for 70kg and 175cm 
    expect(getByText('BMI: 22.9')).toBeTruthy();
  });

  it('handles sex selection modal', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Sex (assigned at birth)')).toBeTruthy();
    });

    fireEvent.press(getByText('Male'));
    
    const femaleOption = getByText('Female');
    fireEvent.press(femaleOption);

    expect(getByText('Female')).toBeTruthy();
  });

  it('saves profile successfully', async () => {
    (userService.saveUserProfile as jest.Mock).mockResolvedValue(true);

    const { getByTestId, findByTestId } = render(
      <NavigationContainer>
        <UserProfileScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByTestId('save-button')).toBeTruthy();
    });

    const saveButton = getByTestId('save-button');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(userService.saveUserProfile).toHaveBeenCalledWith(mockProfile);
    
    const successMessage = await findByTestId('success-message');
    expect(successMessage.props.children).toBe('Your profile has been saved');
  });
});