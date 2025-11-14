import { ExerciseAttemptStatus } from "@constants/exercise.enum";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ReviewStatsSectionProps {
  totalQuestions: number;
  answeredCorrect: number;
  answeredInCorrect: number;
  time: number;
  status: string;
  questions: { id: number; isCorrect: boolean; hasUserAnswer: boolean }[];
  onQuestionPress: (questionId: string, offset: number) => void;
  questionOffsets: Record<string, number>;
}

export const ReviewStatsSection: React.FC<ReviewStatsSectionProps> = ({
  totalQuestions,
  answeredCorrect,
  answeredInCorrect,
  time,
  status,
  questions,
  onQuestionPress,
  questionOffsets,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const unansweredQuestions = totalQuestions - answeredCorrect - answeredInCorrect;

  const isFailedStatus = useMemo(() => {
    return (
      status === ExerciseAttemptStatus.FAIL ||
      status === ExerciseAttemptStatus.FAILED
    );
  }, [status]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const circularProgress = useMemo(() => {
    const correctPercent = (answeredCorrect / totalQuestions) * 100;
    const incorrectPercent = (answeredInCorrect / totalQuestions) * 100;
    return { correct: correctPercent, incorrect: incorrectPercent };
  }, [answeredCorrect, answeredInCorrect, totalQuestions]);

  return (
    <View style={styles.statsSection}>
      <View style={styles.statsHeader}>
        {/* Circular Progress */}
        <View style={styles.circularProgressContainer}>
          <Svg width={100} height={100} style={styles.circularSvg}>
            {/* Background circle */}
            <Circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Incorrect segment */}
            {circularProgress.incorrect > 0 && (
              <Circle
                cx="50"
                cy="50"
                r="45"
                stroke="#ef4444"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - circularProgress.incorrect / 100)}`}
                strokeLinecap="round"
                transform={`rotate(-90 50 50)`}
              />
            )}
            {/* Correct segment */}
            {circularProgress.correct > 0 && (
              <Circle
                cx="50"
                cy="50"
                r="45"
                stroke="#14b8a6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (circularProgress.correct + circularProgress.incorrect) / 100)}`}
                strokeLinecap="round"
                transform={`rotate(${-90 + (circularProgress.incorrect / 100) * 360} 50 50)`}
              />
            )}
          </Svg>
          <View style={styles.circularTextContainer}>
            <Text style={styles.circularText}>{answeredCorrect}</Text>
          </View>
        </View>

        {/* Stats List */}
        <View style={styles.statsList}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Số câu đúng:</Text>
            <Text style={styles.statValue}>{answeredCorrect}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Số câu không làm:</Text>
            <Text style={styles.statValue}>{unansweredQuestions}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Số câu sai:</Text>
            <Text style={styles.statValue}>{answeredInCorrect}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Trạng thái:</Text>
            <View
              style={[
                styles.statusBadge,
                isFailedStatus && styles.statusBadgeFail,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isFailedStatus && styles.statusTextFail,
                ]}
              >
                {isFailedStatus ? "Không đạt" : "Đạt"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Time and Expand Row */}
      <View style={styles.timeExpandRow}>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons
            name="timer-outline"
            size={20}
            color="#14b8a6"
          />
          <Text style={styles.timeText}>{formatTime(time)}</Text>
        </View>

        {questions.length > 0 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.expandText}>
              {isExpanded ? "Thu gọn" : "Mở rộng"}
            </Text>
            <Text style={styles.expandChevron}>
              {isExpanded ? "▴" : "▾"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Expanded Grid */}
      {isExpanded && questions.length > 0 && (
        <View style={styles.gridWrap}>
          <View style={styles.grid}>
            {questions.map((q, idx) => {
              const isCorrect = q.isCorrect;
              const hasAnswer = q.hasUserAnswer;
              const isWrong = hasAnswer && !isCorrect;
              const questionIdStr = q.id.toString();

              return (
                <TouchableOpacity
                  key={q.id}
                  onPress={() => {
                    const offset = questionOffsets[questionIdStr];
                    if (offset !== undefined) {
                      onQuestionPress(questionIdStr, offset);
                    }
                  }}
                  activeOpacity={0.85}
                  style={[
                    styles.numCell,
                    isCorrect && styles.numCellCorrect,
                    isWrong && styles.numCellWrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.numCellText,
                      isCorrect && styles.numCellTextCorrect,
                      isWrong && styles.numCellTextWrong,
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

const styles = StyleSheet.create({
  statsSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  circularProgressContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  circularSvg: {
    position: "absolute",
  },
  circularTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: 100,
  },
  circularText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#14b8a6",
  },
  statsList: {
    flex: 1,
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeFail: {
    backgroundColor: "#f472b6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  statusTextFail: {
    color: "white",
  },
  timeExpandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0ea5e9",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expandText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  expandChevron: {
    fontSize: 14,
    color: "#111827",
  },
  gridWrap: {
    paddingTop: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  numCell: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  numCellCorrect: {
    backgroundColor: "#14b8a6",
    borderColor: "#14b8a6",
  },
  numCellWrong: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  numCellText: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "600",
  },
  numCellTextCorrect: {
    color: "#ffffff",
  },
  numCellTextWrong: {
    color: "#ef4444",
    fontWeight: "700",
  },
});
