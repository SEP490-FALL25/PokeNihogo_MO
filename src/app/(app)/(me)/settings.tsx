import LanguageSwitcher from "@components/LanguageSwitcher";
import BackScreen from "@components/molecules/Back";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import { useAuthStore } from "@stores/auth/auth.config";
import { router } from "expo-router";
import { Crown } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, StatusBar, Text, TouchableOpacity, View } from "react-native";
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

        {/* Subscription Button */}
        <TouchableOpacity
          onPress={() => router.push(ROUTES.APP.SUBSCRIPTION)}
          className="mb-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 flex-row items-center justify-between shadow-lg"
          activeOpacity={0.8}
          style={{
            backgroundColor: '#f59e0b',
            shadowColor: '#f59e0b',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center">
              <Crown size={24} color="white" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">
                {t('subscription.title')}
              </Text>
              <Text className="text-white/90 text-sm">
                {t('subscription.subtitle')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

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
                  onPress: () => {
                    deleteAccessToken();
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
