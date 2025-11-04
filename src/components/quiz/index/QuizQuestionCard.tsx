import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizQuestionOption[];
}

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  selectedIds: string[];
  isUnanswered?: boolean;
  scaleAnims: Animated.Value[];
  onSelect: (optionId: string, optionIndex: number) => void;
  onLayout?: (y: number) => void;
}

export function QuizQuestionCard({
  question,
  questionIndex,
  selectedIds,
  isUnanswered = false,
  scaleAnims,
  onSelect,
  onLayout,
}: QuizQuestionCardProps) {
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
        <View
          style={[
            styles.qaCard,
            isUnanswered && styles.qaCardUnanswered,
          ]}
        >
          {/* Header with number badge */}
          <View style={styles.headerRow}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{questionIndex + 1}</Text>
            </View>
          </View>

          {/* Question text */}
          <Text style={styles.questionText}>{question.question}</Text>

          {/* Options inside same card */}
          <View style={styles.optionsInCard}>
            {question.options?.map((opt, index) => {
              const isSelected = selectedIds.includes(opt.id);
              return (
                <Animated.View
                  key={opt.id}
                  style={[
                    styles.optionWrapper,
                    {
                      transform: [{ scale: scaleAnims[index] || 1 }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => onSelect(opt.id, index)}
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
                      <Text style={styles.optionText}>{opt.text}</Text>
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
}

const styles = StyleSheet.create({
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
  qaCardUnanswered: {
    borderWidth: 2,
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
  circleSelected: { backgroundColor: "#4f46e5" },
  optionLabel: { color: "white", fontWeight: "bold", fontSize: 16 },
  optionText: { fontSize: 18, color: "#1f2937", flex: 1 },
});
