import QuizLayout from "@components/layouts/QuizLayout";
import { ReviewHeader } from "@components/test/review/ReviewHeader";
import { ReviewQuestionCard } from "@components/test/review/ReviewQuestionCard";
import { ReviewStatsSection } from "@components/test/review/ReviewStatsSection";
import { useReviewResultUnified } from "@hooks/useReviewResultUnified";
import {
  calculateReviewStats,
  getCorrectAnswers,
  getQuestionsForGrid,
  getSortedQuestions,
  getUserSelectedAnswers,
  parseExplanation,
} from "@utils/review.utils";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function TestReviewScreen() {
  const { sessionId, reviewData: reviewDataParam } = useLocalSearchParams<{
    sessionId: string;
    reviewData?: string;
  }>();

  // If reviewData is passed as param, use it; otherwise fetch from API
  const reviewDataFromParams = useMemo(() => {
    if (!reviewDataParam) return null;
    try {
      return JSON.parse(reviewDataParam);
    } catch (error) {
      console.error("Error parsing reviewData from params:", error);
      return null;
    }
  }, [reviewDataParam]);

  const { data: reviewDataFromApi, isLoading, error } = useReviewResultUnified(
    sessionId,
    "test",
    reviewDataFromParams || undefined
  );

  // Use reviewData from params if available, otherwise use API data
  const reviewData = reviewDataFromApi || reviewDataFromParams;

  // Determine if we should show loading/error
  const shouldShowLoading = !reviewDataFromParams && isLoading;
  const shouldShowError = !reviewDataFromParams && error;

  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});

  // Get sorted questions by questionOrder
  const questions = useMemo(
    () => getSortedQuestions(reviewData),
    [reviewData]
  );

  // Statistics data
  const stats = useMemo(() => calculateReviewStats(reviewData), [reviewData]);

  // Questions for grid navigation
  const questionsForGrid = useMemo(
    () => getQuestionsForGrid(questions),
    [questions]
  );

  const handleQuestionPress = (questionId: string, offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: Math.max(0, offset - 20),
        animated: true,
      });
    }
  };

  if (shouldShowError) {
    Alert.alert("Lỗi", "Không thể tải phần xem đáp án.");
    router.back();
    return null;
  }

  if (shouldShowLoading || !reviewData?.data || !stats) {
    return (
      <QuizLayout>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout
      showProgress={true}
      progressComponent={<ReviewHeader onBackPress={() => router.back()} />}
    >
      <View style={styles.container}>
        {/* Statistics Section - Fixed at top */}
        <ReviewStatsSection
          totalQuestions={stats.totalQuestions}
          answeredCorrect={stats.answeredCorrect}
          answeredInCorrect={stats.answeredInCorrect}
          time={stats.time}
          status={stats.status}
          questions={questionsForGrid}
          onQuestionPress={handleQuestionPress}
          questionOffsets={questionOffsetsRef.current}
        />

        {/* Questions ScrollView */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
          style={styles.questionsScrollView}
        >
          {questions.map((q, qIdx) => {
            const userSelectedIds = getUserSelectedAnswers(q);
            const correctAnswerIds = getCorrectAnswers(q);

            return (
              <View
                key={q.id}
                style={styles.block}
                onLayout={(e) => {
                  questionOffsetsRef.current[q.id.toString()] =
                    e.nativeEvent.layout.y;
                }}
              >
                <ReviewQuestionCard
                  question={q}
                  questionIndex={qIdx}
                  userSelectedIds={userSelectedIds}
                  correctAnswerIds={correctAnswerIds}
                  parseExplanation={parseExplanation}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "column" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#6b7280" },
  questionsScrollView: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  block: { marginBottom: 10 },
});


