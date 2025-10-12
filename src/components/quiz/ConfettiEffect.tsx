import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

interface ConfettiEffectProps {
  visible: boolean;
  duration?: number;
}

const { width, height } = Dimensions.get("window");

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  visible,
  duration = 3000,
}) => {
  const confettiAnimations = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;

  const confettiPositions = useRef(
    Array.from({ length: 20 }, () => ({
      x: Math.random() * width,
      y: -50,
      rotation: Math.random() * 360,
      color: ["#3b82f6", "#22C55E", "#6FAFB2", "#f59e0b", "#ef4444", "#8b5cf6"][
        Math.floor(Math.random() * 6)
      ],
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Start all confetti animations
      const animations = confettiAnimations.map((anim, index) => {
        const position = confettiPositions[index];

        return Animated.parallel([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration,
            delay: duration * 0.7,
            useNativeDriver: true,
          }),
        ]);
      });

      Animated.parallel(animations).start();
    } else {
      // Reset animations
      confettiAnimations.forEach((anim) => anim.setValue(0));
    }
  }, [visible, duration]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {confettiAnimations.map((anim, index) => {
        const position = confettiPositions[index];

        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [position.y, height + 100],
        });

        const rotate = anim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "720deg"],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={index}
            style={{
              position: "absolute",
              left: position.x,
              top: 0,
              width: 8,
              height: 8,
              backgroundColor: position.color,
              borderRadius: 2,
              transform: [{ translateY }, { rotate }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};
