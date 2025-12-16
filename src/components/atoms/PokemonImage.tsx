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

  // Reset loading and error state when the image changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [imageUri]);

  // If no imageUri or empty string, keep loading indefinitely
  const shouldKeepLoading = !imageUri || imageUri.trim() === "";

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      {(isLoading || shouldKeepLoading || hasError) && (
        <ActivityIndicator
          testID="pokemon-image-loading"
          size="small"
          color="#888"
          style={styles.loader}
        />
      )}
      {!shouldKeepLoading && !hasError && (
        <Image
          source={{ uri: imageUri }}
          style={[styles.image, { width: size, height: size }]}
          contentFit="contain"
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            // Keep loading when error occurs - don't stop loading, don't show image
            setIsLoading(true);
            setHasError(true);
          }}
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
