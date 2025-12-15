import QuizLayout from "@components/layouts/QuizLayout";
import { QuizCompletionModal } from "@components/quiz/index/QuizCompletionModal";
import { QuizProgress } from "@components/quiz/index/QuizProgress";
import { QuizQuestionCard } from "@components/quiz/index/QuizQuestionCard";
import { QuizHeader } from "@components/quiz/shared/QuizHeader";
import { ConfirmModal } from "@components/ui/ConfirmModal";
import { ExerciseAttemptStatus } from "@constants/exercise.enum";
import { useMinimalAlert } from "@hooks/useMinimalAlert";
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
import { usePreventRemove } from "@react-navigation/native";
import { ROUTES } from "@routes/routes";
import userExerciseAttemptService from "@services/user-exercise-attempt";
import { useQueryClient } from "@tanstack/react-query";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  BackHandler,
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
  const { exerciseAttemptId: exerciseAttemptIdParam, lessonId: lessonIdParam } =
    useLocalSearchParams<{
      exerciseAttemptId?: string;
      lessonId?: string;
    }>();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { showAlert } = useMinimalAlert();
  const queryClient = useQueryClient();

  // Parse exerciseAttemptId từ params (chắc chắn có khi vào màn hình này)
  const exerciseAttemptId = exerciseAttemptIdParam || "";
  const exerciseAttemptIdNumber = useMemo(() => {
    return exerciseAttemptId ? parseInt(exerciseAttemptId, 10) : null;
  }, [exerciseAttemptId]);
  const showError = useCallback(
    (key: string, fallback: string) => {
      Alert.alert(t("common.error", "Error"), t(key, fallback));
    },
    [t]
  );

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
  const {
    mutate: continueAndAbandonExercise,
    mutateAsync: continueAndAbandonExerciseAsync,
    isPending: isContinuing,
  } = useContinueAndAbandonExercise();
  const {
    mutateAsync: createNewExerciseAttemptAsync,
    isPending: isCreatingNew,
  } = useCreateNewExerciseAttempt();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [unansweredQuestionIds, setUnansweredQuestionIds] = useState<number[]>(
    []
  );
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [lessonId, setLessonId] = useState<number | null>(
    lessonIdParam ? parseInt(lessonIdParam, 10) : null
  );
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);
  const [allowNavigate, setAllowNavigate] = useState(false);
  const pendingActionRef = useRef<any>(null);

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
      showError(
        "quiz_screen.alerts.missing_attempt_retry",
        "Không tìm thấy bài tập. Vui lòng thử lại."
      );
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

        const detectedLessonId =
          exercise.lessonId ||
          exercise.lesson?.id ||
          exercise.lessonExercise?.lessonId ||
          exercise.lessonExercise?.lesson?.id ||
          exercise.testSet?.lessonId ||
          null;
        if (detectedLessonId) {
          setLessonId(Number(detectedLessonId));
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
        showError(
          "quiz_screen.alerts.load_quiz_failed",
          "Không thể tải quiz. Vui lòng thử lại."
        );
        router.back();
      }
    } else if (!isLoadingQuestions && !exerciseData) {
      // If data failed to load, show error
      showError(
        "quiz_screen.alerts.load_questions_failed",
        "Không thể tải câu hỏi. Vui lòng thử lại."
      );
      router.back();
    }
  }, [
    exerciseData,
    isLoadingQuestions,
    exerciseAttemptId,
    exerciseAttemptIdNumber,
    hasCheckedResume,
    showError,
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

  const refetchLatestLessonAttempt = useCallback(async () => {
    if (!lessonId) return;
    const lessonIdStr = lessonId.toString();
    try {
      const response = await userExerciseAttemptService.getLatestExerciseAttempt(
        lessonIdStr
      );
      queryClient.setQueryData(
        ["user-exercise-attempt-latest", lessonIdStr],
        response.data
      );
    } catch (error) {
      console.error("Error refreshing latest lesson attempt:", error);
    }
  }, [lessonId, queryClient]);

  const handleCheckCompletion = () => {
    if (!currentExerciseAttemptId) {
      showError("quiz_screen.alerts.missing_attempt", "Không tìm thấy bài tập.");
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
        showError(
          "quiz_screen.alerts.check_status_failed",
          "Không thể kiểm tra trạng thái bài làm."
        );
      },
    });
  };

  const handleSubmitCompletion = () => {
    if (!currentExerciseAttemptId) {
      showError("quiz_screen.alerts.missing_attempt", "Không tìm thấy bài tập.");
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
          queryClient.invalidateQueries({ queryKey: ["wallet-user"] });
          if (response.data) {
            // Pass data as JSON string in params
            router.replace({
              pathname: ROUTES.QUIZ.RESULT,
              params: {
                resultId: currentExerciseAttemptId.toString(),
                resultData: JSON.stringify(response.data),
                message: response.message || "",
                timeSpent: totalTimeSpent.toString(),
                origin: "quiz",
              },
            });
          } else {
            showError(
              "quiz_screen.alerts.submit_missing_result",
              "Không nhận được dữ liệu kết quả."
            );
          }
        },
        onError: (error) => {
          console.error("Error submitting completion:", error);
          showError(
            "quiz_screen.alerts.submit_failed",
            "Không thể nộp bài."
          );
        },
      }
    );
  };

  const handleHeaderBack = useCallback(() => {
    pendingActionRef.current = null;
    setShowExitConfirmModal(true);
    return true;
  }, []);

  const handleHardwareBack = useCallback(() => {
    showAlert(
      t("quiz_screen.back_blocked_message", "Vui lòng dùng nút quay lại ở góc trên."),
      "warning"
    );
    return true;
  }, [showAlert, t]);

  usePreventRemove(!allowNavigate, (event) => {
    // Block native removal (iOS gesture/header back)
    pendingActionRef.current = event.data.action;
    setShowExitConfirmModal(true);
  });

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleHardwareBack
      );
      return () => subscription.remove();
    }, [handleHardwareBack])
  );

  useEffect(() => {
    (navigation as any)?.setOptions?.({
      gestureEnabled: false,
      headerBackButtonMenuEnabled: false,
    });
  }, [navigation]);

  const proceedNavigation = useCallback(() => {
    setAllowNavigate(true);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    if (action) {
      navigation.dispatch(action);
    } else {
      router.back();
    }
    setTimeout(() => {
      setAllowNavigate(false);
    }, 0);
  }, [navigation]);

  const handleSaveAndExit = () => {
    if (!currentExerciseAttemptId) {
      showError("quiz_screen.alerts.missing_attempt", "Không tìm thấy bài tập.");
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
          proceedNavigation();
        },
        onError: (error) => {
          console.error("Error abandoning exercise:", error);
          showError(
            "quiz_screen.alerts.save_failed",
            "Không thể lưu bài tập. Vui lòng thử lại."
          );
          setAllowNavigate(false);
        },
      }
    );
  };

  const handleExitWithoutSaving = () => {
    if (!currentExerciseAttemptId) {
      showError("quiz_screen.alerts.missing_attempt", "Không tìm thấy bài tập.");
      return;
    }

    continueAndAbandonExercise(
      {
        exerciseAttemptId: currentExerciseAttemptId.toString(),
        status: ExerciseAttemptStatus.SKIPPED,
      },
      {
        onSuccess: () => {
          setShowExitConfirmModal(false);
          refetchLatestLessonAttempt();
          proceedNavigation();
        },
        onError: (error) => {
          console.error("Error continuing exercise:", error);
          showError(
            "quiz_screen.alerts.continue_failed",
            "Không thể tiếp tục bài tập. Vui lòng thử lại."
          );
          setAllowNavigate(false);
        },
      }
    );
  };

  const handleContinuePreviousExercise = () => {
    if (!currentExerciseAttemptId) {
      showError("quiz_screen.alerts.missing_attempt", "Không tìm thấy bài tập.");
      return;
    }

    continueAndAbandonExercise(
      {
        exerciseAttemptId: currentExerciseAttemptId.toString(),
        status: ExerciseAttemptStatus.IN_PROGRESS,
      },
      {
        onSuccess: () => {
          setShowResumeModal(false);
          setIsTimerPaused(false);
          // Session is already loaded, just resume timer
        },
        onError: (error) => {
          console.error("Error continuing exercise:", error);
          showError(
            "quiz_screen.alerts.continue_failed",
            "Không thể tiếp tục bài tập. Vui lòng thử lại."
          );
        },
      }
    );
  };

  const handleStartNewExercise = async () => {
    if (!exerciseId || !currentExerciseAttemptId) {
      showError("quiz_screen.alerts.missing_attempt", "Không tìm thấy bài tập.");
      return;
    }

    try {
      const [, createResponse] = await Promise.all([
        continueAndAbandonExerciseAsync({
          exerciseAttemptId: currentExerciseAttemptId.toString(),
          status: ExerciseAttemptStatus.SKIPPED,
        }),
        createNewExerciseAttemptAsync(exerciseId.toString()),
      ]);

      if (createResponse?.data?.id) {
        const newExerciseAttemptId = createResponse.data.id.toString();
        router.replace({
          pathname: ROUTES.QUIZ.QUIZ,
          params: {
            exerciseAttemptId: newExerciseAttemptId,
            lessonId: lessonId?.toString() || "",
          },
        });
        setShowResumeModal(false);
        setIsTimerPaused(false);
        setHasCheckedResume(false);
        setSelections({});
        setElapsedSeconds(0);
        setSession(null);
      } else {
        showError(
          "quiz_screen.alerts.new_attempt_failed",
          "Không thể tạo bài tập mới."
        );
      }
    } catch (error) {
      console.error("Error creating new exercise:", error);
      showError(
        "quiz_screen.alerts.new_attempt_retry_failed",
        "Không thể tạo bài tập mới. Vui lòng thử lại."
      );
    }
  };

  // const canSubmit = session
  //   ? answeredCount === session.questions.length
  //   : false;

  if (isLoading || isLoadingQuestions || !session) {
    return (
      <QuizLayout>
        <View style={styles.center}>
          <Text style={styles.loadingText}>
            {t("quiz_screen.loading", t("common.loading", "Đang tải..."))}
          </Text>
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
            title={t("quiz_screen.title", "Làm bài kiểm tra")}
            onBackPress={handleHeaderBack}
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
        title={t("quiz_screen.modals.exit.title", "Thoát bài làm?")}
        message={t(
          "quiz_screen.modals.exit.message",
          "Bạn có muốn lưu lại phần câu trả lời đã làm không?"
        )}
        onRequestClose={() => setShowExitConfirmModal(false)}
        buttons={[
          {
            label: t("quiz_screen.modals.exit.discard", "Không lưu"),
            onPress: handleExitWithoutSaving,
            variant: "secondary",
          },
          {
            label: t("quiz_screen.modals.exit.save", "Lưu và thoát"),
            onPress: handleSaveAndExit,
            variant: "primary",
            disabled: isAbandoning,
            loadingText: t(
              "quiz_screen.modals.exit.saving",
              "Đang lưu..."
            ),
          },
        ]}
      />

      {/* Resume Exercise Modal */}
      <ConfirmModal
        visible={showResumeModal}
        title={t("quiz_screen.modals.resume.title", "Tiếp tục bài làm?")}
        message={t(
          "quiz_screen.modals.resume.message",
          "Bạn có bài làm đã lưu trước đó. Bạn muốn tiếp tục bài làm cũ hay làm lại bài mới?"
        )}
        onRequestClose={() => {}}
        buttons={[
          {
            label: t(
              "quiz_screen.modals.resume.new_attempt",
              "Làm lại bài mới"
            ),
            onPress: handleStartNewExercise,
            variant: "secondary",
            disabled: isCreatingNew,
            loadingText: t(
              "quiz_screen.modals.resume.creating",
              "Đang tạo..."
            ),
          },
          {
            label: t(
              "quiz_screen.modals.resume.continue",
              "Tiếp tục bài cũ"
            ),
            onPress: handleContinuePreviousExercise,
            variant: "primary",
            disabled: isContinuing,
            loadingText: t(
              "quiz_screen.modals.resume.loading",
              "Đang tải..."
            ),
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
  scrollContent: { paddingBottom: 24, paddingTop: 12 },
});
