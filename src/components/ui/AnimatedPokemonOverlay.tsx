import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import PokemonImage from "../atoms/PokemonImage";
import PokemonDisplay from "../molecules/PokemonDisplay";

/**
 * Props for AnimatedPokemonOverlay component
 * @interface AnimatedPokemonOverlayProps
 */
interface AnimatedPokemonOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** URI of the Pokemon image to display */
  imageUri: string;
  /** Size of the Pokemon image (default: 120) */
  imageSize?: number;
  /** Custom styles to apply to the overlay container */
  style?: ViewStyle;
  /** Whether to show background card or just the Pokemon image (default: true) */
  showBackground?: boolean;
}

/**
 * AnimatedPokemonOverlay Component
 *
 * A reusable component that displays a Pokemon with smooth animations.
 * Supports both card display (with background) and image-only display.
 *
 * @param props - Component props
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <AnimatedPokemonOverlay
 *   visible={true}
 *   imageUri="https://example.com/pokemon.png"
 *   imageSize={120}
 *   showBackground={true}
 * />
 * ```
 */
export default function AnimatedPokemonOverlay({
  visible,
  imageUri,
  imageSize = 120,
  style,
  showBackground = true,
}: AnimatedPokemonOverlayProps) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  /**
   * Animation effect - handles entrance, exit, and continuous bounce animations
   */
  useEffect(() => {
    if (visible) {
      // Entrance animation: fade in + scale up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous bounce animation for liveliness
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();

      // Cleanup function to stop bounce animation
      return () => bounceAnimation.stop();
    } else {
      // Exit animation: fade out + scale down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, bounceAnim]);

  // Early return if not visible
  if (!visible) return null;

  // Interpolate bounce animation for vertical movement
  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10], // Move up 10px when bouncing
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY }],
        },
      ]}
    >
      {/* Conditional rendering based on showBackground prop */}
      {showBackground ? (
        <PokemonDisplay imageUri={imageUri} imageSize={imageSize} />
      ) : (
        <PokemonImage imageUri={imageUri} size={imageSize} />
      )}
    </Animated.View>
  );
}

/**
 * Styles for AnimatedPokemonOverlay component
 *
 * Note: Default positioning is absolute centered, but can be overridden
 * via the style prop for different use cases (e.g., relative positioning)
 */
const styles = StyleSheet.create({
  overlay: {
    // Default absolute positioning for overlay behavior
    // Can be overridden by style prop for different positioning needs
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -60, // Half of Pokemon container height (120px / 2)
    marginLeft: -60, // Half of Pokemon container width (120px / 2)
    zIndex: 1002, // Higher than tour guide to ensure visibility
    pointerEvents: "auto", // Allow tour guide interactions
  },
});
