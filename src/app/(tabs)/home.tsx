import HomeLayout from "@components/layouts/HomeLayout";
import MainNavigation from "@components/MainNavigation";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";



export default function HomeScreen() {
  const handleStartLesson = () => {
    // Navigate to lesson screen
    console.log("Start Lesson pressed");
  };


  return (
    <HomeLayout >
      {/* Custom content for home screen */}
      <View style={styles.customContent}>
        <ThemedText type="subtitle" style={styles.welcomeTitle}>
          Welcome back, ! 👋
        </ThemedText>

        <ThemedText style={styles.welcomeSubtitle}>
          Ready to continue your Japanese learning journey?
        </ThemedText>

          {/* Quick Start Section */}
          <ThemedView style={styles.quickStartCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              🚀 Quick Start
            </ThemedText>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartLesson}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.primaryButtonText}>
                Start New Lesson
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Learning Path Section */}
          <ThemedView style={styles.learningPathCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              📚 Your Learning Path
            </ThemedText>

            <View style={styles.pathItem}>
              <ThemedText style={styles.pathItemTitle}>
                Current Level: N5
              </ThemedText>
              <ThemedText style={styles.pathItemSubtitle}>
                Basic Japanese - Hiragana & Katakana
              </ThemedText>
            </View>

            <View style={styles.pathItem}>
              <ThemedText style={styles.pathItemTitle}>Next Goal: N4</ThemedText>
              <ThemedText style={styles.pathItemSubtitle}>
                Intermediate Japanese - Kanji & Grammar
              </ThemedText>
            </View>
          </ThemedView>

          {/* Main Navigation Section */}
          <MainNavigation />

          {/* Recent Activity Section */}
          <ThemedView style={styles.recentActivityCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              📈 Recent Activity
            </ThemedText>

            <View style={styles.activityItem}>
              <ThemedText style={styles.activityText}>
                ✅ Completed &quot;Basic Greetings&quot; lesson
              </ThemedText>
              <ThemedText style={styles.activityTime}>2 hours ago</ThemedText>
            </View>

            <View style={styles.activityItem}>
              <ThemedText style={styles.activityText}>
                🎯 Achieved 95% accuracy in vocabulary quiz
              </ThemedText>
              <ThemedText style={styles.activityTime}>Yesterday</ThemedText>
            </View>

            <View style={styles.activityItem}>
              <ThemedText style={styles.activityText}>
                🔥 7-day streak maintained!
              </ThemedText>
              <ThemedText style={styles.activityTime}>3 days ago</ThemedText>
            </View>
          </ThemedView>
        </View>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  customContent: {
    gap: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  quickStartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  learningPathCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  recentActivityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  pathItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  pathItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  pathItemSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 12,
  },
  testButton: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#10b981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
