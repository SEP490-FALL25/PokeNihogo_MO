import QuizLayout from "@components/layouts/QuizLayout";
import { QuizCompletionModal } from "@components/quiz/QuizCompletionModal";
import { QuizHeader } from "@components/quiz/QuizHeader";
import { QuizProgress } from "@components/quiz/QuizProgress";
import { QuizQuestionCard } from "@components/quiz/QuizQuestionCard";
import { ConfirmModal } from "@components/ui/ConfirmModal";
// import BounceButton from "@components/ui/BounceButton";
// import { Button } from "@components/ui/Button";
import { useUpsertUserAnswerLog } from "@hooks/useUserAnswerLog";
import {
    useAbandonExercise,
    useCheckCompletion,
    useContinueAndAbandonExercise,
    useCreateNewExerciseAttempt,
    useSubmitCompletion,
    useUserExerciseQuestions,
} from "@hooks/useUserExerciseAttempt";
import { router, useLocalSearchParams } from "expo-router";
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
    ScrollView,
    StyleSheet,
    Text,
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
  const { mutate: continueAndAbandonExercise, isPending: isContinuing } =
    useContinueAndAbandonExercise();
  const { mutate: createNewExerciseAttempt, isPending: isCreatingNew } =
    useCreateNewExerciseAttempt();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [unansweredQuestionIds, setUnansweredQuestionIds] = useState<number[]>(
    []
  );
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);

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

        // Store exerciseId for creating new attempt if needed
        if (exercise.id) {
          setExerciseId(exercise.id);
        }

        // Check if there's a saved session (time > 0 or answeredQuestions > 0)
        const savedTime = exercise.time || 0;
        const answeredQuestions = exercise.answeredQuestions || 0;
        const hasSavedProgress = savedTime > 0 || answeredQuestions > 0;

        // If there's saved progress and we haven't checked yet, show resume modal
        // But still load the session in the background
        if (hasSavedProgress && !hasCheckedResume) {
          setIsTimerPaused(true);
          setShowResumeModal(true);
          setHasCheckedResume(true);
        }

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
            const selectedAnswer = answers.find(
              (answer: any) => answer.choose === "choose"
            );
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
        setElapsedSeconds(savedTime);

        // Restore saved selections
        setSelections(restoredSelections);

        setSession(exerciseSession);
        setIsLoading(false);

        // Only resume timer if there's no saved progress (new exercise)
        // If there's saved progress, timer stays paused until user makes a decision
        if (!hasSavedProgress) {
          setIsTimerPaused(false);
        }
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
  }, [
    exerciseData,
    isLoadingQuestions,
    exerciseAttemptId,
    exerciseAttemptIdNumber,
    hasCheckedResume,
  ]);

  // Timer (count-up, no limit) - pause when modal is shown
  useEffect(() => {
    if (session && !isTimerPaused) {
      const timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, isTimerPaused]);

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
                origin: "quiz",
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
    // Always show confirm modal when user presses back
    setShowExitConfirmModal(true);
  };

  const handleSaveAndExit = () => {
    if (!currentExerciseAttemptId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập.");
      setShowExitConfirmModal(false);
      return;
    }

    abandonExercise(
      {
        exerciseAttemptId: currentExerciseAttemptId.toString(),
        time: elapsedSeconds,
      },
      {
        onSuccess: () => {
          setShowExitConfirmModal(false);
          router.back();
        },
        onError: (error) => {
          console.error("Error abandoning exercise:", error);
          Alert.alert("Lỗi", "Không thể lưu bài tập. Vui lòng thử lại.");
        },
      }
    );
  };

  const handleExitWithoutSaving = () => {
    if (!currentExerciseAttemptId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập.");
      return;
    }

    continueAndAbandonExercise(
      {
        exerciseAttemptId: currentExerciseAttemptId.toString(),
        status: "SKIPPED",
      },
      {
        onSuccess: () => {
          setShowExitConfirmModal(false);
          router.back();
        },
        onError: (error) => {
          console.error("Error continuing exercise:", error);
          Alert.alert("Lỗi", "Không thể tiếp tục bài tập. Vui lòng thử lại.");
        },
      }
    );
  };

  const handleContinuePreviousExercise = () => {
    if (!currentExerciseAttemptId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập.");
      return;
    }

    continueAndAbandonExercise(
      {
        exerciseAttemptId: currentExerciseAttemptId.toString(),
        status: "IN_PROGRESS",
      },
      {
        onSuccess: () => {
          setShowResumeModal(false);
          setIsTimerPaused(false);
          // Session is already loaded, just resume timer
        },
        onError: (error) => {
          console.error("Error continuing exercise:", error);
          Alert.alert("Lỗi", "Không thể tiếp tục bài tập. Vui lòng thử lại.");
        },
      }
    );
  };

  const handleStartNewExercise = () => {
    if (!exerciseId) {
      Alert.alert("Lỗi", "Không tìm thấy bài tập.");
      return;
    }

    createNewExerciseAttempt(exerciseId.toString(), {
      onSuccess: (response) => {
        if (response.data?.id) {
          const newExerciseAttemptId = response.data.id.toString();
          // Update params to use new exerciseAttemptId
          router.replace({
            pathname: "/quiz",
            params: {
              exerciseAttemptId: newExerciseAttemptId,
            },
          });
          // Reset states
          setShowResumeModal(false);
          setIsTimerPaused(false);
          setHasCheckedResume(false);
          setSelections({});
          setElapsedSeconds(0);
          // Clear current session to force reload
          setSession(null);
        } else {
          Alert.alert("Lỗi", "Không thể tạo bài tập mới.");
        }
      },
      onError: (error) => {
        console.error("Error creating new exercise:", error);
        Alert.alert("Lỗi", "Không thể tạo bài tập mới. Vui lòng thử lại.");
      },
    });
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
          <QuizHeader
            title="Làm bài kiểm tra"
            onBackPress={handleBackPress}
            onSubmitPress={handleCheckCompletion}
            submitDisabled={isSubmitting}
          />
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
            const isUnanswered =
              unansweredQuestionIds.includes(questionIdNumber) &&
              selected.length === 0;

            if (!scaleAnims[q.id] && q.options) {
              scaleAnims[q.id] = q.options.map(() => new Animated.Value(1));
            }
            return (
              <QuizQuestionCard
                key={q.id}
                question={q}
                questionIndex={qIdx}
                selectedIds={selected}
                isUnanswered={isUnanswered}
                scaleAnims={scaleAnims[q.id] || []}
                onSelect={(optionId, optionIndex) =>
                  handleAnswerSelect(q.id, [optionId], optionIndex)
                }
                onLayout={(y) => {
                  questionOffsetsRef.current[q.id] = y;
                }}
              />
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
      <ConfirmModal
        visible={showExitConfirmModal}
        title="Thoát bài làm?"
        message="Bạn có muốn lưu lại phần câu trả lời đã làm không?"
        onRequestClose={() => setShowExitConfirmModal(false)}
        buttons={[
          {
            label: "Không lưu",
            onPress: handleExitWithoutSaving,
            variant: "secondary",
          },
          {
            label: "Lưu và thoát",
            onPress: handleSaveAndExit,
            variant: "primary",
            disabled: isAbandoning,
            loadingText: "Đang lưu...",
          },
        ]}
      />

      {/* Resume Exercise Modal */}
      <ConfirmModal
        visible={showResumeModal}
        title="Tiếp tục bài làm?"
        message="Bạn có bài làm đã lưu trước đó. Bạn muốn tiếp tục bài làm cũ hay làm lại bài mới?"
        onRequestClose={() => {}}
        buttons={[
          {
            label: "Làm lại bài mới",
            onPress: handleStartNewExercise,
            variant: "secondary",
            disabled: isCreatingNew,
            loadingText: "Đang tạo...",
          },
          {
            label: "Tiếp tục bài cũ",
            onPress: handleContinuePreviousExercise,
            variant: "primary",
            disabled: isContinuing,
            loadingText: "Đang tải...",
          },
        ]}
      />
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
  scrollContent: { paddingBottom: 24 },
});
