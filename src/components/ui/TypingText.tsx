import { ThemedText } from "@components/ThemedText";
import React from "react";
import { Animated, Easing, TextStyle, View, ViewStyle } from "react-native";

type TypingTextProps = {
  messages: string | string[];
  typingSpeedMs?: number; // time per character when typing
  deletingSpeedMs?: number; // time per character when deleting
  pauseBeforeStartMs?: number; // initial delay before start
  pauseBetweenMessagesMs?: number; // pause after a message completes
  loop?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  onComplete?: () => void;
};

export const TypingText: React.FC<TypingTextProps> = ({
  messages,
  typingSpeedMs = 40,
  deletingSpeedMs = 20,
  pauseBeforeStartMs = 300,
  pauseBetweenMessagesMs = 1200,
  loop = false,
  showCursor = true,
  cursorChar = "|",
  containerStyle,
  textStyle,
  onComplete,
}) => {
  const messageList = React.useMemo(() => (Array.isArray(messages) ? messages : [messages]), [messages]);

  const [messageIndex, setMessageIndex] = React.useState(0);
  const [displayText, setDisplayText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  const cursorOpacity = React.useRef(new Animated.Value(1)).current;

  // Cursor blink animation
  React.useEffect(() => {
    if (!showCursor) return;
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    loopAnim.start();
    return () => {
      loopAnim.stop();
    };
  }, [cursorOpacity, showCursor]);

  // Typing effect
  React.useEffect(() => {
    let typingTimer: ReturnType<typeof setTimeout> | null = null;
    let startTimer: ReturnType<typeof setTimeout> | null = null;
    if (!started) {
      startTimer = setTimeout(() => setStarted(true), pauseBeforeStartMs);
      return () => {
        if (startTimer) clearTimeout(startTimer);
      };
    }

    const current = messageList[messageIndex] ?? "";
    const isDoneTyping = !isDeleting && displayText === current;
    const isDoneDeleting = isDeleting && displayText.length === 0;

    if (isDoneTyping) {
      typingTimer = setTimeout(() => {
        if (messageList.length === 1 && !loop) {
          onComplete?.();
          return;
        }
        setIsDeleting(true);
      }, pauseBetweenMessagesMs);
    } else if (isDoneDeleting) {
      const nextIndex = (messageIndex + 1) % messageList.length;
      if (nextIndex === 0 && !loop) {
        onComplete?.();
        return;
      }
      setMessageIndex(nextIndex);
      setIsDeleting(false);
    } else {
      const nextText = isDeleting
        ? current.slice(0, Math.max(0, displayText.length - 1))
        : current.slice(0, displayText.length + 1);
      typingTimer = setTimeout(() => setDisplayText(nextText), isDeleting ? deletingSpeedMs : typingSpeedMs);
    }

    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [started, displayText, isDeleting, messageIndex, messageList, typingSpeedMs, deletingSpeedMs, pauseBetweenMessagesMs, loop, onComplete, pauseBeforeStartMs]);

  // Reset display text when switching message index during forward typing
  React.useEffect(() => {
    if (!isDeleting && displayText.length === 0) {
      // ensure we start typing fresh message
    }
  }, [messageIndex, isDeleting, displayText.length]);

  // Determine when typing for the current message is finished
  const currentMessage = messageList[messageIndex] ?? "";
  const isFinishedPhase = !isDeleting && displayText === currentMessage;

  return (
    <View style={containerStyle}>
      <ThemedText style={textStyle}>
        {displayText}
        {showCursor && !isFinishedPhase ? (
          <Animated.Text style={{ opacity: cursorOpacity }}>{cursorChar}</Animated.Text>
        ) : null}
      </ThemedText>
    </View>
  );
};

export default TypingText;


