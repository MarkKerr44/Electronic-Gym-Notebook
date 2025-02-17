import { beforeEach, describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import OpeningScreen from '../src/OpeningScreen';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('OpeningScreen', () => {
  it('renders correctly with title and subtitle', () => {
    const { getByText } = render(
      <NavigationContainer>
        <OpeningScreen />
      </NavigationContainer>
    );
    expect(getByText('Notebook')).toBeTruthy();
    expect(getByText('Welcome to your new Gym Notebook!')).toBeTruthy();
  });

  it('renders all expected buttons', () => {
    const { getByText } = render(
      <NavigationContainer>
        <OpeningScreen />
      </NavigationContainer>
    );
    expect(getByText('Sign in with Google')).toBeTruthy();
    expect(getByText('Continue with Email')).toBeTruthy();
    expect(getByText('Log in')).toBeTruthy();
  });
});
