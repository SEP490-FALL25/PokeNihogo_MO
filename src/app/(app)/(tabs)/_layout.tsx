import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import CustomTab from "@components/ui/CustomTab";
import DraggableOverlay from "@components/ui/Draggable";
import userPokemonService from "@services/user-pokemon";
import { View } from "react-native";
import { CopilotStep, walkthroughable } from "react-native-copilot";

export default function TabLayout() {
  const { t } = useTranslation();
  const WTView = walkthroughable(View);

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
        <Tabs.Screen name="home" options={{ title: t("tabs.home") }} />
        <Tabs.Screen name="learn" options={{ title: t("tabs.learn") }} />
        <Tabs.Screen name="abilities" options={{ title: t("tabs.abilities") }} />
        {/* Old separate tabs - now combined in abilities screen */}
        <Tabs.Screen name="reading" options={{ title: t("tabs.reading"), href: null }} />
        <Tabs.Screen name="listening" options={{ title: t("tabs.listening"), href: null }} />
        <Tabs.Screen name="speaking" options={{ title: t("tabs.speaking"), href: null }} />
        <Tabs.Screen name="battle" options={{ title: t("tabs.battle") }} />
        <Tabs.Screen name="quiz-demo" options={{ title: t("tabs.quiz_demo") }} />
      </Tabs>
      <CustomTab />

      {/* DraggableOverlay at tab level - persists across screen changes */}
      {mainPokemonImageUrl && (
        <CopilotStep text={t("tour.pokemon_description")} order={2} name="pokemon">
          <WTView>
            <DraggableOverlay
              imageUri={
                mainPokemonImageUrl ||
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif"
              }
              imageSize={100}
              showBackground={false}
            />
          </WTView>
        </CopilotStep>
      )}
    </>
  );
}
