// /context/ThemeProvider.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark' | 'purple';

interface ThemeContextValue {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'purple', 
  setTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('purple');

  useEffect(() => {
    async function loadTheme() {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'purple') {
          setThemeState(storedTheme);
        }
      } catch (error) {
        console.error('Error retrieving theme:', error);
      }
    }
    loadTheme();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('appTheme', theme).catch((error) => {
      console.error('Error storing theme:', error);
    });
  }, [theme]);

  function setTheme(t: ThemeType) {
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
