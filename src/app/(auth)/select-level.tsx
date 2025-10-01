import BackScreen from "@components/mocules/Back";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
// import { Button } from "@components/ui/Button";
import BounceButton from "@components/ui/BounceButton";
import { Progress } from "@components/ui/Progress";
import { TypingText } from "@components/ui/TypingText";
import { ROUTES } from "@routes/routes";
import authService from "@services/auth";
import { useUserStore } from "@stores/user/user.config";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Animated, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  {
    name: "Jigglypuff",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png",
    color: "#f472b6",
    message: "Âm nhạc sẽ giúp bạn tập trung!",
  },
  {
    name: "Meowth",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png",
    color: "#a78bfa",
    message: "Đừng lo, chúng ta sẽ học từ từ!",
  },
  {
    name: "Psyduck",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png",
    color: "#60a5fa",
    message: "Chọn level rồi cùng giải đố nhé!",
  },
  {
    name: "Snorlax",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    color: "#94a3b8",
    message: "Đừng vội, chọn level phù hợp nhất với bạn!",
  },
  {
    name: "Mew",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
    color: "#fb7185",
    message: "Cùng bay vào thế giới tiếng Nhật!",
  },
  {
    name: "Togepi",
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png",
    color: "#f59e0b",
    message: "Bước nhỏ hôm nay, thành công ngày mai!",
  },
];

export default function SelectLevelScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<Level | null>(null);
  const [mascot, setMascot] = React.useState(pokemonMascots[0]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(12)).current;
  const setLevel = useUserStore((s) => (s as any).setLevel);

  // Random mascot selection
  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * pokemonMascots.length);
    setMascot(pokemonMascots[randomIndex]);
    // Gentle entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  const onContinue = async () => {
    if (!selected) return;
    setLevel(selected);
    await authService.setUserLevel(selected);
    router.push(ROUTES.AUTH.CHOOSE_STARTER as any);
  };

  // Color + icon meta per JLPT level
  const getLevelMeta = (level: Level) => {
    switch (level) {
      case "N5":
        return {
          border: "#10b981",
          active: "#059669",
          fill: "rgba(16,185,129,0.35)",
          icon: "🇯🇵",
        };
      case "N4":
        return {
          border: "#f59e0b",
          active: "#d97706",
          fill: "rgba(245,158,11,0.35)",
          icon: "🇯🇵",
        };
      case "N3":
        return {
          border: "#ef4444",
          active: "#dc2626",
          fill: "rgba(239,68,68,0.28)",
          icon: "🇯🇵",
        };
      default:
        return {
          border: "#e5e7eb",
          active: "#3b82f6",
          fill: "rgba(59,130,246,0.12)",
          icon: "🇯🇵",
        };
    }
  };

  const LevelOption = ({ level, label }: { level: Level; label: string }) => {
    const isActive = selected === level;
    const meta = getLevelMeta(level);

    return (
      <TouchableOpacity
        onPress={() => {
          Haptics.selectionAsync();
          setSelected(level);
        }}
        activeOpacity={0.8}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderRadius: 16,
          borderWidth: isActive ? 2 : 1,
          borderColor: isActive ? meta.active : meta.border,
          backgroundColor: isActive ? meta.fill : "#ffffff",
          marginBottom: 12,
          shadowColor: isActive ? meta.active : undefined,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: isActive ? 0 : 0,
          flexDirection: "row",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: 28,
            height: 20,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText style={{ fontSize: 16 }}>{meta.icon}</ThemedText>
        </View>
        <ThemedText type="defaultSemiBold" style={{ marginLeft: 10 }}>
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: 4 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <BackScreen noWrapper />
          <View style={{ flex: 1 }}>
            <Progress value={33} />
          </View>
        </View>
        {/* Mascot + speech bubble on top */}
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 16,
            opacity: fadeAnim,
            transform: [{ translateY }],
          }}
        >
          {/* Mascot Image */}
          <View style={{ alignItems: "center", marginRight: 12 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: mascot.imageUrl }}
                style={{ width: "100%", height: "100%", resizeMode: "contain" }}
              />
            </View>
          </View>

          {/* Speech Bubble with mascot color */}
          <View style={{ flex: 1, position: "relative" }}>
            <View
              style={{
                backgroundColor: mascot.color,
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <TypingText
                messages={[mascot.message]}
                typingSpeedMs={35}
                deletingSpeedMs={20}
                pauseBeforeStartMs={150}
                pauseBetweenMessagesMs={1000}
                loop={false}
                showCursor
                cursorChar="|"
                containerStyle={{}}
                textStyle={{
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              />
            </View>
            {/* Tail pointing left to mascot */}
            <View
              style={{
                position: "absolute",
                left: -8,
                top: 18,
                width: 0,
                height: 0,
                borderRightWidth: 10,
                borderRightColor: mascot.color,
                borderTopWidth: 8,
                borderTopColor: "transparent",
                borderBottomWidth: 8,
                borderBottomColor: "transparent",
              }}
            />
          </View>
        </Animated.View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(0,0,0,0.06)",
            marginBottom: 16,
          }}
        />

        <ThemedText
          type="title"
          style={{ marginBottom: 12, textAlign: "center" }}
        >
          {t("auth.select_level.title")}
        </ThemedText>

        <View style={{ flex: 1 }}>
          <View style={{ gap: 12 }}>
            <LevelOption level="N5" label={t("auth.select_level.n5")} />
            <LevelOption level="N4" label={t("auth.select_level.n4")} />
            <LevelOption level="N3" label={t("auth.select_level.n3")} />

            <TouchableOpacity
              onPress={() => router.push(ROUTES.AUTH.PLACEMENT_TEST as any)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                backgroundColor: "#ffffff",
                marginTop: 4,
              }}
            >
              <ThemedText style={{ color: "#0ea5e9", fontWeight: "600" }}>
                {t("auth.select_level.take_test")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={{ paddingTop: 12 }} />
          <BounceButton
            variant="solid"
            size="full"
            withHaptics
            disabled={!selected}
            onPress={onContinue}
          >
            {t("common.continue")}
          </BounceButton>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
