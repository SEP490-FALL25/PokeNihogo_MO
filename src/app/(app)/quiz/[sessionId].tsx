import QuizLayout from "@components/layouts/QuizLayout";
import { QuizProgress } from "@components/quiz/QuizProgress";
// import BounceButton from "@components/ui/BounceButton";
// import { Button } from "@components/ui/Button";
import AudioPlayer from "@components/ui/AudioPlayer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { QuizSession } from "@models/quiz/quiz.common";
import { quizService } from "@services/quiz";
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QuizScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [session, setSession] = useState<QuizSession | null>(null);
  // Map lưu lựa chọn theo questionId
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  type LocalAnswer = {
    questionId: string;
    selectedAnswers: string[];
    timeSpent: number;
  };
  const scaleAnims = useRef<Record<string, Animated.Value[]>>({}).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});

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
        setElapsedSeconds(0);
      }
    } catch (error) {
      console.error("Error loading quiz session:", error);
      Alert.alert("Lỗi", "Không thể tải quiz. Vui lòng thử lại.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

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
    async (questionId: string, selected: string[], optionIndex?: number) => {
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

      try {
        await quizService.submitAnswer({
          sessionId: session.id,
          questionId,
          selectedAnswers: selected,
          timeSpent: 0,
        });
      } catch (error) {
        console.warn("Error logging answer", error);
      }
    },
    [session, scaleAnims]
  );

  const buildFinalAnswers = useCallback((): LocalAnswer[] => {
    if (!session) return [] as LocalAnswer[];
    return session.questions.map((q) => ({
      questionId: q.id,
      selectedAnswers: selections[q.id] || [],
      timeSpent: 0,
    }));
  }, [session, selections]);

  

  const completeQuiz = async (finalAnswers: LocalAnswer[]) => {
    if (!session) return;

    try {
      const totalTimeSpent = elapsedSeconds; // seconds
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
    }
  };

  // const canSubmit = session
  //   ? answeredCount === session.questions.length
  //   : false;

  if (isLoading || !session) {
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
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={styles.backButton}
            >
              <ChevronLeft size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {session?.level
                ? `Trình độ JLPT ${session.level}`
                : "Làm bài kiểm tra"}
            </Text>
            <TouchableOpacity
              onPress={() => completeQuiz(buildFinalAnswers())}
              activeOpacity={0.8}
              style={styles.submitIconButton}
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
                  <View style={styles.qaCard}>
                    {/* Header with number badge and optional audio */}
                    <View style={styles.headerRow}>
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{qIdx + 1}</Text>
                      </View>
                      {q.audioUrl && (
                        <AudioPlayer
                          audioUrl={q.audioUrl}
                          style={{ marginLeft: "auto" }}
                        />
                      )}
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
});
