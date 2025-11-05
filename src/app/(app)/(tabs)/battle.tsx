import { CountdownTimer } from "@components/atoms/CountdownTimer";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import UserAvatar from "@components/atoms/UserAvatar";
import { HapticPressable } from "@components/HapticPressable";
import GlowingRingEffect from "@components/molecules/GlowingRingEffect";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import TypingText from "@components/ui/TypingText";
import { getSocket } from "@configs/socket";
import { IBattleMatch } from "@models/battle/battle.types";
import battleService from "@services/battle";
import { useAuthStore } from "@stores/auth/auth.config";
import { useRouter } from "expo-router";
import { Award, Crown, History, Info, Target, Trophy } from "lucide-react-native";
import React, { useEffect } from "react";
import { Alert, Animated, Easing, ImageBackground, Modal, ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Socket } from "socket.io-client";

// Mock battle history data
const mockBattleHistory = [
  { id: 1, opponent: "Trainer Alice", result: "win", mmrChange: +25, date: "2 giờ trước", score: "3-1" },
  { id: 2, opponent: "Trainer Bob", result: "win", mmrChange: +22, date: "5 giờ trước", score: "3-2" },
  { id: 3, opponent: "Trainer Charlie", result: "loss", mmrChange: -18, date: "1 ngày trước", score: "1-3" },
  { id: 4, opponent: "Trainer Diana", result: "win", mmrChange: +28, date: "1 ngày trước", score: "3-0" },
  { id: 5, opponent: "Trainer Eve", result: "win", mmrChange: +24, date: "2 ngày trước", score: "3-1" },
  { id: 6, opponent: "Trainer Frank", result: "loss", mmrChange: -20, date: "2 ngày trước", score: "2-3" },
  { id: 7, opponent: "Trainer Grace", result: "win", mmrChange: +26, date: "3 ngày trước", score: "3-2" },
];

