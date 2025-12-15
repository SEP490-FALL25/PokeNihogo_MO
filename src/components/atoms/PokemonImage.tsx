import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset loading/error state when the image changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [imageUri]);

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {isLoading && (
        <ActivityIndicator
          testID="pokemon-image-loading"
          size="small"
          color="#888"
          style={styles.loader}
        />
      )}
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: size, height: size }]}
        contentFit="contain"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {hasError && !isLoading && (
        <ActivityIndicator
          testID="pokemon-image-error"
          size="small"
          color="#888"
          style={styles.loader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    // Base styles for Pokemon image
  },
  loader: {
    position: "absolute",
  },
});
