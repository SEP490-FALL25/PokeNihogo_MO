import React from "react";
import { StyleSheet, View } from "react-native";

interface SelectionBorderProps {
  visible: boolean;
  color: string;
  borderRadius?: number;
  borderWidth?: number;
  style?: any;
  width?: number;
  height?: number;
}

export default function SelectionBorder({
  visible,
  color,
  borderRadius = 16,
  borderWidth = 3,
  style,
  width,
  height,
}: SelectionBorderProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.border,
        {
          borderColor: color,
          borderRadius,
          borderWidth,
          shadowColor: color,
          width,
          height,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  border: {
    position: "absolute",
    top: 0,
    left: 2,
    right: 0,
    bottom: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 12,
  },
});
