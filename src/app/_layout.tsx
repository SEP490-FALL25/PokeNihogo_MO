import MinimalGameAlert, {
  AlertWrapper,
} from "@components/atoms/MinimalAlert";
import GlobalMatchingNotification from "@components/GlobalMatchingNotification";
import { GlobalSocketManager } from "@components/GlobalSocketManager";
import LanguageProvider from "@components/LanguageProvider";
import CopilotProviderWrapper from "@components/ui/CopilotProviderWrapper";
import { GlobalNotificationToast } from "@components/ui/GlobalNotificationToast";
import { useColorScheme } from "@hooks/useColorScheme";
import {
  MinimalAlertProvider,
  useMinimalAlert,
} from "@hooks/useMinimalAlert";
import { ReactQueryProvider } from "@libs/@tanstack/react-query";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useAuthStore } from "@stores/auth/auth.config";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../../global.css";
import SplashScreen from "./splash";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { initialize, isLoading: isTokenLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!loaded || isTokenLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <MinimalAlertProvider>
          <LanguageProvider>
            <ReactQueryProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <CopilotProviderWrapper>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </CopilotProviderWrapper>
                <StatusBar style="auto" />
                <GlobalMatchingNotification />
                <GlobalNotificationToast />
                <GlobalSocketManager />
              </ThemeProvider>
            </ReactQueryProvider>
          </LanguageProvider>
          <GlobalAlertLayer />
        </MinimalAlertProvider>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}

const GlobalAlertLayer = () => {
  const { alertConfig, hideAlert } = useMinimalAlert();

  return (
    <AlertWrapper visible={alertConfig.visible} onHide={hideAlert}>
      <MinimalGameAlert
        visible={alertConfig.visible}
        message={alertConfig.message}
        type={alertConfig.type}
        onHide={hideAlert}
      />
    </AlertWrapper>
  );
};
