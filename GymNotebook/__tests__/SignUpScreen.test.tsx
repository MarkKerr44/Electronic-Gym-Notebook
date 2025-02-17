import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SignUpScreen from '../src/SignUpScreen';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignUpScreen', () => {
  it('renders correctly with input fields and sign up button', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );

    expect(await findByText('Create Account')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('shows error messages when required fields are empty', async () => {
    const { getByText, findByText } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );

    const signUpButton = getByText('Sign Up');

    await act(async () => {
      fireEvent.press(signUpButton);
    });

    expect(await findByText('Email is required.')).toBeTruthy();
    expect(await findByText('Password is required.')).toBeTruthy();
  });
});
