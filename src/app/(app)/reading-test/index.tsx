import QuizLayout from "@components/layouts/QuizLayout";
import { QuizCompletionModal } from "@components/quiz/QuizCompletionModal";
import { QuizProgress } from "@components/quiz/QuizProgress";
import { ConfirmModal } from "@components/ui/ConfirmModal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUpsertUserTestAnswerLog } from "@hooks/useUserTestAnswerLog";
import { useCheckReadingCompletion, useSubmitReadingCompletion } from "@hooks/useUserTestAttempt";
import userTestService from "@services/user-test";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AnswerOption = { id: string; text: string };
type ReadingQuestion = {
  bankId: string; // original questionBankId from BE
  uid: string; // unique per testSet instance (setId-bankId)
  question: string;
  options: AnswerOption[];
  globalIndex: number; // 1-based index across all sets
};
type ReadingSet = { id: string; content: string; questions: ReadingQuestion[] };

export default function ReadingTestScreen() {
  const { testId: testIdParam } = useLocalSearchParams<{ testId?: string }>();
  const testId = testIdParam || "";

  const { data, isLoading } = useQuery({
    queryKey: ["reading-test", testId],
    queryFn: async () => {
      const res = await userTestService.getAttemptByTestId(testId);
      return res.data;
    },
    enabled: !!testId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [userTestAttemptId, setUserTestAttemptId] = useState<number | null>(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const scaleAnims = useRef<Record<string, Animated.Value[]>>({}).current;
  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});
  const blockOffsetsRef = useRef<Record<string, number>>({});

  const sets: ReadingSet[] = useMemo(() => {
    const setsRaw = data?.data?.testSets || [];
    let counter = 0;
    return setsRaw.map((s: any) => {
      const questions: ReadingQuestion[] = (s.testSetQuestionBanks || [])
        .sort((a: any, b: any) => (a.questionOrder || 0) - (b.questionOrder || 0))
        .map((qb: any) => {
          const q = qb.questionBank;
          counter += 1;
          return {
            bankId: String(q.id),
            uid: `${s.id}-${q.id}`,
            question: q.question || "",
            options: (q.answers || []).map((ans: any) => ({ id: String(ans.id), text: ans.answer })),
            globalIndex: counter,
          };
        });
      return { id: String(s.id), content: s.content || "", questions };
    });
  }, [data]);

  useEffect(() => {
    if (data?.data?.userTestAttemptId) {
      setUserTestAttemptId(data.data.userTestAttemptId);
    }
  }, [data]);

  // Timer count-up
  useEffect(() => {
    if (!isTimerPaused) {
      const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isTimerPaused]);

  const { mutate: upsertAnswer } = useUpsertUserTestAnswerLog();

  const handleAnswerSelect = (bankId: string, selected: string[], optionIndex?: number, uid?: string) => {
    const animKey = uid || bankId;
    // UI state keyed by uid to avoid collisions across sets
    if (uid) {
      setSelections((prev) => ({ ...prev, [uid]: selected }));
    }

    if (!scaleAnims[animKey]) {
      const question = sets.flatMap((s) => s.questions).find((q) => q.bankId === bankId);
      if (question?.options) {
        scaleAnims[animKey] = question.options.map(() => new Animated.Value(1));
      }
    }
    if (optionIndex !== undefined && scaleAnims[animKey]?.[optionIndex]) {
      Animated.sequence([
        Animated.timing(scaleAnims[animKey][optionIndex], { toValue: 0.95, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnims[animKey][optionIndex], { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }

    if (userTestAttemptId && selected.length > 0) {
      const questionBankId = parseInt(bankId, 10);
      const answerId = parseInt(selected[selected.length - 1], 10);
      if (!isNaN(questionBankId) && !isNaN(answerId)) {
        upsertAnswer({ userTestAttemptId, questionBankId, answerId });
      }
    }
  };

  const allQuestions = useMemo(() => sets.flatMap((s) => s.questions), [sets]);
  const answeredCount = useMemo(() => Object.values(selections).filter((a) => a.length > 0).length, [selections]);

  const { mutate: checkCompletion, data: checkCompletionData } = useCheckReadingCompletion();
  const { mutate: submitCompletion } = useSubmitReadingCompletion();

  if (isLoading) {
    return (
      <QuizLayout>
        <View style={styles.center}><Text style={styles.loadingText}>Đang tải...</Text></View>
      </QuizLayout>
    );
  }

  return (
    <QuizLayout
      showProgress={true}
      progressComponent={
        <View>
          <View style={styles.topHeader}>
            <TouchableOpacity onPress={() => setShowExitConfirmModal(true)} activeOpacity={0.8} style={styles.backButton}>
              <ChevronLeft size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{data?.data?.name || "Bài đọc"}</Text>
            <View style={styles.submitIconButton}>
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={26}
                color="#0ea5e9"
                onPress={() => {
                  if (!userTestAttemptId) return;
                  setIsTimerPaused(true);
                  checkCompletion(String(userTestAttemptId), {
                    onSuccess: (res) => {
                      setShowCompletionModal(true);
                    },
                    onError: () => setIsTimerPaused(false),
                  });
                }}
              />
            </View>
          </View>
          <QuizProgress
            currentQuestion={answeredCount}
            totalQuestions={allQuestions.length}
            elapsedSeconds={elapsedSeconds}
            questionIds={allQuestions.map((q) => q.uid)}
            answeredIds={allQuestions
              .filter((q) => (selections[q.uid] || []).length > 0)
              .map((q) => q.uid)}
            onPressQuestion={(idx, id) => {
              const y = questionOffsetsRef.current[id] ?? 0;
              scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
            }}
            style={styles.progress}
          />
        </View>
      }
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
      >        
        {sets.map((set, sIdx) => (
          <View
            key={set.id}
            style={styles.readingBlock}
            onLayout={(e) => {
              blockOffsetsRef.current[set.id] = e.nativeEvent.layout.y;
            }}
          >
            <View style={styles.contentCard}>
              <Text style={styles.sectionBadge}>Đoạn {sIdx + 1}</Text>
              <Text style={styles.contentText}>{set.content}</Text>
            </View>

            {set.questions.map((q) => {
              const selected = selections[q.uid] || [];
              if (!scaleAnims[q.uid] && q.options) {
                scaleAnims[q.uid] = q.options.map(() => new Animated.Value(1));
              }
              return (
                <View
                  key={q.uid}
                  style={styles.block}
                  onLayout={(e) => {
                    const blockTop = blockOffsetsRef.current[set.id] || 0;
                    questionOffsetsRef.current[q.uid] = blockTop + e.nativeEvent.layout.y;
                  }}
                >
                  <View style={styles.qaCard}>
                    <View style={styles.headerRow}>
                      <View style={styles.numberBadge}><Text style={styles.numberText}>{q.globalIndex}</Text></View>
                    </View>
                    <Text style={styles.questionText}>{q.question}</Text>
                    <View style={styles.optionsInCard}>
                      {q.options?.map((opt, index) => {
                        const isSelected = selected.includes(opt.id);
                        return (
                          <Animated.View key={opt.id} style={[styles.optionWrapper, { transform: [{ scale: scaleAnims[q.uid]?.[index] || 1 }] }]}> 
                            <TouchableOpacity
                              onPress={() => handleAnswerSelect(q.bankId, [opt.id], index, q.uid)}
                              activeOpacity={0.85}
                              style={[styles.optionButton, isSelected && styles.optionSelected]}
                            >
                              <View style={styles.optionContent}>
                                <View style={[styles.optionCircle, isSelected && styles.circleSelected]}>
                                  <Text style={styles.optionLabel}>{String.fromCharCode(65 + index)}</Text>
                                </View>
                                <Text style={styles.optionText}>{opt.text}</Text>
                              </View>
                            </TouchableOpacity>
                          </Animated.View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <ConfirmModal
        visible={showExitConfirmModal}
        title="Thoát bài đọc?"
        message="Bạn có muốn quay lại danh sách bài đọc?"
        onRequestClose={() => setShowExitConfirmModal(false)}
        buttons={[
          { label: "Hủy", onPress: () => setShowExitConfirmModal(false), variant: "secondary" },
          { label: "Thoát", onPress: () => { setShowExitConfirmModal(false); router.back(); }, variant: "primary" },
        ]}
      />

      <QuizCompletionModal
        visible={showCompletionModal}
        onClose={() => { setShowCompletionModal(false); setIsTimerPaused(false); }}
        onSubmit={() => {
          if (!userTestAttemptId) return;
          setShowCompletionModal(false);
          submitCompletion({ attemptId: String(userTestAttemptId), time: elapsedSeconds }, {
            onSuccess: (res) => {
              setIsTimerPaused(false);
              if (res?.data) {
                router.replace({
                  pathname: "/quiz/result",
                  params: {
                    resultId: String(userTestAttemptId),
                    resultData: JSON.stringify(res.data),
                    message: res.message || "",
                    timeSpent: String(elapsedSeconds),
                  },
                });
              }
            },
            onError: () => setIsTimerPaused(false),
          });
        }}
        data={checkCompletionData?.data || null}
        questions={allQuestions.map((q) => ({ id: q.uid, question: q.question, options: q.options }))}
      />
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#6b7280" },
  progress: { backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  topHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#eef2ff" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 20, fontWeight: "700", color: "#111827", paddingHorizontal: 8 },
  submitIconButton: { backgroundColor: "#e0f2fe", padding: 8, borderRadius: 16 },
  scrollContent: { paddingBottom: 24 },
  readingBlock: { marginBottom: 20, paddingHorizontal: 10 },
  contentCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 10 },
  sectionBadge: { alignSelf: "flex-start", backgroundColor: "#e0e7ff", color: "#4338ca", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8, fontWeight: "700" },
  contentText: { fontSize: 16, color: "#111827", lineHeight: 24 },
  block: { marginBottom: 10 },
  qaCard: { backgroundColor: "white", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  numberBadge: { backgroundColor: "#e0e7ff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  numberText: { color: "#4338ca", fontWeight: "700" },
  questionText: { fontSize: 20, fontWeight: "700", color: "#1f2937", lineHeight: 28 },
  optionsInCard: { marginTop: 12 },
  optionWrapper: { marginBottom: 12 },
  optionButton: { backgroundColor: "white", borderRadius: 16, padding: 16, borderWidth: 2, borderColor: "#e5e7eb", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionSelected: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  optionContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  optionCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e5e7eb", justifyContent: "center", alignItems: "center", marginRight: 12 },
  circleSelected: { backgroundColor: "#4f46e5" },
  optionLabel: { color: "white", fontWeight: "bold", fontSize: 14 },
  optionText: { fontSize: 16, color: "#1f2937", flex: 1 },
});


