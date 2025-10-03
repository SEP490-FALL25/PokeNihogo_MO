import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import StarterCard from "@components/starter/StarterCard";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import authService from "@services/auth";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import starters from "../../../mock-data/starters.json";
import { Starter } from "../../types/starter.types";

export default function ChooseStarterScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<string | null>(null);
  const setStarterId = useUserStore((s) => s.setStarterId);
  const setIsFirstTimeLogin = useUserStore((s) => s.setIsFirstTimeLogin);

  const list = useMemo(() => starters as Starter[], []);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  const onConfirm = useCallback(async () => {
    if (!selected) return;

    try {
      setStarterId(selected);
      setIsFirstTimeLogin(true);
      await authService.selectStarter(selected);
      router.replace(ROUTES.AUTH.CONGRATS);
    } catch (error) {
      console.error("Error selecting starter:", error);
      // Handle error appropriately
    }
  }, [selected, setStarterId, setIsFirstTimeLogin]);

  return (
    <StarterScreenLayout currentStep={2} totalSteps={2}>
      <View style={{ paddingHorizontal: 20 }}>
        <ThemedText type="title" style={{ marginBottom: 16 }}>
          {t("auth.choose_starter.title")}
        </ThemedText>
      </View>

      <FlatList
        data={list}
        numColumns={2}
        keyExtractor={(item) => item.id}
        style={{
          height: 432, // Increased height: (200 + 16) * 2 = 432px for 2 rows
          paddingHorizontal: 20,
        }}
        contentContainerStyle={{ paddingBottom: 0 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={10}
        initialNumToRender={6}
        renderItem={({ item }) => (
          <View style={{ width: "48%", marginBottom: 16 }}>
            <StarterCard
              starter={item}
              selected={selected === item.id}
              onSelect={handleSelect}
            />
          </View>
        )}
      />

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 20,
          backgroundColor: "transparent",
        }}
      >
        <BounceButton variant="solid" disabled={!selected} onPress={onConfirm}>
          {t("auth.choose_starter.confirm")}
        </BounceButton>
      </View>
    </StarterScreenLayout>
  );
}
