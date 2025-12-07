import { Image } from "expo-image";
import { Lock } from "lucide-react-native";
import React from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

type LockOverlayProps = {
  isVisible: boolean;
  pokemonImageUri?: string;
  pokemonImageSize?: number;
  particlePalette?: string[];
  particleCount?: number;
  radiusStart?: number;
  radiusStep?: number;
  particleSize?: number;
  lockIconColor?: string;
  lockIconSize?: number;
  particleDelay?: number;
  shakeSegmentDuration?: number;
  shakePauseDuration?: number;
  maxTiltDeg?: number;
  style?: ViewStyle;
};

// Pokemon-themed color palette: yellow/gold primary with type colors
const DEFAULT_PALETTE = [
  "#fbbf24", // Pokemon yellow/gold
  "#fcd34d", // Light amber
  "#ffa502", // Electric yellow
  "#ffd700", // Gold
  "#6FAFB2", // Pokemon teal/cyan
  "#94a3b8", // Slate for locked state
];
const DEFAULT_SHAKE_SEGMENT = 120;
const DEFAULT_SHAKE_PAUSE = 1200;
const DEFAULT_PARTICLE_DELAY = 180;
const DEFAULT_TILT = 9;

export const LockOverlay: React.FC<LockOverlayProps> = ({
  isVisible,
  pokemonImageUri,
  pokemonImageSize = 70,
  particlePalette = DEFAULT_PALETTE,
  particleCount = 6,
  radiusStart = 14,
  radiusStep = 2,
  particleSize = 14,
  lockIconColor = "#94a3b8", // Pokemon locked state gray
  lockIconSize = 40,
  particleDelay = DEFAULT_PARTICLE_DELAY,
  shakeSegmentDuration = DEFAULT_SHAKE_SEGMENT,
  shakePauseDuration = DEFAULT_SHAKE_PAUSE,
  maxTiltDeg = DEFAULT_TILT,
  style,
}) => {
  const shakeAnim = React.useRef(new Animated.Value(0)).current;
  const particleAnim = React.useRef(new Animated.Value(0)).current;
  const particleConfigs = React.useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, index) => {
        const angle = (index / particleCount) * Math.PI * 2;
        const radius = radiusStart + index * radiusStep;
        return {
          id: `lock-particle-${index}`,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          color: particlePalette[index % particlePalette.length],
        };
      }),
    [particleCount, radiusStart, radiusStep, particlePalette]
  );

  const totalShakeDuration = shakeSegmentDuration * 3;
  const particlePauseAfter = Math.max(shakePauseDuration - particleDelay, 0);

  const shakeRotate = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${maxTiltDeg}deg`, `${maxTiltDeg}deg`],
  });

  React.useEffect(() => {
    if (!isVisible) {
      shakeAnim.stopAnimation();
      particleAnim.stopAnimation();
      shakeAnim.setValue(0);
      particleAnim.setValue(0);
      return;
    }

    const shakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: shakeSegmentDuration,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: shakeSegmentDuration,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: shakeSegmentDuration,
          useNativeDriver: true,
        }),
        Animated.delay(shakePauseDuration),
      ])
    );

    const particleLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(particleDelay),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: totalShakeDuration,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(particlePauseAfter),
      ]),
      { resetBeforeIteration: true }
    );

    shakeLoop.start();
    particleLoop.start();

    return () => {
      shakeLoop.stop();
      particleLoop.stop();
    };
  }, [
    isVisible,
    particleDelay,
    particlePauseAfter,
    shakePauseDuration,
    shakeSegmentDuration,
    totalShakeDuration,
    particleAnim,
    shakeAnim,
  ]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={[styles.overlay, style]} pointerEvents="none">
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ rotateZ: shakeRotate }],
          },
        ]}
      >
        {/* Container for Pokemon and Lock - Lock will overlay Pokemon */}
        <View style={styles.lockAndPokemonContainer}>
          {/* Pokemon Image with silhouette effect (behind lock) */}
          {pokemonImageUri && (
            <View style={styles.pokemonContainer}>
              <Image
                source={{ uri: pokemonImageUri }}
                style={[
                  styles.pokemonImage,
                  {
                    width: pokemonImageSize,
                    height: pokemonImageSize,
                    tintColor: "#b2bcc9", // Silhouette color like locked Pokemon
                    opacity: 0.4, // Make it look like locked/uncaught Pokemon
                  },
                ]}
                contentFit="contain"
              />
            </View>
          )}

          {/* Lock Icon (overlaying Pokemon) */}
          <View style={styles.lockContainer}>
            {/* Glow effect behind lock */}
            <View style={[styles.lockGlow, { backgroundColor: lockIconColor }]} />
            <Lock size={lockIconSize} color={lockIconColor} strokeWidth={2.8} />
          </View>
        </View>
      </Animated.View>
      {particleConfigs.map((particle, index) => (
        <Animated.View
          key={`${particle.id}-${index}`}
          style={[
            styles.particle,
            {
              width: particleSize,
              height: particleSize,
              borderRadius: particleSize / 2,
              backgroundColor: particle.color,
              opacity: particleAnim.interpolate({
                inputRange: [0, 0.3, 0.7, 1],
                outputRange: [0, 1, 0.9, 0],
              }),
              shadowColor: particle.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              transform: [
                {
                  translateX: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, particle.x],
                  }),
                },
                {
                  translateY: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, particle.y],
                  }),
                },
                {
                  scale: particleAnim.interpolate({
                    inputRange: [0, 0.4, 1],
                    outputRange: [0.4, 1.1, 0.2],
                  }),
                },
                {
                  rotate: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(241, 245, 249, 0.85)", // Pokemon-style light slate background
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(148, 163, 184, 0.3)", // Subtle border for Pokemon theme
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  lockAndPokemonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  pokemonContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pokemonImage: {
    // Silhouette effect applied via tintColor and opacity in inline styles
  },
  lockContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1, // Lock on top of Pokemon
  },
  lockGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.2,
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  particle: {
    position: "absolute",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

