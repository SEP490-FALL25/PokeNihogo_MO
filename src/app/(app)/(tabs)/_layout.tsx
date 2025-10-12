import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

import CustomTab from "@components/ui/CustomTab";
import DraggableOverlay from "@components/ui/Draggable";
import userPokemonService from "@services/user-pokemon";

export default function TabLayout() {
  // State for main pokemon image
  const [mainPokemonImageUrl, setMainPokemonImageUrl] = useState<string | null>(
    null
  );

  // Fetch main pokemon on mount
  useEffect(() => {
    const fetchMainPokemon = async () => {
      try {
        const response = await userPokemonService.getOwnedPokemons();
        const mainPokemon = response.data?.data?.results?.find(
          (pokemon: any) => pokemon.isMain === true
        );
        setMainPokemonImageUrl(mainPokemon?.pokemon?.imageUrl || null);
      } catch (error) {
        console.error("Error fetching main pokemon:", error);
        setMainPokemonImageUrl(null);
      }
    };

    fetchMainPokemon();
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        {/* <Tabs.Screen name="learn" options={{ title: "Learn" }} /> */}
        <Tabs.Screen name="lessons" options={{ title: "Lessons" }} />
        <Tabs.Screen name="reading" options={{ title: "Reading" }} />
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="listening" options={{ title: "Listening" }} />
        <Tabs.Screen name="battle" options={{ title: "Battle" }} />
      </Tabs>
      <CustomTab />

      {/* DraggableOverlay at tab level - persists across screen changes */}
      {mainPokemonImageUrl && (
      <DraggableOverlay
        imageUri={
          mainPokemonImageUrl ||
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif"
        }
        imageSize={100}
          showBackground={false}
        />
      )}
    </>
  );
}
