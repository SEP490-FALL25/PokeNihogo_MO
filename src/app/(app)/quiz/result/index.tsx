import QuizLayout from "@components/layouts/QuizLayout";
import ResultValueCard from "@components/quiz/result/ResultValueCard";
import BounceButton from "@components/ui/BounceButton";
import { Button } from "@components/ui/Button";
import { ConfirmModal } from "@components/ui/ConfirmModal";
import { QuizCompletionStatus } from "@constants/quiz.enum";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCheckReviewAccess } from "@hooks/useUserExerciseAttempt";
import { useCheckReviewAccessTest } from "@hooks/useUserTestAttempt";
import { ISubmitCompletionData } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import { ROUTES } from "@routes/routes";
import { AxiosError } from "axios";
import { ResizeMode, Video } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function QuizResultScreen() {
  const {
    resultId,
    resultData,
    message,
    timeSpent,
    origin,
    testType,
  } = useLocalSearchParams<{
    resultId?: string;
    resultData?: string;
    message?: string;
    timeSpent?: string;
    origin?: string; // expected 'quiz' if coming from quiz flow
    testType?: string;
  }>();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { mutate: checkReviewAccess, isPending } = useCheckReviewAccess();
  const [isFetchingReview, setIsFetchingReview] = useState(false);
  const { mutate: checkReviewAccessTest } = useCheckReviewAccessTest();
  const combinedLoading = isPending || isFetchingReview;

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

  const timeDisplay = useMemo(() => {
    const minutes = Math.floor(timeSpentNumber / 60);
    const seconds = timeSpentNumber % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }, [timeSpentNumber]);

  const openErrorModal = useCallback((msg: string) => {
    setErrorMessage(msg);
    setShowErrorModal(true);
  }, []);

  const parseAxiosErrorMessage = useCallback((error: Error, fallback: string) => {
    const axiosError = error as AxiosError<any>;
    const status = axiosError.response?.status;
    if (status === 403) {
      return axiosError.response?.data?.message || "Bạn không đủ điều kiện để xem đáp án";
    }
    return axiosError.response?.data?.message || fallback;
  }, []);

  const handleGoHome = useCallback(() => {
    // Navigate to learn screen
    router.replace(ROUTES.TABS.LEARN);
  }, []);

  const handleViewAnswers = useCallback(async () => {
    if (!resultId) return;
    const comingFromQuiz = origin === "quiz";
    if (comingFromQuiz) {
      // Check review access first (quiz flow)
      checkReviewAccess(resultId, {
        onSuccess: (data) => {
          if ((data as any)?.statusCode === 403) {
            const errorMsg = (data as any)?.message || "Bạn không đủ điều kiện để xem đáp án";
            openErrorModal(errorMsg);
            return;
          }

          router.push({
            pathname: ROUTES.QUIZ.REVIEW,
            params: {
              sessionId: resultId,
              reviewData: JSON.stringify(data),
            },
          });
        },
        onError: (error: Error) => {
          const errorMsg = parseAxiosErrorMessage(error, "Không thể xem đáp án");
          openErrorModal(errorMsg);
        },
      });
      return;
    }

    // Directly check review access via test hook when entering from other routes
    setIsFetchingReview(true);
    checkReviewAccessTest(
      { userTestAttemptId: resultId, testType },
      {
        onSuccess: (data: any) => {
        if (data?.statusCode === 403) {
          const errorMsg = data?.message || "Bạn không đủ điều kiện để xem đáp án";
          openErrorModal(errorMsg);
          setIsFetchingReview(false);
          return;
        }

        router.push({
          pathname: ROUTES.TEST.REVIEW,
          params: {
            sessionId: resultId,
            reviewData: JSON.stringify(data),
              testType: testType || "",
          },
        });
        setIsFetchingReview(false);
      },
        onError: (error: Error) => {
          const errorMsg = parseAxiosErrorMessage(error, "Không thể xem đáp án");
          openErrorModal(errorMsg);
          setIsFetchingReview(false);
        },
      }
    );
  }, [
    checkReviewAccess,
    checkReviewAccessTest,
    openErrorModal,
    origin,
    parseAxiosErrorMessage,
    resultId,
    testType,
  ]);

  const answeredSummary = useMemo(() => {
    if (!result) return "-";
    return `${result.answeredQuestions}/${result.totalQuestions}`;
  }, [result]);

  const formattedAccuracy = useMemo(() => {
    if (!result) return "0%";
    const score = typeof result.score === "number" ? Math.round(result.score) : 0;
    return `${score}%`;
  }, [result]);

  // Calculate correct and incorrect answers
  const correctAnswers = useMemo(() => {
    if (!result) return 0;
    // If all correct, then all answered questions are correct
    if (result.allCorrect) {
      return result.answeredQuestions;
    }
    // If score is available, calculate from score
    if (typeof result.score === "number" && result.score > 0) {
      return Math.round((result.score / 100) * result.totalQuestions);
    }
    // Fallback: if no score, return 0
    return 0;
  }, [result]);

  const incorrectAnswers = useMemo(() => {
    if (!result) return 0;
    return result.answeredQuestions - correctAnswers;
  }, [result, correctAnswers]);

  // Determine title based on status
  const titleText = useMemo(() => {
    if (!result) {
      return "Bài làm hoàn thành!";
    }
    if (result.status === QuizCompletionStatus.FAILED) {
      return "Bài làm hoàn thành!";
    }
    if (result.allCorrect) {
      return "Hoàn thành xuất sắc!";
    }
    return "Bài làm hoàn thành!";
  }, [result]);

  // Determine status message
  const statusMessage = useMemo(() => {
    if (!result) return "Không tìm thấy kết quả quiz";
    if (message) return message;
    if (result.status === QuizCompletionStatus.FAILED) {
      return "Bạn đã hoàn thành bài tập nhưng có một số câu trả lời sai";
    }
    if (result.allCorrect) {
      return "Chúc mừng! Bạn đã trả lời đúng tất cả các câu hỏi!";
    }
    return "Bạn đã hoàn thành bài tập";
  }, [message, result]);

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
        <Text style={styles.title}>{titleText}</Text>

        <Text style={styles.messageText}>{statusMessage}</Text>

        <View style={styles.mascotWrap}>
          {/* <Image
            source={require("../../../../../assets/images/PokeNihongoLogo.png")}
            resizeMode="contain"
            style={styles.mascot}
          /> */}

          <Video
            ref={(ref) => {
              // Video ref can be used for playback control if needed
            }}
            source={require("../../../../../assets/images/pokemon-pikachu.mp4")}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay
            isMuted={false}
          />
        </View>

        <View style={styles.tileRow}>
          <ResultValueCard
            title="Số câu đã trả lời"
            value={answeredSummary}
            icon={
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color="#2563eb"
              />
            }
            headerGradientColors={["#2563eb", "#4f46e5"]}
            style={styles.tile}
            size="compact"
          />

          {result.unansweredQuestions > 0 && (
            <ResultValueCard
              title="Chưa trả lời"
              value={result.unansweredQuestions}
              icon={
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={18}
                  color="#ef4444"
                />
              }
              headerGradientColors={["#ef4444", "#f87171"]}
              style={styles.tile}
              size="compact"
            />
          )}
        </View>

        <View style={styles.tileRow}>
          <ResultValueCard
            title="Số câu đúng"
            value={correctAnswers}
            icon={
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color="#059669"
              />
            }
            headerGradientColors={["#059669", "#34d399"]}
            style={styles.tile}
            size="compact"
          />

          {incorrectAnswers > 0 && (
            <ResultValueCard
              title="Số câu sai"
              value={incorrectAnswers}
              icon={
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="#ef4444"
                />
              }
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
            icon={
              <MaterialCommunityIcons
                name="timer-outline"
                size={18}
                color="#047857"
              />
            }
            headerGradientColors={["#059669", "#34d399"]}
            style={styles.tile}
            size="compact"
          />

          <ResultValueCard
            title="Tỉ lệ đúng"
            value={formattedAccuracy}
            icon={
              <MaterialCommunityIcons
                name="percent-outline"
                size={18}
                color="#7c3aed"
              />
            }
            headerGradientColors={["#7c3aed", "#a855f7"]}
            style={styles.tile}
            size="compact"
          />
        </View>

        <View style={styles.ctaWrap}>
          <BounceButton variant="default" onPress={handleGoHome}>
            TIẾP TỤC
          </BounceButton>
          <View style={{ height: 12 }} />
          <BounceButton
            variant="secondary"
            onPress={handleViewAnswers}
            loading={combinedLoading}
            disabled={combinedLoading || !resultId}
          >
            Xem đáp án
          </BounceButton>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showErrorModal}
        title="Không thể xem đáp án"
        message={errorMessage}
        onRequestClose={() => setShowErrorModal(false)}
        buttons={[
          { label: "Đóng", onPress: () => setShowErrorModal(false), variant: "primary" },
        ]}
      />
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
  video: {
    width: 280,
    height: 200,
    marginTop: 12,
  },
  diamondCard: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.92)",},
  tileRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginVertical: 6,
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
