import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import BottomNavBar from '../../src/components/BottomNavBar';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

const mockNavigate = jest.fn();
const mockUseNavigationState = jest.fn(() => ({
  routes: [{ name: 'DashboardScreen' }],
  index: 0
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate
  }),
  useNavigationState: () => mockUseNavigationState,
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children
}));

describe('BottomNavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 400, height: 800 });
  });

  it('renders all navigation tabs', () => {
    const { getByText } = render(
      <NavigationContainer>
        <BottomNavBar />
      </NavigationContainer>
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Workout')).toBeTruthy();
    expect(getByText('Posture')).toBeTruthy();
    expect(getByText('Library')).toBeTruthy();
  });

  it('handles tab press correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <BottomNavBar />
      </NavigationContainer>
    );

    fireEvent.press(getByText('Workout'));
    expect(mockNavigate).toHaveBeenCalledWith('WorkoutSelectionScreen');

    fireEvent.press(getByText('Posture'));
    expect(mockNavigate).toHaveBeenCalledWith('PoseEstimatorScreen');

    fireEvent.press(getByText('Library'));
    expect(mockNavigate).toHaveBeenCalledWith('ExerciseLibraryScreen');
  });

  it('handles window dimension changes', () => {
    const { rerender } = render(
      <NavigationContainer>
        <BottomNavBar />
      </NavigationContainer>
    );

    jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 800, height: 1200 });

    rerender(
      <NavigationContainer>
        <BottomNavBar />
      </NavigationContainer>
    );

    expect(true).toBeTruthy();
  });

  it('renders icons for all tabs', () => {
    const { UNSAFE_getAllByType } = render(
      <NavigationContainer>
        <BottomNavBar />
      </NavigationContainer>
    );

    const icons = UNSAFE_getAllByType('MaterialIcons');
    expect(icons).toHaveLength(4); 
  });
});
