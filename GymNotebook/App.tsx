import React from 'react';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OpeningScreen from './OpeningScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Opening" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Opening" component={OpeningScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
