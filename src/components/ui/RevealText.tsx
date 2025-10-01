import { ThemedText } from "@components/ThemedText";
import React from "react";
import { Animated, Easing, TextStyle, View, ViewStyle } from "react-native";

type RevealTextProps = {
  text: string;
  speedMs?: number; // time per character
  delayMs?: number; // initial delay before start
  showCursor?: boolean;
  cursorChar?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  onComplete?: () => void;
};

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  speedMs = 35,
  delayMs = 200,
  showCursor = true,
  cursorChar = "|",
  containerStyle,
  textStyle,
  onComplete,
}) => {
  const [visibleCount, setVisibleCount] = React.useState(0);
  const [started, setStarted] = React.useState(false);
  const cursorOpacity = React.useRef(new Animated.Value(1)).current;

  // blink cursor
  React.useEffect(() => {
    if (!showCursor) return;
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, [cursorOpacity, showCursor]);

  // reveal effect
  React.useEffect(() => {
    let tickTimer: ReturnType<typeof setTimeout> | null = null;
    let startTimer: ReturnType<typeof setTimeout> | null = null;

    if (!started) {
      startTimer = setTimeout(() => setStarted(true), delayMs);
      return () => {
        if (startTimer) clearTimeout(startTimer);
      };
    }

    if (visibleCount < text.length) {
      tickTimer = setTimeout(() => setVisibleCount((c) => c + 1), speedMs);
    } else if (visibleCount === text.length) {
      onComplete?.();
    }

    return () => {
      if (tickTimer) clearTimeout(tickTimer);
    };
  }, [started, visibleCount, text.length, speedMs, delayMs, onComplete]);

  const shown = React.useMemo(
    () => text.slice(0, visibleCount),
    [text, visibleCount]
  );
  const isDone = visibleCount >= text.length;

  return (
    <View style={containerStyle}>
      <ThemedText style={textStyle}>
        {shown}
        {showCursor && !isDone ? (
          <Animated.Text style={{ opacity: cursorOpacity }}>
            {cursorChar}
          </Animated.Text>
        ) : null}
      </ThemedText>
    </View>
  );
};

export default RevealText;
