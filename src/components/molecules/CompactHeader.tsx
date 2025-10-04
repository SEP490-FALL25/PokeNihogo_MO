import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ExpProgressBar from "../atoms/ExpProgressBar";
import LevelBadge from "../atoms/LevelBadge";
import UserAvatar from "../atoms/UserAvatar";

interface User {
  name: string;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  avatar?: string;
}

interface CompactHeaderProps {
  user: User;
  onPress: () => void;
  style?: any;
}

export default function CompactHeader({ user, onPress, style }: CompactHeaderProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={["#79B4C4", "#85C3C3", "#9BC7B9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Level Badge */}
        <LevelBadge level={user.level} size="small" />

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ExpProgressBar
            currentExp={user.currentExp}
            expToNextLevel={user.expToNextLevel}
            size="small"
          />
        </View>

        {/* Avatar */}
        <UserAvatar name={user.name} avatar={user.avatar} size="small" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
});
