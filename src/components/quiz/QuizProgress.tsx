import React from "react";
import { Text, View, ViewStyle } from "react-native";
import { Progress } from "../ui/Progress";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining?: number; // in seconds
  score?: number;
  style?: ViewStyle;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  timeRemaining,
  score,
  style,
}) => {
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
        <Progress value={progress} style={styles.progressBar} />
        <Text style={styles.progressText}>
          {currentQuestion}/{totalQuestions}
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Câu hỏi</Text>
          <Text style={styles.statValue}>{currentQuestion + 1}</Text>
        </View>

        {timeRemaining !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Thời gian</Text>
            <Text
              style={[
                styles.statValue,
                timeRemaining < 30 ? styles.timeWarning : styles.timeNormal,
              ]}
            >
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}

        {score !== undefined && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Điểm</Text>
            <Text style={styles.statValue}>{score}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = {
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    minWidth: 60,
    textAlign: "center" as const,
  },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  statItem: {
    alignItems: "center" as const,
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  timeNormal: {
    color: "#059669",
  },
  timeWarning: {
    color: "#dc2626",
  },
};
