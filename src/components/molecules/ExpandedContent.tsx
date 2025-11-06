import ExpProgressBar from "@/components/atoms/ExpProgressBar";
import LevelBadge from "@/components/atoms/LevelBadge";
import UserAvatar from "@/components/atoms/UserAvatar";
import { IUserEntity } from "@models/user/user.entity";
import { ROUTES } from "@routes/routes";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";



interface ExpandedContentProps {
  user: IUserEntity;
  onClose: () => void;
  style?: any;
}

export default function ExpandedContent({
  user,
  onClose,
  style,
}: ExpandedContentProps) {
  const { t } = useTranslation();

  const handleAvatarPress = () => {
    onClose(); // Close the modal first
    router.push(ROUTES.ME.PROFILE);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={(e) => e.stopPropagation()}>
        <LinearGradient
          colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Large Avatar */}
          <View style={styles.avatarContainer}>
            <UserAvatar
              name={user?.name ?? ""}
              avatar={user?.avatar ?? undefined}
              size="large"
              onPress={handleAvatarPress}
            />
          </View>

          {/* User Name */}
          <Text style={styles.userName}>{user.name}</Text>

          {/* Level Badge Large */}
          <LevelBadge
            level={user.level.levelNumber}
            size="large"
            style={styles.levelBadge}
          />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.exp.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{t("profile.current_xp")}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.level.requiredExp.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{t("profile.next_level")}</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>{t("profile.experience_progress")}</Text>
            </View>

            <ExpProgressBar
              currentExp={user.exp}
              expToNextLevel={user.level.requiredExp}
              size="large"
            />
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 8,
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
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  progressSection: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
});
