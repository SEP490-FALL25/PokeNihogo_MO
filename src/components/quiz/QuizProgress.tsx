import React, { useState } from "react";
import { Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Progress } from "../ui/Progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  elapsedSeconds?: number; // count-up timer in seconds
  // Optional expand/collapse question grid
  questionIds?: string[];
  answeredIds?: string[];
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
  onPressQuestion,
  score,
  style,
}) => {
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
          Hoàn thành {currentQuestion}/{totalQuestions}
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
              {isExpanded ? "Thu gọn" : "Mở rộng"}
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
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => onPressQuestion?.(idx, id)}
                  activeOpacity={0.85}
                  style={[styles.numCell, answered && styles.numCellAnswered]}
                >
                  <Text
                    style={[
                      styles.numCellText,
                      answered && styles.numCellTextAnswered,
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
  numCellText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "600" as const,
  },
  numCellTextAnswered: {
    color: "#ffffff",
  },
};
