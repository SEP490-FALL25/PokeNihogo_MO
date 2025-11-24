import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import UserAvatar from "@components/atoms/UserAvatar";
import ModalEffectiveness from "@components/battle/modal-effectiveness";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { getSocket } from "@configs/socket";
import useAuth from "@hooks/useAuth";
import {
  useChoosePokemon,
  useListMatchRound,
  useListUserPokemonRound,
} from "@hooks/useBattle";
import { useListElemental } from "@hooks/useElemental";
import { IBattleMatchRound } from "@models/battle/battle.response";
import { IElementalEntity } from "@models/elemental/elemental.entity";
import { IPokemonType } from "@models/pokemon/pokemon.common";
import { ROUTES } from "@routes/routes";
import { useAuthStore } from "@stores/auth/auth.config";
import { useGlobalStore } from "@stores/global/global.config";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock, Info, Timer, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

export default function PickPokemonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const matchId = params.matchId as string;

  if (!matchId) {
    router.replace(ROUTES.TABS.BATTLE);
    return null;
  }

  const { data: listElemental } = useListElemental();
  const language = useGlobalStore((s) => s.language);
  const { data: matchRound, isLoading: isLoadingMatchRound } =
    useListMatchRound(matchId) as {
      data: IBattleMatchRound;
      isLoading: boolean;
    };

  const { user } = useAuth();
  const currentUserId = user?.data?.id as number | undefined;
  const opponentName =
    matchRound?.match?.participants?.find((p) => {
      if (currentUserId !== undefined) return p.user.id !== currentUserId;
      return p.user.name !== "Bạn";
    })?.user.name || "";

  const [typeId, setTypeId] = useState<number>(1);
  const {
    data: listUserPokemonRound,
    isLoading: isLoadingListUserPokemonRound,
  } = useListUserPokemonRound(typeId);

  const setStartRoundPayload = useMatchingStore((s) => s.setStartRoundPayload);
  const setServerTimeOffset = useMatchingStore((s) => s.setServerTimeOffset);
  const serverTimeOffset = useMatchingStore((s) => s.serverTimeOffset);

  const battleContext = useMemo(() => {
    if (!matchRound) return null;

    const matchParticipants = matchRound.match.participants;
    const opponent = matchParticipants.find((p) => {
      if (currentUserId !== undefined) return p.user.id !== currentUserId;
      return p.user.name !== "Bạn";
    });
    const player = matchParticipants.find((p) => {
      if (currentUserId !== undefined) return p.user.id === currentUserId;
      return p.user.name === "Bạn";
    });

    const opponentMatchParticipantId = opponent?.id;
    const playerMatchParticipantId = player?.id;

    let currentRoundIndex = matchRound.rounds.findIndex(
      (r) => r.status === "SELECTING_POKEMON"
    );

    if (currentRoundIndex === -1) {
      const reversedRounds = [...matchRound.rounds].reverse();
      const lastPendingReversedIndex = reversedRounds.findIndex(
        (r) => r.status === "PENDING"
      );

      if (lastPendingReversedIndex !== -1) {
        currentRoundIndex =
          matchRound.rounds.length - 1 - lastPendingReversedIndex;
      }
    }

    const safeCurrentRoundIndex =
      currentRoundIndex === -1 ? 0 : currentRoundIndex;

    const currentRound = matchRound.rounds[safeCurrentRoundIndex];
    const currentPlayer = currentRound?.participants.find(
      (rp) => rp.matchParticipantId === playerMatchParticipantId
    );
    const currentOpponent = currentRound?.participants.find(
      (rp) => rp.matchParticipantId === opponentMatchParticipantId
    );

    let isPlayerTurn = false;
    let isOpponentTurn = false;

    if (currentRound?.status === "SELECTING_POKEMON") {
      const playerHasPicked = !!currentPlayer?.selectedUserPokemonId;
      const opponentHasPicked = !!currentOpponent?.selectedUserPokemonId;

      if (!playerHasPicked && opponentHasPicked) {
        isPlayerTurn = true;
      } else if (playerHasPicked && !opponentHasPicked) {
        isOpponentTurn = true;
      } else if (!playerHasPicked && !opponentHasPicked) {
        if (
          currentPlayer?.orderSelected !== undefined &&
          currentOpponent?.orderSelected !== undefined
        ) {
          if (currentPlayer.orderSelected < currentOpponent.orderSelected) {
            isPlayerTurn = true;
          } else if (
            currentOpponent.orderSelected < currentPlayer.orderSelected
          ) {
            isOpponentTurn = true;
          }
        } else {
          const playerOrder = currentPlayer?.orderSelected;
          const opponentOrder = currentOpponent?.orderSelected;

          if (playerOrder !== undefined && opponentOrder !== undefined) {
            if (playerOrder < opponentOrder) {
              isPlayerTurn = true;
            } else if (opponentOrder < playerOrder) {
              isOpponentTurn = true;
            }
          } else {
            if (currentPlayer?.orderSelected === 1) isPlayerTurn = true;
            if (currentOpponent?.orderSelected === 1) isOpponentTurn = true;
          }
        }
      }
    } else if (currentRound?.status === "PENDING") {
      const playerHasPicked = !!currentPlayer?.selectedUserPokemonId;
      const opponentHasPicked = !!currentOpponent?.selectedUserPokemonId;

      if (!playerHasPicked && opponentHasPicked) {
        isPlayerTurn = true;
      } else if (playerHasPicked && !opponentHasPicked) {
        isOpponentTurn = true;
      } else if (!playerHasPicked && !opponentHasPicked) {
        if (
          currentPlayer?.orderSelected !== undefined &&
          currentOpponent?.orderSelected !== undefined
        ) {
          if (currentPlayer.orderSelected < currentOpponent.orderSelected) {
            isPlayerTurn = true;
          } else if (
            currentOpponent.orderSelected < currentPlayer.orderSelected
          ) {
            isOpponentTurn = true;
          }
        }
      }
    }

    const currentPicker: "player" | "opponent" | null = isPlayerTurn
      ? "player"
      : isOpponentTurn
        ? "opponent"
        : null;

    const validateDeadline = (
      deadlineStr: string | undefined | null
    ): string | null => {
      if (!deadlineStr) return null;
      try {
        const deadlineTs = new Date(deadlineStr).getTime();
        if (isNaN(deadlineTs)) return null;
        return deadlineStr;
      } catch {
        return null;
      }
    };

    const pickDeadline = (() => {
      if (
        currentRound?.status === "SELECTING_POKEMON" ||
        currentRound?.status === "PENDING"
      ) {
        let activeDeadline: string | null = null;
        if (currentPicker === "player") {
          activeDeadline = validateDeadline(currentPlayer?.endTimeSelected);
        } else if (currentPicker === "opponent") {
          activeDeadline = validateDeadline(currentOpponent?.endTimeSelected);
        }
        if (activeDeadline) return activeDeadline;
        const roundDeadline = validateDeadline(currentRound?.endTimeRound);
        if (roundDeadline) return roundDeadline;
        let fallbackDeadline = validateDeadline(currentPlayer?.endTimeSelected);
        if (fallbackDeadline) return fallbackDeadline;
        fallbackDeadline = validateDeadline(currentOpponent?.endTimeSelected);
        if (fallbackDeadline) return fallbackDeadline;
      }
      return null;
    })();

    const playerPicks: Array<number | null> = [null, null, null];
    const opponentPicks: Array<number | null> = [null, null, null];
    const pickedPokemonMap = new Map<number, any>();

    matchRound.rounds.forEach((round, idx) => {
      const rpPlayer = round.participants.find(
        (rp) => rp.matchParticipantId === playerMatchParticipantId
      );
      const rpOpponent = round.participants.find(
        (rp) => rp.matchParticipantId === opponentMatchParticipantId
      );

      const playerPickId =
        rpPlayer?.selectedUserPokemon?.pokemon?.id ??
        rpPlayer?.selectedUserPokemonId ??
        null;
      const opponentPickId =
        rpOpponent?.selectedUserPokemon?.pokemon?.id ??
        rpOpponent?.selectedUserPokemonId ??
        null;

      playerPicks[idx] = playerPickId;
      opponentPicks[idx] = opponentPickId;

      if (playerPickId && rpPlayer?.selectedUserPokemon?.pokemon) {
        pickedPokemonMap.set(
          playerPickId,
          rpPlayer.selectedUserPokemon.pokemon
        );
      }
      if (opponentPickId && rpOpponent?.selectedUserPokemon?.pokemon) {
        pickedPokemonMap.set(
          opponentPickId,
          rpOpponent.selectedUserPokemon.pokemon
        );
      }
    });

    return {
      playerMatchParticipantId,
      opponentMatchParticipantId,
      currentRoundIndex: safeCurrentRoundIndex,
      currentRound,
      currentRoundId: currentRound?.id,
      isPlayerTurn,
      isOpponentTurn,
      currentPicker,
      pickDeadline,
      playerPicks,
      opponentPicks,
      pickedPokemonMap,
      currentPlayer,
      currentOpponent,
    };
  }, [matchRound, currentUserId]);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [roundStartingData, setRoundStartingData] = useState<{
    matchId: number;
    roundNumber: string;
    delaySeconds: number;
    message: string;
  } | null>(null);

  const playerPulseAnim = useRef(new Animated.Value(1)).current;
  const opponentPulseAnim = useRef(new Animated.Value(1)).current;
  const playerGlowAnim = useRef(new Animated.Value(0)).current;
  const opponentGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (roundStartingData) return;
    if (!battleContext?.pickDeadline || !battleContext?.currentRound) {
      setRemainingSeconds(null);
      return;
    }

    const compute = () => {
      try {
        const deadlineStr = battleContext.pickDeadline as string;
        if (!deadlineStr) {
          setRemainingSeconds(null);
          return;
        }
        const endTs = new Date(deadlineStr).getTime();
        const now = Date.now() + serverTimeOffset;

        if (isNaN(endTs)) {
          setRemainingSeconds(null);
          return;
        }
        const secs = Math.max(0, Math.floor((endTs - now) / 1000));
        setRemainingSeconds(Number.isFinite(secs) ? secs : null);
      } catch (error) {
        console.error("Error computing countdown:", error);
        setRemainingSeconds(null);
      }
    };

    compute();
    const interval = setInterval(compute, 1000);
    return () => clearInterval(interval);
  }, [
    battleContext?.pickDeadline,
    battleContext?.currentRoundIndex,
    battleContext?.currentRound?.id,
    roundStartingData,
    serverTimeOffset,
  ]);

  useEffect(() => {
    if (battleContext?.isPlayerTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(playerPulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(playerPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(playerGlowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(playerGlowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      playerPulseAnim.setValue(1);
      playerGlowAnim.setValue(0);
    }
  }, [battleContext?.isPlayerTurn]);

  useEffect(() => {
    if (battleContext?.isOpponentTurn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opponentPulseAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opponentPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(opponentGlowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(opponentGlowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      opponentPulseAnim.setValue(1);
      opponentGlowAnim.setValue(0);
    }
  }, [battleContext?.isOpponentTurn]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const roundList: any[] = useMemo(() => {
    const dataAny: any = listUserPokemonRound as any;
    if (dataAny?.results && Array.isArray(dataAny.results))
      return dataAny.results as any[];
    if (Array.isArray(dataAny)) return dataAny as any[];
    return [];
  }, [listUserPokemonRound]);

  const pokemonByType = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    roundList.forEach((pokemon: any) => {
      const types = pokemon?.types || pokemon?.pokemon?.types || [];
      types.forEach((type: IPokemonType) => {
        if (!grouped[type.type_name]) grouped[type.type_name] = [];
        grouped[type.type_name].push(pokemon);
      });
    });
    return grouped;
  }, [roundList]);

  const availableTypes = Object.keys(pokemonByType);
  const [currentTypeFilter, setCurrentTypeFilter] = useState<string | null>(
    null
  );
  const displayPokemons = useMemo(() => {
    if (!currentTypeFilter) return roundList;
    return pokemonByType[currentTypeFilter] || [];
  }, [roundList, currentTypeFilter, pokemonByType]);

  const currentElementalName = useMemo(() => {
    const elemental = listElemental?.results?.find(
      (elem: IElementalEntity) => elem.id === typeId
    );
    if (!elemental) return "";
    return (
      elemental.display_name?.[
      language as keyof typeof elemental.display_name
      ] ||
      elemental.display_name?.vi ||
      elemental.display_name?.en ||
      elemental.display_name?.ja ||
      elemental.type_name ||
      ""
    );
  }, [listElemental, typeId, language]);

  const getPokemonById = (pokemonId: number) => {
    if (battleContext?.pickedPokemonMap?.has(pokemonId)) {
      return battleContext.pickedPokemonMap.get(pokemonId);
    }
    let pokemon = roundList.find((pokemon: any) => pokemon?.id === pokemonId);
    if (!pokemon && matchRound) {
      for (const round of matchRound.rounds) {
        for (const participant of round.participants) {
          if (participant.selectedUserPokemon?.pokemon?.id === pokemonId) {
            return participant.selectedUserPokemon.pokemon;
          }
          if (
            participant.selectedUserPokemonId === pokemonId &&
            participant.selectedUserPokemon?.pokemon
          ) {
            return participant.selectedUserPokemon.pokemon;
          }
        }
      }
    }
    return pokemon;
  };

  const getPokemonName = (pokemon: any) => {
    if (!pokemon) return "";
    if (language === "ja") {
      return pokemon.nameTranslations?.ja || pokemon.nameJp || "";
    }
    return pokemon.nameTranslations?.en || pokemon.nameJp || "";
  };

  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(
    null
  );
  const handlePickPokemon = (pokemonId: number) => {
    const isSelected =
      (battleContext?.playerPicks || []).includes(pokemonId) ||
      (battleContext?.opponentPicks || []).includes(pokemonId);
    if (isSelected) return;
    setSelectedPokemonId(pokemonId);
  };

  const [infoPokemonId, setInfoPokemonId] = useState<number | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const handleShowInfo = (pokemonId: number, e?: any) => {
    e?.stopPropagation?.();
    setInfoPokemonId(pokemonId);
    setShowInfoModal(true);
  };
  const handleCloseInfo = () => {
    setShowInfoModal(false);
    setInfoPokemonId(null);
  };

  const choosePokemonMutation = useChoosePokemon();
  const handleChoosePokemon = async () => {
    if (!selectedPokemonId || !battleContext?.currentRoundId) return;
    try {
      await choosePokemonMutation.mutateAsync({
        matchId: battleContext.currentRoundId,
        pokemonId: selectedPokemonId,
      });
      setSelectedPokemonId(null);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn Pokemon. Vui lòng thử lại.");
    }
  };

  const setCurrentMatchId = useMatchingStore((s) => s.setCurrentMatchId);
  useEffect(() => {
    if (matchId) {
      setCurrentMatchId(matchId);
    }
    return () => {
      setCurrentMatchId(null);
    };
  }, [matchId, setCurrentMatchId]);

  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  // --- SOCKET LOGIC ---
  useEffect(() => {
    if (!accessToken || !matchId) return;

    const socket = getSocket("matching", accessToken);
    socket.emit("join-matching-room", { matchId });
    socket.emit("join-user-match-room", { matchId });

    const handleSelectPokemon = (payload: any) => {
      if (
        payload?.matchId &&
        payload.matchId.toString() === matchId.toString()
      ) {
        if (payload?.data) {
          queryClient.setQueryData(["list-match-round"], (oldData: any) => {
            return payload.data;
          });
        }
        queryClient.invalidateQueries({ queryKey: ["list-match-round"] });
        queryClient.invalidateQueries({
          queryKey: ["list-user-pokemon-round"],
        });
      }
    };

    const handleRoundStarting = (payload: any) => {
      if (payload?.startTime) {
        const offset = new Date(payload.startTime).getTime() - Date.now();
        setServerTimeOffset(offset);
      }
      if (
        payload?.matchId &&
        payload?.roundNumber &&
        payload?.delaySeconds !== undefined
      ) {
        setRoundStartingData({
          matchId: payload.matchId,
          roundNumber: payload.roundNumber,
          delaySeconds: payload.delaySeconds,
          message: payload.message,
        });
        setRemainingSeconds(payload.delaySeconds);
      }
      queryClient.invalidateQueries({ queryKey: ["list-match-round"] });
      queryClient.invalidateQueries({ queryKey: ["list-user-pokemon-round"] });
    };

    // 🔥 QUAN TRỌNG: ĐỊNH NGHĨA HANDLER RIÊNG
    const handleRoundStarted = (payload: any) => {
      // Hủy listener này ngay lập tức
      socket.off("round-started", handleRoundStarted);

      // 1. Tính offset
      if (payload?.startTime) {
        const offset = new Date(payload.startTime).getTime() - Date.now();
        setServerTimeOffset(offset);
      }

      // 2. Handover
      setStartRoundPayload(payload);

      // 3. Navigate
      router.replace({
        pathname: ROUTES.APP.ARENA,
        params: {
          matchId: matchId,
          roundNumber:
            payload.round?.roundNumber ||
            roundStartingData?.roundNumber ||
            "ONE",
        },
      });
    };

    // Đăng ký
    socket.on("select-pokemon", handleSelectPokemon);
    socket.on("round-starting", handleRoundStarting);
    socket.on("round-started", handleRoundStarted);

    // Cleanup: CHỈ HỦY ĐÚNG HÀM CỦA MÌNH
    return () => {
      socket.off("select-pokemon", handleSelectPokemon);
      socket.off("round-starting", handleRoundStarting);
      socket.off("round-started", handleRoundStarted);
    };
  }, [accessToken, matchId, queryClient, roundStartingData]);

  // UI Countdown Only
  useEffect(() => {
    if (!roundStartingData) return;
    if (remainingSeconds === null || remainingSeconds <= 0) return;

    const timer = setTimeout(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [remainingSeconds, roundStartingData]);

  if (isLoadingMatchRound) {
    return (
      <ThemedView className="flex-1">
        <ImageBackground
          source={require("../../../../assets/images/list_pokemon_bg.png")}
          style={{ flex: 1 }}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#22d3ee" />
            <ThemedText
              style={{ color: "#93c5fd", marginTop: 16, fontSize: 16 }}
            >
              Đang tải thông tin trận đấu...
            </ThemedText>
          </View>
        </ImageBackground>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../../assets/images/list_pokemon_bg.png")}
        style={{ flex: 1 }}
        imageStyle={{ resizeMode: "cover" }}
      >
        {/* Header */}
        <View className="px-5 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText
              style={{ color: "#fbbf24", fontSize: 20, fontWeight: "800" }}
            >
              PICK PHASE
            </ThemedText>
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#22d3ee" />
              <ThemedText style={{ color: "#cbd5e1", fontSize: 14 }}>
                Round{" "}
                {(() => {
                  if (roundStartingData?.roundNumber) {
                    const roundNum = roundStartingData.roundNumber;
                    if (roundNum === "ONE") return "1";
                    if (roundNum === "TWO") return "2";
                    if (roundNum === "THREE") return "3";
                    return roundNum;
                  }
                  if (battleContext?.currentRound?.roundNumber) {
                    const roundNum = battleContext.currentRound.roundNumber;
                    if (roundNum === "ONE") return "1";
                    if (roundNum === "TWO") return "2";
                    if (roundNum === "THREE") return "3";
                    return roundNum;
                  }
                  return (battleContext?.currentRoundIndex ?? 0) + 1;
                })()}
                /3
              </ThemedText>
            </View>
          </View>

          {/* Opponent vs Player */}
          <View className="flex-row items-center justify-between">
            {/* Opponent */}
            <View
              className="items-center flex-1"
              style={{ position: "relative" }}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: battleContext?.isOpponentTurn
                        ? opponentPulseAnim
                        : 1,
                    },
                  ],
                  zIndex: 2,
                }}
              >
                <UserAvatar
                  name={
                    matchRound?.match.participants.find(
                      (p) => p.user.name === opponentName
                    )?.user.name ?? ""
                  }
                  size="large"
                />
              </Animated.View>

              <ThemedText
                style={{
                  color: "#e5e7eb",
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 8,
                  zIndex: 2,
                }}
              >
                {matchRound?.match.participants.find(
                  (p) => p.user.name === opponentName
                )?.user.name ?? ""}
              </ThemedText>

              {battleContext?.isOpponentTurn && (
                <Animated.View
                  style={{
                    marginTop: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(239, 68, 68, 0.5)",
                    borderWidth: 2,
                    borderColor: "#ef4444",
                  }}
                >
                  <Timer size={14} color="#fca5a5" />
                  <ThemedText
                    style={{
                      color: "#fca5a5",
                      fontSize: 13,
                      fontWeight: "800",
                      marginLeft: 8,
                    }}
                  >
                    ĐANG CHỌN
                  </ThemedText>
                </Animated.View>
              )}
            </View>

            {/* VS */}
            <TWLinearGradient
              colors={["#ec4899", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 2, borderRadius: 999, marginHorizontal: 20 }}
            >
              <View className="px-4 py-2 rounded-full bg-black/70 items-center">
                {remainingSeconds !== null && remainingSeconds > 0 ? (
                  <ThemedText
                    style={{
                      color: "#ffffff",
                      fontWeight: "800",
                      fontSize: 18,
                    }}
                  >
                    {formatTime(remainingSeconds)}
                  </ThemedText>
                ) : (
                  <ThemedText
                    style={{
                      color: "#ffffff",
                      fontWeight: "800",
                      fontSize: 18,
                    }}
                  >
                    --
                  </ThemedText>
                )}
                <ThemedText
                  style={{
                    color: "#cbd5e1",
                    fontWeight: "700",
                    fontSize: 10,
                    opacity: 0.85,
                  }}
                >
                  VS
                </ThemedText>
              </View>
            </TWLinearGradient>

            {/* Player */}
            <View
              className="items-center flex-1"
              style={{ position: "relative" }}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: battleContext?.isPlayerTurn ? playerPulseAnim : 1,
                    },
                  ],
                  zIndex: 2,
                }}
              >
                <UserAvatar name={"Bạn"} size="large" />
              </Animated.View>

              <ThemedText
                style={{
                  color: "#e5e7eb",
                  fontSize: 14,
                  fontWeight: "600",
                  marginTop: 8,
                  zIndex: 2,
                }}
              >
                Bạn
              </ThemedText>

              {battleContext?.isPlayerTurn && (
                <Animated.View
                  style={{
                    marginTop: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(34, 197, 94, 0.5)",
                    borderWidth: 2,
                    borderColor: "#22c55e",
                  }}
                >
                  <Zap size={14} color="#86efac" fill="#86efac" />
                  <ThemedText
                    style={{
                      color: "#86efac",
                      fontSize: 13,
                      fontWeight: "800",
                      marginLeft: 8,
                    }}
                  >
                    CHỌN NGAY
                  </ThemedText>
                </Animated.View>
              )}
            </View>
          </View>
        </View>

        {/* Picks Display */}
        <View className="px-5 mb-4">
          <View className="flex-row justify-between gap-2">
            <View className="flex-1">
              <ThemedText
                style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}
              >
                Đối thủ (
                {matchRound?.match.participants.find(
                  (p) => p.user.name === opponentName
                )?.user.name ?? ""}
                )
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                {[0, 1, 2].map((idx) => {
                  const opponentPickId = battleContext?.opponentPicks[idx];
                  const opponentPokemon = opponentPickId
                    ? getPokemonById(opponentPickId)
                    : null;

                  return (
                    <View
                      key={idx}
                      className="w-16 h-16 rounded-xl border border-white/20 bg-black/40"
                    >
                      {opponentPokemon ? (
                        <View className="flex-1 items-center justify-center">
                          <Image
                            source={{ uri: opponentPokemon.imageUrl }}
                            style={{ width: 48, height: 48 }}
                            resizeMode="contain"
                          />
                        </View>
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Animated.View style={{ opacity: 0.3 }}>
                            <Clock size={24} color="#64748b" />
                          </Animated.View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Player Picks */}
            <View className="flex-1">
              <ThemedText
                style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}
              >
                Bạn
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                {[0, 1, 2].map((idx) => {
                  const playerPickId = battleContext?.playerPicks[idx];
                  const playerPokemon = playerPickId
                    ? getPokemonById(playerPickId)
                    : null;

                  return (
                    <View
                      key={idx}
                      className="w-16 h-16 rounded-xl border border-white/20 bg-black/40"
                    >
                      {playerPokemon ? (
                        <View className="flex-1 items-center justify-center">
                          <Image
                            source={{ uri: playerPokemon.imageUrl }}
                            style={{ width: 48, height: 48 }}
                            resizeMode="contain"
                          />
                        </View>
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Animated.View style={{ opacity: 0.3 }}>
                            <Clock size={24} color="#64748b" />
                          </Animated.View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View className="px-5 mb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {listElemental?.results?.map((elem: IElementalEntity) => (
                <HapticPressable
                  key={elem?.id}
                  onPress={() => setTypeId(elem?.id)}
                  className={`px-4 py-2 rounded-full border ${elem?.id === typeId
                    ? "border-cyan-400 bg-cyan-500/20"
                    : "border-white/20 bg-white/5"
                    }`}
                >
                  <ThemedText
                    style={{
                      color: elem?.id === typeId ? "#22d3ee" : "#cbd5e1",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {elem?.display_name?.[
                      language as keyof typeof elem.display_name
                    ] ||
                      elem?.display_name?.vi ||
                      elem?.type_name ||
                      "Elemental"}
                  </ThemedText>
                </HapticPressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {availableTypes.length > 0 && (
          <View className="px-5 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {availableTypes.map((type) => (
                  <HapticPressable
                    key={type}
                    onPress={() =>
                      setCurrentTypeFilter(
                        currentTypeFilter === type ? null : type
                      )
                    }
                    className={`px-4 py-2 rounded-full border ${currentTypeFilter === type
                      ? "border-cyan-400 bg-cyan-500/20"
                      : "border-white/20 bg-white/5"
                      }`}
                  >
                    <ThemedText
                      style={{
                        color:
                          currentTypeFilter === type ? "#22d3ee" : "#cbd5e1",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </ThemedText>
                  </HapticPressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {selectedPokemonId && (
          <View className="px-5 mb-4">
            <HapticPressable
              onPress={handleChoosePokemon}
              disabled={
                choosePokemonMutation.isPending || !battleContext?.isPlayerTurn
              }
              className={`w-full py-4 rounded-xl border-2 items-center justify-center ${battleContext?.isPlayerTurn && !choosePokemonMutation.isPending
                ? "bg-green-500/20 border-green-500"
                : "bg-gray-500/20 border-gray-500"
                }`}
            >
              {choosePokemonMutation.isPending ? (
                <ActivityIndicator size="small" color="#86efac" />
              ) : (
                <ThemedText
                  style={{
                    color: battleContext?.isPlayerTurn ? "#86efac" : "#9ca3af",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {battleContext?.isPlayerTurn ? "Chọn" : "Chờ đến lượt bạn"}
                </ThemedText>
              )}
            </HapticPressable>
          </View>
        )}

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {isLoadingListUserPokemonRound ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#22d3ee" />
              <ThemedText
                style={{ color: "#64748b", marginTop: 16, fontSize: 14 }}
              >
                Đang tải Pokemon...
              </ThemedText>
            </View>
          ) : !displayPokemons || displayPokemons.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <ThemedText
                style={{
                  color: "#64748b",
                  marginTop: 16,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {currentElementalName
                  ? `Bạn không có Pokemon hệ ${currentElementalName}`
                  : "Không có Pokemon nào"}
              </ThemedText>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-4 pb-8 justify-center">
              {displayPokemons.map((pokemon: any) => {
                const isSelected =
                  (battleContext?.playerPicks || []).includes(pokemon.id) ||
                  (battleContext?.opponentPicks || []).includes(pokemon.id);
                const isCurrentlySelected = selectedPokemonId === pokemon.id;
                const canPick = pokemon?.canPick !== false;
                return (
                  <HapticPressable
                    key={pokemon.id}
                    onPress={() => handlePickPokemon(pokemon.id)}
                    disabled={isSelected || !canPick}
                    className="relative"
                  >
                    <View
                      className={`w-32 h-44 rounded-3xl overflow-hidden border-white/20 ${isSelected ? "opacity-50" : "opacity-100"
                        } ${isCurrentlySelected
                          ? "scale-105 border-green-400 border-2"
                          : "scale-100"
                        }`}
                      style={{ borderWidth: isCurrentlySelected ? 2 : 1 }}
                    >
                      <TWLinearGradient
                        colors={[
                          "rgba(248, 250, 252, 0.1)",
                          "rgba(226, 232, 240, 0.15)",
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          borderRadius: 24,
                        }}
                      />
                      <Image
                        source={{ uri: pokemon.imageUrl }}
                        style={{
                          width: 80,
                          height: 80,
                          alignSelf: "center",
                          marginTop: 30,
                        }}
                        resizeMode="contain"
                      />
                      <View className="px-3 pb-3 pt-1">
                        <ThemedText
                          numberOfLines={1}
                          style={{
                            color: "#ffffff",
                            fontSize: 12,
                            fontWeight: "800",
                            textAlign: "center",
                          }}
                        >
                          {getPokemonName(pokemon)}
                        </ThemedText>
                      </View>
                      {(isSelected || !canPick) && (
                        <View className="absolute inset-0 bg-black/60 rounded-3xl items-center justify-center">
                          {isSelected && (
                            <View className="bg-red-500/80 px-3 py-1 rounded-full">
                              <ThemedText
                                style={{
                                  color: "#ffffff",
                                  fontSize: 10,
                                  fontWeight: "700",
                                }}
                              >
                                Đã chọn
                              </ThemedText>
                            </View>
                          )}
                        </View>
                      )}
                      <TouchableOpacity
                        className="absolute top-1.5 right-1.5 z-30"
                        onPress={(e) => handleShowInfo(pokemon.id, e)}
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.6)",
                          borderRadius: 12,
                          padding: 6,
                        }}
                      >
                        <Info size={14} color="#22d3ee" />
                      </TouchableOpacity>
                    </View>
                  </HapticPressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </ImageBackground>

      <ModalEffectiveness
        visible={showInfoModal}
        onRequestClose={handleCloseInfo}
        pokemonId={infoPokemonId}
        language={language}
      />
    </ThemedView>
  );
}
