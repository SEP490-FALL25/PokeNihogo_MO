import QuizLayout from "@components/layouts/QuizLayout";
import { QuizCompletionModal } from "@components/quiz/index/QuizCompletionModal";
import { QuizProgress } from "@components/quiz/index/QuizProgress";
import { TestHeader } from "@components/test/test-screen/TestHeader";
import { TestQuestionCard } from "@components/test/test-screen/TestQuestionCard";
import { TestSetContent } from "@components/test/test-screen/TestSetContent";
import { ConfirmModal } from "@components/ui/ConfirmModal";
import { useTestLogic } from "@hooks/useTestLogic";
import { useGetTestAttempt } from "@hooks/useUserTestAttempt";
import { getTestConfig, transformTestSets } from "@utils/test.utils";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function TestScreen() {
  const { testId: testIdParam, testType } = useLocalSearchParams<{
    testId?: string;
    testType?: string;
  }>();
  const testId = testIdParam || "";

  const { data, isLoading } = useGetTestAttempt(testId, testType);
  const testConfig = useMemo(() => getTestConfig(testType), [testType]);

  const [userTestAttemptId, setUserTestAttemptId] = useState<number | null>(null);

  const sets = useMemo(() => transformTestSets(data), [data]);

  const {
    selections,
    showExitConfirmModal,
    setShowExitConfirmModal,
    showCompletionModal,
    setShowCompletionModal,
    elapsedSeconds,
    isTimerPaused,
    setIsTimerPaused,
    unansweredQuestionIds,
    scaleAnims,
    allQuestions,
    answeredCount,
    unansweredUids,
    checkCompletionData,
    handleAnswerSelect,
    handleSubmitPress,
    handleExitConfirm,
    handleCompletionSubmit,
  } = useTestLogic({ userTestAttemptId, sets });

  const scrollRef = useRef<ScrollView | null>(null);
  const questionOffsetsRef = useRef<Record<string, number>>({});
  const blockOffsetsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (data?.data?.userTestAttemptId) {
      setUserTestAttemptId(data.data.userTestAttemptId);
    }
  }, [data]);

  const handleQuestionPress = (id: string) => {
    const y = questionOffsetsRef.current[id] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  };

  if (isLoading) {
    return (
      <QuizLayout>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </QuizLayout>
    );
  }

  const renderListeningTest = () => (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 }]}
    >
      {allQuestions.map((q) => {
        const selected = selections[q.uid] || [];
        const questionBankIdNumber = parseInt(q.bankId, 10);
        const isUnanswered =
          unansweredQuestionIds.includes(questionBankIdNumber) &&
          selected.length === 0;

        return (
          <View
            key={q.uid}
            style={[styles.block, { paddingHorizontal: 10 }]}
            onLayout={(e) => {
              questionOffsetsRef.current[q.uid] = e.nativeEvent.layout.y;
            }}
          >
            <TestQuestionCard
              question={q}
              selected={selected}
              isUnanswered={isUnanswered}
              scaleAnims={scaleAnims[q.uid] || []}
              onAnswerSelect={handleAnswerSelect}
            />
          </View>
        );
      })}
    </ScrollView>
  );

  const renderReadingTest = () => (
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
          <TestSetContent content={set.content} sectionIndex={sIdx} />

          {set.questions.map((q) => {
            const selected = selections[q.uid] || [];
            const questionBankIdNumber = parseInt(q.bankId, 10);
            const isUnanswered =
              unansweredQuestionIds.includes(questionBankIdNumber) &&
              selected.length === 0;

            return (
              <View
                key={q.uid}
                style={styles.block}
                onLayout={(e) => {
                  const blockTop = blockOffsetsRef.current[set.id] || 0;
                  questionOffsetsRef.current[q.uid] = blockTop + e.nativeEvent.layout.y;
                }}
              >
                <TestQuestionCard
                  question={q}
                  selected={selected}
                  isUnanswered={isUnanswered}
                  scaleAnims={scaleAnims[q.uid] || []}
                  onAnswerSelect={handleAnswerSelect}
                />
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <QuizLayout
      showProgress={true}
      progressComponent={
        <View>
          <TestHeader
            title={data?.data?.name || testConfig.title}
            icon={testConfig.icon}
            iconColor={testConfig.color}
            onBackPress={() => setShowExitConfirmModal(true)}
            onSubmitPress={handleSubmitPress}
          />
          <QuizProgress
            currentQuestion={answeredCount}
            totalQuestions={allQuestions.length}
            elapsedSeconds={elapsedSeconds}
            questionIds={allQuestions.map((q) => q.uid)}
            answeredIds={allQuestions
              .filter((q) => (selections[q.uid] || []).length > 0)
              .map((q) => q.uid)}
            unansweredIds={unansweredUids}
            onPressQuestion={(idx, id) => handleQuestionPress(id)}
            style={styles.progress}
          />
        </View>
      }
    >
      {testType === "LISTENING_TEST" ? renderListeningTest() : renderReadingTest()}

      <ConfirmModal
        visible={showExitConfirmModal}
        title={testConfig.exitTitle}
        message={testConfig.exitMessage}
        onRequestClose={() => setShowExitConfirmModal(false)}
        buttons={[
          {
            label: "Hủy",
            onPress: () => setShowExitConfirmModal(false),
            variant: "secondary",
          },
          {
            label: "Thoát",
            onPress: handleExitConfirm,
            variant: "primary",
          },
        ]}
      />

      <QuizCompletionModal
        visible={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setIsTimerPaused(false);
        }}
        onSubmit={handleCompletionSubmit}
        data={checkCompletionData?.data || null}
        questions={allQuestions.map((q) => ({
          id: q.uid,
          bankId: q.bankId,
          question: q.question,
          options: q.options,
        }))}
      />
    </QuizLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 18, color: "#6b7280" },
  progress: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  scrollContent: { paddingBottom: 24 },
  readingBlock: { marginBottom: 20, paddingHorizontal: 10 },
  block: { marginBottom: 10 },
});


