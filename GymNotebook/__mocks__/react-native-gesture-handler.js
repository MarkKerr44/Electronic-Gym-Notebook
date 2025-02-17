// __mocks__/react-native-gesture-handler.js
import React from 'react';
import { View } from 'react-native';

export const GestureHandlerRootView = (props) => {
  return <View {...props}>{props.children}</View>;
};

export default GestureHandlerRootView;
