import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { Button } from "@components/ui/Button";
import { ROUTES } from "@routes/routes";
import authService from "@services/auth";
import { useUserStore } from "@stores/user/user.config";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

type Level = "N5" | "N4" | "N3";

export default function SelectLevelScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<Level | null>(null);
  const setLevel = useUserStore((s) => (s as any).setLevel);

  const onContinue = async () => {
    if (!selected) return;
    setLevel(selected);
    await authService.setUserLevel(selected);
    router.push(ROUTES.AUTH.CHOOSE_STARTER as any);
  };

  const LevelOption = ({ level, label }: { level: Level; label: string }) => {
    const isActive = selected === level;
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          setSelected(level);
        }}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 10,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? "#3b82f6" : "#e5e7eb",
          backgroundColor: isActive
            ? "rgba(59,130,246,0.1)"
            : "rgba(255,255,255,0.2)",
          marginBottom: 12,
        }}
      >
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 80 }}>
      <ThemedText type="title" style={{ marginBottom: 24 }}>
        {t("auth.select_level.title")}
      </ThemedText>

      <View style={{ gap: 8 }}>
        <LevelOption level="N5" label={t("auth.select_level.n5")} />
        <LevelOption level="N4" label={t("auth.select_level.n4")} />
        <LevelOption level="N3" label={t("auth.select_level.n3")} />

        <TouchableOpacity
          onPress={() => router.push(ROUTES.AUTH.PLACEMENT_TEST as any)}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            backgroundColor: "transparent",
            marginTop: 8,
          }}
        >
          <ThemedText type="link">
            {t("auth.select_level.take_test")}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{ paddingTop: 20 }} />
      <Button disabled={!selected} onPress={onContinue}>
        {t("common.continue")}
      </Button>
    </ThemedView>
  );
}
