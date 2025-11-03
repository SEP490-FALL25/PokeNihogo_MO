// ============================================================================
// IMPORTS
// ============================================================================
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import { ThemedText } from "@components/ThemedText";
import AudioPlayer from "@components/ui/AudioPlayer";
import BounceButton from "@components/ui/BounceButton";
import MascotBubble from "@components/ui/MascotBubble";
import { Ionicons } from "@expo/vector-icons";
import { usePlacementTest } from "@hooks/usePlacementTest";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, TouchableOpacity, View } from "react-native";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type Difficulty = "N5" | "N4" | "N3";
//

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
// (moved data ops to hook)

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PlacementTestScreen() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  const { t } = useTranslation();

  const {
    questions,
    current,
    isLast,
    progress,
    isLoading,
    error,
    selectedIndex,
    selectOption,
    next,
  } = usePlacementTest(1);

  // Speech state
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Store selectors
  const setLevel = useUserStore((s) => (s as any).setLevel);
  const setHasCompletedPlacementTest = useUserStore(
    (s) => (s as any).setHasCompletedPlacementTest
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const currentIndex = React.useMemo(
    () => (questions && current ? questions.findIndex((q: any) => q.id === (current as any).id) : 0),
    [questions, current]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Handles option selection with haptic feedback
   * @param idx - The index of the selected option
   */
  const onChoose = async (idx: number) => {
    Haptics.selectionAsync();
    await selectOption(idx);
  };

  /**
   * Handles text-to-speech functionality for questions
   */
  const handleSpeak = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    Speech.speak(current.question, {
      language: "ja-JP",
      onDone: () => {
        setIsSpeaking(false);
      },
      onStopped: () => {
        setIsSpeaking(false);
      },
      onError: () => {
        setIsSpeaking(false);
      },
    });
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================
  // data fetching is handled inside the usePlacementTest hook

  /**
   * Animation effect for speaking state - creates pulsing animation
   */
  React.useEffect(() => {
    if (isSpeaking) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSpeaking, scaleAnim]);

  /**
   * Cleanup effect - stops speech when component unmounts
   */
  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================
  /**
   * Handles back navigation
   */
  const handleBack = React.useCallback(() => {
    router.back();
  }, []);

  /**
   * Handles moving to next question or completing the test
   */
  const onNext = async () => {
    if (selectedIndex == null) return;
    const result = await next();
    if (!result?.finished) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    if (result.recommended) setLevel(result.recommended as Difficulty);
    setHasCompletedPlacementTest(true);
    router.replace(ROUTES.STARTER.SELECT_LEVEL as any);
  };

  // ============================================================================
  // EARLY RETURNS & VALIDATION
  // ============================================================================
  if (isLoading) {
    return (
      <StarterScreenLayout currentStep={1} totalSteps={2} onBack={handleBack}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
          <ThemedText style={{ marginTop: 16 }}>
            {t("auth.placement_test.loading")}
          </ThemedText>
        </View>
      </StarterScreenLayout>
    );
  }

  if (error || questions.length === 0) {
    return (
      <StarterScreenLayout currentStep={1} totalSteps={2} onBack={handleBack}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <ThemedText style={{ textAlign: "center" }}>
            {error || t("auth.placement_test.no_questions")}
          </ThemedText>
        </View>
      </StarterScreenLayout>
    );
  }

  // ============================================================================
  // LAYOUT CONFIGURATION
  // ============================================================================
  const maxOptionsForGrid = 4;
  const maxLenPerOption = 15; // Reduced from 22 to 15 for better 2x2 grid display
  const shouldUseGrid =
    !!current &&
    Array.isArray(current.options) &&
    current.options.length === maxOptionsForGrid && // Only use grid when exactly 4 options
    current.options.every((o) => (o ?? "").length <= maxLenPerOption);
  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <StarterScreenLayout currentStep={1} totalSteps={2} onBack={handleBack}>
      <View style={{ flex: 1 }}>
        {/* Progress Section */}
        <View style={{ marginBottom: 12, paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
              {t("auth.placement_test.progress_title")}
            </ThemedText>
            <ThemedText
              type="default"
              style={{ fontSize: 14, color: "#6b7280" }}
            >
              {currentIndex + 1}/{questions.length}
            </ThemedText>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: "#e5e7eb",
              borderRadius: 9999,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                backgroundColor: "#3b82f6",
                height: "100%",
                borderRadius: 9999,
              }}
            />
          </View>
        </View>
        {/* Question Section */}
        <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
          <MascotBubble
            bubbleStyle={{ paddingHorizontal: 24, paddingVertical: 70 }}
            titleTextStyle={{ fontSize: 16 }}
            contentTextStyle={{ fontSize: 20, lineHeight: 30 }}
            mascotImageStyle={{ width: 84, height: 84 }}
            action={
              current.type === "audio" ? (
                <AudioPlayer
                  audioUrl={current.audioUrl || ""}
                  style={{ alignItems: "center" }}
                />
              ) : (
                <TouchableOpacity
                  onPress={handleSpeak}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isSpeaking
                      ? t("auth.placement_test.stop_speaking")
                      : t("auth.placement_test.speak_question")
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: isSpeaking ? "#3b82f6" : "#e5e7eb",
                    backgroundColor: isSpeaking
                      ? "rgba(59,130,246,0.1)"
                      : "#ffffff",
                  }}
                >
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Ionicons
                      name={isSpeaking ? "volume-high" : "volume-high"}
                      size={18}
                      color="#3b82f6"
                    />
                  </Animated.View>
                </TouchableOpacity>
              )
            }
          >
            {current.question}
          </MascotBubble>
        </View>
        {/* Options Section */}
        <View
          style={{
            gap: 12,
            marginBottom: 24,
            marginTop: 20,
            flexDirection: shouldUseGrid ? "row" : "column",
            flexWrap: shouldUseGrid ? "wrap" : "nowrap",
            justifyContent: shouldUseGrid ? "space-between" : "flex-start",
            paddingHorizontal: 20,
          }}
        >
          {current.options.map((opt, idx) => {
            const isActive = selectedIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => onChoose(idx)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderRadius: 16,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? "#3b82f6" : "#e5e7eb",
                  backgroundColor: "#ffffff",
                  width: shouldUseGrid ? "48%" : "100%",
                  minHeight: 56,
                }}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={{ textAlign: "center" }}
                >
                  {`${String.fromCharCode(65 + idx)}. ${opt}`}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Action Button Section */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <BounceButton
          variant="solid"
          disabled={selectedIndex == null}
          onPress={onNext}
        >
          {isLast ? t("common.finish") : t("common.next")}
        </BounceButton>
      </View>
    </StarterScreenLayout>
  );
}
