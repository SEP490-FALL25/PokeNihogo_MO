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
import { Clock, Info, ShieldAlert, Star, Timer, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PickPokemonScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
  const displayOpponentName = opponentName || t("battle.pick.opponent_label");
  const opponentPicksLabel = opponentName
    ? t("battle.pick.opponent_label_with_name", { name: opponentName })
    : t("battle.pick.opponent_label");
  const playerLabel = t("battle.pick.you_label");
  const totalRounds = matchRound?.rounds?.length ?? 3;

  const [typeId, setTypeId] = useState<number>(1);
  const [timeLimitMs, setTimeLimitMs] = useState<number>(5000);
  const {
    data: listUserPokemonRound,
    isLoading: isLoadingListUserPokemonRound,
  } = useListUserPokemonRound(typeId, matchId);

  const setStartRoundPayload = useMatchingStore((s) => s.setStartRoundPayload);
  const setServerTimeOffset = useMatchingStore((s) => s.setServerTimeOffset);
  const serverTimeOffset = useMatchingStore((s) => s.serverTimeOffset);
  const roundStartingData = useMatchingStore((s) => s.roundStartingData);
  const setRoundStartingData = useMatchingStore((s) => s.setRoundStartingData);

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

    // Logic xác định lượt dựa trên orderSelected và trạng thái đã pick
    const determineTurn = (p1: any, p2: any) => {
      const p1Picked = !!p1?.selectedUserPokemonId;
      const p2Picked = !!p2?.selectedUserPokemonId;

      // Nếu 1 người chưa pick và người kia đã pick -> lượt người chưa pick
      if (!p1Picked && p2Picked) return { p1Turn: true, p2Turn: false };
      if (p1Picked && !p2Picked) return { p1Turn: false, p2Turn: true };

      // Nếu cả 2 chưa pick hoặc cả 2 đã pick (tranh chấp/đồng thời) -> check order
      if (p1?.orderSelected !== undefined && p2?.orderSelected !== undefined) {
        if (p1.orderSelected < p2.orderSelected) return { p1Turn: true, p2Turn: false };
        if (p2.orderSelected < p1.orderSelected) return { p1Turn: false, p2Turn: true };
      }

      // Fallback
      return { p1Turn: false, p2Turn: false };
    };

    if (currentRound?.status === "SELECTING_POKEMON" || currentRound?.status === "PENDING") {
      const { p1Turn, p2Turn } = determineTurn(currentPlayer, currentOpponent);
      isPlayerTurn = p1Turn;
      isOpponentTurn = p2Turn;
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
        // Ưu tiên deadline của người đang có lượt
        let activeDeadline: string | null = null;
        if (currentPicker === "player") {
          activeDeadline = validateDeadline(currentPlayer?.endTimeSelected);
        } else if (currentPicker === "opponent") {
          activeDeadline = validateDeadline(currentOpponent?.endTimeSelected);
        }
        if (activeDeadline) return activeDeadline;

        // Nếu không có, fallback sang người còn lại (để hiển thị countdown chung)
        if (currentPicker === "player") {
          // Nếu lượt mình mà chưa có deadline, thử lấy deadline của đối thủ (trường hợp đồng bộ chậm)
          activeDeadline = validateDeadline(currentOpponent?.endTimeSelected);
        } else if (currentPicker === "opponent") {
          activeDeadline = validateDeadline(currentPlayer?.endTimeSelected);
        }
        if (activeDeadline) return activeDeadline;

        // Fallback cuối cùng: endTimeRound hoặc tạo giả lập từ timeLimitMs nếu cần
        const roundDeadline = validateDeadline(currentRound?.endTimeRound);
        if (roundDeadline) return roundDeadline;

        // Nếu tất cả đều null, có thể server chưa gửi deadline. 
        // Không tự ý tạo deadline để tránh sai lệch thêm.
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
  }, [matchRound, currentUserId, timeLimitMs]);

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const parseRoundNumber = (roundValue?: string | null) => {
    if (!roundValue) return null;
    if (roundValue === "ONE") return 1;
    if (roundValue === "TWO") return 2;
    if (roundValue === "THREE") return 3;
    const numericRound = Number(roundValue);
    return Number.isNaN(numericRound) ? null : numericRound;
  };
  const displayedRoundNumber = useMemo(() => {
    const fromStarting = parseRoundNumber(roundStartingData?.roundNumber);
    if (fromStarting) return fromStarting;
    const fromCurrent = parseRoundNumber(battleContext?.currentRound?.roundNumber);
    if (fromCurrent) return fromCurrent;
    return (battleContext?.currentRoundIndex ?? 0) + 1;
  }, [
    battleContext?.currentRound?.roundNumber,
    battleContext?.currentRoundIndex,
    roundStartingData?.roundNumber,
  ]);
  const roundIndicatorText = t("battle.pick.round_indicator", {
    current: displayedRoundNumber,
    total: totalRounds,
  });

  const playerPulseAnim = useRef(new Animated.Value(1)).current;
  const opponentPulseAnim = useRef(new Animated.Value(1)).current;
  const playerGlowAnim = useRef(new Animated.Value(0)).current;
  const opponentGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Nếu có roundStartingData, countdown sẽ được xử lý bởi effect khác
    if (roundStartingData) {
      // Nếu có roundStartingData, đảm bảo remainingSeconds được set từ delaySeconds
      if (roundStartingData.delaySeconds !== undefined) {
        setRemainingSeconds(roundStartingData.delaySeconds);
      }
      return;
    }

    // Debug: log để kiểm tra pickDeadline
    if (!battleContext?.pickDeadline) {
      console.log("[PICK-POKEMON] No pickDeadline in battleContext:", {
        hasBattleContext: !!battleContext,
        hasCurrentRound: !!battleContext?.currentRound,
        currentRoundStatus: battleContext?.currentRound?.status,
        currentPlayer: battleContext?.currentPlayer?.endTimeSelected,
        currentOpponent: battleContext?.currentOpponent?.endTimeSelected,
        roundEndTime: battleContext?.currentRound?.endTimeRound,
      });
    }

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

  const getPokemonRarity = (pokemon: any) => {
    return pokemon?.rarity || pokemon?.pokemon?.rarity || "COMMON";
  };

  const getPokemonTypes = (pokemon: any) => {
    return pokemon?.types || pokemon?.pokemon?.types || [];
  };

  const getPokemonWeaknesses = (pokemon: any) => {
    return pokemon?.weaknesses || pokemon?.pokemon?.weaknesses || [];
  };

  const getTypeDisplayName = (type: any) => {
    return (
      type?.display_name?.[language as keyof typeof type.display_name] ||
      type?.display_name?.vi ||
      type?.type_name ||
      ""
    );
  };

  const rarityStyles: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    COMMON: { bg: "rgba(148, 163, 184, 0.2)", border: "#cbd5f5", text: "#e2e8f0" },
    UNCOMMON: { bg: "rgba(16, 185, 129, 0.2)", border: "#34d399", text: "#bbf7d0" },
    RARE: { bg: "rgba(59, 130, 246, 0.2)", border: "#60a5fa", text: "#bfdbfe" },
    EPIC: { bg: "rgba(147, 51, 234, 0.25)", border: "#c084fc", text: "#f3e8ff" },
    LEGENDARY: { bg: "rgba(251, 191, 36, 0.25)", border: "#facc15", text: "#fef3c7" },
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

  useEffect(() => {
    if (!selectedPokemonId) return;
    const isSelected =
      (battleContext?.playerPicks || []).includes(selectedPokemonId) ||
      (battleContext?.opponentPicks || []).includes(selectedPokemonId);
    if (isSelected) {
      setSelectedPokemonId(null);
    }
  }, [
    battleContext?.playerPicks,
    battleContext?.opponentPicks,
    selectedPokemonId,
  ]);

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
    const isAlreadyPicked =
      (battleContext.playerPicks || []).includes(selectedPokemonId) ||
      (battleContext.opponentPicks || []).includes(selectedPokemonId);
    if (isAlreadyPicked) {
      setSelectedPokemonId(null);
      Alert.alert(
        t("battle.pick.alerts.pokemon_chosen_title"),
        t("battle.pick.alerts.pokemon_chosen_message")
      );
      return;
    }
    try {
      await choosePokemonMutation.mutateAsync({
        matchId: battleContext.currentRoundId,
        pokemonId: selectedPokemonId,
      });
      setSelectedPokemonId(null);
    } catch (error) {
      Alert.alert(t("common.error"), t("battle.pick.alerts.choose_error"));
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
      console.log("handleSelectPokemon", payload);
      if (
        payload?.matchId &&
        payload.matchId.toString() === matchId.toString()
      ) {
        if (payload?.timeLimitMs) {
          setTimeLimitMs(payload.timeLimitMs);
        }
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
      console.log("handleRoundStarting", payload);
      if (payload?.startTime) {
        // startTime là thời gian bắt đầu round (tương lai)
        // delaySeconds là thời gian đếm ngược từ bây giờ đến startTime
        // => ServerNow = startTime - delaySeconds
        // => Offset = ServerNow - ClientNow
        const delayMs = (payload?.delaySeconds || 0) * 1000;
        const offset = new Date(payload.startTime).getTime() - delayMs - Date.now();
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
      console.log("handleRoundStarted", payload);
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
              {t("battle.pick.loading_match")}
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
              {t("battle.pick.title")}
            </ThemedText>
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#22d3ee" />
              <ThemedText style={{ color: "#cbd5e1", fontSize: 14 }}>
                {roundIndicatorText}
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
                  name={displayOpponentName}
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
                {displayOpponentName}
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
                    {t("battle.pick.status.opponent_turn")}
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
                  {t("battle.pick.vs")}
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
                <UserAvatar name={playerLabel} size="large" />
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
                {playerLabel}
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
                    {t("battle.pick.status.player_turn")}
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
                {opponentPicksLabel}
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
                {playerLabel}
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
                      t("battle.pick.filters.elemental_fallback")}
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
                <Text
                  style={{
                    color: battleContext?.isPlayerTurn ? "#86efac" : "#9ca3af",
                    fontSize: 16,
                    fontWeight: "700",
                  }}
                >
                  {battleContext?.isPlayerTurn
                    ? t("battle.pick.primary_button.pick")
                    : t("battle.pick.primary_button.wait")}
                </Text>
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
                {t("battle.pick.loading_pokemon")}
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
                  ? t("battle.pick.empty_by_type", {
                    type: currentElementalName,
                  })
                  : t("battle.pick.empty_default")}
              </ThemedText>
            </View>
          ) : (
            <View className="flex-row flex-wrap pb-8 justify-between">
              {displayPokemons.map((pokemon: any) => {
                const isSelected =
                  (battleContext?.playerPicks || []).includes(pokemon.id) ||
                  (battleContext?.opponentPicks || []).includes(pokemon.id);
                const isCurrentlySelected = selectedPokemonId === pokemon.id;
                const canPick = pokemon?.canPick !== false;
                const rarity = getPokemonRarity(pokemon);
                const rarityStyle = rarityStyles[rarity] || rarityStyles.COMMON;
                const types = getPokemonTypes(pokemon);
                const weaknesses = getPokemonWeaknesses(pokemon);
                return (
                  <HapticPressable
                    key={pokemon.id}
                    onPress={() => handlePickPokemon(pokemon.id)}
                    disabled={isSelected || !canPick}
                    className="relative"
                    style={{ width: "31%", marginBottom: 16 }}
                  >
                    <View
                      className={`h-52 rounded-3xl overflow-hidden border-white/20 ${isSelected ? "opacity-50" : "opacity-100"
                        } ${isCurrentlySelected
                          ? "scale-105 border-green-400 border-2"
                          : "scale-100"
                        }`}
                      style={{
                        borderWidth: isCurrentlySelected ? 2 : 1,
                        width: "100%",
                      }}
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
                      <View
                        className="flex-row items-center"
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          borderWidth: 1,
                          backgroundColor: rarityStyle.bg,
                          borderColor: rarityStyle.border,
                        }}
                      >
                        <Star
                          size={12}
                          color={rarityStyle.text}
                          fill={rarityStyle.text}
                          style={{ marginRight: 4 }}
                        />
                        <ThemedText
                          style={{
                            color: rarityStyle.text,
                            fontSize: 11,
                            fontWeight: "700",
                          }}
                        >
                          {rarity}
                        </ThemedText>
                      </View>
                      <Image
                        source={{ uri: pokemon.imageUrl }}
                        style={{
                          width: 100,
                          height: 100,
                          alignSelf: "center",
                          marginTop: 34,
                        }}
                        resizeMode="contain"
                      />
                      <View className="px-3 pb-3 pt-1 gap-2">
                        {isCurrentlySelected && (
                          <View className="self-center px-3 py-1 rounded-full border border-green-400/70 bg-green-500/10">
                            <ThemedText
                              style={{
                                color: "#bbf7d0",
                                fontSize: 10,
                                fontWeight: "700",
                              }}
                            >
                              {t("battle.pick.status.selection_badge")}
                            </ThemedText>
                          </View>
                        )}
                        <ThemedText
                          numberOfLines={1}
                          style={{
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: "800",
                            textAlign: "center",
                          }}
                        >
                          {getPokemonName(pokemon)}
                        </ThemedText>
                        {types?.length > 0 && (
                          <View className="flex-row flex-wrap gap-1 justify-center">
                            {types.slice(0, 3).map((type: any) => (
                              <View
                                key={type.id}
                                className="px-2 py-1 rounded-full border"
                                style={{
                                  borderColor: type?.color_hex || "#38bdf8",
                                  backgroundColor: `${type?.color_hex || "#38bdf8"}25`,
                                }}
                              >
                                <ThemedText
                                  style={{
                                    color: "#f8fafc",
                                    fontSize: 10,
                                    fontWeight: "700",
                                  }}
                                >
                                  {getTypeDisplayName(type)}
                                </ThemedText>
                              </View>
                            ))}
                          </View>
                        )}
                        {weaknesses?.length > 0 && (
                          <View
                            className="rounded-2xl px-2 py-1 border border-red-400/30 bg-red-500/10 flex-row items-center"
                          >
                            <ShieldAlert size={12} color="#fca5a5" style={{ marginRight: 6 }} />
                            <View style={{ flex: 1 }}>
                              <ThemedText
                                style={{
                                  color: "#fca5a5",
                                  fontSize: 10,
                                  fontWeight: "700",
                                }}
                                numberOfLines={1}
                              >
                                {weaknesses
                                  .slice(0, 2)
                                  .map(
                                    (weak: any) =>
                                      weak?.display_name?.[
                                      language as keyof typeof weak.display_name
                                      ] ||
                                      weak?.display_name?.vi ||
                                      weak?.type_name
                                  )
                                  .join(" • ")}
                              </ThemedText>
                              <ThemedText
                                style={{
                                  color: "#f87171",
                                  fontSize: 9,
                                  fontWeight: "600",
                                }}
                              >
                                {weaknesses
                                  .slice(0, 2)
                                  .map((weak: any) =>
                                    weak?.effectiveness_multiplier
                                      ? `x${Number(
                                        weak.effectiveness_multiplier
                                      ).toFixed(1)}`
                                      : "x1.5"
                                  )
                                  .join("  ")}
                              </ThemedText>
                            </View>
                          </View>
                        )}
                      </View>
                      {isCurrentlySelected && (
                        <View
                          className="absolute inset-0 rounded-3xl border-2 border-green-400 pointer-events-none"
                          style={{}}
                        />
                      )}
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
                                {t("battle.pick.status.picked_badge")}
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
