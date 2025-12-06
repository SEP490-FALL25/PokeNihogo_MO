import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

interface ExpProgressBarProps {
  currentExp: number;
  currentLevel: number;
  expToNextLevel: number;
  size?: "small" | "large";
  showText?: boolean;
  style?: any;
}

export default function ExpProgressBar({
  currentExp = 0,
  currentLevel = 0,
  expToNextLevel = 0,
  size = "small",
  showText = true,
  style,
}: ExpProgressBarProps) {
  // expToNextLevel is now nextLevel.requiredExp (total exp needed to reach next level)
  const totalExp = expToNextLevel;
  const percentage =
    totalExp > 0 ? (currentExp / totalExp) * 100 : 0;
  const expNeeded = Math.max(0, totalExp - currentExp);
  const isLarge = size === "large";
  const { t } = useTranslation();
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
            {currentExp?.toLocaleString()} / {totalExp.toLocaleString()}{" "}
            {t("profile.xp")}
          </Text>
          {/* {isLarge && (
            <Text style={styles.percentageText}>{percentage.toFixed(1)}%</Text>
          )} */}
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
            { width: `${Math.min(100, percentage)}%` },
          ]}
        />
      </View>

      {isLarge && showText && (
        <Text style={styles.remainingText}>
          {expNeeded.toLocaleString()} {t("profile.xp")}{" "}
          {t("profile.to")} {t("profile.level")}{" "}
          {currentLevel + 1}
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
    justifyContent: "center",
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
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
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
