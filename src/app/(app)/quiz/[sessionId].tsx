import { QuestionCard } from "@components/quiz/QuestionCard";
import { QuizProgress } from "@components/quiz/QuizProgress";
import BounceButton from "@components/ui/BounceButton";
import { Button } from "@components/ui/Button";
import { QuizSession } from "@models/quiz/quiz.common";
import { quizService } from "@services/quiz";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function QuizScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>();
  const [answers, setAnswers] = useState<
    {
      questionId: string;
      selectedAnswers: string[];
      timeSpent: number;
    }[]
  >([]);

  // Load quiz session
  useEffect(() => {
    loadQuizSession();
  }, [sessionId]);

  const loadQuizSession = async () => {
    try {
      setIsLoading(true);
      // In a real app, you would fetch the session by ID
      // For now, we'll create a new session for demo purposes
      const response = await quizService.createQuizSession({
        questionCount: 5,
        level: "N5",
        category: "vocabulary",
      });

      if (response.statusCode === 201 && response.data?.session) {
        setSession(response.data.session);
        // Set timer to 10 minutes (600 seconds) for demo
        setTimeRemaining(600);
      }
    } catch (error) {
      console.error("Error loading quiz session:", error);
      Alert.alert("Lỗi", "Không thể tải quiz. Vui lòng thử lại.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = useCallback(
    (questionId: string, selectedAnswers: string[]) => {
      setSelectedAnswers(selectedAnswers);
    },
    []
  );

  const handleNextQuestion = async () => {
    if (!session) return;

    const currentQuestion = session.questions[currentQuestionIndex];

    // Save current answer
    const currentAnswer = {
      questionId: currentQuestion.id,
      selectedAnswers,
      timeSpent: 30, // Mock time spent
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

    // Submit answer
    try {
      setIsSubmitting(true);
      await quizService.submitAnswer({
        sessionId: session.id,
        questionId: currentQuestion.id,
        selectedAnswers,
        timeSpent: 30,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }

    // Move to next question or complete quiz
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
    } else {
      await completeQuiz(newAnswers);
    }
  };

  const completeQuiz = useCallback(
    async (finalAnswers: typeof answers) => {
      if (!session) return;

      try {
        setIsSubmitting(true);
        const totalTimeSpent = finalAnswers.reduce(
          (sum, answer) => sum + answer.timeSpent,
          0
        );

        const response = await quizService.completeQuiz({
          sessionId: session.id,
          answers: finalAnswers,
          totalTimeSpent,
        });

        if (response.statusCode === 201 && response.data?.result) {
          // Navigate to results screen
          router.replace({
            pathname: "/quiz/result/[resultId]",
            params: { resultId: response.data.result.sessionId },
          });
        }
      } catch (error) {
        console.error("Error completing quiz:", error);
        Alert.alert("Lỗi", "Không thể hoàn thành quiz. Vui lòng thử lại.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [session]
  );

  // Timer for quiz (optional)
  useEffect(() => {
    if (session && timeRemaining !== undefined) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === undefined || prev <= 0) {
            clearInterval(timer);
            // Call handleTimeUp directly here to avoid dependency issue
            Alert.alert(
              "Hết thời gian!",
              "Thời gian làm bài đã hết. Quiz sẽ được nộp tự động.",
              [
                {
                  text: "Nộp bài",
                  onPress: () => completeQuiz(answers),
                },
              ]
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session, timeRemaining, answers, completeQuiz]);

  const canProceed = selectedAnswers.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy quiz</Text>
          <Button onPress={() => router.back()}>Quay lại</Button>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Progress Header */}
      <QuizProgress
        currentQuestion={currentQuestionIndex}
        totalQuestions={session.questions.length}
        timeRemaining={timeRemaining}
        style={styles.progress}
      />

      {/* Question Card */}
      <View style={styles.questionContainer}>
        <QuestionCard
          question={currentQuestion}
          selectedAnswers={selectedAnswers}
          onAnswerSelect={handleAnswerSelect}
        />
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <BounceButton
          onPress={handleNextQuestion}
          disabled={!canProceed || isSubmitting}
          loading={isSubmitting}
          //   style={styles.nextButton}
        >
          {currentQuestionIndex < session.questions.length - 1
            ? "Câu tiếp theo"
            : "Hoàn thành"}
        </BounceButton>

        {currentQuestionIndex > 0 && (
          <Button
            variant="outline"
            onPress={() => {
              setCurrentQuestionIndex(currentQuestionIndex - 1);
              setSelectedAnswers(
                answers[currentQuestionIndex - 1]?.selectedAnswers || []
              );
            }}
            style={styles.previousButton}
          >
            Câu trước
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
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
  progress: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  questionContainer: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  nextButton: {
    flex: 1,
  },
  previousButton: {
    minWidth: 120,
  },
});
