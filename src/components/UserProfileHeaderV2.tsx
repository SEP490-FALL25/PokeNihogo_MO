import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Avatar } from "./ui/Avatar";
import { Progress } from "./ui/Progress";

export interface UserProfileDataV2 {
  name: string;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  avatar?: string;
}

export interface UserProfileHeaderV2Props {
  user: UserProfileDataV2;
  style?: any;
}

const { width: screenWidth } = Dimensions.get("window");

export function UserProfileHeaderV2({ user, style }: UserProfileHeaderV2Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  // Calculate the progress percentage
  const progressPercentage =
    user.expToNextLevel > 0 ? (user.currentExp / user.expToNextLevel) * 100 : 0;

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const overlayHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120], // Height of expanded content
  });

  const overlayOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <ThemedView style={[styles.container, style]}>
      {/* Compact Header - Always Visible */}
      <TouchableOpacity
        style={styles.compactHeader}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <View style={styles.compactContent}>
          {/* Level Badge */}
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>Lv.{user.level}</ThemedText>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Progress
              value={progressPercentage}
              style={styles.compactProgressBar}
            />
            <ThemedText style={styles.compactExpText}>
              {user.currentExp}/{user.expToNextLevel}
            </ThemedText>
          </View>

          {/* Avatar */}
          <Avatar
            src={user.avatar}
            fallback={user.name}
            size={40}
            style={styles.avatar}
          />
        </View>
      </TouchableOpacity>

      {/* Expandable Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            height: overlayHeight,
            opacity: overlayOpacity,
          },
        ]}
      >
        <View style={styles.expandedContent}>
          {/* User Name */}
          <ThemedText type="title" style={styles.expandedUserName}>
            {user.name}
          </ThemedText>

          {/* Level and Progress Info */}
          <View style={styles.expandedProgressSection}>
            <View style={styles.expandedProgressInfo}>
              <ThemedText style={styles.expandedLevelText}>
                Level {user.level}
              </ThemedText>
              <ThemedText style={styles.expandedExpText}>
                {user.currentExp} / {user.expToNextLevel} EXP (
                {Math.round(progressPercentage)}%)
              </ThemedText>
            </View>
            <Progress
              value={progressPercentage}
              style={styles.expandedProgressBar}
            />
          </View>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  compactHeader: {
    padding: 16,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  levelText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: "center",
  },
  compactProgressBar: {
    width: "100%",
    height: 8,
    marginBottom: 4,
  },
  compactExpText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  expandedContent: {
    padding: 16,
    paddingTop: 8,
  },
  expandedUserName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1f2937",
    textAlign: "center",
  },
  expandedProgressSection: {
    gap: 8,
  },
  expandedProgressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandedLevelText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
  },
  expandedExpText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  expandedProgressBar: {
    height: 10,
  },
});
