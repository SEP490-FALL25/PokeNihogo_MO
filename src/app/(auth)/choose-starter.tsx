import BackScreen from "@components/mocules/Back";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import BounceButton from "@components/ui/BounceButton";
import { Progress } from "@components/ui/Progress";
import { ROUTES } from "@routes/routes";
import authService from "@services/auth";
import { useUserStore } from "@stores/user/user.config";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
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
      case "fire":
        return "🔥";
      case "water":
        return "💧";
      case "grass":
        return "🌿";
      case "electric":
        return "⚡";
      case "ground":
        return "⛰️";
      case "rock":
        return "🗿";
      case "flying":
        return "🕊️";
      case "ice":
        return "❄️";
      default:
        return "🔷";
    }
  };

  const typeColor = (t: string) => {
    switch (t.toLowerCase()) {
      case "fire":
        return "#ff4757"; // Đỏ rực cho Lửa
      case "water":
        return "#3742fa"; // Xanh dương đậm cho Nước
      case "grass":
        return "#2ed573"; // Xanh lá rực rỡ cho Cỏ
      case "electric":
        return "#ffa502"; // Cam vàng cho Điện
      case "ground":
        return "#cd853f"; // Nâu đất cho Đất
      case "rock":
        return "#6c757d"; // Xám đá cho Đá
      case "flying":
        return "#9c88ff"; // Tím xanh cho Bay
      case "ice":
        return "#70a1ff"; // Xanh băng sáng cho Băng
      default:
        return "#f1f2f6";
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
        padding: 16,
        borderRadius: 16,
        borderWidth: selected ? 3 : 2,
        borderColor: selected ? "#3b82f6" : "#e5e7eb",
        backgroundColor: selected
          ? "rgba(59,130,246,0.1)"
          : "rgba(255,255,255,0.2)",
        minHeight: 200,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Animated.View style={[{ marginBottom: 12 }, floatStyle]}>
          <Image
            source={{ uri: starter.image }}
            style={{ width: 96, height: 96 }}
          />
        </Animated.View>
        <ThemedText
          type="defaultSemiBold"
          style={{ textAlign: "center", marginBottom: 8, fontSize: 16 }}
        >
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
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                borderColor: typeColor(t),
                marginRight: 6,
                marginBottom: 6,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <ThemedText style={{ fontSize: 16 }}>{typeIcon(t)}</ThemedText>
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
    router.replace(ROUTES.AUTH.CONGRATS);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
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
              <Progress value={100} />
            </View>
          </View>
          <ThemedText type="title" style={{ marginBottom: 16 }}>
            {t("auth.choose_starter.title")}
          </ThemedText>
        </View>

        <FlatList
          data={list}
          numColumns={2}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, paddingHorizontal: 20 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ width: "48%", marginBottom: 16 }}>
              <StarterCard
                starter={item}
                selected={selected === item.id}
                onSelect={setSelected}
              />
            </View>
          )}
        />

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: "transparent",
          }}
        >
          <BounceButton
            variant="solid"
            disabled={!selected}
            onPress={onConfirm}
          >
            {t("auth.choose_starter.confirm")}
          </BounceButton>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
