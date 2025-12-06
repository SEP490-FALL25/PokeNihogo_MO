import { MaterialCommunityIcons } from "@expo/vector-icons";
import { IReviewResultQuestionBank } from "@models/user-exercise-attempt/user-exercise-attempt.response";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface ReviewQuestionCardProps {
  question: IReviewResultQuestionBank;
  questionIndex: number;
  userSelectedIds: number[];
  correctAnswerIds: number[];
  scaleAnims: Animated.Value[];
  onLayout?: (y: number) => void;
}

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

export function ReviewQuestionCard({
  question,
  questionIndex,
  userSelectedIds,
  correctAnswerIds,
  scaleAnims,
  onLayout,
}: ReviewQuestionCardProps) {
  const questionIdStr = question.id.toString();
  
  // Check if question is incorrect or unanswered
  // Highlight red only when isCorrect is false (either wrong answer or unanswered)
  const shouldHighlightRed = question.isCorrect === false;

  return (
    <View
      style={styles.block}
      onLayout={(e) => {
        if (onLayout) {
          onLayout(e.nativeEvent.layout.y);
        }
      }}
    >
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
                          scale: scaleAnims[index] || 1,
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
                      <Text style={styles.optionText}>{answer.answer}</Text>
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
}

const styles = StyleSheet.create({
  block: { marginBottom: 10 },
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
  },
  optionCorrect: { backgroundColor: "#ecfdf5", borderColor: "#10b981" },
  optionWrong: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
});
