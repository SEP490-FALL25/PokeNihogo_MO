import { ThemedText } from "@components/ThemedText";
import { IconSymbol } from "@components/ui/IconSymbol";
import { Lesson } from "@models/lesson/lesson.common";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface LessonCardProps {
  lesson: Lesson;
  onPress?: (lesson: Lesson) => void;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onPress }) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress(lesson);
    } else {
      // Navigate to lesson detail
      router.push(`/(app)/lesson/${lesson.id}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
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
      default:
        return "doc.text";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "vocabulary":
        return "#10b981";
      case "grammar":
        return "#f59e0b";
      case "reading":
        return "#3b82f6";
      case "listening":
        return "#8b5cf6";
      case "kanji":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "COMMON":
        return "bg-gray-500";
      case "UNCOMMON":
        return "bg-green-500";
      case "RARE":
        return "bg-blue-500";
      case "EPIC":
        return "bg-purple-500";
      case "LEGENDARY":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.lessonCard,
        { borderLeftColor: getTypeColor(lesson.type) },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.lessonHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getTypeColor(lesson.type) },
          ]}
        >
          <IconSymbol
            name={getTypeIcon(lesson.type) as any}
            size={24}
            color="#ffffff"
          />
        </View>
        <View style={styles.lessonInfo}>
          <ThemedText type="subtitle" style={styles.lessonTitle}>
            {lesson.title}
          </ThemedText>
          <ThemedText style={styles.lessonDescription}>
            {lesson.description}
          </ThemedText>
        </View>
        <View style={styles.difficultyBadge}>
          <ThemedText style={styles.difficultyText}>
            {t(`lessons.difficulty.${lesson.difficulty}`)}
          </ThemedText>
        </View>
      </View>

      {/* Pokemon Reward */}
      {lesson.pokemonReward && (
        <View style={styles.pokemonRewardContainer}>
          <View style={styles.pokemonReward}>
            <Image
              source={{ uri: lesson.pokemonReward.image }}
              style={styles.pokemonImage}
            />
            <View
              style={[
                styles.rarityIndicator,
                {
                  backgroundColor: getRarityColor(lesson.pokemonReward.rarity),
                },
              ]}
            />
          </View>
          <ThemedText style={styles.pokemonName}>
            {lesson.pokemonReward.name}
          </ThemedText>
        </View>
      )}

      {/* Progress */}
      {lesson.progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${lesson.progress}%`,
                  backgroundColor: getTypeColor(lesson.type),
                },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {lesson.progress}% Complete
          </ThemedText>
        </View>
      )}

      {/* Status and Level */}
      <View style={styles.statusContainer}>
        <View style={styles.statusInfo}>
          {lesson.isCompleted ? (
            <ThemedText style={styles.statusCompleted}>
              ✅ {t("lessons.lesson_status.completed")}
            </ThemedText>
          ) : lesson.progress > 0 ? (
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
          <ThemedText style={styles.levelText}>{lesson.level}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
  difficultyBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  pokemonRewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  pokemonReward: {
    position: "relative",
    marginRight: 8,
  },
  pokemonImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  rarityIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pokemonName: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
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
