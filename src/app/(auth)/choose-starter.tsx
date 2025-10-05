// ============================================================================
// IMPORTS
// ============================================================================
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import StarterCard from "@components/Organism/StarterCard";
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ChooseStarterScreen() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  const { t } = useTranslation();

  // UI state
  const [selected, setSelected] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Store selectors
  const setStarterId = useUserStore((s) => s.setStarterId);
  const setIsFirstTimeLogin = useUserStore((s) => s.setIsFirstTimeLogin);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  /**
   * Memoized starter list to prevent unnecessary re-renders
   */
  const list = useMemo(() => starters as Starter[], []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Handles starter selection
   * @param id - The ID of the selected starter
   */
  const handleSelect = useCallback((id: string) => {
    setSelected(id);
  }, []);

  /**
   * Handles confirmation of starter selection
   * Sets the starter in the store and navigates to congrats screen
   */
  const onConfirm = useCallback(async () => {
    if (!selected || isProcessing) return;

    try {
      setIsProcessing(true);
      setStarterId(selected);
      setIsFirstTimeLogin(true);
      await authService.selectStarter(selected);
      router.replace(ROUTES.AUTH.CONGRATS);
    } catch (error) {
      console.error("Error selecting starter:", error);
      setIsProcessing(false);
      // Handle error appropriately
    }
  }, [selected, isProcessing, setStarterId, setIsFirstTimeLogin]);

  /**
   * Handles back navigation - prevents navigation during processing
   */
  const handleBack = useCallback(() => {
    if (!isProcessing) {
      router.back();
    }
  }, [isProcessing]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <StarterScreenLayout currentStep={2} totalSteps={2} onBack={handleBack}>
      {/* Title Section */}
      <View style={{ paddingHorizontal: 20 }}>
        <ThemedText type="title" style={{ marginBottom: 16 }}>
          {t("auth.choose_starter.title")}
        </ThemedText>
      </View>

      {/* Starter Grid Section */}
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

      {/* Confirm Button Section */}
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
        <BounceButton
          variant="solid"
          disabled={!selected || isProcessing}
          onPress={onConfirm}
        >
          {isProcessing
            ? t("common.processing") || "Processing..."
            : t("auth.choose_starter.confirm")}
        </BounceButton>
      </View>
    </StarterScreenLayout>
  );
}
