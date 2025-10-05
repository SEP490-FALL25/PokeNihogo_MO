import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const sampleLessons = [
  {
    id: 1,
    title: "Hiragana Basics",
    description: "Learn the basic hiragana characters",
    progress: 75,
    difficulty: "Beginner",
    icon: "textformat.abc",
    color: "#10b981",
  },
  {
    id: 2,
    title: "Katakana Fundamentals",
    description: "Master katakana writing system",
    progress: 45,
    difficulty: "Beginner",
    icon: "textformat.123",
    color: "#f59e0b",
  },
  {
    id: 3,
    title: "Basic Greetings",
    description: "Essential Japanese greetings and phrases",
    progress: 90,
    difficulty: "Beginner",
    icon: "hand.wave.fill",
    color: "#3b82f6",
  },
  {
    id: 4,
    title: "Numbers & Counting",
    description: "Learn Japanese numbers and counting systems",
    progress: 30,
    difficulty: "Beginner",
    icon: "number.circle.fill",
    color: "#8b5cf6",
  },
  {
    id: 5,
    title: "Family Members",
    description: "Vocabulary for family relationships",
    progress: 0,
    difficulty: "Beginner",
    icon: "person.2.fill",
    color: "#ef4444",
  },
  {
    id: 6,
    title: "Daily Activities",
    description: "Common daily activities and verbs",
    progress: 0,
    difficulty: "Intermediate",
    icon: "sun.max.fill",
    color: "#06b6d4",
  },
];

const LessonCard: React.FC<{
  lesson: (typeof sampleLessons)[0];
  onPress: () => void;
}> = ({ lesson, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.lessonCard, { borderLeftColor: lesson.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.lessonHeader}>
        <View style={[styles.iconContainer, { backgroundColor: lesson.color }]}>
          <IconSymbol name={lesson.icon as any} size={24} color="#ffffff" />
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
            {lesson.difficulty}
          </ThemedText>
        </View>
      </View>

      {lesson.progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${lesson.progress}%`, backgroundColor: lesson.color },
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {lesson.progress}% Complete
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function LearnScreen() {
  const handleLessonPress = (lessonId: number) => {
    console.log(`Lesson ${lessonId} pressed`);
    // Navigate to lesson detail screen
  };

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        📚 Learn Japanese
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Choose a lesson to continue your learning journey
      </ThemedText>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🎯 Your Learning Path
      </ThemedText>

      <View style={styles.lessonsContainer}>
        {sampleLessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onPress={() => handleLessonPress(lesson.id)}
          />
        ))}
      </View>

      <ThemedView style={styles.statsCard}>
        <ThemedText type="subtitle" style={styles.statsTitle}>
          📊 Your Progress
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Lessons Completed</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>7</ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>85%</ThemedText>
            <ThemedText style={styles.statLabel}>Average Score</ThemedText>
          </View>
        </View>
      </ThemedView>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
