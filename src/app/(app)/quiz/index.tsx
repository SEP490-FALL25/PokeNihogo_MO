import QuizLayout from "@components/layouts/QuizLayout";
import { QuizCompletionModal } from "@components/quiz/QuizCompletionModal";
import { QuizProgress } from "@components/quiz/QuizProgress";
// import BounceButton from "@components/ui/BounceButton";
// import { Button } from "@components/ui/Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUpsertUserAnswerLog } from "@hooks/useUserAnswerLog";
import {
  useAbandonExercise,
  useCheckCompletion,
  useSubmitCompletion,
  useUserExerciseQuestions,
} from "@hooks/useUserExerciseAttempt";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Simple types matching BE response structure
type ExerciseQuestion = {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
};

type ExerciseSession = {
  id: string;
  questions: ExerciseQuestion[];
  level?: string;
};

export default function QuizScreen() {
  const { exerciseAttemptId: exerciseAttemptIdParam } = useLocalSearchParams<{
    exerciseAttemptId?: string;
  }>();

  // Parse exerciseAttemptId từ params (chắc chắn có khi vào màn hình này)
  const exerciseAttemptId = exerciseAttemptIdParam || "";
  const exerciseAttemptIdNumber = useMemo(() => {
    return exerciseAttemptId ? parseInt(exerciseAttemptId, 10) : null;
  }, [exerciseAttemptId]);

  // Fetch exercise data using exerciseAttemptId
  const { data: exerciseData, isLoading: isLoadingQuestions } =
    useUserExerciseQuestions(exerciseAttemptId);
  const [session, setSession] = useState<ExerciseSession | null>(null);
  // Map lưu lựa chọn theo questionId
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [userExerciseAttemptId, setUserExerciseAttemptId] = useState<
    number | null
  >(null);
  const { mutate: upsertAnswerLog } = useUpsertUserAnswerLog();
  const { mutate: checkCompletion, data: checkCompletionData } =
    useCheckCompletion();
  const { mutate: submitCompletion, isPending: isSubmitting } =
    useSubmitCompletion();
  const { mutate: abandonExercise, isPending: isAbandoning } =
    useAbandonExercise();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [unansweredQuestionIds, setUnansweredQuestionIds] = useState<number[]>([]);

  // Current exercise attempt ID - ưu tiên từ BE response, fallback về params
  const currentExerciseAttemptId = useMemo(() => {
    return userExerciseAttemptId || exerciseAttemptIdNumber;
  }, [userExerciseAttemptId, exerciseAttemptIdNumber]);
  const scaleAnims = useRef<Record<string, Animated.Value[]>>({}).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});

  // Use BE response directly without unnecessary transformation
  useEffect(() => {
    if (!exerciseAttemptId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập. Vui lòng thử lại.");
      router.back();
      return;
    }

    if (exerciseData?.data && !isLoadingQuestions) {
      try {
        const exercise = exerciseData.data;
        const testSet = exercise.testSet;

        // Restore saved selections from previous session
        const restoredSelections: Record<string, string[]> = {};

        // Sort and map questions directly from BE response
        const questions: ExerciseQuestion[] = (
          testSet?.testSetQuestionBanks || []
        )
          .sort(
            (a: any, b: any) => (a.questionOrder || 0) - (b.questionOrder || 0)
          )
          .map((item: any) => {
            const questionBank = item.questionBank;
            const answers = questionBank.answers || [];
            const questionId = questionBank.id.toString();

            // Find the selected answer (has "choose" field)
            const selectedAnswer = answers.find((answer: any) => answer.choose === "choose");
            if (selectedAnswer) {
              restoredSelections[questionId] = [selectedAnswer.id.toString()];
            }

            return {
              id: questionId,
              question: questionBank.question || "",
              options: answers.map((answer: any) => ({
                id: answer.id.toString(),
                text: answer.answer,
              })),
            };
          });

        // Create simple session object matching what component needs
        const exerciseSession: ExerciseSession = {
          id:
            exercise.userExerciseAttemptId?.toString() ||
            exercise.id?.toString() ||
            exerciseAttemptId ||
            "",
          questions: questions,
        };

        // Store userExerciseAttemptId for API calls (ưu tiên từ BE, fallback về params)
        if (exercise.userExerciseAttemptId) {
          setUserExerciseAttemptId(exercise.userExerciseAttemptId);
        } else if (exerciseAttemptIdNumber) {
          setUserExerciseAttemptId(exerciseAttemptIdNumber);
        }

        // Restore saved time if available (from previous session)
        const savedTime = exercise.time || 0;
        setElapsedSeconds(savedTime);

        // Restore saved selections
        setSelections(restoredSelections);

        setSession(exerciseSession);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading exercise data:", error);
        Alert.alert("Lỗi", "Không thể tải quiz. Vui lòng thử lại.");
        router.back();
      }
    } else if (!isLoadingQuestions && !exerciseData) {
      // If data failed to load, show error
      Alert.alert("Lỗi", "Không thể tải câu hỏi. Vui lòng thử lại.");
      router.back();
    }
  }, [exerciseData, isLoadingQuestions, exerciseAttemptId, exerciseAttemptIdNumber]);

  // Timer (count-up, no limit)
  useEffect(() => {
    if (session) {
      const timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session]);

  const answeredCount = useMemo(() => {
    return Object.values(selections).filter((arr) => arr.length > 0).length;
  }, [selections]);

  // No single current question in all-in-one layout

  const handleAnswerSelect = useCallback(
    (questionId: string, selected: string[], optionIndex?: number) => {
      if (!session) return;

      setSelections((prev) => ({ ...prev, [questionId]: selected }));

      // small tap animation per question option
      if (!scaleAnims[questionId]) {
        const q = session.questions.find((q) => q.id === questionId);
        if (q?.options) {
          scaleAnims[questionId] = q.options.map(() => new Animated.Value(1));
        }
      }
      if (optionIndex !== undefined && scaleAnims[questionId]?.[optionIndex]) {
        Animated.sequence([
          Animated.timing(scaleAnims[questionId][optionIndex], {
            toValue: 0.95,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[questionId][optionIndex], {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Sử dụng currentExerciseAttemptId (đã đảm bảo có giá trị)
      if (currentExerciseAttemptId && selected.length > 0) {
        const questionBankId = parseInt(questionId, 10);
        const answerId = parseInt(selected[selected.length - 1], 10);

        if (!isNaN(questionBankId) && !isNaN(answerId)) {
          upsertAnswerLog({
            userExerciseAttemptId: currentExerciseAttemptId,
            questionBankId,
            answerId,
          });
        }
      }
    },
    [session, scaleAnims, currentExerciseAttemptId, upsertAnswerLog]
  );

  const handleCheckCompletion = () => {
    if (!currentExerciseAttemptId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập.");
      return;
    }

    checkCompletion(currentExerciseAttemptId.toString(), {
      onSuccess: (response) => {
        if (response.data) {
          // Track unanswered question IDs from response
          setUnansweredQuestionIds(response.data.unansweredQuestionIds || []);
          setShowCompletionModal(true);
        }
      },
      onError: (error) => {
        console.error("Error checking completion:", error);
        Alert.alert("Lỗi", "Không thể kiểm tra trạng thái bài làm.");
      },
    });
  };

  const handleSubmitCompletion = () => {
    if (!currentExerciseAttemptId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập.");
      return;
    }

    const totalTimeSpent = elapsedSeconds; // seconds

    submitCompletion(
      {
        exerciseAttemptId: currentExerciseAttemptId.toString(),
        time: totalTimeSpent,
      },
      {
        onSuccess: (response) => {
          // Navigate to result screen with response data
          if (response.data) {
            // Pass data as JSON string in params
            router.replace({
              pathname: "/quiz/result",
              params: {
                resultId: currentExerciseAttemptId.toString(),
                resultData: JSON.stringify(response.data),
                message: response.message || "",
                timeSpent: totalTimeSpent.toString(),
              },
            });
          } else {
            Alert.alert("Lỗi", "Không nhận được dữ liệu kết quả.");
          }
        },
        onError: (error) => {
          console.error("Error submitting completion:", error);
          Alert.alert("Lỗi", "Không thể nộp bài.");
        },
      }
    );
  };

  const handleBackPress = () => {
    // Check if user has answered any questions
    const hasAnswered = answeredCount > 0;
    
    if (hasAnswered) {
      // Show confirm modal if user has answered questions
      setShowExitConfirmModal(true);
    } else {
      // No answers, just go back
      router.back();
    }
  };

  const handleSaveAndExit = () => {
    if (!currentExerciseAttemptId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập.");
      setShowExitConfirmModal(false);
      return;
    }

    abandonExercise({ exerciseAttemptId: currentExerciseAttemptId.toString(), time: elapsedSeconds }, {
      onSuccess: () => {
        setShowExitConfirmModal(false);
        router.back();
      },
      onError: (error) => {
        console.error("Error abandoning exercise:", error);
        Alert.alert("Lỗi", "Không thể lưu bài tập. Vui lòng thử lại.");
      },
    });
  };

  const handleExitWithoutSaving = () => {
    setShowExitConfirmModal(false);
    router.back();
  };


  // const canSubmit = session
  //   ? answeredCount === session.questions.length
  //   : false;

  if (isLoading || isLoadingQuestions || !session) {
    return (
      <QuizLayout>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </QuizLayout>
    );
  }

  // Animation values sẽ được khởi tạo lazy per-question khi render

  return (
    <QuizLayout
      showProgress={true}
      progressComponent={
        <View>
          {/* Header row: back, title, submit */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              onPress={handleBackPress}
              activeOpacity={0.8}
              style={styles.backButton}
            >
              <ChevronLeft size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Làm bài kiểm tra
            </Text>
            <TouchableOpacity
              onPress={handleCheckCompletion}
              activeOpacity={0.8}
              style={styles.submitIconButton}
              disabled={isSubmitting}
            >
              <MaterialCommunityIcons
                name="notebook-check"
                size={26}
                color="#0ea5e9"
              />
            </TouchableOpacity>
          </View>
          <QuizProgress
            currentQuestion={answeredCount}
            totalQuestions={session.questions.length}
            elapsedSeconds={elapsedSeconds}
            questionIds={session.questions.map((q) => q.id)}
            answeredIds={session.questions
              .filter((q) => (selections[q.id] || []).length > 0)
              .map((q) => q.id)}
            unansweredIds={unansweredQuestionIds.map((id) => id.toString())}
            onPressQuestion={(idx, id) => {
              const y = questionOffsetsRef.current[id] ?? 0;
              scrollRef.current?.scrollTo({
                y: Math.max(0, y - 16),
                animated: true,
              });
            }}
            style={styles.progress}
          />
        </View>
      }
    >
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
        >
          {session.questions.map((q, qIdx) => {
            const selected = selections[q.id] || [];
            const questionIdNumber = parseInt(q.id, 10);
            // Chỉ hiện màu đỏ khi: trong unansweredQuestionIds từ API VÀ chưa trả lời locally
            const isUnanswered = unansweredQuestionIds.includes(questionIdNumber) && selected.length === 0;
            
            if (!scaleAnims[q.id] && q.options) {
              scaleAnims[q.id] = q.options.map(() => new Animated.Value(1));
            }
            return (
              <View
                key={q.id}
                style={styles.block}
                onLayout={(e) => {
                  questionOffsetsRef.current[q.id] = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.questionWrapper}>
                  <View style={[styles.qaCard, isUnanswered && styles.qaCardUnanswered]}>
                    {/* Header with number badge */}
                    <View style={styles.headerRow}>
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{qIdx + 1}</Text>
                      </View>
                    </View>

                    {/* Question text */}
                    <Text style={styles.questionText}>{q.question}</Text>

                    {/* Options inside same card */}
                    <View style={styles.optionsInCard}>
                      {q.options?.map((opt, index) => {
                        const isSelected = selected.includes(opt.id);
                        return (
                          <Animated.View
                            key={opt.id}
                            style={[
                              styles.optionWrapper,
                              {
                                transform: [
                                  { scale: scaleAnims[q.id]?.[index] || 1 },
                                ],
                              },
                            ]}
                          >
                            <TouchableOpacity
                              onPress={() =>
                                handleAnswerSelect(q.id, [opt.id], index)
                              }
                              activeOpacity={0.85}
                              style={[
                                styles.optionButton,
                                isSelected && styles.optionSelected,
                              ]}
                            >
                              <View style={styles.optionContent}>
                                <View
                                  style={[
                                    styles.optionCircle,
                                    isSelected && styles.circleSelected,
                                  ]}
                                >
                                  <Text style={styles.optionLabel}>
                                    {String.fromCharCode(65 + index)}
                                  </Text>
                                </View>
                                <Text style={styles.optionText}>
                                  {opt.text}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* <View style={styles.navigationContainer}>
          <BounceButton
            onPress={() => completeQuiz(buildFinalAnswers())}
            disabled={isSubmitting || !canSubmit}
            loading={isSubmitting}
          >
            Nộp bài
          </BounceButton>
          <Button
            variant="outline"
            onPress={() => router.back()}
            style={styles.previousButton}
          >
            Thoát
          </Button>
        </View> */}
      </View>

      {/* Completion Modal */}
      <QuizCompletionModal
        visible={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onSubmit={() => {
          setShowCompletionModal(false);
          handleSubmitCompletion();
        }}
        data={checkCompletionData?.data || null}
        questions={session?.questions || []}
      />

      {/* Exit Confirm Modal */}
      <Modal
        visible={showExitConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitConfirmModal(false)}
      >
        <View style={styles.exitModalOverlay}>
          <View style={styles.exitModalContent}>
            <Text style={styles.exitModalTitle}>Thoát bài làm?</Text>
            <Text style={styles.exitModalMessage}>
              Bạn có muốn lưu lại phần câu trả lời đã làm không?
            </Text>
            
            <View style={styles.exitModalButtons}>
              <TouchableOpacity
                style={[styles.exitModalButton, styles.exitModalButtonCancel]}
                onPress={handleExitWithoutSaving}
                activeOpacity={0.8}
              >
                <Text style={styles.exitModalButtonCancelText}>Không lưu</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.exitModalButton, styles.exitModalButtonSave]}
                onPress={handleSaveAndExit}
                activeOpacity={0.8}
                disabled={isAbandoning}
              >
                <Text style={styles.exitModalButtonSaveText}>
                  {isAbandoning ? "Đang lưu..." : "Lưu và thoát"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#6b7280" },
  progress: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef2ff",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 8,
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  submitIconButton: {
    backgroundColor: "#e0f2fe",
    padding: 8,
    borderRadius: 16,
  },
  scrollContent: { paddingBottom: 24 },
  block: { marginBottom: 10 },

  questionWrapper: { paddingHorizontal: 10 },
  qaCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  qaCardUnanswered: {
    borderWidth: 2,
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  numberBadge: {
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  numberText: { color: "#4338ca", fontWeight: "700" },
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
  optionsContainer: { paddingHorizontal: 24 },
  optionsInCard: { marginTop: 12 },
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
  exitModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  exitModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  exitModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  exitModalMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  exitModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  exitModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exitModalButtonCancel: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  exitModalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  exitModalButtonSave: {
    backgroundColor: "#0ea5e9",
  },
  exitModalButtonSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});

