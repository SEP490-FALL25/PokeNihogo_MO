import React, { useRef } from "react";
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";

interface BounceButtonProps {
  title: string;
  onPress?: () => void;
  withHaptics?: boolean;
}

export default function BounceButton({
  title,
  onPress,
  withHaptics = false,
}: BounceButtonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const shadowOpacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (withHaptics) {
      Vibration.vibrate(10);
    }
    onPress?.();

    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 6,
        duration: 25,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 0,
        duration: 25,
        useNativeDriver: true, // opacity supports native driver
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacity, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true, // opacity supports native driver
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {/* Red shadow/border effect */}
      <Animated.View
        style={[
          styles.shadow,
          {
            opacity: shadowOpacity,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.button,
          {
            transform: [
              {
                translateY: animatedValue,
              },
            ],
          },
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          style={styles.pressable}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignSelf: "center",
  },
  shadow: {
    position: "absolute",
    top: 6,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#cfcbca",
    borderRadius: 16,
    zIndex: 0,
  },
  button: {
    backgroundColor: "#84cc16",
    borderRadius: 16,
    zIndex: 1,
    elevation: 0, // Remove default Android shadow
  },
  pressable: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonText: {
    color: "#374151",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
