// ============================================================================
// IMPORTS
// ============================================================================
import { HelloWave } from "@components/HelloWave";
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Image, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import starters from "../../../mock-data/starters.json";

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

// ============================================================================
// CUSTOM HOOKS
// ============================================================================
/**
 * Custom hook to manage confetti animation logic
 * Handles delayed confetti trigger to avoid creating new objects on each render
 * @param delay - Delay before confetti starts (default: CONFETTI_DELAY)
 * @returns Object containing confetti ref and triggered state
 */
const useConfetti = (delay: number = CONFETTI_DELAY) => {
  const confettiRef = useRef<ConfettiCannon>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (triggered) return;

    const timer = setTimeout(() => {
      confettiRef.current?.start();
      setTriggered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [triggered, delay]);

  return { confettiRef, triggered };
};

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
  const { confettiRef } = useConfetti();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  /**
   * Memoized selected starter to avoid unnecessary recalculations
   */
  const selectedStarter = useMemo(() => {
    return (
      starters.find((starter: Starter) => starter.id === starterId) ||
      starters[0]
    );
  }, [starterId]);

  // ============================================================================
  // MEMOIZED STYLES
  // ============================================================================
  /**
   * Memoized styles to avoid creating new objects on each render
   * Optimized for performance
   */
  const containerStyle = useMemo(
    () => ({
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingHorizontal: 20,
    }),
    []
  );

  const badgeStyle = useMemo(
    () => ({
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
    }),
    []
  );

  const imageStyle = useMemo(
    () => ({
      width: 220,
      height: 220,
      marginBottom: 20,
    }),
    []
  );

  const buttonContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 20,
      paddingBottom: 16,
    }),
    []
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Memoized callback to prevent unnecessary re-renders
   * Handles navigation to home screen
   */
  const handleGoHome = useCallback(() => {
    router.replace(ROUTES.AUTH.WELCOME);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <StarterScreenLayout showBack={false}>
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
          source={{ uri: selectedStarter.image }}
          style={imageStyle}
          resizeMode="contain"
        />
        
        {/* Welcome Message */}
        <ThemedText
          type="title"
          style={{ textAlign: "center", marginBottom: 8 }}
        >
          Welcome <HelloWave />
        </ThemedText>
        
        {/* Success Message */}
        <ThemedText
          style={{ textAlign: "center", color: "#6b7280", marginBottom: 4 }}
        >
          Your profile has been created successfully.
        </ThemedText>
        
        {/* Starter Name */}
        <ThemedText
          style={{ textAlign: "center", color: "#3b82f6", fontWeight: "600" }}
        >
          Your starter: {selectedStarter.name}
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

export default CongratsScreen;
