import InlineAudioPlayer from "@components/ui/InlineAudioPlayer";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { TestAnswerOption } from "./TestAnswerOption";

export type AnswerOption = { id: string; text: string };

export type TestQuestion = {
  bankId: string;
  uid: string;
  question: string;
  options: AnswerOption[];
  globalIndex: number;
  audioUrl?: string;
};

interface TestQuestionCardProps {
  question: TestQuestion;
  selected: string[];
  isUnanswered: boolean;
  scaleAnims: Animated.Value[];
  onAnswerSelect: (bankId: string, selected: string[], optionIndex: number, uid: string) => void;
}

export const TestQuestionCard: React.FC<TestQuestionCardProps> = ({
  question,
  selected,
  isUnanswered,
  scaleAnims,
  onAnswerSelect,
}) => {
  return (
    <View style={[styles.qaCard, isUnanswered && styles.qaCardUnanswered]}>
      <View style={styles.headerRow}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{question.globalIndex}</Text>
        </View>
      </View>
      {question.question && (
        <Text style={styles.questionText}>{question.question}</Text>
      )}
      {question.audioUrl && (
        <InlineAudioPlayer audioUrl={question.audioUrl} style={styles.audioBelow} />
      )}
      <View style={styles.optionsInCard}>
        {question.options?.map((opt, index) => {
          const isSelected = selected.includes(opt.id);
          return (
            <TestAnswerOption
              key={opt.id}
              id={opt.id}
              text={opt.text}
              index={index}
              isSelected={isSelected}
              scaleAnim={scaleAnims[index] || new Animated.Value(1)}
              onPress={() =>
                onAnswerSelect(question.bankId, [opt.id], index, question.uid)
              }
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  qaCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
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
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  audioBelow: { marginTop: 8 },
  numberBadge: {
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  numberText: { color: "#4338ca", fontWeight: "700" },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    lineHeight: 28,
    marginTop: 8,
  },
  optionsInCard: { marginTop: 12 },
});
