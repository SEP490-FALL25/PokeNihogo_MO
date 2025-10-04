import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface LevelBadgeProps {
  level: number;
  size?: "small" | "large";
  style?: any;
}

export default function LevelBadge({ level, size = "small", style }: LevelBadgeProps) {
  const isLarge = size === "large";

  return (
    <View
      style={[
        styles.badge,
        isLarge ? styles.badgeLarge : styles.badgeSmall,
        style,
      ]}
    >
      <Text
        style={[styles.text, isLarge ? styles.textLarge : styles.textSmall]}
      >
        {isLarge ? `Level ${level}` : `Lv ${level}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
  },
  badgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
  },
  text: {
    color: "#ffffff",
    fontWeight: "700",
  },
  textSmall: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
});
