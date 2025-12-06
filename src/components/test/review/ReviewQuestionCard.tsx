import { IReviewResultQuestionBank } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { ParsedExplanation, ReviewAnswerOption } from "./ReviewAnswerOption";

interface ReviewQuestionCardProps {
  question: IReviewResultQuestionBank;
  questionIndex: number;
  userSelectedIds: number[];
  correctAnswerIds: number[];
  parseExplanation: (explanation?: string) => ParsedExplanation | null;
}

export const ReviewQuestionCard: React.FC<ReviewQuestionCardProps> = ({
  question,
  questionIndex,
  userSelectedIds,
  correctAnswerIds,
  parseExplanation,
}) => {
  const scaleAnims = useRef<Record<number, Animated.Value[]>>({}).current;

  // Initialize animations for answers
  if (!scaleAnims[question.id] && question.answers) {
    scaleAnims[question.id] = question.answers.map(
      () => new Animated.Value(1)
    );
  }

  // Check if question is incorrect or unanswered
  // Highlight red only when isCorrect is false (either wrong answer or unanswered)
  const shouldHighlightRed = question.isCorrect === false;

  return (
    <View style={styles.questionWrapper}>
      <View style={[styles.qaCard, shouldHighlightRed && styles.qaCardError]}>
        <View style={styles.headerRow}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{questionIndex + 1}</Text>
          </View>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.optionsInCard}>
          {question.answers.map((answer, index) => {
            const isUserSelected = userSelectedIds.includes(answer.id);
            const isCorrectAnswer = correctAnswerIds.includes(answer.id);
            const explanation = parseExplanation(answer.explantion);

            return (
              <ReviewAnswerOption
                key={answer.id}
                id={answer.id}
                answer={answer.answer}
                index={index}
                isUserSelected={isUserSelected}
                isCorrectAnswer={isCorrectAnswer}
                explanation={explanation}
                scaleAnim={
                  scaleAnims[question.id]?.[index] || new Animated.Value(1)
                }
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionWrapper: { paddingHorizontal: 10 },
  qaCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  qaCardError: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    lineHeight: 36,
  },
  optionsInCard: { marginTop: 12 },
});
