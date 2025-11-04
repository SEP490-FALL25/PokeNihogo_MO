import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface ResultValueCardProps {
  title: string;
  value: string | number;
  icon?: string | React.ReactNode; // emoji text or vector icon element
  style?: ViewStyle;
  headerGradientColors?: [string, string];
  size?: "default" | "compact";
}

export default function ResultValueCard({
  title,
  value,
  icon,
  style,
  headerGradientColors = ["#4f86ff", "#2f66f3"],
  size = "default",
}: ResultValueCardProps) {
  const isCompact = size === "compact";
  return (
    <View
      style={[
        styles.card,
        { borderColor: headerGradientColors[0] },
        isCompact && styles.cardCompact,
        style,
      ]}
    >
      <LinearGradient colors={[...headerGradientColors]} style={styles.header}>
        <Text style={[styles.headerText, isCompact && styles.headerTextCompact]}>
          {title}
        </Text>
      </LinearGradient>
      <View style={[styles.body, isCompact && styles.bodyCompact]}>
        {typeof icon === "string" ? (
          <Text style={[styles.icon, isCompact && styles.iconCompact]}>{icon}</Text>
        ) : (
          icon
        )}
        <Text style={[styles.value, isCompact && styles.valueCompact]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  cardCompact: {
    borderRadius: 14,
  },
  header: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  headerTextCompact: {
    fontSize: 14,
  },
  body: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  bodyCompact: {
    paddingVertical: 12,
  },
  icon: {
    fontSize: 20,
  },
  iconCompact: {
    fontSize: 18,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  valueCompact: {
    fontSize: 18,
  },
});


