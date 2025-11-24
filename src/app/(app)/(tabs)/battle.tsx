import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import UserAvatar from "@components/atoms/UserAvatar";
import ModalBattleAccept from "@components/battle/modal-accept.battle";
import ModalBattleHistory from "@components/battle/modal-battleHistory";
import ModalFirstTimeUser from "@components/battle/modal-first-time-user";
import ModalLeaderboard from "@components/battle/modal-leaderboard";
import ModalNewSeasonInfo from "@components/battle/modal-new-season-info";
import ModalRewardLeaderboard from "@components/battle/modal-rewardLeaderboard";
import ModalSeasonEnded from "@components/battle/modal-season-ended";
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
import { useJoinNewSeason, useMatchTracking } from "@hooks/useBattle";
import { useUserStatsSeason } from "@hooks/useSeason";
import {
  IBattleMatchFound,
  IBattleMatchTrackingResponse,
} from "@models/battle/battle.response";
import { ROUTES } from "@routes/routes";
import battleService from "@services/battle";
import { useAuthStore } from "@stores/auth/auth.config";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { Crown, History, Info, Trophy } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  Easing,
  ImageBackground,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Socket } from "socket.io-client";

export default function BattleLobbyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queueMessagesTranslation = t("battle.lobby.queue_messages", {
    returnObjects: true,
  });
  const queueMessages =
    Array.isArray(queueMessagesTranslation) &&
    queueMessagesTranslation.length > 0
      ? (queueMessagesTranslation as string[])
      : [t("battle.lobby.queue_status.searching")];
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const { user } = useAuth();

  const [showAcceptModal, setShowAcceptModal] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Season state management
  const {
    data: seasonData,
    responseType,
    isLoading: isLoadingSeason,
  } = useUserStatsSeason();
  const [showSeasonEndedModal, setShowSeasonEndedModal] = useState(false);
  const [showNewSeasonModal, setShowNewSeasonModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [newSeasonInfo, setNewSeasonInfo] = useState<any>(null);
  const joinNewSeasonMutation = useJoinNewSeason();
  const queryClient = useQueryClient();

  // Match tracking
  const {
    data: matchTrackingData,
    refetch: refetchMatchTracking,
    isLoading: isLoadingMatchTracking,
  } = useMatchTracking(
    responseType === "ACTIVE",
    responseType === "ACTIVE" ? 5000 : 0
  );

  const hasCheckedMatchTracking = useRef(false);
  const lastProcessedMatchId = useRef<number | null>(null);
  const lastProcessedStatus = useRef<string | null>(null);

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

  const socketRef = useRef<Socket | null>(null);
  const [inQueue, setInQueue] = useState<boolean>(false);

  // Store & Auth
  const accessToken = useAuthStore((s) => s.accessToken);
  const {
    setIsInQueue: setGlobalInQueue,
    showMatchFoundModal: showGlobalMatchFound,
    hideMatchFoundModal: hideGlobalMatchFound,
    setStartRoundPayload,
  } = useMatchingStore();

  const clearLastMatchResult = useMatchingStore(
    (s) => (s as any).clearLastMatchResult
  );
  const setLastMatchResult = useMatchingStore(
    (s) => (s as any).setLastMatchResult
  );
  const [matchedPlayer, setMatchedPlayer] = useState<IBattleMatchFound | null>(
    null
  );
  const [statusMatch, setStatusMatch] = useState<"reject" | "accept" | null>(
    null
  );

  // --- ACTIONS ---
  const handleStartRanked = async () => {
    if (responseType !== "ACTIVE") return;

    console.log("[QUEUE] Start button pressed");
    setInQueue(true);
    setGlobalInQueue(true);
    try {
      await battleService.matchQueue();

      let socket = socketRef.current;
      if (!socket && accessToken) {
        socket = getSocket("matching", accessToken);
        socketRef.current = socket;
      }

      if (socket) {
        socket.emit("join-searching-room", {}, (ack: any) => {
          console.log("[QUEUE] join-searching-room ack:", ack);
        });
        console.log("[QUEUE] Emitted join-searching-room");
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        t("battle.lobby.alerts.queue_error_message")
      );
      console.log("[QUEUE] startQueue failed:", error?.response?.data?.message);
      setInQueue(false);
      setGlobalInQueue(false);
    }
  };

  const handleOpenLeaderboard = () => setShowLeaderboard(true);
  const handleViewTopRewards = () => setShowRewards(true);
  const handleViewRankInfo = () =>
    Alert.alert(
      t("battle.lobby.alerts.rank_info_title"),
      t("battle.lobby.alerts.rank_info_message")
    );
  const handleSeasonEndedContinue = () => {};

  const handleClaimRewardComplete = async () => {
    setShowSeasonEndedModal(false);
    try {
      const response = await joinNewSeasonMutation.mutateAsync();
      const seasonNowInfo = response?.data?.data?.seasonNowInfo;
      if (seasonNowInfo) {
        setNewSeasonInfo(seasonNowInfo);
        setShowNewSeasonModal(true);
      } else {
        queryClient.invalidateQueries({ queryKey: ["user-stats-season"] });
      }
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.response?.data?.message || t("common.error")
      );
      queryClient.invalidateQueries({ queryKey: ["user-stats-season"] });
    }
  };

  const handleFirstTimeJoinComplete = (newSeasonInfo: any) => {
    setShowFirstTimeModal(false);
    setNewSeasonInfo(newSeasonInfo);
    setShowNewSeasonModal(true);
  };

  const handleNewSeasonModalClose = () => {
    setShowNewSeasonModal(false);
    setNewSeasonInfo(null);
    queryClient.invalidateQueries({ queryKey: ["user-stats-season"] });
  };

  const handleCancelQueue = async () => {
    setInQueue(false);
    setGlobalInQueue(false);
    await battleService.cancelQueue();
  };

  useEffect(() => {
    setStatusMatch(null);
    setShowAcceptModal(false);
    setMatchedPlayer(null);
  }, []);

  // --- MATCH TRACKING HANDLER ---
  const handleMatchTrackingData = useCallback(
    (
      data: IBattleMatchTrackingResponse | undefined,
      forceProcess: boolean = false
    ) => {
      if (!data) return;

      const currentMatchId = data.matchId || data.match?.id;
      const currentStatus = data.type;

      const isSameMatchAndStatus =
        currentMatchId &&
        lastProcessedMatchId.current === currentMatchId &&
        lastProcessedStatus.current === currentStatus;

      if (
        !forceProcess &&
        isSameMatchAndStatus &&
        data.type !== BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH
      ) {
        return;
      }

      console.log(
        "[MATCH_TRACKING] Processing:",
        currentStatus,
        "ID:",
        currentMatchId
      );

      if (currentMatchId) {
        lastProcessedMatchId.current = currentMatchId;
        lastProcessedStatus.current = currentStatus;
      } else if (
        data.type === BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH
      ) {
        lastProcessedMatchId.current = null;
        lastProcessedStatus.current = null;
      }

      let socket = socketRef.current;
      if (!socket && accessToken) {
        socket = getSocket("matching", accessToken);
        socketRef.current = socket;
      }

      switch (data.type) {
        case BATTLE_STATUS.MATCH_TRACKING_STATUS.MATCH_FOUND:
          // ... (giữ nguyên logic match found)
          if (
            data.match &&
            data.opponent &&
            data.participant &&
            !data.participant.hasAccepted
          ) {
            const matchId = data.matchId || data.match.id;
            const matchFoundPayload: IBattleMatchFound = {
              type: BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_FOUND,
              matchId: matchId,
              match: {
                id: data.match.id,
                status: data.match.status,
                createdAt: data.match.createdAt,
                endTime: data.match.endTime || "",
              },
              opponent: {
                id: data.opponent.id,
                name: data.opponent.name,
                avatar: data.opponent.avatar || undefined,
              },
              participant: {
                id: data.participant.id,
                matchId: data.participant.matchId,
                hasAccepted: data.participant.hasAccepted,
                userId: data.participant.userId,
              },
            };
            setInQueue(false);
            setGlobalInQueue(false);
            setMatchedPlayer(matchFoundPayload);
            setShowAcceptModal(true);
            showGlobalMatchFound(matchFoundPayload, String(matchId));
          }
          break;

        // 🔥 FIX: Gộp ROUND_STARTING vào case Pick Pokemon
        case BATTLE_STATUS.MATCH_TRACKING_STATUS.ROUND_STARTING:
        case BATTLE_STATUS.MATCH_TRACKING_STATUS.ROUND_SELECTING_POKEMON:
        case BATTLE_STATUS.MATCH_TRACKING_STATUS.BETWEEN_ROUNDS:
          const pickPokemonMatchId = data.matchId || data.match?.id;
          if (!pickPokemonMatchId) break;

          // 🔥 FIX: Lấy roundNumber để truyền sang Pick Screen (có thể dùng để hiển thị)
          const pickRoundNumber =
            (data as any).round?.roundNumber || data.roundNumber || "ONE";

          console.log(
            "[MATCH_TRACKING] -> Pick Pokemon. Round:",
            pickRoundNumber
          );

          if (socket && pickPokemonMatchId) {
            socket.emit("join-matching-room", { matchId: pickPokemonMatchId });
            socket.emit("join-user-match-room", {
              matchId: pickPokemonMatchId,
            });
          }

          // 🔥 Trao tay dữ liệu (quan trọng cho ROUND_STARTING)
          setStartRoundPayload(data);

          setInQueue(false);
          setGlobalInQueue(false);
          hideGlobalMatchFound();
          queryClient.invalidateQueries({ queryKey: ["list-match-round"] });
          queryClient.invalidateQueries({
            queryKey: ["list-user-pokemon-round"],
          });

          router.replace({
            pathname: ROUTES.APP.PICK_POKEMON,
            params: {
              matchId: String(pickPokemonMatchId),
              roundNumber: pickRoundNumber, // Truyền thêm roundNumber
            },
          });
          break;

        case BATTLE_STATUS.MATCH_TRACKING_STATUS.ROUND_IN_PROGRESS:
          const arenaMatchId = data.matchId || data.match?.id;
          if (!arenaMatchId) break;

          // 🔥 FIX: Lấy roundNumber chính xác
          const arenaRoundNumber =
            (data as any).round?.roundNumber || data.roundNumber || "ONE";

          console.log("[MATCH_TRACKING] -> Arena. Round:", arenaRoundNumber);

          if (socket && arenaMatchId) {
            socket.emit("join-matching-room", { matchId: arenaMatchId });
            socket.emit("join-user-match-room", { matchId: arenaMatchId });
          }

          setStartRoundPayload(data);

          setInQueue(false);
          setGlobalInQueue(false);
          hideGlobalMatchFound();
          queryClient.invalidateQueries({ queryKey: ["list-match-round"] });

          router.replace({
            pathname: ROUTES.APP.ARENA,
            params: {
              matchId: String(arenaMatchId),
              roundNumber: arenaRoundNumber, // Truyền đúng Round Number
            },
          });
          break;

        case BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH:
          setInQueue(false);
          setGlobalInQueue(false);
          setShowAcceptModal(false);
          setMatchedPlayer(null);
          setStatusMatch(null);
          hideGlobalMatchFound();
          break;
      }
    },
    [
      router,
      setGlobalInQueue,
      showGlobalMatchFound,
      hideGlobalMatchFound,
      queryClient,
      socketRef,
      accessToken,
      setStartRoundPayload,
    ]
  );

  // ... (Giữ nguyên các phần còn lại của file battle.tsx)
  // ... (checkMatchTrackingAndNavigate, useFocusEffect, useEffects...)

  const checkMatchTrackingAndNavigate = useCallback(() => {
    if (hasCheckedMatchTracking.current) return;
    if (responseType !== "ACTIVE" || isLoadingSeason || isLoadingMatchTracking)
      return;

    const data = matchTrackingData as IBattleMatchTrackingResponse | undefined;
    if (data) {
      hasCheckedMatchTracking.current = true;
      handleMatchTrackingData(data, false);
      setTimeout(() => {
        hasCheckedMatchTracking.current = false;
      }, 1000);
    }
  }, [
    responseType,
    isLoadingSeason,
    isLoadingMatchTracking,
    matchTrackingData,
    handleMatchTrackingData,
  ]);

  const hasInitializedSeasonCheck = useRef(false);
  const isBattleScreenFocused = useRef(false);

  useEffect(() => {
    if (
      !isLoadingSeason &&
      responseType === "ACTIVE" &&
      !isLoadingMatchTracking &&
      isBattleScreenFocused.current
    ) {
      if (hasCheckedMatchTracking.current)
        hasCheckedMatchTracking.current = false;
      const checkMatchStatus = async () => {
        if (hasCheckedMatchTracking.current) return;
        try {
          hasCheckedMatchTracking.current = true;
          const trackingResult = await refetchMatchTracking();
          const data = trackingResult.data?.data?.data as
            | IBattleMatchTrackingResponse
            | undefined;
          if (data) handleMatchTrackingData(data, true);
          setTimeout(() => {
            hasCheckedMatchTracking.current = false;
          }, 1000);
        } catch (error) {
          hasCheckedMatchTracking.current = false;
        }
      };
      const timer = setTimeout(checkMatchStatus, 300);
      return () => clearTimeout(timer);
    }
    if (responseType !== "ACTIVE") hasInitializedSeasonCheck.current = false;
  }, [
    isLoadingSeason,
    responseType,
    isLoadingMatchTracking,
    refetchMatchTracking,
    handleMatchTrackingData,
  ]);

  useEffect(() => {
    if (
      matchTrackingData &&
      responseType === "ACTIVE" &&
      !isLoadingSeason &&
      !isLoadingMatchTracking
    ) {
      const data = matchTrackingData as IBattleMatchTrackingResponse;
      const currentMatchId = data.matchId || data.match?.id;
      const currentStatus = data.type;
      const requiresNavigation =
        data.type !== BATTLE_STATUS.MATCH_TRACKING_STATUS.NO_ACTIVE_MATCH;
      const isNewMatch =
        !lastProcessedMatchId.current ||
        lastProcessedMatchId.current !== currentMatchId;
      const isDifferentStatus = lastProcessedStatus.current !== currentStatus;
      const shouldProcess =
        !hasCheckedMatchTracking.current &&
        requiresNavigation &&
        (isNewMatch || isDifferentStatus);

      if (shouldProcess) {
        hasCheckedMatchTracking.current = true;
        handleMatchTrackingData(data, true);
        setTimeout(() => {
          hasCheckedMatchTracking.current = false;
        }, 1000);
      }
    }
  }, [
    matchTrackingData,
    responseType,
    isLoadingSeason,
    isLoadingMatchTracking,
    handleMatchTrackingData,
  ]);

  useFocusEffect(
    useCallback(() => {
      isBattleScreenFocused.current = true;
      hasCheckedMatchTracking.current = false;
      lastProcessedMatchId.current = null;
      lastProcessedStatus.current = null;

      const checkAndNavigate = async () => {
        if (responseType !== "ACTIVE" || isLoadingSeason) {
          const retryTimer = setTimeout(async () => {
            if (
              responseType === "ACTIVE" &&
              !isLoadingSeason &&
              !hasCheckedMatchTracking.current
            ) {
              await performCheck();
            }
          }, 1000);
          return () => clearTimeout(retryTimer);
        }
        await performCheck();
      };

      const performCheck = async () => {
        if (hasCheckedMatchTracking.current || responseType !== "ACTIVE")
          return;
        try {
          hasCheckedMatchTracking.current = true;
          const trackingResult = await refetchMatchTracking();
          const data = trackingResult.data?.data?.data as
            | IBattleMatchTrackingResponse
            | undefined;
          if (data) handleMatchTrackingData(data, true);
          setTimeout(() => {
            hasCheckedMatchTracking.current = false;
          }, 2000);
        } catch (error) {
          hasCheckedMatchTracking.current = false;
        }
      };

      checkAndNavigate();
      return () => {
        isBattleScreenFocused.current = false;
      };
    }, [
      responseType,
      isLoadingSeason,
      refetchMatchTracking,
      handleMatchTrackingData,
    ])
  );

  useEffect(() => {
    if (isLoadingSeason) return;
    if (responseType === "ACTIVE") {
      setShowSeasonEndedModal(false);
      setShowFirstTimeModal(false);
      return;
    }
    if (responseType === "ENDED" && seasonData) {
      setShowSeasonEndedModal(true);
      setShowNewSeasonModal(false);
      setShowFirstTimeModal(false);
      return;
    }
    if (responseType === "NULL") {
      setShowFirstTimeModal(true);
      setShowSeasonEndedModal(false);
      setShowNewSeasonModal(false);
      return;
    }
  }, [responseType, seasonData, isLoadingSeason]);

  // --- SOCKET EVENT LISTENER ---
  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket("matching", accessToken);
    socketRef.current = socket;

    const onMatchingEvent = async (payload: any) => {
      if (payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_FOUND) {
        const match = payload?.match;
        if (match && "opponent" in payload) {
          setStatusMatch(null);
          setMatchedPlayer(payload);
          setShowAcceptModal(true);
          showGlobalMatchFound(payload, match.id.toString());
        }
      }
      if (
        payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_STATUS_UPDATE
      ) {
        if (payload.status === "IN_PROGRESS" && payload.matchId) {
          socket.emit("join-matching-room", { matchId: payload.matchId });
          socket.emit("join-user-match-room", { matchId: payload.matchId });

          setShowAcceptModal(false);
          setStatusMatch(null);
          setMatchedPlayer(null);
          setInQueue(false);
          setGlobalInQueue(false);
          hideGlobalMatchFound();
          try {
            clearLastMatchResult();
          } catch (e) {}
          queryClient.invalidateQueries({ queryKey: ["list-match-round"] });
          queryClient.invalidateQueries({
            queryKey: ["list-user-pokemon-round"],
          });

          router.replace({
            pathname: ROUTES.APP.PICK_POKEMON,
            params: { matchId: String(payload.matchId) },
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
      if (
        payload?.type === BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCHMAKING_FAILED ||
        payload?.type === "MATCHMAKING_FAILED"
      ) {
        setInQueue(false);
        setStatusMatch(null);
        setGlobalInQueue(false);
        if (payload.reason || payload.message)
          Alert.alert(
            t("common.error"),
            payload.reason ||
              payload.message ||
              t("battle.lobby.alerts.queue_error_message")
          );
      }
    };

    socket.on("matching-event", onMatchingEvent);
    const onMatchCompleted = (payload: any) => {
      try {
        setLastMatchResult(payload);
        const matchId = payload?.matchId || payload?.match?.id;
        if (matchId) {
          queryClient.invalidateQueries({
            queryKey: ["user-matching-history"],
          });
          router.replace({
            pathname: "/(app)/(battle)/result",
            params: { matchId: String(matchId) },
          } as any);
        }
      } catch (e) {}
    };
    socket.on("match-completed", onMatchCompleted);

    return () => {
      socket.off("matching-event", onMatchingEvent);
      socket.off("match-completed", onMatchCompleted);
    };
  }, [
    accessToken,
    router,
    setGlobalInQueue,
    showGlobalMatchFound,
    hideGlobalMatchFound,
    clearLastMatchResult,
    setLastMatchResult,
    queryClient,
  ]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../../../assets/images/list_pokemon_bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <TWLinearGradient
          colors={[
            "rgba(17,24,39,0.85)",
            "rgba(17,24,39,0.6)",
            "rgba(17,24,39,0.85)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overlay}
        />
        <SeasonInfo insetsTop={insets.top} />
        <StatsBattle />
        <View className="px-5 mt-6 flex-row items-center justify-between">
          <ThemedText
            style={{
              color: "#fbbf24",
              letterSpacing: 3,
              fontSize: 18,
              fontWeight: "900",
            }}
          >
            {t("battle.lobby.title")}
          </ThemedText>
          <HapticPressable
            className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10"
            onPress={() => setShowHistory(true)}
          >
            <History size={16} color="#22d3ee" />
            <ThemedText
              style={{ color: "#22d3ee", fontSize: 13, fontWeight: "600" }}
            >
              {t("battle.lobby.history_button")}
            </ThemedText>
          </HapticPressable>
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="items-center justify-center">
            <GlowingRingEffect
              color="#22d3ee"
              ringSize={260}
              particleCount={18}
            />
            <View className="absolute items-center gap-2">
              <View className="flex-row items-center gap-5 mt-2">
                <View className="items-center gap-1">
                  <Animated.View style={{ transform: [{ scale: pulse }] }}>
                    <UserAvatar
                      avatar={user?.data?.avatar}
                      name={user?.data?.name || ""}
                      size="large"
                    />
                  </Animated.View>
                  <ThemedText
                    style={{
                      color: "#cbd5e1",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {user?.data?.name}
                  </ThemedText>
                </View>
                <TWLinearGradient
                  colors={["#ec4899", "#8b5cf6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 2, borderRadius: 999 }}
                >
                  <View className="px-4 py-2 rounded-full bg-black/70">
                    <ThemedText
                      style={{
                        color: "#ffffff",
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      VS
                    </ThemedText>
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
                  <ThemedText
                    style={{
                      color: "#cbd5e1",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {inQueue
                      ? t("battle.lobby.queue_status.searching")
                      : t("battle.lobby.queue_status.waiting")}
                  </ThemedText>
                </View>
              </View>
              <View className="flex-row items-center gap-3 mt-3">
                <HapticPressable
                  className="rounded-full overflow-hidden"
                  onPress={handleStartRanked}
                  disabled={
                    inQueue || responseType !== "ACTIVE" || isLoadingSeason
                  }
                >
                  <TWLinearGradient
                    colors={
                      inQueue || responseType !== "ACTIVE" || isLoadingSeason
                        ? ["#64748b", "#374151"]
                        : inQueue
                          ? ["#10b981", "#059669"]
                          : ["#22c55e", "#16a34a"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 14, paddingHorizontal: 28 }}
                  >
                    <Animated.View
                      style={{
                        opacity: shimmer.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [1, 0.85, 1],
                        }),
                      }}
                    >
                      <ThemedText
                        style={{
                          color: "#ffffff",
                          fontSize: 16,
                          fontWeight: "700",
                          letterSpacing: 1.2,
                        }}
                      >
                        {inQueue
                          ? t("battle.lobby.buttons.queueing")
                          : t("battle.lobby.buttons.find_match")}
                      </ThemedText>
                    </Animated.View>
                  </TWLinearGradient>
                </HapticPressable>
                {inQueue ? (
                  <HapticPressable
                    className="px-5 py-3 rounded-full border border-red-400/40 bg-red-500/20"
                    onPress={handleCancelQueue}
                  >
                    <ThemedText style={{ color: "#fca5a5", fontWeight: "700" }}>
                      {t("common.cancel")}
                    </ThemedText>
                  </HapticPressable>
                ) : null}
              </View>
            </View>
          </View>
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
        <View className="px-5 pb-6">
          <View className="flex-row gap-3">
            <HapticPressable
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-4"
              onPress={handleOpenLeaderboard}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Trophy size={18} color="#22d3ee" />
                <ThemedText
                  style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}
                >
                  {t("battle.lobby.sections.leaderboard_title")}
                </ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>
                {t("battle.lobby.sections.leaderboard_subtitle")}
              </ThemedText>
            </HapticPressable>
            <HapticPressable
              className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-4"
              onPress={handleViewTopRewards}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Crown size={18} color="#fbbf24" />
                <ThemedText
                  style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}
                >
                  {t("battle.lobby.sections.rewards_title")}
                </ThemedText>
              </View>
              <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>
                {t("battle.lobby.sections.rewards_subtitle")}
              </ThemedText>
            </HapticPressable>
          </View>
          <HapticPressable
            className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-4"
            onPress={handleViewRankInfo}
          >
            <View className="flex-row items-center gap-2 mb-1">
              <Info size={18} color="#60a5fa" />
              <ThemedText
                style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 14 }}
              >
                {t("battle.lobby.sections.rank_info_title")}
              </ThemedText>
            </View>
            <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>
              {t("battle.lobby.sections.rank_info_subtitle")}
            </ThemedText>
          </HapticPressable>
        </View>
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
      <ModalBattleAccept
        showAcceptModal={showAcceptModal}
        matchedPlayer={matchedPlayer as IBattleMatchFound}
        setShowAcceptModal={(show) => {
          setShowAcceptModal(show);
          if (!show) {
            hideGlobalMatchFound();
          }
        }}
        setMatchedPlayer={setMatchedPlayer}
        setInQueue={setInQueue}
        statusMatch={statusMatch}
        setStatusMatch={setStatusMatch}
      />
      <ModalSeasonEnded
        visible={showSeasonEndedModal}
        onRequestClose={() => setShowSeasonEndedModal(false)}
        data={responseType === "ENDED" ? (seasonData as any) : null}
        onContinue={handleSeasonEndedContinue}
        onClaimComplete={handleClaimRewardComplete}
      />
      <ModalNewSeasonInfo
        visible={showNewSeasonModal}
        onRequestClose={handleNewSeasonModalClose}
        data={newSeasonInfo}
      />
      <ModalFirstTimeUser
        visible={showFirstTimeModal}
        onRequestClose={() => setShowFirstTimeModal(false)}
        onJoinComplete={handleFirstTimeJoinComplete}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { flex: 1 },
  bgImage: { resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject },
  scanline: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
});
