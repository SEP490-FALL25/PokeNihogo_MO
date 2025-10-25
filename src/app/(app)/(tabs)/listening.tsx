import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const sampleListeningExercises = [
  {
    id: 1,
    title: "Basic Greetings",
    description: "Listen to common Japanese greetings and responses",
    level: "Beginner",
    duration: "3:45",
    icon: "hand.wave.fill",
    color: "#10b981",
    progress: 100,
  },
  {
    id: 2,
    title: "Numbers & Counting",
    description: "Practice listening to Japanese numbers",
    level: "Beginner",
    duration: "5:20",
    icon: "number.circle.fill",
    color: "#f59e0b",
    progress: 75,
  },
  {
    id: 3,
    title: "Daily Conversations",
    description: "Real-life Japanese conversations",
    level: "Intermediate",
    duration: "8:15",
    icon: "bubble.left.and.bubble.right.fill",
    color: "#3b82f6",
    progress: 30,
  },
  {
    id: 4,
    title: "News & Weather",
    description: "Japanese news broadcasts and weather reports",
    level: "Intermediate",
    duration: "12:30",
    icon: "cloud.sun.fill",
    color: "#8b5cf6",
    progress: 0,
  },
  {
    id: 5,
    title: "Anime Dialogues",
    description: "Popular anime conversations for practice",
    level: "Advanced",
    duration: "15:45",
    icon: "tv.fill",
    color: "#ef4444",
    progress: 0,
  },
  {
    id: 6,
    title: "Business Japanese",
    description: "Formal business conversations and meetings",
    level: "Advanced",
    duration: "20:00",
    icon: "briefcase.fill",
    color: "#06b6d4",
    progress: 0,
  },
];

const ListeningCard: React.FC<{
  exercise: (typeof sampleListeningExercises)[0];
  onPress: () => void;
}> = ({ exercise, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.listeningCard, { borderLeftColor: exercise.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconContainer, { backgroundColor: exercise.color }]}
        >
          <IconSymbol name={exercise.icon as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.exerciseInfo}>
          <ThemedText type="subtitle" style={styles.exerciseTitle}>
            {exercise.title}
          </ThemedText>
          <ThemedText style={styles.exerciseDescription}>
            {exercise.description}
          </ThemedText>
        </View>
        <View style={styles.playButton}>
          <IconSymbol
            name={"play.circle.fill" as any}
            size={32}
            color={exercise.color}
          />
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>{exercise.level}</ThemedText>
          </View>
          <ThemedText style={styles.durationText}>
            ⏱️ {exercise.duration}
          </ThemedText>
        </View>

        {exercise.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${exercise.progress}%`,
                    backgroundColor: exercise.color,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {exercise.progress}%
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ListeningScreen() {
  const { t } = useTranslation();
  
  const handleListeningPress = (exerciseId: number) => {
    console.log(`Listening exercise ${exerciseId} pressed`);
    // Navigate to listening detail screen
  };

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        🎧 {t("listening.title")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        {t("listening.subtitle")}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🎵 {t("listening.audio_exercises")}
      </ThemedText>

      <View style={styles.exercisesContainer}>
        {sampleListeningExercises.map((exercise) => (
          <ListeningCard
            key={exercise.id}
            exercise={exercise}
            onPress={() => handleListeningPress(exercise.id)}
          />
        ))}
      </View>

      <ThemedView style={styles.statsCard}>
        <ThemedText type="subtitle" style={styles.statsTitle}>
          📊 {t("listening.progress_title")}
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>15</ThemedText>
            <ThemedText style={styles.statLabel}>{t("listening.exercises_done")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>2.5h</ThemedText>
            <ThemedText style={styles.statLabel}>{t("listening.total_time")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>88%</ThemedText>
            <ThemedText style={styles.statLabel}>{t("listening.accuracy")}</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.tipsCard}>
        <ThemedText type="subtitle" style={styles.tipsTitle}>
          🎯 {t("listening.tips_title")}
        </ThemedText>
        <View style={styles.tipsList}>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_1")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_2")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_3")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("listening.tip_4")}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.controlsCard}>
        <ThemedText type="subtitle" style={styles.controlsTitle}>
          🎛️ {t("listening.controls_title")}
        </ThemedText>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol
              name={"backward.fill" as any}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol
              name={"play.circle.fill" as any}
              size={48}
              color="#3b82f6"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <IconSymbol
              name={"forward.fill" as any}
              size={24}
              color="#6b7280"
            />
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.controlsHint}>
          {t("listening.controls_hint")}
        </ThemedText>
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
  exercisesContainer: {
    gap: 16,
  },
  listeningCard: {
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
  cardHeader: {
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
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  playButton: {
    marginLeft: 8,
  },
  cardFooter: {
    gap: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  durationText: {
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
    color: "#8b5cf6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  tipsCard: {
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
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  controlsCard: {
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
  controlsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 12,
  },
  controlButton: {
    padding: 8,
  },
  controlsHint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
});
