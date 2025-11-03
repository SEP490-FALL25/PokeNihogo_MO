import QuizLayout from "@components/layouts/QuizLayout";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useReviewResultUnified } from "@hooks/useReviewResultUnified";
import { IReviewResultQuestionBank } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function QuizReviewScreen() {
  const { sessionId, reviewData: reviewDataParam, origin } = useLocalSearchParams<{ 
    sessionId: string;
    reviewData?: string;
    origin?: string; // "quiz" or "test"
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

  const type = (origin === "test" ? "test" : "quiz") as "test" | "quiz";
  const { data: reviewDataFromApi, isLoading, error } = useReviewResultUnified(
    sessionId,
    type,
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
  console.log(reviewData)
  // Parse explanation text to extract VN and EN parts
  const parseExplanation = (explanation?: string) => {
    if (!explanation) return null;

    const vnMatch = explanation.match(/VN:\s*(.+?)(?:\n|$|EN:)/i);
    const enMatch = explanation.match(/EN:\s*(.+?)(?:\n|$)/i);

    return {
      vn: vnMatch ? vnMatch[1].trim() : null,
      en: enMatch ? enMatch[1].trim() : explanation, // Fallback to full text if no EN: prefix
    };
  };

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

  // Format time (seconds to HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate circular progress percentages
  const circularProgress = useMemo(() => {
    if (!stats) return { correct: 0, incorrect: 0 };
    const correctPercent = (stats.answeredCorrect / stats.totalQuestions) * 100;
    const incorrectPercent =
      (stats.answeredInCorrect / stats.totalQuestions) * 100;
    return { correct: correctPercent, incorrect: incorrectPercent };
  }, [stats]);

  const [isExpanded, setIsExpanded] = useState(false);

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
          <View style={styles.topHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={styles.backButton}
            >
              <ChevronLeft size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Xem đáp án
            </Text>
            <View style={styles.submitIconButton}>
              <MaterialCommunityIcons name="eye" size={22} color="#0ea5e9" />
            </View>
          </View>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Statistics Section - Fixed at top */}
        {stats && (
          <View style={styles.statsSection}>
            <View style={styles.statsHeader}>
              {/* Circular Progress */}
              <View style={styles.circularProgressContainer}>
                <Svg width={100} height={100} style={styles.circularSvg}>
                  {/* Background circle */}
                  <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Incorrect segment */}
                  {circularProgress.incorrect > 0 && (
                    <Circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#ef4444"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - circularProgress.incorrect / 100)}`}
                      strokeLinecap="round"
                      transform={`rotate(-90 50 50)`}
                    />
                  )}
                  {/* Correct segment */}
                  {circularProgress.correct > 0 && (
                    <Circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#14b8a6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - (circularProgress.correct + circularProgress.incorrect) / 100)}`}
                      strokeLinecap="round"
                      transform={`rotate(${-90 + (circularProgress.incorrect / 100) * 360} 50 50)`}
                    />
                  )}
                </Svg>
                <View style={styles.circularTextContainer}>
                  <Text style={styles.circularText}>
                    {stats.answeredCorrect}
                  </Text>
                </View>
              </View>

              {/* Stats List */}
              <View style={styles.statsList}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Số câu đúng:</Text>
                  <Text style={styles.statValue}>{stats.answeredCorrect}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Số câu không làm:</Text>
                  <Text style={styles.statValue}>
                    {stats.unansweredQuestions}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Số câu sai:</Text>
                  <Text style={styles.statValue}>
                    {stats.answeredInCorrect}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Trạng thái:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      stats.status === "FAIL" && styles.statusBadgeFail,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        stats.status === "FAIL" && styles.statusTextFail,
                      ]}
                    >
                      {stats.status === "FAIL" ? "Không đạt" : "Đạt"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Time and Expand Row */}
            <View style={styles.timeExpandRow}>
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={20}
                  color="#14b8a6"
                />
                <Text style={styles.timeText}>{formatTime(stats.time)}</Text>
              </View>

              {questions.length > 0 && (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setIsExpanded(!isExpanded)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expandText}>
                    {isExpanded ? "Thu gọn" : "Mở rộng"}
                  </Text>
                  <Text style={styles.expandChevron}>
                    {isExpanded ? "▴" : "▾"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Expanded Grid */}
            {isExpanded && questions.length > 0 && (
              <View style={styles.gridWrap}>
                <View style={styles.grid}>
                  {questions.map((q, idx) => {
                    const isCorrect = q.isCorrect;
                    const userSelectedIds = getUserSelectedAnswers(q);
                    const hasAnswer = userSelectedIds.length > 0;
                    const isWrong = hasAnswer && !isCorrect;

                    return (
                      <TouchableOpacity
                        key={q.id}
                        onPress={() => {
                          const questionIdStr = q.id.toString();
                          const offset =
                            questionOffsetsRef.current[questionIdStr];
                          if (offset !== undefined && scrollRef.current) {
                            scrollRef.current.scrollTo({
                              y: offset - 20,
                              animated: true,
                            });
                          }
                        }}
                        activeOpacity={0.85}
                        style={[
                          styles.numCell,
                          isCorrect && styles.numCellCorrect,
                          isWrong && styles.numCellWrong,
                        ]}
                      >
                        <Text
                          style={[
                            styles.numCellText,
                            isCorrect && styles.numCellTextCorrect,
                            isWrong && styles.numCellTextWrong,
                          ]}
                        >
                          {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Questions ScrollView */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}
          style={styles.questionsScrollView}
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
              <View
                key={q.id}
                style={styles.block}
                onLayout={(e) => {
                  questionOffsetsRef.current[q.id.toString()] =
                    e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.questionWrapper}>
                  <View style={styles.qaCard}>
                    <View style={styles.headerRow}>
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{qIdx + 1}</Text>
                      </View>
                    </View>

                    <Text style={styles.questionText}>{q.question}</Text>

                    <View style={styles.optionsInCard}>
                      {q.answers.map((answer, index) => {
                        const isUserSelected = userSelectedIds.includes(
                          answer.id
                        );
                        const isCorrectAnswer = correctAnswerIds.includes(
                          answer.id
                        );
                        const hasExplanation = !!answer.explantion;
                        const explanation = parseExplanation(answer.explantion);

                        // Determine styling
                        const optionStyle: ViewStyle[] = isCorrectAnswer
                          ? [styles.optionButton, styles.optionCorrect]
                          : isUserSelected
                            ? [styles.optionButton, styles.optionWrong]
                            : [styles.optionButton];

                        const circleStyle: ViewStyle[] = isCorrectAnswer
                          ? [styles.optionCircle, styles.circleCorrect]
                          : isUserSelected
                            ? [styles.optionCircle, styles.circleWrong]
                            : [styles.optionCircle];

                        return (
                          <Animated.View
                            key={answer.id}
                            style={[
                              styles.optionWrapper,
                              {
                                transform: [
                                  {
                                    scale:
                                      scaleAnims[questionIdStr]?.[index] || 1,
                                  },
                                ],
                              },
                            ]}
                          >
                            <TouchableOpacity
                              disabled
                              activeOpacity={1}
                              style={optionStyle}
                            >
                              <View style={styles.optionContent}>
                                <View style={circleStyle}>
                                  <Text style={styles.optionLabel}>
                                    {String.fromCharCode(65 + index)}
                                  </Text>
                                </View>
                                <Text style={styles.optionText}>
                                  {answer.answer}
                                </Text>
                                {isCorrectAnswer && (
                                  <MaterialCommunityIcons
                                    name="check-circle"
                                    size={18}
                                    color="#10b981"
                                  />
                                )}
                              </View>

                              {/* Show explanation inline if available */}
                              {hasExplanation &&
                                (isCorrectAnswer || isUserSelected) && (
                                  <View
                                    style={[
                                      styles.explanationContainer,
                                      isCorrectAnswer
                                        ? styles.explanationCorrect
                                        : undefined,
                                      isUserSelected && !isCorrectAnswer
                                        ? styles.explanationWrong
                                        : undefined,
                                    ]}
                                  >
                                    {isCorrectAnswer && (
                                      <View style={styles.explanationHeader}>
                                        <MaterialCommunityIcons
                                          name="check-circle"
                                          size={16}
                                          color="#10b981"
                                        />
                                        <Text style={styles.explanationLabel}>
                                          Câu trả lời chính xác
                                        </Text>
                                      </View>
                                    )}
                                    {explanation && (
                                      <View style={styles.explanationContent}>
                                        <Text style={styles.explanationText}>
                                          {explanation.en}
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                )}
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
      </View>
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "column" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#6b7280" },
  questionsScrollView: { flex: 1 },
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
  questionText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    lineHeight: 36,
  },
  optionsInCard: { marginTop: 12 },
  optionWrapper: { marginBottom: 16 },
  optionButton: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  optionCorrect: { backgroundColor: "#ecfdf5", borderColor: "#10b981" },
  optionWrong: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
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
  explanationContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 0,
  },
  explanationCorrect: {
    backgroundColor: "#ecfdf5",
    borderColor: "#10b981",
  },
  explanationWrong: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  explanationContent: {
    gap: 4,
  },
  explanationText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  statsSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  circularProgressContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  circularSvg: {
    position: "absolute",
  },
  circularTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
  },
  circularText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#14b8a6",
  },
  statsList: {
    flex: 1,
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeFail: {
    backgroundColor: "#f472b6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  statusTextFail: {
    color: "white",
  },
  timeExpandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0ea5e9",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expandText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  expandChevron: {
    fontSize: 14,
    color: "#111827",
  },
  gridWrap: {
    paddingTop: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  numCell: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  numCellCorrect: {
    backgroundColor: "#14b8a6",
    borderColor: "#14b8a6",
  },
  numCellWrong: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  numCellText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "600",
  },
  numCellTextCorrect: {
    color: "#ffffff",
  },
  numCellTextWrong: {
    color: "#ef4444",
    fontWeight: "700",
  },
});

