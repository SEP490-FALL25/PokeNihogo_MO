// ============================================================================
// IMPORTS
// ============================================================================
import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import { ThemedText } from "@components/ThemedText";
import AudioPlayer from "@components/ui/AudioPlayer";
import BounceButton from "@components/ui/BounceButton";
import MascotBubble from "@components/ui/MascotBubble";
import { Ionicons } from "@expo/vector-icons";
import { PlacementQuestion } from "@models/quiz/placement-question.common";
import { ROUTES } from "@routes/routes";
import { quizService } from "@services/quiz";
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
type QuestionType = "text" | "audio";
type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  answerIndex: number;
  difficulty: Difficulty;
  audioUrl?: string;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PlacementTestScreen() {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  const { t } = useTranslation();

  // Questions state
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Test progress state
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<number[]>([]);

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
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = (currentIndex + 1) / questions.length;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Handles option selection with haptic feedback
   * @param idx - The index of the selected option
   */
  const onChoose = (idx: number) => {
    Haptics.selectionAsync();
    setSelectedIndex(idx);
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
  /**
   * Fetch placement questions from API
   */
  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await quizService.getPlacementQuestions(1);
        
        if (response.data?.questions) {
          // Transform API questions to component format
          const transformedQuestions: Question[] = response.data.questions
            .filter((q: PlacementQuestion) => q.answers && q.answers.length > 0) // Filter out questions without answers
            .map((q: PlacementQuestion) => {
              // Find the correct answer index
              const correctAnswerIndex = q.answers.findIndex((a) => a.isCorrect);
              const answerIndex = correctAnswerIndex !== -1 ? correctAnswerIndex : 0;

              // Determine question type based on audioUrl and questionType
              const hasAudio = q.audioUrl !== null && q.audioUrl !== undefined && q.audioUrl !== "";
              const type: QuestionType = hasAudio ? "audio" : "text";

              // Map levelN (3, 4, 5) to difficulty ("N3", "N4", "N5")
              const difficulty: Difficulty = `N${q.levelN}` as Difficulty;

              return {
                id: q.id.toString(),
                type,
                question: q.question,
                options: q.answers.map((a) => a.answer),
                answerIndex,
                difficulty,
                audioUrl: q.audioUrl || undefined,
              };
            });

          // Shuffle questions
          const shuffled = shuffle(transformedQuestions);
          setQuestions(shuffled);
        } else {
          setError(t("auth.placement_test.no_questions"));
        }
      } catch (err) {
        console.error("Error fetching placement questions:", err);
        setError(
          err instanceof Error
            ? err.message
            : t("auth.placement_test.fetch_error")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [t]);

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
  const onNext = () => {
    if (selectedIndex == null) return;
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = selectedIndex;
    setAnswers(nextAnswers);
    setSelectedIndex(null);
    if (isLast) {
      const rec = computeRecommendation(questions, nextAnswers);
      setLevel(rec);
      setHasCompletedPlacementTest(true);
      router.replace(ROUTES.STARTER.SELECT_LEVEL as any);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex((i) => i + 1);
    }
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
            bubbleStyle={{ paddingHorizontal: 24, paddingVertical: 100 }}
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

// ============================================================================
// UTILITY FUNCTIONS (EXPORTED)
// ============================================================================
/**
 * Computes JLPT level recommendation based on test answers
 * Uses a simple heuristic algorithm to determine the appropriate level
 * @param questions - Array of test questions
 * @param answers - Array of user's answers (indices)
 * @returns Recommended JLPT difficulty level
 */
function computeRecommendation(
  questions: Question[],
  answers: number[]
): Difficulty {
  let correct = 0;
  let correctN3 = 0;
  let correctN4 = 0;

  // Count correct answers by difficulty level
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const a = answers[i];
    const isCorrect = a === q.answerIndex;
    if (isCorrect) {
      correct++;
      if (q.difficulty === "N3") correctN3++;
      if (q.difficulty === "N4") correctN4++;
    }
  }

  // Simple heuristic algorithm
  if (correct >= 8 || correctN3 >= 3) return "N3";
  if (correct >= 5 || correctN4 >= 3) return "N4";
  return "N5";
}
