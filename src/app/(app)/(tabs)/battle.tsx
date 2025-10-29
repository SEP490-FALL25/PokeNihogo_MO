import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import GlowingRingEffect from "@components/molecules/GlowingRingEffect";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import React from "react";
import { Alert, ImageBackground, StyleSheet, View } from "react-native";

export default function BattleLobbyScreen() {
  const handleStartRanked = () => {
    Alert.alert(
      "Xếp hạng",
      "Đang tìm trận phù hợp theo trình độ của bạn...",
    );
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

        <View style={styles.heroSection}>
          <View style={styles.ringContainer}>
            <GlowingRingEffect color="#22d3ee" ringSize={260} particleCount={18} />
            <View style={styles.ringCenter}>
              <ThemedText style={styles.rankTitle}>RANKED MATCH</ThemedText>
              <ThemedText style={styles.rankSubtitle}>Học thuật • PvE-PvP</ThemedText>
              <HapticPressable style={styles.ctaButton} onPress={handleStartRanked}>
                <ThemedText style={styles.ctaText}>TÌM TRẬN NGAY</ThemedText>
              </HapticPressable>
              <ThemedText style={styles.mmrText}>MMR: 1200 • Bậc: Bronze II</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.row}>
            <HapticPressable style={[styles.glassButton, styles.half]} onPress={handleOpenLeaderboard}>
              <ThemedText style={styles.glassTitle}>Bảng xếp hạng</ThemedText>
              <ThemedText style={styles.glassDesc}>Top người chơi theo mùa</ThemedText>
            </HapticPressable>
            <HapticPressable style={[styles.glassButton, styles.half]} onPress={handleViewTopRewards}>
              <ThemedText style={styles.glassTitle}>Phần thưởng TOP</ThemedText>
              <ThemedText style={styles.glassDesc}>Skin, huy hiệu, kim cương</ThemedText>
            </HapticPressable>
          </View>

          <HapticPressable style={styles.glassButton} onPress={handleViewRankInfo}>
            <ThemedText style={styles.glassTitle}>Thông tin rank</ThemedText>
            <ThemedText style={styles.glassDesc}>Cơ chế thăng hạng, bảo lưu điểm</ThemedText>
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
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  ringContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    gap: 8,
  },
  rankTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    letterSpacing: 2,
  },
  rankSubtitle: {
    color: "#93c5fd",
    fontSize: 12,
  },
  ctaButton: {
    marginTop: 6,
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  mmrText: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  bottomPanel: {
    padding: 20,
    gap: 12,
  },
  glassButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
  },
  half: {
    flex: 1,
  },
  glassTitle: {
    color: "#e5e7eb",
    fontWeight: "700",
    marginBottom: 4,
  },
  glassDesc: {
    color: "#cbd5e1",
    fontSize: 12,
  },
});


