import { ThemedText } from "@components/ThemedText";
import {
  LessonCategory as LessonCategoryType,
  LessonProgress,
} from "@models/lesson/lesson.common";
import { ArrowRight, BookOpen } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Removed expand/collapse animated wrapper

interface LessonCategoryProps {
  category: LessonCategoryType;
  onLessonPress?: (lesson: LessonProgress) => void;
  onCategoryPress?: (category: LessonCategoryType) => void;
}

const LessonCategory: React.FC<LessonCategoryProps> = React.memo(
  ({ category, onLessonPress, onCategoryPress }) => {
    useTranslation();
    // Removed expand/collapse state and setup
    // Memoized calculations for better performance
    const { completedLessons, totalLessons, progressPercentage } =
      useMemo(() => {
        const completed = category.lessons.filter(
          (lesson) => lesson.status === "COMPLETED"
        ).length;
        const total = category.lessons.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;

        return {
          completedLessons: completed,
          totalLessons: total,
          progressPercentage: progress,
        };
      }, [category.lessons]);

    const handleToggle = useCallback(() => {
      if (onCategoryPress) {
        onCategoryPress(category);
      }
    }, [onCategoryPress, category]);

    // Using a single lucide icon for category

    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={handleToggle}
          style={[styles.categoryCard, { borderLeftColor: category.color }]}
          activeOpacity={0.8}
        >
          <View style={styles.categoryHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: category.color },
              ]}
            >
              <BookOpen size={24} color="#ffffff" />
            </View>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryDetails}>
                <ThemedText type="subtitle" style={styles.categoryName}>
                  {category.name}
                </ThemedText>
                <ThemedText style={styles.categoryDescription}>
                  {category.description}
                </ThemedText>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: category.color,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={styles.progressText}>
                    {completedLessons}/{totalLessons}
                  </ThemedText>
                </View>
                <View style={styles.navigationIcon}>
                  <ArrowRight size={20} color="#6b7280" />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Removed expandable lessons list */}
      </View>
    );
  }
);

LessonCategory.displayName = "LessonCategory";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,},
  categoryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryDetails: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    marginRight: 12,
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
  navigationIcon: {
    marginLeft: 8,
  },
  lessonsContainer: {
    marginTop: 12,
    paddingLeft: 8,
    gap: 12,
    overflow: "hidden",
  },
});

export default LessonCategory;
