import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { StarterCardProps } from "../../types/starter.types";
import { getTypeColor } from "../../utils/pokemon.utils";
import SelectionBorder from "../atoms/SelectionBorder";
import PokemonDisplay from "../molecules/PokemonDisplay";
import PokemonInfo from "../molecules/PokemonInfo";

const StarterCard: React.FC<StarterCardProps> = ({
  starter,
  selected,
  onSelect,
}) => {
  const primaryType = starter.type[0]?.toLowerCase() || "fire";
  const typeColor = getTypeColor(primaryType);

  return (
    <Pressable
      onPress={() => onSelect(starter.id)}
      style={({ pressed }) => [
        styles.card,
        {
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      {/* Background Image */}
      <Image
        source={require("../../../assets/images/list_pokemon_bg.png")}
        style={styles.backgroundImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        priority="high"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />

      {/* Selection Border */}
      <SelectionBorder visible={selected} color={typeColor} />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Pokemon Display */}
        <PokemonDisplay imageUri={starter.image} />

        {/* Pokemon Info */}
        <PokemonInfo
          name={starter.name}
          type={starter.type[0]}
          selected={selected}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",},
  backgroundImage: {
    position: "absolute",
    width: "102%",
    height: "100%",
    borderRadius: 24,
  },
  contentContainer: {
    flex: 1,
    padding: 30,
    justifyContent: "space-between",
  },
});

export default StarterCard;
