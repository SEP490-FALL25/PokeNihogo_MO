import QuizLayout from "@components/layouts/QuizLayout";
import AudioPlayer from "@components/ui/AudioPlayer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { QuizSession } from "@models/quiz/quiz.common";
import { quizService } from "@services/quiz";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QuizReviewScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const scaleAnims = useRef<Record<string, Animated.Value[]>>({}).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});

  const loadReview = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await quizService.getQuizReview(sessionId!);
      if (response.statusCode === 200 && response.data?.session) {
        const s = response.data.session;
        setSession(s);
        setElapsedSeconds(0);
        const prefilled: Record<string, string[]> = {};
        for (const a of s.answers) {
          prefilled[a.questionId] = a.selectedAnswers;
        }
        setSelections(prefilled);
      }
    } catch (error) {
      console.error("Error loading quiz review:", error);
      Alert.alert("Lỗi", "Không thể tải phần xem đáp án.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) loadReview();
  }, [sessionId, loadReview]);

  const answeredCount = useMemo(() => {
    return Object.values(selections).filter((arr) => arr.length > 0).length;
  }, [selections]);

  if (isLoading || !session) {
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
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.scrollContent, { paddingBottom: 0 }]}>
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
                    <View style={styles.headerRow}>
                      <View style={styles.numberBadge}>
                        <Text style={styles.numberText}>{qIdx + 1}</Text>
                      </View>
                      {q.audioUrl && (
                        <AudioPlayer audioUrl={q.audioUrl} style={{ marginLeft: "auto" }} />
                      )}
                    </View>

                    <Text style={styles.questionText}>{q.question}</Text>

                    <View style={styles.optionsInCard}>
                      {q.options?.map((opt, index) => {
                        const isSelected = selected.includes(opt.id);
                        const isCorrectOption = q.correctAnswers.includes(opt.id);
                        const wrongSelected = isSelected && !isCorrectOption;
                        const correctSelected = isSelected && isCorrectOption;
                        return (
                          <Animated.View
                            key={opt.id}
                            style={[
                              styles.optionWrapper,
                              { transform: [{ scale: scaleAnims[q.id]?.[index] || 1 }] },
                            ]}
                          >
                            <TouchableOpacity disabled activeOpacity={1} style={[styles.optionButton, correctSelected && styles.optionCorrect, wrongSelected && styles.optionWrong]}>
                              <View style={styles.optionContent}>
                                <View style={[styles.optionCircle, correctSelected && styles.circleCorrect, wrongSelected && styles.circleWrong, isSelected && !correctSelected && !wrongSelected && styles.circleSelected]}>
                                  <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
                                </View>
                                <Text style={styles.optionText}>{opt.text}</Text>
                                {isCorrectOption && (
                                  <MaterialCommunityIcons name="check-circle" size={18} color="#10b981" />
                                )}
                              </View>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>

                    {!!q.explanation && (
                      <View style={{ marginTop: 10 }}>
                        <Text style={{ color: "#6b7280", fontStyle: "italic" }}>Giải thích: {q.explanation}</Text>
                      </View>
                    )}
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#6b7280" },
  topHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#eef2ff" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: "700", color: "#111827", paddingHorizontal: 8 },
  submitIconButton: { backgroundColor: "#e0f2fe", padding: 8, borderRadius: 16 },
  scrollContent: { paddingBottom: 24 },
  block: { marginBottom: 10 },
  questionWrapper: { paddingHorizontal: 10 },
  qaCard: { backgroundColor: "white", borderRadius: 16, padding: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 10, position: "relative" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  numberBadge: { backgroundColor: "#e0e7ff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  numberText: { color: "#4338ca", fontWeight: "700" },
  questionText: { fontSize: 28, fontWeight: "bold", color: "#1f2937", textAlign: "center", lineHeight: 36 },
  optionsInCard: { marginTop: 12 },
  optionWrapper: { marginBottom: 16 },
  optionButton: { backgroundColor: "white", borderRadius: 20, padding: 20, borderWidth: 2, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionCorrect: { backgroundColor: "#ecfdf5", borderColor: "#10b981" },
  optionWrong: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  optionContent: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  optionCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#e5e7eb", justifyContent: "center", alignItems: "center", marginRight: 16 },
  circleCorrect: { backgroundColor: "#10b981" },
  circleWrong: { backgroundColor: "#ef4444" },
  circleSelected: { backgroundColor: "#4f46e5" },
  optionLabel: { color: "white", fontWeight: "bold", fontSize: 16 },
  optionText: { fontSize: 18, color: "#1f2937", flex: 1 },
});


