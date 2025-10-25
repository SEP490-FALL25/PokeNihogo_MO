import LanguageSwitcher from "@components/LanguageSwitcher";
import BackScreen from "@components/molecules/Back";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import { useAuthStore } from "@stores/auth/auth.config";
import { router } from "expo-router";
import React from "react";
import { Alert, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { deleteAccessToken } = useAuthStore();
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <BackScreen onPress={() => router.back()} color="black" title="Cài đặt" />

      <View className="flex-1 px-4">
        {/* Language Settings */}
        <View className="mb-6">
          <LanguageSwitcher />
        </View>

        {/* Logout Button */}
        <BounceButton
          variant="secondary"
          onPress={() => {
            Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
              { text: "Hủy", style: "cancel" },
              {
                text: "Đăng xuất",
                onPress: () => {
                  deleteAccessToken();
                  router.replace(ROUTES.AUTH.WELCOME);
                },
              },
            ]);
          }}
        >
          Đăng xuất
        </BounceButton>
      </View>
    </SafeAreaView>
  );
}
