import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

interface PokemonImageProps {
  imageUri: string;
  size?: number;
  style?: any;
}

export default function PokemonImage({
  imageUri,
  size = 80,
  style,
}: PokemonImageProps) {
  return (
    <Image
      source={{ uri: imageUri }}
      style={[
        styles.image,
        {
          width: size,
          height: size,
        },
        style,
      ]}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    // Base styles for Pokemon image
  },
});
