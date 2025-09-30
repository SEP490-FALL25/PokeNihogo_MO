import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { Button } from "@components/ui/Button";
import { ROUTES } from "@routes/routes";
import authService from "@services/auth";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import starters from "../../../mock-data/starters.json";

type Starter = { id: string; name: string; type: string[]; image: string };

function StarterCard({
  starter,
  selected,
  onSelect,
}: {
  starter: Starter;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const typeIcon = (t: string) => {
    switch (t.toLowerCase()) {
      case "grass":
        return "🌱";
      case "fire":
        return "🔥";
      case "water":
        return "💧";
      case "poison":
        return "☠️";
      case "electric":
        return "⚡";
      case "ice":
        return "❄️";
      case "rock":
        return "🪨";
      case "ground":
        return "🌍";
      case "psychic":
        return "🔮";
      case "fighting":
        return "🥊";
      case "bug":
        return "🪲";
      case "flying":
        return "🪽";
      case "ghost":
        return "👻";
      case "dragon":
        return "🐉";
      case "dark":
        return "🌑";
      case "steel":
        return "🔩";
      case "fairy":
        return "✨";
      default:
        return "🔷";
    }
  };

  const typeColor = (t: string) => {
    switch (t.toLowerCase()) {
      case "grass":
        return "#86efac";
      case "fire":
        return "#fca5a5";
      case "water":
        return "#93c5fd";
      case "poison":
        return "#d8b4fe";
      default:
        return "#e5e7eb";
    }
  };

  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 800, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [translateY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <TouchableOpacity
      onPress={() => onSelect(starter.id)}
      activeOpacity={0.8}
      style={{
        flex: 1,
        marginHorizontal: 4,
        padding: 12,
        borderRadius: 12,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? "#3b82f6" : "#e5e7eb",
        backgroundColor: selected
          ? "rgba(59,130,246,0.1)"
          : "rgba(255,255,255,0.2)",
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Animated.View style={[{ marginBottom: 8 }, floatStyle]}>
          <Image
            source={{ uri: starter.image }}
            style={{ width: 72, height: 72 }}
          />
        </Animated.View>
        <ThemedText type="defaultSemiBold" style={{ textAlign: "center" }}>
          {starter.name}
        </ThemedText>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          {starter.type.map((t) => (
            <View
              key={t}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 9999,
                backgroundColor: typeColor(t),
                marginRight: 6,
                marginBottom: 6,
              }}
            >
              <ThemedText style={{ marginRight: 4 }}>{typeIcon(t)}</ThemedText>
              <ThemedText>{t}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChooseStarterScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState<string | null>(null);
  const setStarterId = useUserStore((s) => (s as any).setStarterId);
  const setIsFirstTimeLogin = useUserStore(
    (s) => (s as any).setIsFirstTimeLogin
  );

  const list = starters as Starter[];

  const onConfirm = async () => {
    if (!selected) return;
    setStarterId(selected);
    setIsFirstTimeLogin(true);
    await authService.selectStarter(selected);
    router.replace(ROUTES.AUTH.WELCOME);
  };

  return (
    <ThemedView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}>
      <ThemedText type="title" style={{ marginBottom: 16 }}>
        {t("auth.choose_starter.title")}
      </ThemedText>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {list.map((p) => (
          <StarterCard
            key={p.id}
            starter={p}
            selected={selected === p.id}
            onSelect={setSelected}
          />
        ))}
      </View>

      <Button disabled={!selected} onPress={onConfirm}>
        {t("auth.choose_starter.confirm")}
      </Button>
    </ThemedView>
  );
}
