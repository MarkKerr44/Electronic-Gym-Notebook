import { Stack } from 'expo-router';
import React from 'react';

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="OpeningScreen" options={{ title: 'Welcome', headerShown: false }} />
      <Stack.Screen name="SignUpScreen" options={{ title: 'Sign Up', headerShown: true }} />
      <Stack.Screen name="SignInScreen" options={{ title: 'Sign In', headerShown: true }} />
      <Stack.Screen name="DashboardScreen" options={{ title: 'DashboardScreen', headerShown: false }} /> {/* Updated route name */}
    </Stack>
  );
};

export default Layout;
