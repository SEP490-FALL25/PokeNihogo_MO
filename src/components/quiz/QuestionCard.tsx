import { QuizQuestion } from "@models/quiz/quiz.common";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { Card, CardContent } from "../ui/Card";
import { AnswerOption } from "./AnswerOption";

interface QuestionCardProps {
  question: QuizQuestion;
  selectedAnswers: string[];
  onAnswerSelect: (questionId: string, selectedAnswers: string[]) => void;
  showResult?: boolean;
  style?: ViewStyle;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswers,
  onAnswerSelect,
  showResult = false,
  style,
}) => {
  const { t } = useTranslation();
  const [localSelectedAnswers, setLocalSelectedAnswers] =
    useState<string[]>(selectedAnswers);

  useEffect(() => {
    setLocalSelectedAnswers(selectedAnswers);
  }, [selectedAnswers]);

  const handleAnswerSelect = (optionId: string) => {
    let newAnswers: string[];

    if (question.type === "multiple-choice") {
      // Toggle selection for multiple choice
      if (localSelectedAnswers.includes(optionId)) {
        newAnswers = localSelectedAnswers.filter((id) => id !== optionId);
      } else {
        newAnswers = [...localSelectedAnswers, optionId];
      }
    } else {
      // Single selection for single choice
      newAnswers = [optionId];
    }

    setLocalSelectedAnswers(newAnswers);
    onAnswerSelect(question.id, newAnswers);
  };

  const getQuestionTypeLabel = (): string => {
    switch (question.type) {
      case "single-choice":
        return t("quiz.question_types.single_choice");
      case "multiple-choice":
        return t("quiz.question_types.multiple_choice");
      case "text-input":
        return t("quiz.question_types.text_input");
      case "audio":
        return t("quiz.question_types.audio");
      case "image":
        return t("quiz.question_types.image");
      default:
        return "";
    }
  };

  const renderAudioPlayer = () => {
    if (question.type === "audio" && question.audioUrl) {
      return (
        <View style={styles.audioContainer}>
          <View style={styles.audioPlayer}>
            <Text style={styles.playButton}>{t("quiz.audio_player.play_button")}</Text>
            <Text style={styles.audioText}>{t("quiz.audio_player.press_to_play")}</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const renderImage = () => {
    if (question.questionImage) {
      return (
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>{t("quiz.image_placeholder")}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Card style={[styles.container, style]}>
      <CardContent style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Question Header */}
          <View style={styles.header}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{getQuestionTypeLabel()}</Text>
            </View>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {question.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Question Content */}
          <View style={styles.questionContent}>
            <Text style={styles.questionText}>{question.question}</Text>

            {renderAudioPlayer()}
            {renderImage()}
          </View>

          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {question.options?.map((option) => (
              <AnswerOption
                key={option.id}
                id={option.id}
                text={option.text}
                image={option.image}
                isCorrect={showResult ? option.isCorrect : undefined}
                isSelected={localSelectedAnswers.includes(option.id)}
                showResult={showResult}
                isMultipleChoice={question.type === "multiple-choice"}
                onSelect={handleAnswerSelect}
              />
            ))}
          </View>

          {/* Explanation (shown after answering) */}
          {showResult && question.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationLabel}>{t("quiz.explanation_label")}</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}

          {/* Question Metadata */}
          <View style={styles.metadata}>
            <View style={styles.tagContainer}>
              {question.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.pointsText}>{question.points} {t("quiz.points_label")}</Text>
          </View>
        </ScrollView>
      </CardContent>
    </Card>
  );
};

const styles = {
  container: {
    margin: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "600" as const,
  },
  difficultyBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "600" as const,
  },
  questionContent: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#111827",
    lineHeight: 28,
    marginBottom: 16,
  },
  audioContainer: {
    marginVertical: 16,
  },
  audioPlayer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  playButton: {
    fontSize: 24,
  },
  audioText: {
    fontSize: 16,
    color: "#374151",
  },
  imageContainer: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    alignItems: "center" as const,
    marginVertical: 16,
  },
  imagePlaceholder: {
    fontSize: 16,
    color: "#6b7280",
  },
  optionsContainer: {
    marginBottom: 20,
  },
  explanationContainer: {
    backgroundColor: "#f0f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1e40af",
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  metadata: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  tagContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
  },
  tag: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#6b7280",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#059669",
  },
};
