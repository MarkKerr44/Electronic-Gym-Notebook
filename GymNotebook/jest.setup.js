// jest.setup.js

import 'react-native-reanimated';
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

import { NativeModules } from 'react-native';

NativeModules.CameraView = {};

NativeModules.RNSkiaModule = {};

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraPermission: () => ({
    status: 'authorized',
    requestPermission: jest.fn(),
  }),
}));

// Mock react-native-mediapipe
jest.mock('react-native-mediapipe', () => ({
  MediapipeCamera: () => null,
  RunningMode: { IMAGE: 'IMAGE', VIDEO: 'VIDEO' },
  usePoseDetection: () => ({}),
  KnownPoseLandmarkConnections: {},
  Delegate: { CPU: 'CPU', GPU: 'GPU' },
}));

// Mock @shopify/react-native-skia 
jest.mock('@shopify/react-native-skia', () => ({
  vec: (...args) => args,
  Canvas: () => null,
  Points: () => null,
}));
