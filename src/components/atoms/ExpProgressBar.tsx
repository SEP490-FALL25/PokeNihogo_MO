import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ExpProgressBarProps {
  currentExp: number;
  expToNextLevel: number;
  size?: "small" | "large";
  showText?: boolean;
  style?: any;
}

export default function ExpProgressBar({
  currentExp,
  expToNextLevel,
  size = "small",
  showText = true,
  style,
}: ExpProgressBarProps) {
  const percentage =
    expToNextLevel > 0 ? (currentExp / expToNextLevel) * 100 : 0;
  const isLarge = size === "large";

  return (
    <View style={[styles.container, style]}>
      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.progressText,
              isLarge ? styles.progressTextLarge : styles.progressTextSmall,
            ]}
          >
            {currentExp.toLocaleString()} / {expToNextLevel.toLocaleString()} XP
          </Text>
          {isLarge && (
            <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.progressBarBg,
          isLarge ? styles.progressBarBgLarge : styles.progressBarBgSmall,
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            isLarge ? styles.progressBarFillLarge : styles.progressBarFillSmall,
            { width: `${percentage}%` },
          ]}
        />
      </View>

      {isLarge && showText && (
        <Text style={styles.remainingText}>
          {(expToNextLevel - currentExp).toLocaleString()} XP to Level{" "}
          {Math.floor(currentExp / 1000) + 1}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  progressTextSmall: {
    fontSize: 11,
  },
  progressTextLarge: {
    fontSize: 14,
  },
  percentageText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  progressBarBg: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarBgSmall: {
    height: 8,
  },
  progressBarBgLarge: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  progressBarFillSmall: {
    borderRadius: 4,
  },
  progressBarFillLarge: {
    borderRadius: 6,
  },
  remainingText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
