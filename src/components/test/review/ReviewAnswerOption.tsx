import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

interface ReviewAnswerOptionProps {
  id: number;
  answer: string;
  index: number;
  isUserSelected: boolean;
  isCorrectAnswer: boolean;
  explanation?: string;
  scaleAnim: Animated.Value;
}

export type ParsedExplanation = {
  vn: string | null;
  en: string;
};

interface ReviewAnswerOptionWithExplanation extends ReviewAnswerOptionProps {
  explanation?: ParsedExplanation | null;
}

export const ReviewAnswerOption: React.FC<ReviewAnswerOptionWithExplanation> = ({
  answer,
  index,
  isUserSelected,
  isCorrectAnswer,
  explanation,
  scaleAnim,
}) => {
  const hasExplanation = !!explanation;
  const showExplanation = hasExplanation && (isCorrectAnswer || isUserSelected);

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
      style={[
        styles.optionWrapper,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity disabled activeOpacity={1} style={optionStyle}>
        <View style={styles.optionContent}>
          <View style={circleStyle}>
            <Text style={styles.optionLabel}>
              {String.fromCharCode(65 + index)}
            </Text>
          </View>
          <Text style={styles.optionText}>{answer}</Text>
          {isCorrectAnswer && (
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color="#10b981"
            />
          )}
        </View>

        {/* Show explanation inline if available */}
        {showExplanation && (
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
};

const styles = StyleSheet.create({
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
