import { useEffect, useRef, useState } from "react";
import ConfettiCannon from "react-native-confetti-cannon";

/**
 * Custom hook to manage confetti animation logic
 * Handles delayed confetti trigger to avoid creating new objects on each render
 * @param delay - Delay before confetti starts (default: 500ms)
 * @returns Object containing confetti ref and triggered state
 */
export const useConfetti = (delay: number = 500) => {
  const confettiRef = useRef<ConfettiCannon>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (triggered) return;

    const timer = setTimeout(() => {
      confettiRef.current?.start();
      setTriggered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [triggered, delay]);

  return { confettiRef, triggered };
};

export default useConfetti;
