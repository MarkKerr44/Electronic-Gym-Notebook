module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|react-native-reanimated|@react-native|react-native-gesture-handler|@shopify/react-native-skia|react-native-linear-gradient|firebase|@firebase)/)',
  ],
  moduleNameMapper: {
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/react-native-gesture-handler.js',
    '^@/animations/(.*)$': '<rootDir>/assets/animations/$1',
    '^@/components/(.*)$': '<rootDir>/assets/components/$1',
    '^@/constants/(.*)$': '<rootDir>/assets/constants/$1',
    '^@/fonts/(.*)$': '<rootDir>/assets/fonts/$1',
    '^@/hooks/(.*)$': '<rootDir>/assets/hooks/$1',
    '^@/images/(.*)$': '<rootDir>/assets/images/$1',
    '^@/models/(.*)$': '<rootDir>/assets/models/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  
};
