import QuizLayout from "@components/layouts/QuizLayout";
import ResultValueCard from "@components/quiz/ResultValueCard";
import BounceButton from "@components/ui/BounceButton";
import { Button } from "@components/ui/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ISubmitCompletionData } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function QuizResultScreen() {
  const { resultId, resultData, message, timeSpent } = useLocalSearchParams<{
    resultId: string;
    resultData?: string;
    message?: string;
    timeSpent?: string;
  }>();

  // Parse result data from params
  const result: ISubmitCompletionData | null = useMemo(() => {
    if (!resultData) return null;
    try {
      return JSON.parse(resultData) as ISubmitCompletionData;
    } catch (error) {
      console.error("Error parsing result data:", error);
      return null;
    }
  }, [resultData]);

  const timeSpentNumber = useMemo(() => {
    return timeSpent ? parseInt(timeSpent, 10) : 0;
  }, [timeSpent]);

  const handleGoHome = () => {
    // Navigate back to home
    router.replace("/(app)/(tabs)/home");
  };

  const handleViewAnswers = () => {
    if (!resultId) return;
    // resultId is actually exerciseAttemptId
    router.push({
      pathname: "/quiz/review/[sessionId]",
      params: { sessionId: resultId },
    });
  };

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

  // Format time spent (convert seconds to minutes)
  const timeSpentMinutes = Math.floor(timeSpentNumber / 60);
  const timeSpentSeconds = timeSpentNumber % 60;
  const timeDisplay =
    timeSpentMinutes > 0
      ? `${timeSpentMinutes}m ${timeSpentSeconds}s`
      : `${timeSpentSeconds}s`;

  // Determine title based on status
  const getTitle = () => {
    if (result.status === "FAIL") {
      return "Bài làm hoàn thành!";
    }
    if (result.allCorrect) {
      return "Hoàn thành xuất sắc!";
    }
    return "Bài làm hoàn thành!";
  };

  // Determine status message
  const getStatusMessage = () => {
    if (message) return message;
    if (result.status === "FAIL") {
      return "Bạn đã hoàn thành bài tập nhưng có một số câu trả lời sai";
    }
    if (result.allCorrect) {
      return "Chúc mừng! Bạn đã trả lời đúng tất cả các câu hỏi!";
    }
    return "Bạn đã hoàn thành bài tập";
  };

  return (
    <QuizLayout>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{getTitle()}</Text>

        <Text style={styles.messageText}>{getStatusMessage()}</Text>

        <View style={styles.mascotWrap}>
          <Image
            source={require("../../../../../assets/images/PokeNihongoLogo.png")}
            resizeMode="contain"
            style={styles.mascot}
          />
        </View>

        <View style={styles.tileRow}>
          <ResultValueCard
            title="Tổng câu hỏi"
            value={result.totalQuestions}
            icon={<MaterialCommunityIcons name="help-circle" size={18} color="#6366f1" />}
            headerGradientColors={["#6366f1", "#8b5cf6"]}
            style={styles.tile}
            size="compact"
          />

          <ResultValueCard
            title="Đã trả lời"
            value={result.answeredQuestions}
            icon={<MaterialCommunityIcons name="check-circle" size={18} color="#10b981" />}
            headerGradientColors={["#10b981", "#34d399"]}
            style={styles.tile}
            size="compact"
          />

          {result.unansweredQuestions > 0 && (
            <ResultValueCard
              title="Chưa trả lời"
              value={result.unansweredQuestions}
              icon={<MaterialCommunityIcons name="alert-circle" size={18} color="#ef4444" />}
              headerGradientColors={["#ef4444", "#f87171"]}
              style={styles.tile}
              size="compact"
            />
          )}
        </View>

        <View style={styles.tileRow}>
          <ResultValueCard
            title="Thời gian"
            value={timeDisplay}
            icon={<MaterialCommunityIcons name="timer-outline" size={18} color="#065f46" />}
            headerGradientColors={["#10b981", "#34d399"]}
            style={styles.tile}
            size="compact"
          />

          <ResultValueCard
            title="Kết quả"
            value={result.allCorrect ? "Hoàn hảo" : result.status === "FAIL" ? "Có sai sót" : "Đã hoàn thành"}
            icon={
              <MaterialCommunityIcons
                name={result.allCorrect ? "trophy" : result.status === "FAIL" ? "alert" : "check"}
                size={18}
                color={result.allCorrect ? "#f59e0b" : result.status === "FAIL" ? "#ef4444" : "#10b981"}
              />
            }
            headerGradientColors={
              result.allCorrect
                ? ["#f59e0b", "#fbbf24"]
                : result.status === "FAIL"
                ? ["#ef4444", "#f87171"]
                : ["#10b981", "#34d399"]
            }
            style={styles.tile}
            size="compact"
          />
        </View>

        <View style={styles.ctaWrap}>
          <BounceButton variant="default" onPress={handleGoHome}>
            TIẾP TỤC
          </BounceButton>
          <View style={{ height: 12 }} />
          <BounceButton variant="secondary" onPress={handleViewAnswers}>
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
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
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
