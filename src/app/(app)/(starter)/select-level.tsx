// ============================================================================
// IMPORTS
// ============================================================================
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { TypingText } from "@components/ui/TypingText";
import { useFocusEffect } from "@react-navigation/native";
import { ROUTES } from "@routes/routes";
import userService from "@services/user";
import { useUserStore } from "@stores/user/user.config";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Image, TouchableOpacity, View } from "react-native";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type Level = "N5" | "N4" | "N3";

// ============================================================================
// CONSTANTS & DATA
// ============================================================================
/**
 * Pokémon mascot data for random selection
 * Each mascot has a name, image URL, and associated color theme
 */
const pokemonMascots = [
  {
    name: "Pikachu",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif",
    color: "#fbbf24",
  },
  {
    name: "Eevee",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif",
    color: "#f59e0b",
  },
  {
    name: "Bulbasaur",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/1.gif",
    color: "#10b981",
  },
  {
    name: "Charmander",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/4.gif",
    color: "#ef4444",
  },
  {
    name: "Squirtle",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/7.gif",
    color: "#3b82f6",
  },
  {
    name: "Jigglypuff",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/39.gif",
    color: "#f472b6",
  },
  {
    name: "Meowth",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/52.gif",
    color: "#a78bfa",
  },
  {
    name: "Psyduck",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/54.gif",
    color: "#60a5fa",
  },
  {
    name: "Snorlax",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/143.gif",
    color: "#94a3b8",
  },
  {
    name: "Mew",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/151.gif",
    color: "#fb7185",
  },
  {
    name: "Togepi",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/175.gif",
    color: "#f59e0b",
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SelectLevelScreen() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  const { t } = useTranslation();

  // UI state
  const [selected, setSelected] = React.useState<Level | null>(null);
  const [mascot, setMascot] = React.useState(pokemonMascots[0]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showTestResult, setShowTestResult] = React.useState(false);

  // Animation refs
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(12)).current;

  // Store selectors
  const userLevel = useUserStore((s) => (s as any).level);
  const hasCompletedPlacementTest = useUserStore(
    (s) => (s as any).hasCompletedPlacementTest
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================
  /**
   * Effect to handle placement test results and pre-select level
   */
  React.useEffect(() => {
    if (userLevel && hasCompletedPlacementTest) {
      setSelected(userLevel);
      setShowTestResult(true);
    } else if (userLevel) {
      setSelected(userLevel);
      setShowTestResult(false);
    }
  }, [userLevel, hasCompletedPlacementTest]);

  /**
   * Reset processing state when screen is focused (when back from other screens)
   */
  useFocusEffect(
    useCallback(() => {
      setIsProcessing(false);
    }, [])
  );

  /**
   * Random mascot selection with entrance animation
   */
  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * pokemonMascots.length);
    setMascot(pokemonMascots[randomIndex]);
    // Gentle entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Handles level selection - calls API to update level on server
   */
  const onLevelSelect = async (level: Level) => {
    if (isProcessing || selected === level) return;

    try {
      setSelected(level);
      // Call API to update level immediately when user selects (no local storage)
      await userService.updateLevelJLPT(level);
    } catch (error) {
      console.error("Error updating user level:", error);
      // Revert selection on error
      if (userLevel) {
        setSelected(userLevel);
      } else {
        setSelected(null);
      }
    }
  };

  /**
   * Handles continue action - ensures level is saved and navigates to starter selection
   */
  const onContinue = async () => {
    if (!selected || isProcessing) return;

    try {
      setIsProcessing(true);
      // Ensure level is saved on server before navigation (in case previous API call failed)
      await userService.updateLevelJLPT(selected);
      setIsProcessing(false);
      router.push(ROUTES.STARTER.CHOOSE_STARTER as any);
    } catch (error) {
      console.error("Error setting user level:", error);
      setIsProcessing(false);
      // Optionally show error message to user
    }
  };

  /**
   * Get mascot messages using i18n
   * @param mascotName - Name of the mascot
   * @returns Translated message for the mascot
   */
  const getMascotMessage = (mascotName: string) => {
    return t(`auth.mascots.${mascotName.toLowerCase()}`);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  /**
   * Get color and icon metadata for each JLPT level
   * @param level - The JLPT level
   * @returns Object containing border, active, fill colors and icon
   */
  const getLevelMeta = (level: Level) => {
    switch (level) {
      case "N5":
        return {
          border: "#10b981",
          active: "#059669",
          fill: "rgba(16,185,129,0.35)",
          icon: "🇯🇵",
        };
      case "N4":
        return {
          border: "#f59e0b",
          active: "#d97706",
          fill: "rgba(235, 155, 66,0.35)",
          icon: "🇯🇵",
        };
      case "N3":
        return {
          border: "#ef4444",
          active: "#dc2626",
          fill: "rgba(239,68,68,0.28)",
          icon: "🇯🇵",
        };
      default:
        return {
          border: "#e5e7eb",
          active: "#3b82f6",
          fill: "rgba(59,130,246,0.12)",
          icon: "🇯🇵",
        };
    }
  };

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================
  /**
   * Level option component for each JLPT level
   * @param level - The JLPT level
   * @param label - Display label for the level
   */
  const LevelOption = ({ level, label }: { level: Level; label: string }) => {
    const isActive = selected === level;
    // Always show recommendation tag on the recommended level, regardless of user's current selection
    const isRecommended = hasCompletedPlacementTest && userLevel === level;
    const meta = getLevelMeta(level);

    return (
      <TouchableOpacity
        onPress={() => {
          if (isProcessing) return;
          Haptics.selectionAsync();
          onLevelSelect(level);
          // Don't reset hasCompletedPlacementTest to keep recommendation visible
        }}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderRadius: 16,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? meta.active : meta.border,
          backgroundColor: isActive ? meta.fill : "#ffffff",
          marginBottom: 12,
          shadowColor: isActive ? meta.active : undefined,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: isActive ? 0 : 0,
          flexDirection: "row",
          alignItems: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <View
          style={{
            width: 28,
            height: 20,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText style={{ fontSize: 16 }}>{meta.icon}</ThemedText>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ThemedText type="defaultSemiBold">{label}</ThemedText>
          {isRecommended && (
            <ThemedText
              style={{
                fontSize: 12,
                color: "#059669",
                fontWeight: "600",
                marginTop: 2,
              }}
            >
              {t("auth.select_level.recommended_from_test")}
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <StarterScreenLayout currentStep={1} totalSteps={2}>
      {/* Mascot + Speech Bubble Section */}
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginBottom: 16,
          opacity: fadeAnim,
          transform: [{ translateY }],
          paddingHorizontal: 20,
        }}
      >
        {/* Mascot Image */}
        <View style={{ alignItems: "center", marginRight: 12 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: mascot.imageUrl }}
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
          </View>
        </View>

        {/* Speech Bubble with mascot color */}
        <View style={{ flex: 1, position: "relative" }}>
          <View
            style={{
              backgroundColor: mascot.color,
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <TypingText
              messages={[getMascotMessage(mascot.name)]}
              typingSpeedMs={35}
              deletingSpeedMs={20}
              pauseBeforeStartMs={150}
              pauseBetweenMessagesMs={1000}
              loop={false}
              showCursor
              cursorChar="|"
              containerStyle={{}}
              textStyle={{
                color: "#ffffff",
                fontSize: 14,
                fontWeight: "700",
              }}
            />
          </View>
          {/* Tail pointing left to mascot */}
          <View
            style={{
              position: "absolute",
              left: -8,
              top: 18,
              width: 0,
              height: 0,
              borderRightWidth: 10,
              borderRightColor: mascot.color,
              borderTopWidth: 8,
              borderTopColor: "transparent",
              borderBottomWidth: 8,
              borderBottomColor: "transparent",
            }}
          />
        </View>
      </Animated.View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "rgba(0,0,0,0.06)",
          marginBottom: 16,
          marginHorizontal: 20,
        }}
      />

      {/* Title and Test Result Section */}
      <View style={{ paddingHorizontal: 20 }}>
        <ThemedText
          type="title"
          style={{ marginBottom: 12, textAlign: "center" }}
        >
          {t("auth.select_level.title")}
        </ThemedText>

        {showTestResult && userLevel && (
          <View
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderWidth: 1,
              borderColor: "#10b981",
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              alignItems: "center",
            }}
          >
            <ThemedText
              style={{
                color: "#059669",
                fontWeight: "600",
                fontSize: 16,
                marginBottom: 4,
              }}
            >
              {t("auth.select_level.test_result_title")}
            </ThemedText>
            <ThemedText
              style={{
                color: "#047857",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {t("auth.select_level.test_result_desc", { level: userLevel })}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Level Selection and Actions Section */}
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <View style={{ gap: 12 }}>
          <LevelOption level="N5" label={t("auth.select_level.n5")} />
          <LevelOption level="N4" label={t("auth.select_level.n4")} />
          <LevelOption level="N3" label={t("auth.select_level.n3")} />

          {/* Take Placement Test Button */}
          <TouchableOpacity
            onPress={() => router.push(ROUTES.STARTER.PLACEMENT_TEST as any)}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "#ffffff",
            }}
          >
            <ThemedText style={{ color: "#0ea5e9", fontWeight: "600" }}>
              {t("auth.select_level.take_test")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Continue Button Section */}
        <View style={{ paddingTop: 12 }}>
          <BounceButton
            variant="solid"
            size="full"
            withHaptics
            disabled={!selected || isProcessing}
            onPress={onContinue}
          >
            {isProcessing
              ? t("common.processing") || "Processing..."
              : t("common.continue")}
          </BounceButton>
        </View>
      </View>
    </StarterScreenLayout>
  );
}
