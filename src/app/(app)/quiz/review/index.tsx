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
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  const { t } = useTranslation();
  
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
    {
      initialData: reviewDataFromParams || undefined,
    }
  );
  
  // Use reviewData from params if available, otherwise use API data
  const reviewData = reviewDataFromApi || reviewDataFromParams;
  
  // Determine if we should show loading/error
  const shouldShowLoading = !reviewDataFromParams && isLoading;
  const shouldShowError = !reviewDataFromParams && error;
  
  const scaleAnims = useRef<Record<string, Animated.Value[]>>({}).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});
  const lastScrollY = useRef(0);
  
  // State for collapse/expand stats section
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);
  const [manualControl, setManualControl] = useState(false);
  
  // Scroll to top button logic
  const { showButton, buttonOpacity, scrollToTop } =
    useScrollToTop(scrollRef, 200);
  
  // Handle scroll with auto collapse/expand
  const handleScrollWithCollapse = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      
      // If user manually controlled, don't auto-collapse/expand for a while
      if (!manualControl) {
        if (currentScrollY > 100 && !isStatsCollapsed) {
          // Scrolling down, collapse
          setIsStatsCollapsed(true);
        } else if (currentScrollY < 50 && isStatsCollapsed) {
          // Near top, expand
          setIsStatsCollapsed(false);
        }
      } else {
        // Reset manual control if user scrolls to very top or far down
        if (currentScrollY < 10 || currentScrollY > 300) {
          setManualControl(false);
        }
      }
      
      lastScrollY.current = currentScrollY;
    },
    [isStatsCollapsed, manualControl]
  );
  
  // Handle manual toggle from user
  const handleManualToggle = useCallback(() => {
    setIsStatsCollapsed(!isStatsCollapsed);
    setManualControl(true);
  }, [isStatsCollapsed]);

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
    Alert.alert(
      t("quiz_review.load_error_title", "Lỗi"),
      t("quiz_review.load_error_message", "Không thể tải phần xem đáp án.")
    );
    router.back();
    return null;
  }

  if (shouldShowLoading || !reviewData?.data) {
    return (
      <QuizLayout>
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            {t("quiz_review.loading", t("common.loading", "Đang tải..."))}
          </Text>
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
            title={t("quiz_review.title", "Xem đáp án")}
            onBackPress={() => router.back()}
          />
        </View>
      }
    >
      <View style={styles.container}>
        {/* Statistics Section - Fixed at top with auto collapse */}
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
            isCollapsed={isStatsCollapsed}
            onToggleCollapse={handleManualToggle}
          />
        )}

        {/* Questions ScrollView */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
          style={styles.questionsScrollView}
          onScroll={handleScrollWithCollapse}
          scrollEventThrottle={16}
        >
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

