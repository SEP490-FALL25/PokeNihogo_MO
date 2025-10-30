import QuizLayout from "@components/layouts/QuizLayout";
import { Button } from "@components/ui/Button";
import { QuizResult } from "@models/quiz/quiz.common";
// import { ROUTES } from "@routes/routes";
import ResultValueCard from "@components/quiz/ResultValueCard";
import BounceButton from "@components/ui/BounceButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function QuizResultScreen() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadQuizResult = useCallback(async () => {
    try {
      setIsLoading(true);

      // In a real app, you would fetch the result by ID
      // For now, we'll create a mock result for demo purposes
      const mockResult: QuizResult = {
        sessionId: resultId || "mock-session",
        userId: "current-user",
        category: "vocabulary",
        level: "N5",
        totalQuestions: 5,
        correctAnswers: 4,
        score: 80,
        totalPoints: 50,
        earnedPoints: 40,
        timeSpent: 8,
        completedAt: new Date().toISOString(),
        pokemonReward: {
          id: "eevee",
          name: "Eevee",
          image:
            "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
          rarity: "UNCOMMON",
        },
        achievements: ["Quiz Master", "Knowledge Seeker"],
      };

      setResult(mockResult);
    } catch (error) {
      console.error("Error loading quiz result:", error);
      Alert.alert("Lỗi", "Không thể tải kết quả quiz. Vui lòng thử lại.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [resultId]);

  useEffect(() => {
    loadQuizResult();
  }, [resultId, loadQuizResult]);

  // kept for future use
  // const handleRetakeQuiz = async () => {};

  // const handleTryDifferentQuiz = async () => {};

  // const handleViewHistory = () => {};

  const handleGoHome = () => {
    // Navigate back to home
    router.replace("/(app)/(tabs)/home");
  };

  const handleViewAnswers = () => {
    if (!result) return;
    router.push({ pathname: "/quiz/review/[sessionId]", params: { sessionId: result.sessionId } });
  };

  if (isLoading) {
    return (
      <QuizLayout>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </QuizLayout>
    );
  }

  if (!result) {
    return (
      <QuizLayout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy kết quả quiz</Text>
          <Button onPress={() => router.back()}>Quay lại</Button>
        </View>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Lesson completed!</Text>

        <View style={styles.mascotWrap}>
          <Image
            source={require("../../../../../assets/images/PokeNihongoLogo.png")}
            resizeMode="contain"
            style={styles.mascot}
          />
        </View>

        <ResultValueCard
          title="Diamonds"
          value={result.earnedPoints}
          icon={<MaterialCommunityIcons name="diamond" size={22} color="#1d4ed8" />}
          headerGradientColors={["#4f86ff", "#2f66f3"]}
          style={styles.diamondCard}
        />

        <View style={styles.tileRow}>
          <ResultValueCard
            title="Total XP"
            value={result.totalPoints}
            icon={<MaterialCommunityIcons name="lightning-bolt" size={18} color="#92400e" />}
            headerGradientColors={["#f59e0b", "#fbbf24"]}
            style={styles.tile}
            size="compact"
          />

          <ResultValueCard
            title="Time"
            value={`${result.timeSpent}m`}
            icon={<MaterialCommunityIcons name="timer-outline" size={18} color="#065f46" />}
            headerGradientColors={["#10b981", "#34d399"]}
            style={styles.tile}
            size="compact"
          />

          <ResultValueCard
            title="Accuracy"
            value={`${result.score}%`}
            icon={<MaterialCommunityIcons name="target-variant" size={18} color="#991b1b" />}
            headerGradientColors={["#ef4444", "#f87171"]}
            style={styles.tile}
            size="compact"
          />
        </View>

        <View style={styles.ctaWrap}>
          <BounceButton variant="default" onPress={handleGoHome} >
            CONTINUE
          </BounceButton>
          <View style={{ height: 12 }} />
          <BounceButton variant="secondary" onPress={handleViewAnswers} >
            Xem đáp án
          </BounceButton>
        </View>
      </ScrollView>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#dc2626",
    marginBottom: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6d28d9",
    textAlign: "center",
    marginBottom: 12,
  },
  mascotWrap: {
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  mascot: {
    width: 180,
    height: 140,
  },
  diamondCard: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  tileRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  tile: {
    flex: 1,
  },
  ctaWrap: {
    width: "100%",
    marginTop: 24,
    marginBottom: 48,
  },
  ctaButton: {
    height: 48,
    borderRadius: 24,
  },
});
