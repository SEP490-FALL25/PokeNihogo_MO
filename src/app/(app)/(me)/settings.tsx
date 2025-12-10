import LanguageSwitcher from "@components/LanguageSwitcher";
import BackScreen from "@components/molecules/Back";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import { useAuthStore } from "@stores/auth/auth.config";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { deleteAccessToken } = useAuthStore();

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

        {/* Logout Button */}
        <BounceButton
          variant="secondary"
          onPress={async () => {
            Alert.alert(
              t("settings.logout_title"),
              t("settings.logout_message"),
              [
                { text: t("settings.cancel"), style: "cancel" },
                {
                  text: t("settings.logout"),
                  onPress: async () => {
                    await deleteAccessToken();
                    router.replace(ROUTES.AUTH.WELCOME);
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
