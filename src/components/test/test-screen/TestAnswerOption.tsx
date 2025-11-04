import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TestAnswerOptionProps {
  id: string;
  text: string;
  index: number;
  isSelected: boolean;
  scaleAnim: Animated.Value;
  onPress: () => void;
}

export const TestAnswerOption: React.FC<TestAnswerOptionProps> = ({
  text,
  index,
  isSelected,
  scaleAnim,
  onPress,
}) => {
  return (
    <Animated.View
      style={[
        styles.optionWrapper,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.optionButton, isSelected && styles.optionSelected]}
      >
        <View style={styles.optionContent}>
          <View
            style={[styles.optionCircle, isSelected && styles.circleSelected]}
          >
            <Text style={styles.optionLabel}>
              {String.fromCharCode(65 + index)}
            </Text>
          </View>
          <Text style={styles.optionText}>{text}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  optionWrapper: { marginBottom: 12 },
  optionButton: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionSelected: { backgroundColor: "#eef2ff", borderColor: "#4f46e5" },
  optionContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  optionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  circleSelected: { backgroundColor: "#4f46e5" },
  optionLabel: { color: "white", fontWeight: "bold", fontSize: 14 },
  optionText: { fontSize: 16, color: "#1f2937", flex: 1 },
});
