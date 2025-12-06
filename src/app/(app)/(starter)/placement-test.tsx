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
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

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
  const speechScaleAnim = React.useRef(new Animated.Value(1)).current;

  // Result state
  const [testResult, setTestResult] = React.useState<{
    levelN: number;
    levelId: number | null;
    totalCorrect: number;
    totalQuestions: number;
    percentage: number;
    recommended: Difficulty;
  } | null>(null);

  // Animation values for result screen
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const resultScaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const trophyScaleAnim = React.useRef(new Animated.Value(0)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Store selectors
  const setLevel = useUserStore((s) => (s as any).setLevel);
  const setHasCompletedPlacementTest = useUserStore(
    (s) => (s as any).setHasCompletedPlacementTest
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const currentIndex = React.useMemo(
    () =>
      questions && current
        ? questions.findIndex((q: any) => q.id === (current as any).id)
        : 0,
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
          Animated.timing(speechScaleAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(speechScaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(speechScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSpeaking, speechScaleAnim]);

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

    // Lưu kết quả và hiển thị màn hình kết quả
    if (result.levelN && result.totalCorrect !== undefined) {
      setTestResult({
        levelN: result.levelN,
        levelId: result.levelId || null,
        totalCorrect: result.totalCorrect,
        totalQuestions: result.totalQuestions || questions.length,
        percentage: result.percentage || 0,
        recommended: result.recommended,
      });
      // Lưu gợi ý level và trạng thái hoàn thành test vào store
      if (result.recommended) {
        setLevel(result.recommended as Difficulty);
        setHasCompletedPlacementTest(true);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Fallback nếu không có kết quả chi tiết
      if (result.recommended) setLevel(result.recommended as Difficulty);
      setHasCompletedPlacementTest(true);
      router.replace(ROUTES.STARTER.SELECT_LEVEL as any);
    }
  };

  /**
   * Handles continuing after viewing results
   */
  const handleContinue = () => {
    if (testResult?.recommended) {
      setLevel(testResult.recommended);
    }
    setHasCompletedPlacementTest(true);
    setTestResult(null);
    router.replace(ROUTES.STARTER.SELECT_LEVEL as any);
  };

  // Animation effect for result screen
  React.useEffect(() => {
    if (testResult) {
      // Reset animations
      fadeAnim.setValue(0);
      resultScaleAnim.setValue(0.8);
      trophyScaleAnim.setValue(0);
      progressAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(resultScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(200),
          Animated.spring(trophyScaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(progressAnim, {
          toValue: testResult.percentage,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [testResult, fadeAnim, resultScaleAnim, trophyScaleAnim, progressAnim]);

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
  // Helper function for level gradient
  const getLevelGradient = (level: Difficulty): [string, string, string] => {
    switch (level) {
      case "N3":
        return ["#8b5cf6", "#a78bfa", "#c4b5fd"];
      case "N4":
        return ["#3b82f6", "#60a5fa", "#93c5fd"];
      default:
        return ["#10b981", "#34d399", "#6ee7b7"];
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  // Hiển thị màn hình kết quả nếu có
  if (testResult) {
    return (
      <StarterScreenLayout currentStep={1} totalSteps={2} onBack={handleBack}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ scale: resultScaleAnim }],
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Trophy */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Animated.View
                style={{
                  transform: [{ scale: trophyScaleAnim }],
                }}
              >
                <LinearGradient
                  colors={["#fbbf24", "#f59e0b", "#d97706"]}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Ionicons name="trophy" size={60} color="#ffffff" />
                </LinearGradient>
              </Animated.View>
              <ThemedText
                type="defaultSemiBold"
                style={{ fontSize: 32, marginBottom: 8, color: "#ffffff", padding: 20 }}
              >
                {t("auth.placement_test.result_title")}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.9)",
                  textAlign: "center",
                }}
              >
                {t("auth.placement_test.result_subtitle")}
              </ThemedText>
            </View>

            {/* Level Result Card with Gradient */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ scale: resultScaleAnim }],
              }}
            >
              <LinearGradient
                colors={getLevelGradient(testResult.recommended)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 32,
                  marginBottom: 24,
                  alignItems: "center",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: 16,
                    fontWeight: "500",
                  }}
                >
                  {t("auth.placement_test.recommended_level")}
                </ThemedText>
                <View
                  style={{
                    minHeight: 60,
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <ThemedText
                    type="defaultSemiBold"
                    style={{
                      fontSize: 56,
                      color: "#ffffff",
                      textShadowColor: "rgba(0,0,0,0.2)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                      padding: 30,
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {testResult.recommended}
                  </ThemedText>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Statistics Cards */}
            <View style={{ gap: 16, marginBottom: 24 }}>
              {/* Total Questions Card */}
              <View
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 20,
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#f3f4f6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Ionicons name="document-text" size={28} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}
                  >
                    {t("auth.placement_test.total_questions")}
                  </ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ fontSize: 24, color: "#111827" }}
                  >
                    {testResult.totalQuestions}
                  </ThemedText>
                </View>
              </View>

              {/* Correct Answers Card */}
              <View
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 20,
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#ecfdf5",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={28} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}
                  >
                    {t("auth.placement_test.correct_answers")}
                  </ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ fontSize: 24, color: "#10b981" }}
                  >
                    {testResult.totalCorrect}
                  </ThemedText>
                </View>
              </View>

              {/* Percentage Card */}
              <View
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 20,
                  padding: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#eff6ff",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Ionicons name="stats-chart" size={28} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}
                  >
                    {t("auth.placement_test.percentage")}
                  </ThemedText>
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ fontSize: 24, color: "#3b82f6" }}
                  >
                    {testResult.percentage.toFixed(1)}%
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Progress Bar with Animation */}
            <View style={{ marginBottom: 32 }}>
              <View
                style={{
                  height: 16,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 9999,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={{
                    width: progressWidth,
                    height: "100%",
                    backgroundColor: "#10b981",
                    borderRadius: 9999,
                  }}
                />
              </View>
            </View>

            {/* Continue Button */}
            <View style={{ paddingBottom: 20 }}>
              <BounceButton variant="solid" onPress={handleContinue}>
                {t("common.continue")}
              </BounceButton>
            </View>
          </ScrollView>
        </Animated.View>
      </StarterScreenLayout>
    );
  }

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
                  <Animated.View
                    style={{ transform: [{ scale: speechScaleAnim }] }}
                  >
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
