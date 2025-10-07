import { ToastProvider, Toaster } from '@components/ui/Toast';
import { useColorScheme } from '@hooks/useColorScheme';
import '@i18n/i18n';
import { ReactQueryProvider } from '@libs/@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useAuthStore } from '@stores/auth/auth.config';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../../global.css';
import SplashScreen from './splash';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { initialize, isLoading: isTokenLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!loaded || isTokenLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReactQueryProvider>
        <ToastProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <Toaster />
          </ThemeProvider>
        </ToastProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
}