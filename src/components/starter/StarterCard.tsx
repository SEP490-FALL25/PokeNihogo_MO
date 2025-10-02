import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { StarterCardProps } from "../../types/starter.types";
import { getTypeColor, getTypeIcon } from "../../utils/pokemon.utils";

const StarterCard: React.FC<StarterCardProps> = ({
  starter,
  selected,
  onSelect,
}) => {
  const primaryType = starter.type[0]?.toLowerCase() || "fire";
  const typeIcon = getTypeIcon(primaryType);
  const typeColor = getTypeColor(primaryType);

  return (
    <Pressable
      onPress={() => onSelect(starter.id)}
      style={({ pressed }) => [
        {
          height: 200,
          borderRadius: 16,
          overflow: "hidden",
          transform: [{ scale: pressed ? 0.95 : 1 }],
          shadowColor: selected ? typeColor : "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: selected ? 0.3 : 0.1,
          shadowRadius: selected ? 12 : 8,
          elevation: selected ? 8 : 4,
        },
      ]}
    >
      {/* Background Image */}
      <Image
        source={require("../../../assets/images/list_pokemon_bg.png")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: 16,
        }}
        contentFit="cover"
      />

      {/* Selection Border */}
      {selected && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: typeColor,
            shadowColor: typeColor,
          }}
        />
      )}

      {/* Content Container */}
      <View
        style={{
          flex: 1,
          padding: 24,
          justifyContent: "space-between",
        }}
      >
        {/* Top Section - Pokemon Display Area */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            flex: 0.7,
            position: "relative",
          }}
        >
          {/* Pokemon Image - Centered and Large */}
          <Image
            source={{ uri: starter.image }}
            style={{
              width: 160,
              height: 160,
              marginBottom:30
            }}
            contentFit="contain"
          />
        </View>

        {/* Bottom Section - Pokemon Info */}
        <View
          style={{
            flex: 0.4,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 8,
          }}
        >
          {/* Pokemon Name */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#fff",
              textAlign: "center",
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
              marginBottom: 8,
            }}
            numberOfLines={1}
          >
            {starter.name}
          </Text>

          {/* Type Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: selected ? typeColor : "rgba(255,255,255,0.2)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selected ? typeColor : "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ fontSize: 12, marginRight: 4 }}>{typeIcon}</Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: "#fff",
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              }}
            >
              {starter.type[0]}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default StarterCard;
