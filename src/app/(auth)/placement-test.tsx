import StarterScreenLayout from "@components/layouts/StarterScreenLayout";
import { ThemedText } from "@components/ThemedText";
import BounceButton from "@components/ui/BounceButton";
// removed Card in favor of MascotBubble
import MascotBubble from "@components/ui/MascotBubble";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, TouchableOpacity, View } from "react-native";
import questionsData from "../../../mock-data/placement-questions.json";

type Difficulty = "N5" | "N4" | "N3";
type Question = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  difficulty: Difficulty;
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PlacementTestScreen() {
  const { t } = useTranslation();
  const [questions] = React.useState<Question[]>(() => {
    const all = questionsData as Question[];
    const shuffled = shuffle(all);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  });
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [answers, setAnswers] = React.useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const setLevel = useUserStore((s) => (s as any).setLevel);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const onChoose = (idx: number) => {
    Haptics.selectionAsync();
    setSelectedIndex(idx);
  };

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

  // Animation effect khi đang speak
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

  // Cleanup khi component unmount
  React.useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const onNext = () => {
    if (selectedIndex == null) return;
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = selectedIndex;
    setAnswers(nextAnswers);
    setSelectedIndex(null);
    if (isLast) {
      const rec = computeRecommendation(questions, nextAnswers);
      setLevel(rec);
      router.push(ROUTES.AUTH.SELECT_LEVEL as any);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex((i) => i + 1);
    }
  };

  if (questions.length === 0) {
    return (
      <StarterScreenLayout currentStep={1} totalSteps={2}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <ThemedText>{t("auth.placement_test.no_questions")}</ThemedText>
        </View>
      </StarterScreenLayout>
    );
  }

  const maxOptionsForGrid = 4;
  const maxLenPerOption = 15; // Giảm từ 22 xuống 15 để dễ hiển thị 2x2
  const shouldUseGrid =
    !!current &&
    Array.isArray(current.options) &&
    current.options.length === maxOptionsForGrid && // Chỉ dùng grid khi có đúng 4 options
    current.options.every((o) => (o ?? "").length <= maxLenPerOption);
  return (
    <StarterScreenLayout currentStep={1} totalSteps={2}>
      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 12, paddingHorizontal: 20 }}>
          {/* <ThemedText
            type="defaultSemiBold"
            style={{ marginBottom: 6, fontSize: 30 }}
          >
            {t("auth.placement_test.progress_title")}
          </ThemedText> */}
          {/* <View
            style={{
              height: 6,
              backgroundColor: "#e5e7eb",
              borderRadius: 9999,
              overflow: "hidden",
              marginBottom: 6,
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                backgroundColor: "#3b82f6",
                height: "100%",
              }}
            />
          </View> */}
        </View>
        <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
          <MascotBubble
            bubbleStyle={{ paddingHorizontal: 24, paddingVertical: 100 }}
            titleTextStyle={{ fontSize: 16 }}
            contentTextStyle={{ fontSize: 20, lineHeight: 30 }}
            mascotImageStyle={{ width: 84, height: 84 }}
            action={
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
                  borderRadius: 9999,
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
                  <ThemedText style={{ fontSize: 18 }}>
                    {isSpeaking ? "🔊" : "🔊"}
                  </ThemedText>
                </Animated.View>
              </TouchableOpacity>
            }
          >
            {current.question}
          </MascotBubble>
        </View>
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

//fake caculation
function computeRecommendation(
  questions: Question[],
  answers: number[]
): Difficulty {
  let correct = 0;
  let correctN3 = 0;
  let correctN4 = 0;
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
  // Simple heuristic
  if (correct >= 8 || correctN3 >= 3) return "N3";
  if (correct >= 5 || correctN4 >= 3) return "N4";
  return "N5";
}
