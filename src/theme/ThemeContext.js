import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './colors';

const THEME_KEY = 'app_user_theme';

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setMode: (mode) => {}
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false); // default to lightmode as requested

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'dark') {
          setIsDark(true);
        } else if (saved === 'light') {
          setIsDark(false);
        }
      } catch (e) {
        console.log('Error reading theme', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch (e) {
      console.log('Error saving theme', e);
    }
  };

  const setMode = async (mode) => {
    const next = mode === 'dark';
    setIsDark(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (e) {
      console.log('Error saving theme', e);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
