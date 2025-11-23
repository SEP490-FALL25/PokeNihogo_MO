import { ThemedText } from "@components/ThemedText";
// Replaced IconSymbol with lucide-react-native
import { LessonProgress } from "@models/lesson/lesson.common";
import { ROUTES } from "@routes/routes";
import { router } from "expo-router";
import { Type } from "lucide-react-native";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface LessonCardProps {
  lesson: LessonProgress;
  onPress?: (lesson: LessonProgress) => void;
}

const LessonCard: React.FC<LessonCardProps> = React.memo(
  ({ lesson, onPress }) => {
    const { t } = useTranslation();

    const handlePress = useCallback(() => {
      if (onPress) {
        onPress(lesson);
      } else {
        // Navigate to lesson detail
        router.push({
          pathname: ROUTES.LESSON.DETAIL,
          params: { 
            id: lesson.lessonId.toString(),
            status: lesson.status || "NOT_STARTED",
          },
        });
      }
    }, [onPress, lesson]);

    // Simplified type configuration
    const typeConfig = {
      color: "#10b981",
    };


    return (
      <TouchableOpacity
        style={[styles.lessonCard, { borderLeftColor: typeConfig.color }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.lessonHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: typeConfig.color },
            ]}
          >
            <Type size={24} color="#ffffff" />
          </View>
          <View style={styles.lessonInfo}>
            <ThemedText type="subtitle" style={styles.lessonTitle}>
              {lesson.lesson.titleJp}
            </ThemedText>
            <ThemedText style={styles.lessonDescription}>
              {t("lesson_card.lesson_description", { level: lesson.lesson.levelJlpt })}
            </ThemedText>
          </View>
        </View>


        {/* Progress */}
        {lesson.progressPercentage > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${lesson.progressPercentage}%`,
                    backgroundColor: typeConfig.color,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {lesson.progressPercentage}% {t("common.complete")}
            </ThemedText>
          </View>
        )}

        {/* Status and Level */}
        <View style={styles.statusContainer}>
          <View style={styles.statusInfo}>
            {lesson.status === "COMPLETED" ? (
              <ThemedText style={styles.statusCompleted}>
                ✅ {t("lessons.lesson_status.completed")}
              </ThemedText>
            ) : lesson.progressPercentage > 0 ? (
              <ThemedText style={styles.statusInProgress}>
                🔄 {t("lessons.lesson_status.in_progress")}
              </ThemedText>
            ) : (
              <ThemedText style={styles.statusNotStarted}>
                ⭕ {t("lessons.lesson_status.not_started")}
              </ThemedText>
            )}
          </View>
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>N{lesson.lesson.levelJlpt}</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

LessonCard.displayName = "LessonCard";

const styles = StyleSheet.create({
  lessonCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusCompleted: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  statusInProgress: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563eb",
  },
  statusNotStarted: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
  },
  levelBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    color: "#374151",
    fontWeight: "600",
  },
});

export default LessonCard;
