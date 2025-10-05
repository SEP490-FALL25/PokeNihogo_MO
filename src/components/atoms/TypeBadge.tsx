import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTypeColor, getTypeIcon } from "../../utils/pokemon.utils";

interface TypeBadgeProps {
  type: string;
  selected?: boolean;
  style?: any;
}

export default function TypeBadge({
  type,
  selected = false,
  style,
}: TypeBadgeProps) {
  const typeIcon = getTypeIcon(type.toLowerCase());
  const typeColor = getTypeColor(type.toLowerCase());

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: selected ? typeColor : "rgba(255,255,255,0.2)",
          borderColor: selected ? typeColor : "rgba(255,255,255,0.3)",
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{typeIcon}</Text>
      <Text style={styles.text}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
