import ExpProgressBar from "@components/atoms/ExpProgressBar";
import LevelBadge from "@components/atoms/LevelBadge";
import UserAvatar from "@components/atoms/UserAvatar";
import { IconSymbol } from "@components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  // Mock user data - in real app, this would come from user store/context
  const user = {
    name: "Skibido",
    level: 15,
    currentExp: 1250,
    expToNextLevel: 500,
    avatar: undefined, // Will use placeholder
    email: "skibido@gmail.com",
    joinDate: "January 2024",
    totalLessons: 45,
    streakDays: 7,
    achievements: 12,
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <LinearGradient
          colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          {/* Large Avatar */}
          <View style={styles.avatarContainer}>
            <UserAvatar name={user.name} avatar={user.avatar} size="large" />
          </View>

          {/* User Name */}
          <Text style={styles.userName}>{user.name}</Text>

          {/* Level Badge */}
          <LevelBadge
            level={user.level}
            size="large"
            style={styles.levelBadge}
          />

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Experience Progress</Text>
            </View>
            <ExpProgressBar
              currentExp={user.currentExp}
              expToNextLevel={user.expToNextLevel}
              size="large"
            />
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.totalLessons}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user.achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member since</Text>
            <Text style={styles.infoValue}>{user.joinDate}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Pressable style={styles.settingItem}>
            <IconSymbol name="gear" size={20} color="#666666" />
            <Text style={styles.settingText}>Preferences</Text>
            <IconSymbol name="chevron.right" size={16} color="#cccccc" />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <IconSymbol name="bell" size={20} color="#666666" />
            <Text style={styles.settingText}>Notifications</Text>
            <IconSymbol name="chevron.right" size={16} color="#cccccc" />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <IconSymbol name="questionmark.circle" size={20} color="#666666" />
            <Text style={styles.settingText}>Help & Support</Text>
            <IconSymbol name="chevron.right" size={16} color="#cccccc" />
          </Pressable>

          <Pressable style={[styles.settingItem, styles.logoutItem]}>
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={20}
              color="#ff4444"
            />
            <Text style={[styles.settingText, styles.logoutText]}>
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#79B4C4",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  levelBadge: {
    marginBottom: 20,
  },
  progressSection: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  progressHeader: {
    marginBottom: 12,
  },
  progressTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  accountSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  settingsSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#ff4444",
  },
});
