import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import PoseEstimatorScreen from '../../../src/screens/pose/PoseEstimatorScreen';
import { useCameraPermission } from 'react-native-vision-camera';
import { usePoseDetection } from 'react-native-mediapipe';

jest.mock('react-native-vision-camera', () => ({
  useCameraPermission: jest.fn(),
}));

jest.mock('react-native-mediapipe', () => ({
  usePoseDetection: jest.fn(),
  RunningMode: { LIVE_STREAM: 'LIVE_STREAM' },
  KnownPoseLandmarkConnections: [[0, 1], [1, 2]],
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn().mockReturnValue({ value: [] }),
}));
jest.mock('@shopify/react-native-skia', () => ({
  vec: jest.fn(),
}));

describe('PoseEstimatorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCameraPermission as jest.Mock).mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    });
    (usePoseDetection as jest.Mock).mockReturnValue({
      solution: {},
      error: null,
    });
  });

  it('renders exercise selection screen initially', () => {
    const { getByText } = render(<PoseEstimatorScreen />);
    
    expect(getByText('Select Your Workout')).toBeTruthy();
    expect(getByText('Squats')).toBeTruthy();
    expect(getByText('Bicep Curls')).toBeTruthy();
    expect(getByText('Shoulder Press')).toBeTruthy();
  });

  it('requests camera permission if not granted', () => {
    const mockRequestPermission = jest.fn().mockResolvedValue(true);
    (useCameraPermission as jest.Mock).mockReturnValue({
      hasPermission: false,
      requestPermission: mockRequestPermission,
    });

    const { getByText } = render(<PoseEstimatorScreen />);
    
    const allowButton = getByText('Allow');
    fireEvent.press(allowButton);
    
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('starts squat exercise when selected', async () => {
    const { getByText, findByText } = render(<PoseEstimatorScreen />);
    
    const squatsButton = getByText('Squats');
    fireEvent.press(squatsButton);
    
    expect(await findByText('Get Ready')).toBeTruthy();
    expect(await findByText('Position yourself in view of the camera.')).toBeTruthy();
  });

  it('shows countdown after modal confirmation', async () => {
    const { getByText, findByText } = render(<PoseEstimatorScreen />);
    
    fireEvent.press(getByText('Squats'));
    fireEvent.press(getByText('OK'));
    
    expect(await findByText('5')).toBeTruthy();
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
    });
    
    expect(getByText('Detecting...')).toBeTruthy();
  });

  it('processes pose detection results correctly', async () => {
    const { getByText } = render(<PoseEstimatorScreen />);
    
    fireEvent.press(getByText('Squats'));
    fireEvent.press(getByText('OK'));
    
    const mockResults = {
      results: [{
        landmarks: [[
          ...Array(33).fill({ x: 0, y: 0, z: 0 })
        ]]
      }]
    };

    const mockViewCoordinator = {
      getFrameDims: jest.fn().mockReturnValue({ width: 100, height: 100 }),
      convertPoint: jest.fn().mockReturnValue({ x: 0, y: 0 }),
    };

    await act(async () => {
      const poseDetectionHook = usePoseDetection as jest.Mock;
      const { onResults } = poseDetectionHook.mock.calls[0][0];
      onResults(mockResults, mockViewCoordinator);
    });

    expect(getByText('Detecting...')).toBeTruthy();
  });

  it('counts reps correctly', async () => {
    const { getByText } = render(<PoseEstimatorScreen />);
    
    fireEvent.press(getByText('Squats'));
    fireEvent.press(getByText('OK'));
    
    const goodSquatPose = Array(33).fill(null).map((_, i) => ({
      x: 0.5,
      y: i === 25 || i === 26 ? 0.7 : 0.5, 
      z: 0
    }));

    await act(async () => {
      const poseDetectionHook = usePoseDetection as jest.Mock;
      const { onResults } = poseDetectionHook.mock.calls[0][0];
      onResults({
        results: [{ landmarks: [goodSquatPose] }]
      }, {
        getFrameDims: () => ({ width: 100, height: 100 }),
        convertPoint: (_, p) => p
      });
    });

    expect(getByText('1')).toBeTruthy(); 
    expect(getByText('0')).toBeTruthy(); 
  });
});