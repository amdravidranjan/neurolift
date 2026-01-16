import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { },
    theme: MD3LightTheme
});

export const useThemeContext = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    useEffect(() => {
        // Load preference
        AsyncStorage.getItem('theme_preference').then(val => {
            if (val) setIsDark(val === 'dark');
        });
    }, []);

    const toggleTheme = () => {
        setIsDark(prev => {
            const newVal = !prev;
            AsyncStorage.setItem('theme_preference', newVal ? 'dark' : 'light');
            return newVal;
        });
    };

    const theme = isDark ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, primary: '#bb86fc', secondary: '#03dac6' } } : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: '#6200ee', secondary: '#03dac6' } };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
            {children}
        </ThemeContext.Provider>
    );
}
