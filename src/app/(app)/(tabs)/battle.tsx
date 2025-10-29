import { CountdownTimer } from "@components/atoms/CountdownTimer";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import UserAvatar from "@components/atoms/UserAvatar";
import { HapticPressable } from "@components/HapticPressable";
import GlowingRingEffect from "@components/molecules/GlowingRingEffect";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import TypingText from "@components/ui/TypingText";
import React from "react";
import { Alert, ImageBackground, StyleSheet, View } from "react-native";

export default function BattleLobbyScreen() {
  const [mode, setMode] = React.useState<"ranked" | "casual">("ranked");
  const [inQueue, setInQueue] = React.useState(false);

  const handleStartRanked = () => {
    setInQueue(true);
    Alert.alert("Xếp hạng", "Đang tìm trận phù hợp theo trình độ của bạn...");
  };

  const handleOpenLeaderboard = () => {
    Alert.alert(
      "Bảng xếp hạng",
      "Màn hình bảng xếp hạng sẽ hiển thị tại đây (WIP).",
    );
  };

  const handleViewTopRewards = () => {
    Alert.alert(
      "Phần thưởng TOP",
      "Xem phần thưởng theo thứ hạng mùa giải (WIP).",
    );
  };

  const handleViewRankInfo = () => {
    Alert.alert(
      "Hệ thống Rank",
      "Thông tin về bậc rank, lên hạng và bảo lưu điểm (WIP).",
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ImageBackground
        source={require("../../../../assets/images/list_pokemon_bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <TWLinearGradient
          colors={["rgba(17,24,39,0.85)", "rgba(17,24,39,0.6)", "rgba(17,24,39,0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlay}
        />

        {/* Top status bar */}
        <View className="px-5 pt-5">
          <View className="flex-row items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <View className="flex-row items-center gap-2">
              <ThemedText style={{ color: "#93c5fd", fontWeight: "700" }}>Season 1</ThemedText>
              <ThemedText style={{ color: "#cbd5e1" }}>Kết thúc sau</ThemedText>
            </View>
            <CountdownTimer endDate={new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()} daysLabel="ngày" />
          </View>
        </View>

        {/* Mode toggle */}
        <View className="px-5 mt-4">
          <View className="flex-row bg-white/10 rounded-full p-1">
            <HapticPressable
              className={`flex-1 items-center py-2 rounded-full ${mode === "ranked" ? "bg-green-500 shadow" : "bg-transparent"}`}
              onPress={() => setMode("ranked")}
            >
              <ThemedText style={{ color: mode === "ranked" ? "#ffffff" : "#cbd5e1", fontWeight: "700" }}>Ranked</ThemedText>
            </HapticPressable>
            <HapticPressable
              className={`flex-1 items-center py-2 rounded-full ${mode === "casual" ? "bg-green-500 shadow" : "bg-transparent"}`}
              onPress={() => setMode("casual")}
            >
              <ThemedText style={{ color: mode === "casual" ? "#ffffff" : "#cbd5e1", fontWeight: "700" }}>Casual</ThemedText>
            </HapticPressable>
          </View>
        </View>

        {/* Versus slot */}
        <View className="flex-1 items-center justify-center pt-4">
          <View className="items-center justify-center">
            <GlowingRingEffect color="#22d3ee" ringSize={260} particleCount={18} />
            <View className="absolute items-center gap-2">
              <ThemedText style={{ color: "#e5e7eb", letterSpacing: 2, fontSize: 16 }}>MATCH LOBBY</ThemedText>
              <View className="flex-row items-center gap-5 mt-1">
                <View className="items-center gap-1">
                  <UserAvatar name="You" size="large" />
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12 }}>Bạn</ThemedText>
                </View>
                <View className="px-3 py-1 rounded-full border border-white/20 bg-white/10">
                  <ThemedText style={{ color: "#ffffff", fontWeight: "700" }}>VS</ThemedText>
                </View>
                <View className="items-center gap-1">
                  {inQueue ? (
                    <View className="w-24 h-24 rounded-full bg-white/20" />
                  ) : (
                    <View className="w-24 h-24 rounded-full bg-white/10 border border-white/20" />
                  )}
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12 }}>{inQueue ? "Đang tìm đối thủ" : "Chưa sẵn sàng"}</ThemedText>
                </View>
              </View>
              <HapticPressable
                className="mt-2 bg-green-500 px-6 py-3 rounded-full shadow"
                onPress={handleStartRanked}
              >
                <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", letterSpacing: 1 }}>
                  {inQueue ? "ĐANG TÌM TRẬN..." : "TÌM TRẬN NGAY"}
                </ThemedText>
              </HapticPressable>
              <ThemedText style={{ color: "#cbd5e1", fontSize: 12, marginTop: 4 }}>MMR: 1200 • Bậc: Bronze II</ThemedText>
            </View>
          </View>

          {/* Queue status typing */}
          <View className="mt-6">
            {inQueue ? (
              <TypingText
                messages={["Đang tìm đối thủ phù hợp...", "Cân bằng MMR...", "Xếp phòng..."]}
                loop
                textStyle={{ color: "#93c5fd" }}
              />
            ) : null}
          </View>
        </View>

        {/* Bottom actions */}
        <View className="px-5 pb-6">
          <View className="flex-row gap-3">
            <HapticPressable className="flex-1 rounded-2xl border border-white/15 bg-white/10 p-4" onPress={handleOpenLeaderboard}>
              <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", marginBottom: 4 }}>Bảng xếp hạng</ThemedText>
              <ThemedText style={{ color: "#cbd5e1", fontSize: 12 }}>Top người chơi theo mùa</ThemedText>
            </HapticPressable>
            <HapticPressable className="flex-1 rounded-2xl border border-white/15 bg-white/10 p-4" onPress={handleViewTopRewards}>
              <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", marginBottom: 4 }}>Phần thưởng TOP</ThemedText>
              <ThemedText style={{ color: "#cbd5e1", fontSize: 12 }}>Skin, huy hiệu, kim cương</ThemedText>
            </HapticPressable>
          </View>

          <HapticPressable className="mt-3 rounded-2xl border border-white/15 bg-white/10 p-4" onPress={handleViewRankInfo}>
            <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", marginBottom: 4 }}>Thông tin rank</ThemedText>
            <ThemedText style={{ color: "#cbd5e1", fontSize: 12 }}>Cơ chế thăng hạng, bảo lưu điểm</ThemedText>
          </HapticPressable>
        </View>
      </ImageBackground>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  bgImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  // Most layout styles moved to Tailwind classes above
});


