import { ThemedText } from "@components/ThemedText";
import { IconSymbol } from "@components/ui/IconSymbol";
import {
  Lesson,
  LessonCategory as LessonCategoryType,
} from "@models/lesson/lesson.common";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import LessonCard from "./LessonCard";

interface LessonCategoryProps {
  category: LessonCategoryType;
  onLessonPress?: (lesson: Lesson) => void;
}

const LessonCategory: React.FC<LessonCategoryProps> = ({
  category,
  onLessonPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedLessons = category.lessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const totalLessons = category.lessons.length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "vocabulary":
        return "textformat.abc";
      case "grammar":
        return "textformat.123";
      case "reading":
        return "book.fill";
      case "listening":
        return "headphones";
      case "kanji":
        return "character";
      case "conversation":
        return "bubble.left.and.bubble.right.fill";
      case "writing":
        return "pencil.and.outline";
      default:
        return "folder.fill";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={[styles.categoryCard, { borderLeftColor: category.color }]}
        activeOpacity={0.8}
      >
        <View style={styles.categoryHeader}>
          <View
            style={[styles.iconContainer, { backgroundColor: category.color }]}
          >
            <IconSymbol
              name={getCategoryIcon(category.name) as any}
              size={24}
              color="#ffffff"
            />
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
              <View style={styles.expandIcon}>
                <IconSymbol
                  name={isExpanded ? "chevron.up" : "chevron.down"}
                  size={20}
                  color="#6b7280"
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.lessonsContainer}>
          {category.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onPress={onLessonPress}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
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
  expandIcon: {
    marginLeft: 8,
  },
  lessonsContainer: {
    marginTop: 12,
    paddingLeft: 8,
    gap: 12,
  },
});

export default LessonCategory;
