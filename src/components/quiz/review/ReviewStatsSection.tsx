import { ExerciseAttemptStatus } from "@constants/exercise.enum";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTranslation } from "react-i18next";

interface ReviewStats {
  totalQuestions: number;
  answeredCorrect: number;
  answeredInCorrect: number;
  unansweredQuestions: number;
  time: number;
  status: string;
}

interface ReviewStatsSectionProps {
  stats: ReviewStats;
  questions: { id: number; isCorrect?: boolean }[];
  onQuestionPress?: (questionId: string, index: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ReviewStatsSection({
  stats,
  questions,
  onQuestionPress,
  isCollapsed = false,
  onToggleCollapse,
}: ReviewStatsSectionProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation values
  const heightAnim = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;
  
  // Animate when collapsed state changes
  useEffect(() => {
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: isCollapsed ? 0 : 1,
        useNativeDriver: false,
        tension: 65,
        friction: 9,
      }),
      Animated.timing(opacityAnim, {
        toValue: isCollapsed ? 0 : 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCollapsed, heightAnim, opacityAnim]);

  // Format time (seconds to HH:MM:SS)
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isFailedStatus = useMemo(() => {
    return (
      stats.status === ExerciseAttemptStatus.FAIL ||
      stats.status === ExerciseAttemptStatus.FAILED
    );
  }, [stats.status]);

  // Determine progress color based on status
  const progressColor = useMemo(() => {
    return isFailedStatus ? "#ef4444" : "#14b8a6";
  }, [isFailedStatus]);

  // Text color for circular progress
  const textColor = useMemo(() => {
    return isFailedStatus ? "#ef4444" : "#14b8a6";
  }, [isFailedStatus]);

  // Helper to check if question is correct
  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (!question) return { isCorrect: false, isWrong: false };
    const isCorrect = question.isCorrect === true;
    const isWrong = question.isCorrect === false && question.isCorrect !== undefined;
    return { isCorrect, isWrong };
  };

  return (
    <View style={styles.statsSection}>
      {/* Collapsed View - Compact version with animation */}
      {isCollapsed && (
        <TouchableOpacity
          onPress={onToggleCollapse}
          activeOpacity={0.7}
          style={styles.collapsedTouchableContainer}
        >
          <Animated.View 
            style={[
              styles.statsSectionCollapsed,
              {
                opacity: opacityAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    scale: opacityAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.95],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.collapsedContent}>
              {/* Compact Circular Progress */}
              <View style={styles.circularProgressContainerSmall}>
                <Svg width={50} height={50} style={styles.circularSvg}>
                  {/* Background circle */}
                  <Circle
                    cx="25"
                    cy="25"
                    r="22"
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <Circle
                    cx="25"
                    cy="25"
                    r="22"
                    stroke={progressColor}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform={`rotate(-90 25 25)`}
                  />
                </Svg>
                <View style={styles.circularTextContainerSmall}>
                  <Text style={[styles.circularTextSmall, { color: textColor }]}>
                    {stats.answeredCorrect}
                  </Text>
                </View>
              </View>

              {/* Compact Stats */}
              {stats.time > 0 && (
                <View style={styles.collapsedStats}>
                  <Text style={styles.collapsedStatsText}>
                    {stats.answeredCorrect}/{stats.totalQuestions} đúng
                  </Text>
                  <Text style={styles.collapsedTimeText}>
                    ⏱ {formatTime(stats.time)}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Expanded View - Full version with animation */}
      {!isCollapsed && (
        <Animated.View
          style={[
            styles.statsSectionExpanded,
            {
              opacity: opacityAnim,
              transform: [
                {
                  scale: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={onToggleCollapse}
            activeOpacity={0.7}
            style={styles.statsHeaderTouchable}
          >
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
                  {/* Progress circle based on status */}
                  <Circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={progressColor}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform={`rotate(-90 50 50)`}
                  />
                </Svg>
                <View style={styles.circularTextContainer}>
                  <Text style={[styles.circularText, { color: textColor }]}>
                    {stats.answeredCorrect}
                  </Text>
                </View>
              </View>

              {/* Stats List */}
              <View style={styles.statsList}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>
                    {t("review_stats.correct_count", "Số câu đúng:")}
                  </Text>
                  <Text style={styles.statValue}>{stats.answeredCorrect}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>
                    {t("review_stats.unanswered_count", "Số câu không làm:")}
                  </Text>
                  <Text style={styles.statValue}>{stats.unansweredQuestions}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>
                    {t("review_stats.incorrect_count", "Số câu sai:")}
                  </Text>
                  <Text style={styles.statValue}>{stats.answeredInCorrect}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>
                    {t("review_stats.status_label", "Trạng thái:")}
                  </Text>
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
                      {isFailedStatus
                        ? t("review_stats.status_failed", "Không đạt")
                        : t("review_stats.status_passed", "Đạt")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Time and Expand Row */}
          <View style={styles.timeExpandRow}>
            <View style={styles.timeContainer}>
              <MaterialCommunityIcons name="timer-outline" size={20} color="#14b8a6" />
              <Text style={styles.timeText}>{formatTime(stats.time)}</Text>
            </View>

            {questions.length > 0 && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.expandText}>
                  {isExpanded
                    ? t("review_stats.collapse", "Thu gọn")
                    : t("review_stats.expand", "Mở rộng")}
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
                  const { isCorrect, isWrong } = getQuestionStatus(idx);
                  return (
                    <TouchableOpacity
                      key={q.id}
                      onPress={() => {
                        if (onQuestionPress) {
                          onQuestionPress(q.id.toString(), idx);
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
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
    overflow: "hidden",
  },
  collapsedTouchableContainer: {
    width: "100%",
  },
  statsSectionCollapsed: {
    padding: 12,
    paddingVertical: 10,
  },
  statsSectionExpanded: {
    padding: 20,
  },
  statsHeaderTouchable: {
    width: "100%",
  },
  collapsedContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  circularProgressContainerSmall: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  circularTextContainerSmall: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
  },
  circularTextSmall: {
    fontSize: 18,
    fontWeight: "700",
  },
  collapsedStats: {
    flex: 1,
    marginLeft: 12,
  },
  collapsedStatsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  collapsedTimeText: {
    fontSize: 13,
    color: "#6b7280",
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
