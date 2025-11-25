import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet, ViewStyle } from "react-native";
import PokemonImage from "../atoms/PokemonImage";
import PokemonDisplay from "../molecules/PokemonDisplay";

// Storage key for saving position
const STORAGE_KEY = "@AnimatedPokemonOverlay:position";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
  
  // Drag position values
  const pan = useRef(new Animated.ValueXY()).current;
  const [initialLoadCompleted, setInitialLoadCompleted] = useState(false);
  const isInitializing = useRef(false);
  const isDragging = useRef(false);
  const savedBounceOffset = useRef(0); // Store bounce offset when starting drag
  
  // Calculate overlay size based on imageSize
  const overlaySize = imageSize + 20; // Add padding

  // Save position to AsyncStorage
  const savePosition = useCallback(
    async (x: number, y: number) => {
      try {
        const position = JSON.stringify({ x, y });
        await AsyncStorage.setItem(STORAGE_KEY, position);
      } catch (e) {
        console.error("Error saving position:", e);
      }
    },
    []
  );

  // Initialize position from AsyncStorage
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const initializePosition = async () => {
      // Default position (center of screen)
      const defaultPosition = {
        x: screenWidth / 2 - overlaySize / 2,
        y: screenHeight / 2 - overlaySize / 2,
      };

      try {
        const storedPosition = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedPosition !== null) {
          const { x, y } = JSON.parse(storedPosition);
          
          // Validate position is within screen bounds
          const validX = Math.max(0, Math.min(x, screenWidth - overlaySize));
          const validY = Math.max(0, Math.min(y, screenHeight - overlaySize));
          
          pan.setValue({ x: validX, y: validY });
        } else {
          pan.setValue(defaultPosition);
        }
      } catch (e) {
        console.error("Error loading position:", e);
        pan.setValue(defaultPosition);
      } finally {
        setInitialLoadCompleted(true);
      }
    };

    if (visible) {
      initializePosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // PanResponder for drag handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        // Get current bounce offset
        const currentBounce = (bounceAnim as any)._value || 0;
        savedBounceOffset.current = currentBounce * -10; // Save bounce offset
        
        // Get current pan.y value
        const currentPanY = (pan.y as any)._value || 0;
        const currentX = (pan.x as any)._value || 0;
        
        // Calculate actual displayed Y (pan.y + bounce offset)
        const currentActualY = currentPanY + savedBounceOffset.current;
        
        // Mark as dragging
        isDragging.current = true;
        
        // Set pan.y to actual displayed position (this will be the base for dragging)
        pan.setValue({ 
          x: currentX, 
          y: currentActualY 
        });
        
        // Save current position as offset
        pan.setOffset({
          x: currentX,
          y: currentActualY,
        });
        // Reset current value to 0 for relative movement
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false } // Must be false for position-based transforms
      ),

      onPanResponderRelease: () => {
        // Flatten offset into value
        pan.flattenOffset();

        // Get final position and constrain to screen bounds
        let finalX = (pan.x as any)._value;
        let finalY = (pan.y as any)._value;

        // Constrain X (0 to screenWidth - overlaySize)
        finalX = Math.max(0, Math.min(finalX, screenWidth - overlaySize));
        // Constrain Y (0 to screenHeight - overlaySize)
        finalY = Math.max(0, Math.min(finalY, screenHeight - overlaySize));

        // Set final position
        pan.setValue({ x: finalX, y: finalY });

        // Save position
        savePosition(finalX, finalY);
        
        // Re-enable bounce animation
        isDragging.current = false;
      },
    })
  ).current;

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

  // Create combined translateY that adds bounce to pan.y
  // Must be declared before early returns to follow Rules of Hooks
  const combinedTranslateY = useRef(new Animated.Value(0)).current;
  
  // Update combined translateY when pan.y or bounce changes
  // Must be called before early returns to follow Rules of Hooks
  useEffect(() => {
    if (!visible || !initialLoadCompleted) return;

    // Helper function to update translateY
    const updateTranslateY = () => {
      const panYValue = (pan.y as any)._value || 0;
      
      if (isDragging.current) {
        // When dragging, use pan.y directly (bounce already subtracted)
        combinedTranslateY.setValue(panYValue);
      } else {
        // When not dragging, add bounce animation
        const bounceValue = (bounceAnim as any)._value || 0;
        const bounceOffset = bounceValue * -10; // Bounce moves up 10px
        combinedTranslateY.setValue(panYValue + bounceOffset);
      }
    };

    // Initial update
    updateTranslateY();

    // Set up listeners
    const panYListener = pan.y.addListener(updateTranslateY);
    const bounceListener = bounceAnim.addListener(updateTranslateY);

    return () => {
      pan.y.removeListener(panYListener);
      bounceAnim.removeListener(bounceListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialLoadCompleted]);

  // Early return if not visible
  if (!visible) return null;

  // Don't render until position is loaded
  if (!initialLoadCompleted) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        style,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateX: pan.x },
            { translateY: combinedTranslateY },
          ],
        },
      ]}
      {...panResponder.panHandlers}
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
    // Position will be controlled by pan transform
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 1002, // Higher than tour guide to ensure visibility
    pointerEvents: "auto", // Allow drag interactions
  },
});
