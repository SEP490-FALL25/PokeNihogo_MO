import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../../global.css';

import { useColorScheme } from '@hooks/useColorScheme';
import { ReactQueryProvider } from '@libs/@tanstack/react-query';
import { useEffect, useState } from 'react';
import SplashScreen from './splash';

export default function RootLayout() {
  const [isAppReady, setAppReady] = useState<boolean>(false);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        setAppReady(true);
      }, 2000);
    }
  }, [loaded]);

  if (!loaded || !isAppReady) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReactQueryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
}
