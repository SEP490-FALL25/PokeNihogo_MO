import BackScreen from "@components/mocules/Back";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { Button } from "@components/ui/Button";
import { Progress } from "@components/ui/Progress";
import { ROUTES } from "@routes/routes";
import { useUserStore } from "@stores/user/user.config";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const [recommended, setRecommended] = React.useState<Difficulty | null>(null);

  const setLevel = useUserStore((s) => (s as any).setLevel);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const onChoose = (idx: number) => {
    Haptics.selectionAsync();
    setSelectedIndex(idx);
  };

  const onNext = () => {
    if (selectedIndex == null) return;
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = selectedIndex;
    setAnswers(nextAnswers);
    setSelectedIndex(null);
    if (isLast) {
      const rec = computeRecommendation(questions, nextAnswers);
      setRecommended(rec);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentIndex((i) => i + 1);
    }
  };

  const onFinish = () => {
    if (!recommended) return;
    setLevel(recommended);
    router.push(ROUTES.AUTH.CHOOSE_STARTER as any);
  };

  if (questions.length === 0) {
    return (
      <ThemedView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <ThemedText>{t("auth.placement_test.no_questions")}</ThemedText>
      </ThemedView>
    );
  }

  if (recommended) {
    return (
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <BackScreen noWrapper />
          <View style={{ flex: 1 }}>
            <Progress value={100} />
          </View>
        </View>
        <ThemedText type="title" style={{ marginBottom: 12 }}>
          {t("auth.placement_test.recommended_title")}
        </ThemedText>
        <ThemedText style={{ marginBottom: 24 }}>
          {t("auth.placement_test.recommended_desc", { level: recommended })}
        </ThemedText>
        <Button onPress={onFinish}>
          {t("auth.placement_test.choose_starter")}
        </Button>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const progress = (currentIndex + 1) / questions.length;
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20, paddingTop: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <BackScreen noWrapper />
        <View style={{ flex: 1 }}>
          <Progress value={66} />
        </View>
      </View>
      <View style={{ marginBottom: 12 }}>
        <View style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 9999, overflow: 'hidden', marginBottom: 6 }}>
          <View style={{ width: `${progress * 100}%`, backgroundColor: '#3b82f6', height: '100%' }} />
        </View>
        <ThemedText>
          {t("auth.placement_test.progress", {
            current: currentIndex + 1,
            total: questions.length,
          })}
        </ThemedText>
      </View>
      <ThemedText type="title" style={{ marginBottom: 16 }}>
        {current.question}
      </ThemedText>
      <View style={{ gap: 10, marginBottom: 20 }}>
        {current.options.map((opt, idx) => {
          const isActive = selectedIndex === idx;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onChoose(idx)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 10,
                borderWidth: isActive ? 2 : 1,
                borderColor: isActive ? "#3b82f6" : "#e5e7eb",
                backgroundColor: isActive
                  ? "rgba(59,130,246,0.1)"
                  : "rgba(255,255,255,0.2)",
              }}
            >
              <ThemedText type="defaultSemiBold">{opt}</ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
      <Button disabled={selectedIndex == null} onPress={onNext}>
        {isLast ? t("common.finish") : t("common.next")}
      </Button>
      </SafeAreaView>
    </ThemedView>
  );
}

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
