import LanguageSwitcher from "@components/LanguageSwitcher";
import BackScreen from "@components/molecules/Back";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import { useAuthStore } from "@stores/auth/auth.config";
import { useGlobalStore } from "@stores/global/global.config";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StatusBar, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { deleteAccessToken } = useAuthStore();
  const {
    isPokemonOverlayEnabled,
    isOverlayPreferenceLoaded,
    setPokemonOverlayEnabled,
    initializeOverlayPreference,
  } = useGlobalStore();

  useEffect(() => {
    initializeOverlayPreference();
  }, [initializeOverlayPreference]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <BackScreen
        onPress={() => router.back()}
        color="black"
        title={t("settings.title")}
      />

      <View className="flex-1 px-4">
        {/* Language Settings */}
        <View className="mb-6">
          <LanguageSwitcher />
        </View>

        {/* Draggable Overlay Toggle */}
        <View className="mb-6 rounded-2xl bg-white px-4 py-3 flex-row items-center">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-slate-900">
              {t("settings.overlay_title", "Pokémon overlay")}
            </Text>
            <Text className="text-sm text-slate-500 mt-1">
              {t(
                "settings.overlay_subtitle",
                "Show the draggable buddy on the home screen"
              )}
            </Text>
          </View>
          <Switch
            value={isPokemonOverlayEnabled}
            onValueChange={setPokemonOverlayEnabled}
            trackColor={{ false: "#cbd5e1", true: "#bbf7d0" }}
            thumbColor={isPokemonOverlayEnabled ? "#10b981" : "#e5e7eb"}
            disabled={!isOverlayPreferenceLoaded}
          />
        </View>

        {/* Logout Button */}
        <BounceButton
          variant="secondary"
          onPress={() => {
            Alert.alert(
              t("settings.logout_title"),
              t("settings.logout_message"),
              [
                { text: t("settings.cancel"), style: "cancel" },
                {
                  text: t("settings.logout"),
                  onPress: async () => {
                    try {
                      await deleteAccessToken();
                    } catch (error) {
                      console.error('Logout error:', error);
                    } finally {
                      // Always navigate to welcome screen even if logout fails
                      router.replace(ROUTES.AUTH.WELCOME);
                    }
                  },
                },
              ]
            );
          }}
        >
          {t("settings.logout")}
        </BounceButton>
      </View>
    </SafeAreaView>
  );
}
