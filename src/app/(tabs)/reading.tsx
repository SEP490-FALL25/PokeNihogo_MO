import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const sampleReadingMaterials = [
  {
    id: 1,
    title: "Basic Hiragana Stories",
    description: "Simple stories using only hiragana characters",
    level: "Beginner",
    estimatedTime: "5 min",
    icon: "textformat.abc",
    color: "#10b981",
    progress: 80,
  },
  {
    id: 2,
    title: "Daily Life Conversations",
    description: "Reading about everyday Japanese conversations",
    level: "Beginner",
    estimatedTime: "8 min",
    icon: "bubble.left.and.bubble.right.fill",
    color: "#f59e0b",
    progress: 45,
  },
  {
    id: 3,
    title: "Japanese News Headlines",
    description: "Practice reading current news in Japanese",
    level: "Intermediate",
    estimatedTime: "12 min",
    icon: "newspaper.fill",
    color: "#3b82f6",
    progress: 0,
  },
  {
    id: 4,
    title: "Traditional Folktales",
    description: "Classic Japanese stories and legends",
    level: "Intermediate",
    estimatedTime: "15 min",
    icon: "book.closed.fill",
    color: "#8b5cf6",
    progress: 0,
  },
  {
    id: 5,
    title: "Manga Excerpts",
    description: "Reading practice with popular manga",
    level: "Advanced",
    estimatedTime: "20 min",
    icon: "rectangle.stack.fill",
    color: "#ef4444",
    progress: 0,
  },
  {
    id: 6,
    title: "Business Japanese",
    description: "Professional and formal Japanese texts",
    level: "Advanced",
    estimatedTime: "25 min",
    icon: "briefcase.fill",
    color: "#06b6d4",
    progress: 0,
  },
];

const ReadingCard: React.FC<{
  material: (typeof sampleReadingMaterials)[0];
  onPress: () => void;
}> = ({ material, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.readingCard, { borderLeftColor: material.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconContainer, { backgroundColor: material.color }]}
        >
          <IconSymbol name={material.icon as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.materialInfo}>
          <ThemedText type="subtitle" style={styles.materialTitle}>
            {material.title}
          </ThemedText>
          <ThemedText style={styles.materialDescription}>
            {material.description}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>{material.level}</ThemedText>
          </View>
          <ThemedText style={styles.timeText}>
            ⏱️ {material.estimatedTime}
          </ThemedText>
        </View>

        {material.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${material.progress}%`,
                    backgroundColor: material.color,
                  },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {material.progress}%
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ReadingScreen() {
  const handleReadingPress = (materialId: number) => {
    console.log(`Reading material ${materialId} pressed`);
    // Navigate to reading detail screen
  };

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        📖 Reading Practice
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Improve your Japanese reading skills with various texts
      </ThemedText>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        📚 Reading Materials
      </ThemedText>

      <View style={styles.materialsContainer}>
        {sampleReadingMaterials.map((material) => (
          <ReadingCard
            key={material.id}
            material={material}
            onPress={() => handleReadingPress(material.id)}
          />
        ))}
      </View>

      <ThemedView style={styles.statsCard}>
        <ThemedText type="subtitle" style={styles.statsTitle}>
          📊 Reading Progress
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>8</ThemedText>
            <ThemedText style={styles.statLabel}>Articles Read</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>245</ThemedText>
            <ThemedText style={styles.statLabel}>Words Learned</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>92%</ThemedText>
            <ThemedText style={styles.statLabel}>Comprehension</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.tipsCard}>
        <ThemedText type="subtitle" style={styles.tipsTitle}>
          💡 Reading Tips
        </ThemedText>
        <View style={styles.tipsList}>
          <ThemedText style={styles.tipItem}>
            • Start with simple texts and gradually increase difficulty
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • Look up unknown words but try to guess meaning from context first
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • Read aloud to improve pronunciation and rhythm
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • Practice reading different types of texts (news, stories, etc.)
          </ThemedText>
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
  materialsContainer: {
    gap: 16,
  },
  readingCard: {
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
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: "#6b7280",
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
  timeText: {
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
    color: "#f59e0b",
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
});
