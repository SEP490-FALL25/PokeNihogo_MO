import QuizLayout from "@components/layouts/QuizLayout";
import { ReviewQuestionCard } from "@components/quiz/review/ReviewQuestionCard";
import { ReviewStatsSection } from "@components/quiz/review/ReviewStatsSection";
import { QuizHeader } from "@components/quiz/shared/QuizHeader";
import {
  ScrollToTopButton,
  useScrollToTop,
} from "@components/ui/ScrollToTopButton";
import { useReviewResultUnified } from "@hooks/useReviewResultUnified";
import { IReviewResultQuestionBank } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function QuizReviewScreen() {
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
    "quiz",
    reviewDataFromParams || undefined
  );
  
  // Use reviewData from params if available, otherwise use API data
  const reviewData = reviewDataFromApi || reviewDataFromParams;
  
  // Determine if we should show loading/error
  const shouldShowLoading = !reviewDataFromParams && isLoading;
  const shouldShowError = !reviewDataFromParams && error;
  
  const scaleAnims = useRef<Record<string, Animated.Value[]>>({}).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});
  
  // Scroll to top button logic
  const { showButton, buttonOpacity, handleScroll, scrollToTop } =
    useScrollToTop(scrollRef, 200);

  // Get sorted questions by questionOrder
  const questions = useMemo((): IReviewResultQuestionBank[] => {
    if (!reviewData?.data?.testSet?.testSetQuestionBanks) return [];
    return reviewData.data.testSet.testSetQuestionBanks
      .sort(
        (a: { questionOrder: number }, b: { questionOrder: number }) =>
          a.questionOrder - b.questionOrder
      )
      .map(
        (item: { questionBank: IReviewResultQuestionBank }) => item.questionBank
      );
  }, [reviewData]);

  // Get user selected answers for each question
  const getUserSelectedAnswers = (
    question: IReviewResultQuestionBank
  ): number[] => {
    return question.answers
      .filter((answer) => answer.type === "user_selected_incorrect")
      .map((answer) => answer.id);
  };

  // Get correct answers for each question
  const getCorrectAnswers = (question: IReviewResultQuestionBank): number[] => {
    return question.answers
      .filter((answer) => answer.type === "correct_answer")
      .map((answer) => answer.id);
  };

  // Statistics data
  const stats = useMemo(() => {
    if (!reviewData?.data) return null;
    const data = reviewData.data;
    return {
      totalQuestions: data.totalQuestions,
      answeredCorrect: data.answeredCorrect,
      answeredInCorrect: data.answeredInCorrect,
      unansweredQuestions:
        data.totalQuestions - data.answeredCorrect - data.answeredInCorrect,
      time: data.time,
      status: data.status,
    };
  }, [reviewData]);

  if (shouldShowError) {
    Alert.alert("Lỗi", "Không thể tải phần xem đáp án.");
    router.back();
    return null;
  }

  if (shouldShowLoading || !reviewData?.data) {
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
      progressComponent={
        <View>
          <QuizHeader
            title="Xem đáp án"
            onBackPress={() => router.back()}
          />
        </View>
      }
    >
      <View style={styles.container}>
        {/* Questions ScrollView with Statistics Section inside */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
          style={styles.questionsScrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Statistics Section - Now scrolls with questions */}
          {stats && (
            <ReviewStatsSection
              stats={stats}
              questions={questions.map((q) => ({ id: q.id, isCorrect: q.isCorrect }))}
              onQuestionPress={(questionId, index) => {
                const offset = questionOffsetsRef.current[questionId];
                if (offset !== undefined && scrollRef.current) {
                  scrollRef.current.scrollTo({
                    y: offset - 20,
                    animated: true,
                  });
                }
              }}
            />
          )}

          {questions.map((q, qIdx) => {
            const userSelectedIds = getUserSelectedAnswers(q);
            const correctAnswerIds = getCorrectAnswers(q);

            const questionIdStr = q.id.toString();
            if (!scaleAnims[questionIdStr] && q.answers) {
              scaleAnims[questionIdStr] = q.answers.map(
                () => new Animated.Value(1)
              );
            }

            return (
              <ReviewQuestionCard
                key={q.id}
                question={q}
                questionIndex={qIdx}
                userSelectedIds={userSelectedIds}
                correctAnswerIds={correctAnswerIds}
                scaleAnims={scaleAnims[questionIdStr] || []}
                onLayout={(y) => {
                  questionOffsetsRef.current[q.id.toString()] = y;
                }}
              />
            );
          })}
        </ScrollView>

        {/* Scroll to Top Button */}
        <ScrollToTopButton
          show={showButton}
          opacity={buttonOpacity}
          onPress={scrollToTop}
        />
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
});

