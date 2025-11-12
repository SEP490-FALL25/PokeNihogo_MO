import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import UserAvatar from "@components/atoms/UserAvatar";
import ModalBattleAccept from "@components/battle/modal-accept.battle";
import ModalBattleHistory from "@components/battle/modal-battleHistory";
import ModalLeaderboard from "@components/battle/modal-leaderboard";
import ModalRewardLeaderboard from "@components/battle/modal-rewardLeaderboard";
import SeasonInfo from "@components/battle/season-info.battle";
import StatsBattle from "@components/battle/stats.battle";
import { HapticPressable } from "@components/HapticPressable";
import GlowingRingEffect from "@components/molecules/GlowingRingEffect";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import TypingText from "@components/ui/TypingText";
import { getSocket } from "@configs/socket";
import { BATTLE_STATUS } from "@constants/battle.enum";
import useAuth from "@hooks/useAuth";
import { IBattleMatchFound, IBattleMatchStatusUpdate } from "@models/battle/battle.response";
import { ROUTES } from "@routes/routes";
import battleService from "@services/battle";
import { useAuthStore } from "@stores/auth/auth.config";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Crown, History, Info, Trophy } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Animated, Easing, ImageBackground, StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";


export default function BattleLobbyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queueMessagesTranslation = t("battle.lobby.queue_messages", { returnObjects: true });
  const queueMessages =
    Array.isArray(queueMessagesTranslation) && queueMessagesTranslation.length > 0
      ? (queueMessagesTranslation as string[])
      : [t("battle.lobby.queue_status.searching")];
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const { user } = useAuth();

  const [showAcceptModal, setShowAcceptModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  /**
   * Shimmer effect
   */
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
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
  //------------------------End------------------------//


  /**
   * Pulse effect
   */
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
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
  //------------------------End------------------------//


  /**
   * Socket reference
   */
  const socketRef = useRef<Socket | null>(null);
  const [inQueue, setInQueue] = useState<boolean>(false);

  const handleStartRanked = async () => {
    console.log("[QUEUE] Start button pressed");
    setInQueue(true);
    setGlobalInQueue(true); // Update global store
    try {
      await battleService.matchQueue();
      if (socketRef.current) {
        socketRef.current.emit("join-searching-room", {}, (ack: any) => {
        });
      }
    } catch (error: any) {
      Alert.alert(t("common.error"), t("battle.lobby.alerts.queue_error_message"));
      console.log("[QUEUE] startQueue failed:", error?.response?.data?.message);
      setInQueue(false);
      setGlobalInQueue(false); // Update global store
    }
  };
  //------------------------End------------------------//


  /**
   * Handle open leaderboard
   */
  const handleOpenLeaderboard = () => {
    setShowLeaderboard(true);
  };

  const handleViewTopRewards = () => {
    setShowRewards(true);
  };

  const handleViewRankInfo = () => {
    Alert.alert(
      t("battle.lobby.alerts.rank_info_title"),
      t("battle.lobby.alerts.rank_info_message"),
    );
  };
  //------------------------End------------------------//



  /**
   * Matched player
   * - Handle accept match
   * - Handle reject match
   * - Handle cancel queue
   */
  const [matchedPlayer, setMatchedPlayer] = useState<IBattleMatchFound | null>(null);

  const handleCancelQueue = async () => {
    setInQueue(false);
    setGlobalInQueue(false); // Update global store
    await battleService.cancelQueue();
  };
  //------------------------End------------------------//


  /**
   * Handle matching event
   * Note: This screen also updates the global matching store so notifications appear on all tabs
   */
  const [statusMatch, setStatusMatch] = useState<"reject" | "accept" | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    setIsInQueue: setGlobalInQueue,
    showMatchFoundModal: showGlobalMatchFound,
    hideMatchFoundModal: hideGlobalMatchFound,
  } = useMatchingStore();
  const clearLastMatchResult = useMatchingStore((s) => (s as any).clearLastMatchResult);
  const setLastMatchResult = useMatchingStore((s) => (s as any).setLastMatchResult);
  const queryClient = useQueryClient();

  // Reset match-related state when component mounts (e.g., returning from result screen)
  useEffect(() => {
    setStatusMatch(null);
    setShowAcceptModal(false);
    setMatchedPlayer(null);
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket("matching", accessToken);
    socketRef.current = socket;

    const onMatchingEvent = async (payload: IBattleMatchFound | IBattleMatchStatusUpdate) => {
      console.log("payload", payload);

      if (payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_FOUND) {
        const match = payload?.match;

        if (match && 'opponent' in payload) {
          // Reset status match to allow accepting new match
          setStatusMatch(null);

          // Update local state for modal
          setMatchedPlayer(payload);
          setShowAcceptModal(true);

          // Also update global store for notification on other tabs
          showGlobalMatchFound(payload as IBattleMatchFound, match.id.toString());
          socket.emit("join-matching-room", { matchId: match.id });
        }
      }

      if (payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_STATUS_UPDATE) {
        if (payload.status === "IN_PROGRESS" && payload.matchId) {
          socket.emit("join-matching-room", { matchId: payload.matchId });
          setShowAcceptModal(false);
          setStatusMatch(null);
          setMatchedPlayer(null);
          setInQueue(false);
          setGlobalInQueue(false);
          hideGlobalMatchFound();

          // Clear cache and last match result when starting new match
          try {
            clearLastMatchResult();
          } catch (e) {
            console.warn("Failed to clear last match result", e);
          }
          queryClient.invalidateQueries({ queryKey: ['list-match-round'] });
          queryClient.invalidateQueries({ queryKey: ['list-user-pokemon-round'] });

          router.push({
            pathname: ROUTES.APP.PICK_POKEMON,
            params: {
              matchId: payload.matchId,
            },
          });
        }
        if (payload.status === "CANCELLED") {
          setShowAcceptModal(false);
          setStatusMatch(null);
          setMatchedPlayer(null);
          setInQueue(false);
          setGlobalInQueue(false);
          hideGlobalMatchFound();

          Alert.alert(
            t("battle.lobby.alerts.match_cancelled_title"),
            payload.message || t("battle.lobby.alerts.match_cancelled_default")
          );
        }
      }

      if (payload?.type === "MATCHMAKING_FAILED") {
        setInQueue(false);
        setStatusMatch(null);
        setGlobalInQueue(false);
      }
    };

    socket.on("matching-event", onMatchingEvent);

    // Global listener for match-completed (works even after navigating to result screen)
    const onMatchCompleted = (payload: any) => {
      console.log("Match completed (global):", payload);
      try {
        setLastMatchResult(payload);
        const matchId = payload?.matchId || payload?.match?.id;
        if (matchId) {
          // Invalidate user matching history to refetch latest data
          queryClient.invalidateQueries({ queryKey: ['user-matching-history'] });
          // Navigate to result screen
          router.replace({
            pathname: "/(app)/(battle)/result",
            params: { matchId: String(matchId) },
          } as any);
        }
      } catch (e) {
        console.warn("Failed to handle match-completed", e);
      }
    };

    socket.on("match-completed", onMatchCompleted);

    return () => {
      socket.off("matching-event", onMatchingEvent);
      socket.off("match-completed", onMatchCompleted);
      // disconnectSocket();
    };
  }, [accessToken, router, setGlobalInQueue, showGlobalMatchFound, hideGlobalMatchFound, clearLastMatchResult, setLastMatchResult, queryClient]);
  //------------------------End------------------------//



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
        <SeasonInfo insetsTop={insets.top} />

        {/* Stats Preview */}
        <StatsBattle />

        {/* Title & History Button */}
        <View className="px-5 mt-6 flex-row items-center justify-between">
          <ThemedText style={{ color: "#fbbf24", letterSpacing: 3, fontSize: 18, fontWeight: "900" }}>
            {t("battle.lobby.title")}
          </ThemedText>
          <HapticPressable
            className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10"
            onPress={() => setShowHistory(true)}
          >
            <History size={16} color="#22d3ee" />
            <ThemedText style={{ color: "#22d3ee", fontSize: 13, fontWeight: "600" }}>{t("battle.lobby.history_button")}</ThemedText>
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
                    <UserAvatar avatar={user?.data?.avatar} name={user?.data?.name || ""} size="large" />
                  </Animated.View>
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "600" }}>{user?.data?.name}</ThemedText>
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
                  <ThemedText style={{ color: "#cbd5e1", fontSize: 12, fontWeight: "600" }}>
                    {inQueue ? t("battle.lobby.queue_status.searching") : t("battle.lobby.queue_status.waiting")}
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row items-center gap-3 mt-3">
                <HapticPressable
                  className="rounded-full overflow-hidden"
                  onPress={handleStartRanked}
                  disabled={inQueue ? true : false}
                >
                  <TWLinearGradient
                    colors={inQueue ? ["#10b981", "#059669"] : ["#22c55e", "#16a34a"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 14, paddingHorizontal: 28 }}
                  >
                    <Animated.View style={{ opacity: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.85, 1] }) }}>
                      <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", letterSpacing: 1.2 }}>
                        {inQueue ? t("battle.lobby.buttons.queueing") : t("battle.lobby.buttons.find_match")}
                      </ThemedText>
                    </Animated.View>
                  </TWLinearGradient>
                </HapticPressable>
                {inQueue ? (
                  <HapticPressable
                    className="px-5 py-3 rounded-full border border-red-400/40 bg-red-500/20"
                    onPress={handleCancelQueue}
                  >
                    <ThemedText style={{ color: "#fca5a5", fontWeight: "700" }}>{t("common.cancel")}</ThemedText>
                  </HapticPressable>
                ) : null}
              </View>
            </View>
          </View>

          {/* Queue status typing */}
          <View className="mt-6">
            {inQueue ? (
              <TypingText
                messages={queueMessages}
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
                <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>{t("battle.lobby.sections.leaderboard_title")}</ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>{t("battle.lobby.sections.leaderboard_subtitle")}</ThemedText>
            </HapticPressable>
            <HapticPressable className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleViewTopRewards}>
              <View className="flex-row items-center gap-2 mb-1">
                <Crown size={18} color="#fbbf24" />
                <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>{t("battle.lobby.sections.rewards_title")}</ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>{t("battle.lobby.sections.rewards_subtitle")}</ThemedText>
            </HapticPressable>
          </View>

          <HapticPressable className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-4" onPress={handleViewRankInfo}>
            <View className="flex-row items-center gap-2 mb-1">
              <Info size={18} color="#60a5fa" />
              <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}>{t("battle.lobby.sections.rank_info_title")}</ThemedText>
            </View>
            <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>{t("battle.lobby.sections.rank_info_subtitle")}</ThemedText>
          </HapticPressable>
        </View>

        {/* Subtle scanline overlay for game feel */}
        <View pointerEvents="none" style={styles.scanline} />
      </ImageBackground>

      <ModalBattleHistory
        visible={showHistory}
        onRequestClose={() => setShowHistory(false)}
      />

      <ModalLeaderboard
        visible={showLeaderboard}
        onRequestClose={() => setShowLeaderboard(false)}
        rankName="N5"
      />

      <ModalRewardLeaderboard
        visible={showRewards}
        onRequestClose={() => setShowRewards(false)}
      />

      {/* Accept Match Modal */}
      <ModalBattleAccept
        showAcceptModal={showAcceptModal}
        matchedPlayer={matchedPlayer as IBattleMatchFound}
        setShowAcceptModal={(show) => {
          setShowAcceptModal(show);
          if (!show) {
            // Also hide global modal when closing local modal
            hideGlobalMatchFound();
          }
        }}
        setMatchedPlayer={setMatchedPlayer}
        setInQueue={setInQueue}
        statusMatch={statusMatch}
        setStatusMatch={setStatusMatch}
      />

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


