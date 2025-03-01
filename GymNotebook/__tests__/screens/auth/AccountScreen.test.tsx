import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AccountScreen from '../../../src/screens/auth/AccountScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePassword, updateProfile, deleteUser, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('@react-native-async-storage/async-storage', () => ({
  clear: jest.fn(),
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../../../firebase/firebaseConfig', () => ({
  auth: {
    currentUser: {
      email: 'test@example.com',
      displayName: 'Test User',
    },
  },
}));

jest.mock('firebase/auth', () => ({
  updatePassword: jest.fn(),
  updateProfile: jest.fn(),
  deleteUser: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn(),
  },
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
}));

describe('AccountScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('renders account information correctly', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <AccountScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Account')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
      expect(getByText('Send Password Reset Email')).toBeTruthy();
    });
  });

  it('handles password verification process', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <AccountScreen />
      </NavigationContainer>
    );

    const currentPasswordInput = getByPlaceholderText('Current Password');
    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'currentPassword123');
    });

    const verifyButton = getByText('Verify Password');
    await act(async () => {
      fireEvent.press(verifyButton);
    });

    expect(reauthenticateWithCredential).toHaveBeenCalled();
  });

  it('handles password change process', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <AccountScreen />
      </NavigationContainer>
    );

    const currentPasswordInput = getByPlaceholderText('Current Password');
    await act(async () => {
      fireEvent.changeText(currentPasswordInput, 'currentPassword123');
    });

    const verifyButton = getByText('Verify Password');
    await act(async () => {
      fireEvent.press(verifyButton);
    });

    (reauthenticateWithCredential as jest.Mock).mockResolvedValueOnce(true);

    const newPasswordInput = getByPlaceholderText('New Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm New Password');

    await act(async () => {
      fireEvent.changeText(newPasswordInput, 'NewPassword123!');
      fireEvent.changeText(confirmPasswordInput, 'NewPassword123!');
    });

    const updateButton = getByText('Update Password');
    await act(async () => {
      fireEvent.press(updateButton);
    });

    expect(updatePassword).toHaveBeenCalled();
  });

  it('handles account deletion process', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <AccountScreen />
      </NavigationContainer>
    );

    const deleteButton = getByText('Delete Account');
    await act(async () => {
      fireEvent.press(deleteButton);
    });

    expect(getByText('Reauthenticate')).toBeTruthy();
  });
});