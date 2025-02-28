import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SignInScreen from '../../../src/screens/auth/SignInScreen';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('SignInScreen', () => {
  it('renders correctly with input fields and sign in button', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
    });
  });

  it('shows error messages for missing inputs', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

      const signInButton = getByText('Sign In');
      fireEvent.press(signInButton);

      expect(getByText('Email is required.')).toBeTruthy();
      expect(getByText('Password is required.')).toBeTruthy();
    });

