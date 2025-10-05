import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import PokemonDisplay from '../molecules/PokemonDisplay';

interface AnimatedPokemonOverlayProps {
  visible: boolean;
  imageUri: string;
  imageSize?: number;
}

export default function AnimatedPokemonOverlay({ 
  visible, 
  imageUri, 
  imageSize = 120 
}: AnimatedPokemonOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
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

      // Continuous bounce animation
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

      return () => bounceAnimation.stop();
    } else {
      // Exit animation
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

  if (!visible) return null;

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY },
          ],
        },
      ]}
    >
      <PokemonDisplay
        imageUri={imageUri}
        imageSize={imageSize}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -500, // Half of Pokemon container height
    marginLeft: -60, // Half of Pokemon container width
    zIndex: 1001, // Higher than interaction blocker
    pointerEvents: 'auto', // Allow tour guide interactions
  },
});
