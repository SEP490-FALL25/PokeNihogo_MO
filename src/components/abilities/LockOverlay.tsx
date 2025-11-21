import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

type LockOverlayProps = {
  isVisible: boolean;
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

const DEFAULT_PALETTE = ["#fbbf24", "#fef3c7"];
const DEFAULT_SHAKE_SEGMENT = 120;
const DEFAULT_SHAKE_PAUSE = 1200;
const DEFAULT_PARTICLE_DELAY = 180;
const DEFAULT_TILT = 9;

export const LockOverlay: React.FC<LockOverlayProps> = ({
  isVisible,
  particlePalette = DEFAULT_PALETTE,
  particleCount = 6,
  radiusStart = 14,
  radiusStep = 2,
  particleSize = 14,
  lockIconColor = "#64748B",
  lockIconSize = 48,
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
        style={{
          transform: [{ rotateZ: shakeRotate }],
        }}
      >
        <MaterialCommunityIcons
          name="lock"
          size={lockIconSize}
          color={lockIconColor}
        />
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
                inputRange: [0, 0.3, 1],
                outputRange: [0, 1, 0],
              }),
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
                    outputRange: [0.4, 1, 0.2],
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
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
  },
  particle: {
    position: "absolute",
  },
});


