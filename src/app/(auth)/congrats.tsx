import { HelloWave } from "@components/HelloWave";
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import starters from "../../../mock-data/starters.json";

type Starter = { id: string; name: string; type: string[]; image: string };

// Constants để tránh tạo object mới mỗi lần render
const CONFETTI_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const CONFETTI_CONFIG = {
  count: 300,
  origin: { x: -10, y: 0 },
  fadeOut: true,
  autoStart: false,
  colors: CONFETTI_COLORS,
  explosionSpeed: 350,
  fallSpeed: 2000,
};

const CONFETTI_DELAY = 500;

// Custom hook để quản lý confetti logic
const useConfetti = (delay: number = CONFETTI_DELAY) => {
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

// Memoized component để tránh re-render không cần thiết
const CongratsScreen = React.memo(() => {
  const starterId = useUserStore((state) => state.starterId);
  const { confettiRef } = useConfetti();

  // Memoize selected starter để tránh tính toán lại không cần thiết
  const selectedStarter = useMemo(() => {
    return (
      starters.find((starter: Starter) => starter.id === starterId) ||
      starters[0]
    );
  }, [starterId]);

  // Memoize styles để tránh tạo object mới mỗi lần render
  const containerStyle = useMemo(
    () => ({
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingHorizontal: 20,
    }),
    []
  );

  const badgeStyle = useMemo(
    () => ({
      backgroundColor: "#ffffff",
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }),
    []
  );

  const imageStyle = useMemo(
    () => ({
      width: 220,
      height: 220,
      marginBottom: 20,
    }),
    []
  );

  const buttonContainerStyle = useMemo(
    () => ({
      paddingHorizontal: 20,
      paddingBottom: 16,
    }),
    []
  );

  // Memoized callback để tránh re-render không cần thiết
  const handleGoHome = useCallback(() => {
    router.replace(ROUTES.AUTH.WELCOME);
  }, []);

  return (
    <StarterScreenLayout showBack={false}>
      <ConfettiCannon ref={confettiRef} {...CONFETTI_CONFIG} />
      <View style={containerStyle}>
        <View style={badgeStyle}>
          <ThemedText>Hurray!!</ThemedText>
        </View>

        <Image
          source={{ uri: selectedStarter.image }}
          style={imageStyle}
          resizeMode="contain"
        />
        <ThemedText
          type="title"
          style={{ textAlign: "center", marginBottom: 8 }}
        >
          Welcome <HelloWave />
        </ThemedText>
        <ThemedText
          style={{ textAlign: "center", color: "#6b7280", marginBottom: 4 }}
        >
          Your profile has been created successfully.
        </ThemedText>
        <ThemedText
          style={{ textAlign: "center", color: "#3b82f6", fontWeight: "600" }}
        >
          Your starter: {selectedStarter.name}
        </ThemedText>
      </View>

      <View style={buttonContainerStyle}>
        <BounceButton
          size="full"
          variant="solid"
          withHaptics
          onPress={handleGoHome}
        >
          CONTINUE TO HOME
        </BounceButton>
      </View>
    </StarterScreenLayout>
  );
});

// Export với display name để debugging
CongratsScreen.displayName = "CongratsScreen";

export default CongratsScreen;
