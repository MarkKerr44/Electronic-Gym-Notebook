// jest.setup.js

import 'react-native-reanimated';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { NativeModules } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props) => <Text>MockedIcon</Text>,
  };
});


jest.mock('react-native-vector-icons/Ionicons', () => {
  return {
    default: jest.fn(() => 'MockedIonicon'),
  };
});



jest.mock('@react-native-community/datetimepicker', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');


jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }) => children,
  createNavigationContainerRef: jest.fn(() => ({
    current: null,
  })),
}));


jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children }) => children,
    SafeAreaProvider: ({ children }) => <>{children}</>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('react-native-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props) => {
    return React.createElement(View, props, props.children);
  };
});

NativeModules.CameraView = {};
NativeModules.RNSkiaModule = {};
NativeModules.RNGestureHandlerModule = {};

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

// **Mock Google Signin module**
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ user: 'mockUser' }),
  },
}));
