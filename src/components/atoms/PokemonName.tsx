import React from "react";
import { StyleSheet, Text } from "react-native";

interface PokemonNameProps {
  name: string;
  style?: any;
  numberOfLines?: number;
}

export default function PokemonName({
  name,
  style,
  numberOfLines = 1,
}: PokemonNameProps) {
  return (
    <Text style={[styles.name, style]} numberOfLines={numberOfLines}>
      {name}
    </Text>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
  },
});
