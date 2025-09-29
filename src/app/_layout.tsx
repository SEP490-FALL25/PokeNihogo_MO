import useAuth from '@hooks/useAuth';
import { useColorScheme } from '@hooks/useColorScheme';
import '@i18n/i18n';
import { ReactQueryProvider } from '@libs/@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../../global.css';
import SplashScreen from './splash';

export default function RootLayout() {

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { isLoading: isAuthLoading } = useAuth();

  if (!loaded || isAuthLoading) {
    return <SplashScreen />;
  }

  return (
    <ReactQueryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="redirect" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ReactQueryProvider>
  );
}