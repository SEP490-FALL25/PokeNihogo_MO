import React from "react";
import { StyleSheet, View } from "react-native";
import PokemonName from "../atoms/PokemonName";
import TypeBadge from "../atoms/TypeBadge";

interface PokemonInfoProps {
  name: string;
  type: string;
  selected?: boolean;
  style?: any;
}

export default function PokemonInfo({
  name,
  type,
  selected = false,
  style,
}: PokemonInfoProps) {
  return (
    <View style={[styles.container, style]}>
      <PokemonName name={name} />
      <TypeBadge type={type} selected={selected} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 8,
  },
});
