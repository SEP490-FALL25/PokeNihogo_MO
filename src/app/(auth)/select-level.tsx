import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { Button } from "@components/ui/Button";
import { ROUTES } from "@routes/routes";
import authService from "@services/auth";
import { useUserStore } from "@stores/user/user.config";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, TouchableOpacity, View } from "react-native";

type Level = "N5" | "N4" | "N3";

// Pokémon mascot data
const pokemonMascots = [
  {
    name: "Pikachu",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
    color: "#fbbf24",
    message: "Hãy chọn level phù hợp với bạn!",
  },
  {
    name: "Eevee",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png",
    color: "#f59e0b",
    message: "Mỗi level sẽ có thử thách khác nhau!",
  },
  {
    name: "Bulbasaur",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    color: "#10b981",
    message: "Bắt đầu từ N5 để học từ cơ bản!",
  },
  {
    name: "Charmander",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
    color: "#ef4444",
    message: "N3 sẽ là thử thách lớn nhất!",
  },
  {
    name: "Squirtle",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
    color: "#3b82f6",
    message: "Chọn level và bắt đầu hành trình!",
  },
];

export default function SelectLevelScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<Level | null>(null);
  const [mascot, setMascot] = React.useState(pokemonMascots[0]);
  const setLevel = useUserStore((s) => (s as any).setLevel);

  // Random mascot selection
  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * pokemonMascots.length);
    setMascot(pokemonMascots[randomIndex]);
  }, []);

  const onContinue = async () => {
    if (!selected) return;
    setLevel(selected);
    await authService.setUserLevel(selected);
    router.push(ROUTES.AUTH.CHOOSE_STARTER as any);
  };

  const getLevelColors = (level: Level) => {
    switch (level) {
      case "N5":
        return {
          border: "#10b981", // green
          background: "rgba(16,185,129,0.1)",
          activeBorder: "#059669",
          activeBackground: "rgba(16,185,129,0.2)"
        };
      case "N4":
        return {
          border: "#f59e0b", // amber
          background: "rgba(245,158,11,0.1)",
          activeBorder: "#d97706",
          activeBackground: "rgba(245,158,11,0.2)"
        };
      case "N3":
        return {
          border: "#ef4444", // red
          background: "rgba(239,68,68,0.1)",
          activeBorder: "#dc2626",
          activeBackground: "rgba(239,68,68,0.2)"
        };
      default:
        return {
          border: "#e5e7eb",
          background: "rgba(255,255,255,0.2)",
          activeBorder: "#3b82f6",
          activeBackground: "rgba(59,130,246,0.1)"
        };
    }
  };

  const LevelOption = ({ level, label }: { level: Level; label: string }) => {
    const isActive = selected === level;
    const colors = getLevelColors(level);
    
    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          setSelected(level);
        }}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 10,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? colors.activeBorder : colors.border,
          backgroundColor: isActive ? colors.activeBackground : colors.background,
          marginBottom: 12,
        }}
      >
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}>
      {/* Pokémon Mascot and Speech Bubble */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        marginBottom: 30,
        position: 'relative'
      }}>
        {/* Speech Bubble */}
        <View style={{
          flex: 1,
          backgroundColor: mascot.color,
          borderRadius: 20,
          padding: 16,
          marginRight: 10,
          position: 'relative',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <ThemedText style={{ 
            color: 'white', 
            fontSize: 16, 
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {mascot.message}
          </ThemedText>
          {/* Speech bubble tail */}
          <View style={{
            position: 'absolute',
            right: -10,
            bottom: 20,
            width: 0,
            height: 0,
            borderLeftWidth: 15,
            borderLeftColor: mascot.color,
            borderTopWidth: 10,
            borderTopColor: 'transparent',
            borderBottomWidth: 10,
            borderBottomColor: 'transparent',
          }} />
        </View>

        {/* Pokémon Mascot Image */}
        <View style={{
          width: 90,
          height: 90,
          backgroundColor: mascot.color,
          borderRadius: 16,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
          overflow: 'hidden'
        }}>
          <Image
            source={{ uri: mascot.imageUrl }}
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
          />
        </View>
      </View>

      <ThemedText type="title" style={{ marginBottom: 24, textAlign: 'center' }}>
        {t("auth.select_level.title")}
      </ThemedText>

      <View style={{ gap: 8 }}>
        <LevelOption level="N5" label={t("auth.select_level.n5")} />
        <LevelOption level="N4" label={t("auth.select_level.n4")} />
        <LevelOption level="N3" label={t("auth.select_level.n3")} />

        <TouchableOpacity
          onPress={() => router.push(ROUTES.AUTH.PLACEMENT_TEST as any)}
          activeOpacity={0.8}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            backgroundColor: "transparent",
            marginTop: 8,
          }}
        >
          <ThemedText type="link">
            {t("auth.select_level.take_test")}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{ paddingTop: 20 }} />
      <Button disabled={!selected} onPress={onContinue}>
        {t("common.continue")}
      </Button>
    </ThemedView>
  );
}
