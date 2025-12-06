import React from "react";
import { StyleSheet, View } from "react-native";
import PokemonImage from "../atoms/PokemonImage";

interface PokemonDisplayProps {
  imageUri: string;
  imageSize?: number;
  style?: any;
}

export default function PokemonDisplay({
  imageUri,
  imageSize = 80,
  style,
}: PokemonDisplayProps) {
  return (
    <View style={[styles.container, style]}>
      <PokemonImage imageUri={imageUri} size={imageSize} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    // backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 16,},
  image: {
    // Removed marginBottom for overlay display
  },
});
