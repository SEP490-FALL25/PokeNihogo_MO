import { Progress } from "@components/ui/Progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useTranslation } from "react-i18next";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  elapsedSeconds?: number; // count-up timer in seconds
  // Optional expand/collapse question grid
  questionIds?: string[];
  answeredIds?: string[];
  unansweredIds?: string[]; // IDs of unanswered questions (from check completion)
  onPressQuestion?: (index: number, id: string) => void;
  score?: number;
  style?: ViewStyle;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  elapsedSeconds,
  questionIds,
  answeredIds,
  unansweredIds,
  onPressQuestion,
  score,
  style,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const progress =
    totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[{ paddingHorizontal: 16, paddingVertical: 12 }, style]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {t("quiz_progress.label", {
            current: currentQuestion,
            total: totalQuestions,
            defaultValue: "Hoàn thành {{current}}/{{total}}",
          })}
        </Text>
        <Progress value={progress} style={styles.progressBar} />
      </View>

      {/* Stats Row + Expand */}
      <View style={styles.statsRow}>
        <View style={styles.statsLeft}>
          {elapsedSeconds !== undefined && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="timer" size={24} color="#0ea5e9" />
              <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
            </View>
          )}
        </View>
        {questionIds && questionIds.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsExpanded((v) => !v)}
            activeOpacity={0.85}
            style={styles.expandButton}
          >
            <Text style={styles.expandText}>
              {isExpanded
                ? t("quiz_progress.collapse", "Thu gọn")
                : t("quiz_progress.expand", "Mở rộng")}
            </Text>
            <Text style={styles.expandChevron}>{isExpanded ? "▴" : "▾"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && questionIds && questionIds.length > 0 && (
        <View style={styles.gridWrap}>
          <View style={styles.grid}>
            {questionIds.map((id, idx) => {
              const answered = answeredIds?.includes(id);
              // Chỉ hiện màu đỏ khi: trong unansweredIds từ API VÀ chưa trả lời (không có trong answeredIds)
              const unanswered = unansweredIds?.includes(id) && !answered;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => onPressQuestion?.(idx, id)}
                  activeOpacity={0.85}
                  style={[
                    styles.numCell,
                    answered && styles.numCellAnswered,
                    unanswered && styles.numCellUnanswered,
                  ]}
                >
                  <Text
                    style={[
                      styles.numCellText,
                      answered && styles.numCellTextAnswered,
                      unanswered && styles.numCellTextUnanswered,
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
  );
};

const styles = {
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  expandButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expandText: { color: "#111827", fontWeight: "600" as const },
  expandChevron: { color: "#111827" },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  statsLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
    flex: 1,
  },
  statItem: {
    display: "flex" as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  gridWrap: {
    paddingTop: 8,
  },
  grid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  numCell: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  numCellAnswered: {
    backgroundColor: "#14b8a6",
    borderColor: "#14b8a6",
  },
  numCellUnanswered: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  numCellText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "600" as const,
  },
  numCellTextAnswered: {
    color: "#ffffff",
  },
  numCellTextUnanswered: {
    color: "#ef4444",
    fontWeight: "700" as const,
  },
};
