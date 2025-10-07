// ============================================================================
// IMPORTS
// ============================================================================
import { HelloWave } from "@components/HelloWave";
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { useConfetti } from "@hooks/useConfetti";
import { usePokemonData } from "@hooks/usePokemonData";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type Starter = { id: string; name: string; type: string[]; image: string };

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
/**
 * Confetti colors for celebration effect
 * Constants to avoid creating new objects on each render
 */
const CONFETTI_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

/**
 * Confetti configuration object
 * Optimized settings for celebration animation
 */
const CONFETTI_CONFIG = {
  count: 300,
  origin: { x: -10, y: 0 },
  fadeOut: true,
  autoStart: false,
  colors: CONFETTI_COLORS,
  explosionSpeed: 350,
  fallSpeed: 2000,
};

/**
 * Delay before confetti starts (in milliseconds)
 */
const CONFETTI_DELAY = 500;

/**
 * Image dimensions for Pokemon display
 */
const POKEMON_IMAGE_SIZE = 220;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
/**
 * Memoized component to prevent unnecessary re-renders
 * Optimized for performance with memoized styles and callbacks
 */
const CongratsScreen = React.memo(() => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  const starterId = useUserStore((state) => state.starterId);
  const { confettiRef } = useConfetti(CONFETTI_DELAY);
  const params = useLocalSearchParams();
  const selectedPokemon = usePokemonData(params, starterId || "");

  // ============================================================================
  // MEMOIZED STYLES
  // ============================================================================
  /**
   * Memoized styles to avoid creating new objects on each render
   * Optimized for performance using StyleSheet
   */
  const containerStyle = useMemo(() => styles.container, []);
  const badgeStyle = useMemo(() => styles.badge, []);
  const imageStyle = useMemo(() => styles.pokemonImage, []);
  const buttonContainerStyle = useMemo(() => styles.buttonContainer, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Memoized callback to prevent unnecessary re-renders
   * Handles navigation to home screen
   */
  const handleGoHome = useCallback(() => {
    router.replace(ROUTES.TABS.HOME);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <StarterScreenLayout>
      {/* Confetti Animation */}
      <ConfettiCannon ref={confettiRef} {...CONFETTI_CONFIG} />

      {/* Main Content Section */}
      <View style={containerStyle}>
        {/* Celebration Badge */}
        <View style={badgeStyle}>
          <ThemedText>Hurray!!</ThemedText>
        </View>

        {/* Starter Image */}
        <Image
          source={{ uri: selectedPokemon.image }}
          style={imageStyle}
          resizeMode="contain"
        />

        {/* Welcome Message */}
        <ThemedText type="title" style={styles.title}>
          Welcome <HelloWave />
        </ThemedText>

        {/* Success Message */}
        <ThemedText style={styles.successMessage}>
          Your profile has been created successfully.
        </ThemedText>

        {/* Starter Name */}
        <ThemedText style={styles.starterName}>
          Your starter: {selectedPokemon.name}
        </ThemedText>
      </View>

      {/* Action Button Section */}
      <View style={buttonContainerStyle}>
        <BounceButton
          size="full"
          variant="solid"
          withHaptics
          onPress={handleGoHome}
        >
          CONTINUE TO HOME
        </BounceButton>
      </View>
    </StarterScreenLayout>
  );
});

// ============================================================================
// COMPONENT EXPORT
// ============================================================================
/**
 * Export with display name for debugging purposes
 * Helps identify component in React DevTools
 */
CongratsScreen.displayName = "CongratsScreen";

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  badge: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pokemonImage: {
    width: POKEMON_IMAGE_SIZE,
    height: POKEMON_IMAGE_SIZE,
    marginBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  successMessage: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 4,
  },
  starterName: {
    textAlign: "center",
    color: "#3b82f6",
    fontWeight: "600",
  },
});

export default CongratsScreen;