export default function BattleLobbyScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [inQueue, setInQueue] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [historyFilter, setHistoryFilter] = React.useState<"all" | "win" | "loss">("all");
  const [selectedBattle, setSelectedBattle] = React.useState<typeof mockBattleHistory[0] | null>(null);
  const [matchedPlayer, setMatchedPlayer] = React.useState<IBattleMatch | null>(null);
  const [showAcceptModal, setShowAcceptModal] = React.useState(false);
  const insets = useSafeAreaInsets();
  const shimmer = React.useRef(new Animated.Value(0)).current;
  const pulse = React.useRef(new Animated.Value(1)).current;
  const socketRef = React.useRef<Socket | null>(null);

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const handleStartRanked = async () => {
    setInQueue(true);
    try {
      await battleService.startQueue();
      // Emit join-searching-room when user starts queueing
      if (socketRef.current) {
        socketRef.current.emit("join-searching-room");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tìm trận đấu");
      setInQueue(false);
    }
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

  const filteredHistory = React.useMemo(() => {
    if (historyFilter === "all") return mockBattleHistory;
    return mockBattleHistory.filter(battle => battle.result === historyFilter);
  }, [historyFilter]);

  const handleAcceptMatch = () => {
    setShowAcceptModal(false);
    setInQueue(false);
    if (matchedPlayer) {
      router.push({
        pathname: "/(app)/(battle)/draft",
        params: {
          matchId: matchedPlayer.id,
          opponentName: matchedPlayer.opponentName,
        },
      });
    }
  };

  const handleRejectMatch = () => {
    setShowAcceptModal(false);
    setMatchedPlayer(null);
    setInQueue(false);
  };

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket("matching", accessToken);
    socketRef.current = socket;

    const onConnect = () => {
      console.log("Connected:", socket.id);
    };
    const onDisconnect = (reason: string) => {
      console.log("Disconnected:", reason);
    };
    const onConnectError = (err: any) => {
      console.log("❌ Connect error:", err?.message || err);
    };
    const onMatchingEvent = async (payload: any) => {
      console.log("🔥 MATCHING EVENT RECEIVED:", payload);

      if (payload?.type === "MATCH_FOUND") {
        const match: IBattleMatch | undefined = payload?.match;
        if (match) {
          setMatchedPlayer(match);
          setShowAcceptModal(true);
        }
      }

      if (payload?.type === "MATCH_STATUS_UPDATE") {
        if (payload.status === "IN_PROGRESS" && payload.matchId) {
          socket.emit("join-matching-room", { matchId: payload.matchId });
          console.log("match->room:", payload.matchId);
        }
      }

      if (payload?.type === "MATCHMAKING_FAILED") {
        console.log("❌ Failed:", payload?.reason);
        setInQueue(false);
      }
    };
    const onSelectPokemon = (payload: any) => {
      console.log("select poke ne");
      console.log(payload);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("matching-event", onMatchingEvent);
    socket.on("select-pokemon", onSelectPokemon);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("matching-event", onMatchingEvent);
      socket.off("select-pokemon", onSelectPokemon);
      // Do not force disconnect here if other screens reuse the singleton.
      // If you want hard cleanup on unmount, uncomment:
      // disconnectSocket();
    };
  }, [accessToken]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
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

        {/* Top status bar (respect safe area) */}
        <View className="px-5" style={{ paddingTop: insets.top + 8 }}>
          <TWLinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 16, padding: 1 }}
          >
            <View className="rounded-2xl bg-black/40 px-4 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-cyan-400" />
                  <ThemedText style={{ color: "#93c5fd", fontWeight: "700", fontSize: 15 }}>Season 1</ThemedText>
                  <ThemedText style={{ color: "#94a3b8", fontSize: 13 }}>Kết thúc sau</ThemedText>
                </View>
                <CountdownTimer endDate={new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()} daysLabel="ngày" />
              </View>
              <View className="mt-2 flex-row items-center gap-2">
                <Crown size={14} color="#fbbf24" />
                <ThemedText style={{ color: "#fde68a", fontSize: 12, fontWeight: "600" }}>Bronze II</ThemedText>
                <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>• 1200 MMR</ThemedText>
              </View>
            </View>
          </TWLinearGradient>
        </View>

        {/* Stats Preview */}
        <View className="px-5 mt-4">
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-xl border border-white/15 bg-white/5 p-3">
              <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>Trận thắng</ThemedText>
              <View className="flex-row items-end gap-1">
                <ThemedText style={{ color: "#22d3ee", fontSize: 22, fontWeight: "700" }}>48</ThemedText>
                <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 2 }}>/ 100</ThemedText>
              </View>
            </View>
            <View className="flex-1 rounded-xl border border-white/15 bg-white/5 p-3">
              <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>Tỷ lệ thắng</ThemedText>
              <View className="flex-row items-end gap-1">
                <ThemedText style={{ color: "#34d399", fontSize: 22, fontWeight: "700" }}>48</ThemedText>
                <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 2 }}>%</ThemedText>
              </View>
            </View>
            <View className="flex-1 rounded-xl border border-white/15 bg-white/5 p-3">
              <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>Chuỗi thắng</ThemedText>
              <View className="flex-row items-end gap-1">
                <ThemedText style={{ color: "#fbbf24", fontSize: 22, fontWeight: "700" }}>5</ThemedText>
                <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 2 }}>🔥</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Title & History Button */}
        <View className="px-5 mt-6 flex-row items-center justify-between">
          <ThemedText style={{ color: "#fbbf24", letterSpacing: 3, fontSize: 18, fontWeight: "900" }}>
            ⚡ BATTLE LOBBY
          </ThemedText>
          <HapticPressable
            className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10"
            onPress={() => setShowHistory(true)}
          >
            <History size={16} color="#22d3ee" />
            <ThemedText style={{ color: "#22d3ee", fontSize: 13, fontWeight: "600" }}>Lịch sử</ThemedText>
          </HapticPressable>
        </View>

        {/* Versus slot */}
        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            <GlowingRingEffect color="#22d3ee" ringSize={260} particleCount={18} />
            <View className="absolute items-center gap-2">
              <View className="flex-row items-center gap-5 mt-2">
                <View className="items-center gap-1">
                  <Animated.View style={{ transform: [{ scale: pulse }] }}>
                    <UserAvatar name="You" size="large" />
                  </Animated.View>
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "600" }}>Bạn</ThemedText>
                </View>
                <TWLinearGradient
                  colors={["#ec4899", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 2, borderRadius: 999 }}
                >
                  <View className="px-4 py-2 rounded-full bg-black/70">
                    <ThemedText style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>VS</ThemedText>
                  </View>
                </TWLinearGradient>
                <View className="items-center gap-1">
                  {inQueue ? (
                    <Animated.View style={{ transform: [{ scale: pulse }] }}>
                      <View className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-400/50" />
                    </Animated.View>
                  ) : (
                    <View className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 border-dashed" />
                  )}
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "600" }}>{inQueue ? "Đang tìm..." : "Đang chờ"}</ThemedText>
                </View>
              </View>
              <View className="flex-row items-center gap-3 mt-3">
                <HapticPressable
                  className="rounded-full overflow-hidden"
                  onPress={handleStartRanked}
                >
                  <TWLinearGradient
                    colors={inQueue ? ["#10b981", "#059669"] : ["#22c55e", "#16a34a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 14, paddingHorizontal: 28 }}
                  >
                    <Animated.View style={{ opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 1] }) }}>
                      <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", letterSpacing: 1.2 }}>
                        {inQueue ? "⏳ ĐANG TÌM TRẬN..." : "TÌM TRẬN NGAY"}
                      </ThemedText>
                    </Animated.View>
                  </TWLinearGradient>
                </HapticPressable>
                {inQueue ? (
                  <HapticPressable
                    className="px-5 py-3 rounded-full border border-red-400/40 bg-red-500/20"
                    onPress={() => setInQueue(false)}
                  >
                    <ThemedText style={{ color: "#fca5a5", fontWeight: "700" }}>Hủy</ThemedText>
                  </HapticPressable>
                ) : null}
              </View>
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
            <HapticPressable className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleOpenLeaderboard}>
              <View className="flex-row items-center gap-2 mb-1">
                <Trophy size={18} color="#22d3ee" />
                <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>Bảng xếp hạng</ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>Top người chơi theo mùa</ThemedText>
            </HapticPressable>
            <HapticPressable className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleViewTopRewards}>
              <View className="flex-row items-center gap-2 mb-1">
                <Crown size={18} color="#fbbf24" />
                <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>Phần thưởng</ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>Skin, huy hiệu, kim cương</ThemedText>
            </HapticPressable>
          </View>

          <HapticPressable className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleViewRankInfo}>
            <View className="flex-row items-center gap-2 mb-1">
              <Info size={18} color="#60a5fa" />
              <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>Thông tin rank</ThemedText>
            </View>
            <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>Cơ chế thăng hạng, bảo lưu điểm</ThemedText>
          </HapticPressable>
        </View>

        {/* Subtle scanline overlay for game feel */}
        <View pointerEvents="none" style={styles.scanline} />
      </ImageBackground>

      {/* Battle History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)" }}>
          <View style={{ flex: 1, marginTop: insets.top + 40 }}>
            <View className="flex-1 bg-slate-900 rounded-t-3xl">
              {/* Modal Header */}
              <View className="px-6 py-5 border-b border-white/10">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <History size={24} color="#22d3ee" />
                    <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>Lịch sử thi đấu</ThemedText>
                  </View>
                  <HapticPressable
                    className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                    onPress={() => setShowHistory(false)}
                  >
                    <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                  </HapticPressable>
                </View>

                {/* Quick Stats */}
                <View className="flex-row gap-3 mt-4">
                  <View className="flex-1 rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Award size={14} color="#22c55e" />
                      <ThemedText style={{ color: "#86efac", fontSize: 11 }}>Thắng</ThemedText>
                    </View>
                    <ThemedText style={{ color: "#22c55e", fontSize: 20, fontWeight: "700" }}>5</ThemedText>
                  </View>
                  <View className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Target size={14} color="#ef4444" />
                      <ThemedText style={{ color: "#fca5a5", fontSize: 11 }}>Thua</ThemedText>
                    </View>
                    <ThemedText style={{ color: "#ef4444", fontSize: 20, fontWeight: "700" }}>2</ThemedText>
                  </View>
                  <View className="flex-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Trophy size={14} color="#22d3ee" />
                      <ThemedText style={{ color: "#a5f3fc", fontSize: 11 }}>Tỉ lệ</ThemedText>
                    </View>
                    <ThemedText style={{ color: "#22d3ee", fontSize: 20, fontWeight: "700" }}>71%</ThemedText>
                  </View>
                </View>

                {/* Filter Tabs */}
                <View className="flex-row gap-2 mt-4">
                  <HapticPressable
                    className={`flex-1 py-2 rounded-full ${historyFilter === "all" ? "bg-cyan-500" : "bg-white/5"}`}
                    onPress={() => setHistoryFilter("all")}
                  >
                    <ThemedText style={{ color: historyFilter === "all" ? "#ffffff" : "#94a3b8", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                      Tất cả ({mockBattleHistory.length})
                    </ThemedText>
                  </HapticPressable>
                  <HapticPressable
                    className={`flex-1 py-2 rounded-full ${historyFilter === "win" ? "bg-green-500" : "bg-white/5"}`}
                    onPress={() => setHistoryFilter("win")}
                  >
                    <ThemedText style={{ color: historyFilter === "win" ? "#ffffff" : "#94a3b8", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                      Thắng (5)
                    </ThemedText>
                  </HapticPressable>
                  <HapticPressable
                    className={`flex-1 py-2 rounded-full ${historyFilter === "loss" ? "bg-red-500" : "bg-white/5"}`}
                    onPress={() => setHistoryFilter("loss")}
                  >
                    <ThemedText style={{ color: historyFilter === "loss" ? "#ffffff" : "#94a3b8", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                      Thua (2)
                    </ThemedText>
                  </HapticPressable>
                </View>
              </View>

              {/* Battle List */}
              <ScrollView className="flex-1 px-6 pt-4">
                {filteredHistory.map((battle) => (
                  <HapticPressable
                    key={battle.id}
                    className="py-4 border-b border-white/5"
                    onPress={() => setSelectedBattle(battle)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <View className={`px-2 py-0.5 rounded-full ${battle.result === "win" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                            <ThemedText style={{ color: battle.result === "win" ? "#22c55e" : "#ef4444", fontSize: 10, fontWeight: "700" }}>
                              {battle.result === "win" ? "THẮNG" : "THUA"}
                            </ThemedText>
                          </View>
                          <ThemedText style={{ color: "#64748b", fontSize: 11 }}>{battle.date}</ThemedText>
                        </View>
                        <ThemedText style={{ color: "#e5e7eb", fontSize: 15, fontWeight: "600" }}>{battle.opponent}</ThemedText>
                        <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>Tỉ số: {battle.score}</ThemedText>
                      </View>
                      <View className="items-end">
                        <ThemedText style={{ color: battle.mmrChange > 0 ? "#22c55e" : "#ef4444", fontSize: 18, fontWeight: "700" }}>
                          {battle.mmrChange > 0 ? "+" : ""}{battle.mmrChange}
                        </ThemedText>
                        <ThemedText style={{ color: "#64748b", fontSize: 11 }}>MMR</ThemedText>
                      </View>
                    </View>
                  </HapticPressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Battle Detail Modal */}
      <Modal
        visible={selectedBattle !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedBattle(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
          <View className="w-11/12 max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-white/10">
            {/* Detail Header */}
            <TWLinearGradient
              colors={selectedBattle?.result === "win" ? ["#22c55e", "#16a34a"] : ["#ef4444", "#dc2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <ThemedText style={{ color: "#ffffff", fontSize: 22, fontWeight: "700" }}>
                  {selectedBattle?.result === "win" ? "🎉 CHIẾN THẮNG" : "💔 THẤT BẠI"}
                </ThemedText>
                <HapticPressable
                  className="w-8 h-8 items-center justify-center rounded-full bg-white/20"
                  onPress={() => setSelectedBattle(null)}
                >
                  <ThemedText style={{ color: "#ffffff", fontSize: 18 }}>✕</ThemedText>
                </HapticPressable>
              </View>
              <ThemedText style={{ color: "#ffffff", fontSize: 14, opacity: 0.9 }}>
                {selectedBattle?.date}
              </ThemedText>
            </TWLinearGradient>

            {/* Detail Content */}
            <View className="p-6">
              {/* Opponent Info */}
              <View className="mb-5">
                <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>Đối thủ</ThemedText>
                <View className="flex-row items-center gap-3">
                  <UserAvatar name={selectedBattle?.opponent || "?"} size="small" />
                  <ThemedText style={{ color: "#e5e7eb", fontSize: 18, fontWeight: "600" }}>
                    {selectedBattle?.opponent}
                  </ThemedText>
                </View>
              </View>

              {/* Score */}
              <View className="mb-5">
                <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>Tỉ số</ThemedText>
                <ThemedText style={{ color: "#e5e7eb", fontSize: 32, fontWeight: "700", textAlign: "center" }}>
                  {selectedBattle?.score}
                </ThemedText>
              </View>

              {/* MMR Change */}
              <View className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>Thay đổi MMR</ThemedText>
                    <ThemedText style={{ color: selectedBattle && selectedBattle.mmrChange > 0 ? "#22c55e" : "#ef4444", fontSize: 28, fontWeight: "700" }}>
                      {selectedBattle && selectedBattle.mmrChange > 0 ? "+" : ""}{selectedBattle?.mmrChange}
                    </ThemedText>
                  </View>
                  <View className="items-end">
                    <ThemedText style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>MMR hiện tại</ThemedText>
                    <ThemedText style={{ color: "#22d3ee", fontSize: 20, fontWeight: "600" }}>1200</ThemedText>
                  </View>
                </View>
              </View>

              {/* Performance Stats */}
              <View className="mt-5 flex-row gap-3">
                <View className="flex-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3">
                  <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>Độ chính xác</ThemedText>
                  <ThemedText style={{ color: "#22d3ee", fontSize: 18, fontWeight: "700" }}>85%</ThemedText>
                </View>
                <View className="flex-1 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                  <ThemedText style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>Thời gian</ThemedText>
                  <ThemedText style={{ color: "#fbbf24", fontSize: 18, fontWeight: "700" }}>12:34</ThemedText>
                </View>
              </View>

              {/* Close Button */}
              <HapticPressable
                className="mt-6 py-3 rounded-full bg-white/10 border border-white/15"
                onPress={() => setSelectedBattle(null)}
              >
                <ThemedText style={{ color: "#e5e7eb", fontSize: 15, fontWeight: "600", textAlign: "center" }}>
                  Đóng
                </ThemedText>
              </HapticPressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Accept Match Modal */}
      <Modal
        visible={showAcceptModal}
        animationType="fade"
        transparent
        onRequestClose={handleRejectMatch}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
          <View className="w-11/12 max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-white/10">
            <TWLinearGradient
              colors={["#22c55e", "#16a34a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              <View className="items-center">
                <ThemedText style={{ color: "#ffffff", fontSize: 24, fontWeight: "900" }}>
                  🎮 TRẬN ĐẤU SẴN SÀNG
                </ThemedText>
              </View>
            </TWLinearGradient>

            <View className="p-6">
              <View className="flex-row items-center justify-center gap-8 mb-6">
                <View className="items-center">
                  <UserAvatar name={matchedPlayer?.playerName || "You"} size="large" />
                  <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                    Bạn
                  </ThemedText>
                </View>
                <TWLinearGradient
                  colors={["#ec4899", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 2, borderRadius: 999 }}
                >
                  <View className="px-4 py-2 rounded-full bg-black/70">
                    <ThemedText style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>VS</ThemedText>
                  </View>
                </TWLinearGradient>
                <View className="items-center">
                  <UserAvatar name={matchedPlayer?.opponentName || "Opponent"} size="large" />
                  <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                    {matchedPlayer?.opponentName || "Đối thủ"}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
                Đã tìm thấy đối thủ phù hợp!
              </ThemedText>

              <View className="flex-row gap-3">
                <HapticPressable className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/20" onPress={handleRejectMatch}>
                  <ThemedText style={{ color: "#fca5a5", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                    Từ chối
                  </ThemedText>
                </HapticPressable>
                <HapticPressable className="flex-1 rounded-2xl overflow-hidden" onPress={handleAcceptMatch}>
                  <TWLinearGradient
                    colors={["#22c55e", "#16a34a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 16 }}
                  >
                    <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                      ĐỒNG Ý
                    </ThemedText>
                  </TWLinearGradient>
                </HapticPressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  scanline: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  // Most layout styles moved to Tailwind classes above
});


