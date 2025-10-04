import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import UserProfileHeaderAtomic from "@components/Organism/UserProfileHeader";

interface HomeLayoutProps {
  children?: React.ReactNode;
  user: {
    name: string;
    level: number;
    currentExp: number;
    expToNextLevel: number;
    avatar?: string;
  };
}

export default function HomeLayout({ children, user }: HomeLayoutProps) {
  return (
    <LinearGradient
      colors={["#dbeafe", "#ffffff", "#e0e7ff"]} // bg-gradient-to-br from-blue-50 via-white to-indigo-100
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Header */}
          <View style={styles.profileSection}>
            <UserProfileHeaderAtomic user={user} />
          </View>

          {/* Main Content Area */}
          <View style={styles.contentSection}>{children}</View>

          {/* Quick Stats Section */}
          <View style={styles.statsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Today&apos;s Progress
            </ThemedText>

            <View style={styles.statsGrid}>
              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statNumber}>12</ThemedText>
                <ThemedText style={styles.statLabel}>Lessons</ThemedText>
              </ThemedView>

              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statNumber}>8</ThemedText>
                <ThemedText style={styles.statLabel}>New Words</ThemedText>
              </ThemedView>

              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statNumber}>95%</ThemedText>
                <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
              </ThemedView>
            </View>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.actionsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Quick Actions
            </ThemedText>

            <View style={styles.actionsGrid}>
              <ThemedView style={styles.actionCard}>
                <ThemedText style={styles.actionTitle}>
                  Continue Learning
                </ThemedText>
                <ThemedText style={styles.actionSubtitle}>
                  Resume your current lesson
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.actionCard}>
                <ThemedText style={styles.actionTitle}>Practice</ThemedText>
                <ThemedText style={styles.actionSubtitle}>
                  Review learned words
                </ThemedText>
              </ThemedView>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  contentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontWeight: "500",
    textAlign: "center",
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
});
