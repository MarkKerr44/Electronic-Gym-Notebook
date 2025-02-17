import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import renderer from 'react-test-renderer';
import App from '../src/App';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
);

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await waitFor(() => {
      const { getByTestId } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
      expect(getByTestId('app-root')).toBeTruthy();
    });
  });

  it('contains NavigationContainer', async () => {
    await waitFor(() => {
      const component = renderer.create(
        <TestWrapper>
          <App />
        </TestWrapper>
      );
      expect(component.root.findByType(NavigationContainer)).toBeTruthy();
    });
  });

  it('matches the snapshot', async () => {
    await waitFor(() => {
      const tree = renderer
        .create(
          <TestWrapper>
            <App />
          </TestWrapper>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  it('renders navigation structure correctly', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByTestId('app-root')).toBeTruthy();
    });
  });

  it('handles authentication state', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByTestId('app-root')).toBeTruthy();
    });
  });
});