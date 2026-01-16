import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { ContentSeedService } from '../features/engine/ContentSeedService';
import { ThemeProvider, useThemeContext } from '../features/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
    const { theme } = useThemeContext();
    return (
        <PaperProvider theme={theme}>
            <Stack screenOptions={{
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.onBackground,
                contentStyle: { backgroundColor: theme.colors.background }
            }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="settings/index" options={{ headerShown: false }} />
            </Stack>
        </PaperProvider>
    );
}

export default function RootLayout() {
    useEffect(() => {
        const init = async () => {
            try {
                await ContentSeedService.seedContentIfEmpty();
            } catch (e) {
                console.error("Failed to seed content", e);
            }
            SplashScreen.hideAsync();
        };
        init();
    }, []);

    return (
        <ThemeProvider>
            <RootNavigator />
        </ThemeProvider>
    );
}
