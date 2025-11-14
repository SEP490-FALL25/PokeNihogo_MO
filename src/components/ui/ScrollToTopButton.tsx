import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Animated,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

interface ScrollToTopButtonProps {
  /**
   * Show/hide state from useScrollToTop hook
   */
  show: boolean;
  /**
   * Opacity animated value from useScrollToTop hook
   */
  opacity: Animated.Value;
  /**
   * Scroll to top function from useScrollToTop hook
   */
  onPress: () => void;
  /**
   * Button size (default: 56)
   */
  size?: number;
  /**
   * Button background color (default: "#14b8a6")
   */
  backgroundColor?: string;
  /**
   * Icon color (default: "#fff")
   */
  iconColor?: string;
  /**
   * Icon size (default: 28)
   */
  iconSize?: number;
  /**
   * Bottom position (default: 20)
   */
  bottom?: number;
  /**
   * Right position (default: 20)
   */
  right?: number;
}

/**
 * Custom hook to handle scroll to top button logic
 */
export function useScrollToTop(
  scrollRef: React.RefObject<any>,
  threshold: number = 200
) {
  const [showButton, setShowButton] = useState(false);
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Handle scroll to show/hide button
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    if (scrollY > threshold && !showButton) {
      setShowButton(true);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (scrollY <= threshold && showButton) {
      setShowButton(false);
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return {
    showButton,
    buttonOpacity,
    handleScroll,
    scrollToTop,
  };
}

/**
 * Scroll to top button component
 * Use with useScrollToTop hook
 */
export function ScrollToTopButton({
  show,
  opacity,
  onPress,
  size = 56,
  backgroundColor = "#14b8a6",
  iconColor = "#fff",
  iconSize = 28,
  bottom = 20,
  right = 20,
}: ScrollToTopButtonProps) {
  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          bottom,
          right,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.touchable,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
        ]}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="keyboard-arrow-up"
          size={iconSize}
          color={iconColor}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 999,
  },
  touchable: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

