import QuizLayout from "@components/layouts/QuizLayout";
import { QuizProgress } from "@components/quiz/QuizProgress";
import BounceButton from "@components/ui/BounceButton";
import { Button } from "@components/ui/Button";
import { QuizSession } from "@models/quiz/quiz.common";
import { quizService } from "@services/quiz";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Check, Volume2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function QuizScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>();
  const [answers, setAnswers] = useState<
    { questionId: string; selectedAnswers: string[]; timeSpent: number }[]
  >([]);

  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const scaleAnims = useRef<Animated.Value[]>([]).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load session
  useEffect(() => {
    loadQuizSession();
  }, [sessionId]);

  const loadQuizSession = async () => {
    try {
      setIsLoading(true);
      const response = await quizService.createQuizSession({
        questionCount: 5,
        level: "N5",
        category: "vocabulary",
      });

      if (response.statusCode === 201 && response.data?.session) {
        setSession(response.data.session);
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

  // Timer
  useEffect(() => {
    if (session && timeRemaining !== undefined) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === undefined || prev <= 0) {
            clearInterval(timer);
            Alert.alert(
              "Hết thời gian!",
              "Thời gian làm bài đã hết. Quiz sẽ được nộp tự động.",
              [{ text: "Nộp bài", onPress: () => completeQuiz(answers) }]
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, timeRemaining, answers]);

  // Reset animations khi đổi câu
  useEffect(() => {
    setSelectedAnswers([]);
    setShowResult(false);
    setIsCorrect(false);
    fadeAnim.setValue(1);
    scaleAnims.forEach((anim) => anim.setValue(1));
  }, [currentQuestionIndex]);

  const currentQuestion = session?.questions[currentQuestionIndex];
  const progress = session
    ? ((currentQuestionIndex + 1) / session.questions.length) * 100
    : 0;

  const handleAnswerSelect = useCallback(
    (questionId: string, selectedAnswers: string[]) => {
      if (showResult) return;

      setSelectedAnswers(selectedAnswers);
      setShowResult(true);

      // Kiểm tra đúng/sai
      const correct = currentQuestion?.correctAnswers.every((ans) =>
        selectedAnswers.includes(ans)
      );
      const allSelected = selectedAnswers.every((ans) =>
        currentQuestion?.correctAnswers.includes(ans)
      );
      const isFullyCorrect = correct && allSelected;

      setIsCorrect(isFullyCorrect ?? false);

      if (isFullyCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 2000);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Animation
      const selectedIndex = currentQuestion?.options?.findIndex((opt) =>
        selectedAnswers.includes(opt.id)
      );
      if (selectedIndex !== undefined && selectedIndex !== -1) {
        Animated.sequence([
          Animated.timing(scaleAnims[selectedIndex], {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[selectedIndex], {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
    [currentQuestion, showResult]
  );

  const handleNextQuestion = async () => {
    if (!session || !currentQuestion) return;

    const currentAnswer = {
      questionId: currentQuestion.id,
      selectedAnswers,
      timeSpent: 30,
    };

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

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

    if (currentQuestionIndex < session.questions.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    } else {
      await completeQuiz(newAnswers);
    }
  };

  const completeQuiz = async (finalAnswers: typeof answers) => {
    if (!session) return;

    try {
      setIsSubmitting(true);
      const totalTimeSpent = finalAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
      const response = await quizService.completeQuiz({
        sessionId: session.id,
        answers: finalAnswers,
        totalTimeSpent,
      });

      if (response.statusCode === 201 && response.data?.result) {
        router.replace({
          pathname: "/quiz/result/[resultId]",
          params: { resultId: response.data.result.sessionId },
        });
      }
    } catch (error) {
      console.error("Error completing quiz:", error);
      Alert.alert("Lỗi", "Không thể hoàn thành quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = selectedAnswers.length > 0 && showResult;

  if (isLoading || !session || !currentQuestion) {
    return (
      <QuizLayout>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </QuizLayout>
    );
  }

  // Khởi tạo animation cho từng option
  if (scaleAnims.length === 0) {
    currentQuestion?.options?.forEach(() => {
      scaleAnims.push(new Animated.Value(1));
    });
  }

  return (
    <QuizLayout
      showProgress={true}
      progressComponent={
        <QuizProgress
          currentQuestion={currentQuestionIndex}
          totalQuestions={session.questions.length}
          timeRemaining={timeRemaining}
          style={styles.progress}
        />
      }
    >
      <View style={styles.container}>
        {/* Câu hỏi */}
        <Animated.View style={[styles.questionWrapper, { opacity: fadeAnim }]}>
          <View style={styles.questionCard}>
            {currentQuestion.audioUrl && (
              <TouchableOpacity style={styles.audioButton}>
                <Volume2 size={20} color="#4f46e5" />
              </TouchableOpacity>
            )}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>
        </Animated.View>

        {/* Đáp án */}
        <View style={styles.optionsContainer}>
          {currentQuestion?.options?.map((option, index) => {
            const isSelected = selectedAnswers.includes(option.id);
            const isCorrectAnswer = currentQuestion.correctAnswers.includes(option.id);
            const showCorrect = showResult && isCorrectAnswer;
            const showWrong = showResult && isSelected && !isCorrectAnswer;

            return (
              <Animated.View
                key={option.id}
                style={[
                  styles.optionWrapper,
                  { transform: [{ scale: scaleAnims[index] || 1 }] },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleAnswerSelect(currentQuestion.id, [option.id])}
                  disabled={showResult}
                  activeOpacity={0.8}
                  style={[
                    styles.optionButton,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                    isSelected && !showResult && styles.optionSelected,
                  ]}
                >
                  <View style={styles.optionContent}>
                    <View
                      style={[
                        styles.optionCircle,
                        showCorrect && styles.circleCorrect,
                        showWrong && styles.circleWrong,
                        isSelected && !showResult && styles.circleSelected,
                      ]}
                    >
                      <Text style={styles.optionLabel}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{option.text}</Text>
                  </View>
                  {showCorrect && <Check size={24} color="#10b981" />}
                  {showWrong && <X size={24} color="#ef4444" />}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Nút điều hướng */}
        <View style={styles.navigationContainer}>
          <BounceButton
            onPress={handleNextQuestion}
            disabled={!canProceed || isSubmitting}
            loading={isSubmitting}
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

        {/* Confetti */}
        {confetti && <ConfettiCannon count={50} origin={{ x: -10, y: 0 }} fadeOut />}
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#6b7280" },
  progress: { backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },

  questionWrapper: { paddingHorizontal: 24, marginTop: 32, marginBottom: 32 },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
    position: "relative",
  },
  audioButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 20,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    lineHeight: 36,
  },

  optionsContainer: { paddingHorizontal: 24, flex: 1 },
  optionWrapper: { marginBottom: 16 },
  optionButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionCorrect: { backgroundColor: "#ecfdf5", borderColor: "#10b981" },
  optionWrong: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  optionSelected: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },

  optionContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  optionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  circleCorrect: { backgroundColor: "#10b981" },
  circleWrong: { backgroundColor: "#ef4444" },
  circleSelected: { backgroundColor: "#4f46e5" },

  optionLabel: { color: "white", fontWeight: "bold", fontSize: 16 },
  optionText: { fontSize: 18, color: "#1f2937", flex: 1 },

  navigationContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  nextButton: { flex: 1 },
  previousButton: { minWidth: 120 },
});