import { IUserEntity } from "@models/user/user.entity";
import { ROUTES } from "@routes/routes";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ExpProgressBar from "../atoms/ExpProgressBar";
import LevelBadge from "../atoms/LevelBadge";
import UserAvatar from "../atoms/UserAvatar";

interface CompactHeaderProps {
  user: IUserEntity;
  onPress: () => void;
  style?: any;
}

export default function CompactHeader({ user, onPress, style }: CompactHeaderProps) {
  const handleAvatarPress = () => {
    router.push(ROUTES.ME.PROFILE);
  };

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
        <LevelBadge level={user?.level?.levelNumber ?? 0} size="small" />

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ExpProgressBar
            currentLevel={user?.level?.levelNumber ?? 0}
            currentExp={user?.exp}
            expToNextLevel={user?.level?.requiredExp ?? 0}
            size="small"
          />
        </View>

        {/* Avatar */}
        <UserAvatar
          name={user?.name ?? ""}
          avatar={user?.avatar ?? undefined}
          size="small"
          onPress={handleAvatarPress}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",},
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
