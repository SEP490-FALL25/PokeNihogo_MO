import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import TypeBadge from "@components/atoms/TypeBadge";
import UserAvatar from "@components/atoms/UserAvatar";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { getSocket } from "@configs/socket";
import useAuth from "@hooks/useAuth";
import { useChoosePokemon, useListMatchRound, useListUserPokemonRound } from "@hooks/useBattle";
import { useListElemental } from "@hooks/useElemental";
import { IBattleMatchRound } from "@models/battle/battle.response";
import { IElementalEntity } from "@models/elemental/elemental.entity";
import { IPokemonType } from "@models/pokemon/pokemon.common";
import { ROUTES } from "@routes/routes";
import { useAuthStore } from "@stores/auth/auth.config";
import { useGlobalStore } from "@stores/global/global.config";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useQueryClient } from "@tanstack/react-query"; // Thêm dòng này
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Clock, Sparkles, Star, Timer, Zap } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, Image, ImageBackground, ScrollView, StyleSheet, View } from "react-native";

export default function PickPokemonScreen() {
    /**
     * Define Variables
     */
    const router = useRouter();
    const params = useLocalSearchParams();
    //---------------End---------------//


    /**
     * Param variables
     */
    const matchId = params.matchId as string;
    //---------------End---------------//


    if (!matchId) {
        router.replace(ROUTES.TABS.BATTLE);
        return;
    }


    /**
     * List elemental
     */
    const { data: listElemental } = useListElemental();
    //------------------------End------------------------//


    /**
     * Get List Match Round
     */
    const language = useGlobalStore((s) => s.language);
    const { data: matchRound, isLoading: isLoadingMatchRound } = useListMatchRound(matchId) as { data: IBattleMatchRound; isLoading: boolean };

    //---------------End---------------//


    /**
     * Get Current User ID and Opponent Name
     */
    const { user } = useAuth();
    const currentUserId = user?.data?.id as number | undefined;
    const opponentName = matchRound?.match?.participants?.find((p) => {
        if (currentUserId !== undefined) return p.user.id !== currentUserId;
        return p.user.name !== "Bạn";
    })?.user.name || "";
    //---------------End---------------//


    /**
     * List user pokemon round
     * @param typeId Type ID
     */
    const [typeId, setTypeId] = useState<number>(1);
    const { data: listUserPokemonRound, isLoading: isLoadingListUserPokemonRound } = useListUserPokemonRound(typeId);
    //------------------------End------------------------//


    /**
     * Get Battle Context (ĐÃ SỬA LOGIC LẶP)
     */
    const battleContext = useMemo(() => {
        if (!matchRound) return null;

        //#region Xác định địch và ta
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
        //#endregion


        //#region Xác định round hiện tại (ĐÃ SỬA: Lặp từ đầu)

        // Tìm vòng SELECTING_POKEMON *đầu tiên* (lặp từ 0 tăng lên)
        let currentRoundIndex = matchRound.rounds.findIndex(
            (r) => r.status === "SELECTING_POKEMON"
        );

        // Nếu không tìm thấy (ví dụ: tất cả đều PENDING hoặc COMPLETED)
        if (currentRoundIndex === -1) {
            // Tìm vòng PENDING *cuối cùng* (newest) bằng cách dùng findLastIndex
            // Cần import 'lodash' hoặc dùng polyfill cho findLastIndex nếu cần
            // Cách đơn giản không cần import:
            const reversedRounds = [...matchRound.rounds].reverse();
            const lastPendingReversedIndex = reversedRounds.findIndex(
                (r) => r.status === "PENDING"
            );

            if (lastPendingReversedIndex !== -1) {
                // Chuyển đổi index ngược về index gốc
                currentRoundIndex = matchRound.rounds.length - 1 - lastPendingReversedIndex;
            }
        }
        //#endregion


        const safeCurrentRoundIndex = currentRoundIndex === -1 ? 0 : currentRoundIndex; // Giữ nguyên fallback an toàn

        // Determine turn based on orderSelected and whether already selected
        const currentRound = matchRound.rounds[safeCurrentRoundIndex];
        const currentPlayer = currentRound?.participants.find((rp) => rp.matchParticipantId === playerMatchParticipantId);
        const currentOpponent = currentRound?.participants.find((rp) => rp.matchParticipantId === opponentMatchParticipantId);

        let isPlayerTurn = false;
        let isOpponentTurn = false;

        // Only determine turn if round is actively selecting (not if both have already picked)
        if (currentRound?.status === "SELECTING_POKEMON") {
            const playerHasPicked = !!currentPlayer?.selectedUserPokemonId;
            const opponentHasPicked = !!currentOpponent?.selectedUserPokemonId;

            if (!playerHasPicked && opponentHasPicked) {
                isPlayerTurn = true;
            } else if (playerHasPicked && !opponentHasPicked) {
                isOpponentTurn = true;
            }

            else if (!playerHasPicked && !opponentHasPicked) {
                if (currentPlayer?.orderSelected !== undefined && currentOpponent?.orderSelected !== undefined) {
                    if (currentPlayer.orderSelected < currentOpponent.orderSelected) {
                        isPlayerTurn = true;
                    } else if (currentOpponent.orderSelected < currentPlayer.orderSelected) {
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
                        // Last resort: check for orderSelected === 1
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
                // Both haven't picked in PENDING round - determine by orderSelected
                if (currentPlayer?.orderSelected !== undefined && currentOpponent?.orderSelected !== undefined) {
                    if (currentPlayer.orderSelected < currentOpponent.orderSelected) {
                        isPlayerTurn = true;
                    } else if (currentOpponent.orderSelected < currentPlayer.orderSelected) {
                        isOpponentTurn = true;
                    }
                }
            }
        }

        // Determine current picker and deadline
        const currentPicker: "player" | "opponent" | null = isPlayerTurn ? "player" : isOpponentTurn ? "opponent" : null;

        // Helper function to validate deadline
        const validateDeadline = (deadlineStr: string | undefined | null): string | null => {
            if (!deadlineStr) return null;
            try {
                const deadlineTs = new Date(deadlineStr).getTime();
                if (isNaN(deadlineTs)) return null;

                if (deadlineTs <= Date.now()) return null;
                return deadlineStr;
            } catch {
                return null;
            }
        };

        const pickDeadline = (() => {
            if (currentRound?.status === "SELECTING_POKEMON" || currentRound?.status === "PENDING") {
                let activeDeadline: string | null = null;

                // Ưu tiên 1: Lấy deadline của người đang pick
                if (currentPicker === "player") {
                    activeDeadline = validateDeadline(currentPlayer?.endTimeSelected);
                } else if (currentPicker === "opponent") {
                    activeDeadline = validateDeadline(currentOpponent?.endTimeSelected);
                }

                // Nếu có deadline của người đang pick, trả về nó
                if (activeDeadline) return activeDeadline;

                // Ưu tiên 2: Nếu không ai đang pick (ví dụ cả hai đã pick, chờ round)
                // Lấy deadline của round (nếu có)
                const roundDeadline = validateDeadline(currentRound?.endTimeRound);
                if (roundDeadline) return roundDeadline;

                // Fallback: Nếu vẫn không có, thử lấy deadline (chưa hết hạn) của bất kỳ ai
                let fallbackDeadline = validateDeadline(currentPlayer?.endTimeSelected);
                if (fallbackDeadline) return fallbackDeadline;

                fallbackDeadline = validateDeadline(currentOpponent?.endTimeSelected);
                if (fallbackDeadline) return fallbackDeadline;
            }

            // Không tìm thấy deadline nào hợp lệ
            return null;
        })();

        // Build picks arrays for UI display (length 3)
        // Also build a map of all picked Pokemon for easy lookup (regardless of type)
        const playerPicks: Array<number | null> = [null, null, null];
        const opponentPicks: Array<number | null> = [null, null, null];
        const pickedPokemonMap = new Map<number, any>(); // Map<pokemonId, pokemonData>

        matchRound.rounds.forEach((round, idx) => {
            const rpPlayer = round.participants.find((rp) => rp.matchParticipantId === playerMatchParticipantId);
            const rpOpponent = round.participants.find((rp) => rp.matchParticipantId === opponentMatchParticipantId);

            // Try selectedUserPokemon.pokemon.id first, fallback to selectedUserPokemonId
            const playerPickId = rpPlayer?.selectedUserPokemon?.pokemon?.id ?? rpPlayer?.selectedUserPokemonId ?? null;
            const opponentPickId = rpOpponent?.selectedUserPokemon?.pokemon?.id ?? rpOpponent?.selectedUserPokemonId ?? null;

            playerPicks[idx] = playerPickId;
            opponentPicks[idx] = opponentPickId;

            // Store Pokemon data in map for easy lookup
            if (playerPickId && rpPlayer?.selectedUserPokemon?.pokemon) {
                pickedPokemonMap.set(playerPickId, rpPlayer.selectedUserPokemon.pokemon);
            }
            if (opponentPickId && rpOpponent?.selectedUserPokemon?.pokemon) {
                pickedPokemonMap.set(opponentPickId, rpOpponent.selectedUserPokemon.pokemon);
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
    //---------------End---------------//

    // Countdown for current picker
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

    /**
     * Round starting state
     */
    const [roundStartingData, setRoundStartingData] = useState<{
        matchId: number;
        roundNumber: string;
        delaySeconds: number;
        message: string;
    } | null>(null);

    // Animation for pulse effect when it's player/opponent turn
    const playerPulseAnim = useRef(new Animated.Value(1)).current;
    const opponentPulseAnim = useRef(new Animated.Value(1)).current;
    const playerGlowAnim = useRef(new Animated.Value(0)).current;
    const opponentGlowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // If round is starting, don't use deadline countdown
        if (roundStartingData) {
            return;
        }

        // Reset when round changes
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
                const now = Date.now();

                // Check if deadline is valid (not NaN)
                if (isNaN(endTs)) {
                    console.error("Invalid deadline timestamp:", deadlineStr);
                    setRemainingSeconds(null);
                    return;
                }

                const secs = Math.max(0, Math.floor((endTs - now) / 1000));
                setRemainingSeconds(Number.isFinite(secs) ? secs : null);
            } catch (error) {
                console.error("Error computing countdown:", error, battleContext.pickDeadline);
                setRemainingSeconds(null);
            }
        };

        // Compute immediately
        compute();

        // Update every second
        const interval = setInterval(compute, 1000);

        return () => clearInterval(interval);
    }, [battleContext?.pickDeadline, battleContext?.currentRoundIndex, battleContext?.currentRound?.id, roundStartingData]);

    // Pulse animation for player turn
    useEffect(() => {
        if (battleContext?.isPlayerTurn) {
            // Pulse animation
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

            // Glow animation
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

    // Pulse animation for opponent turn
    useEffect(() => {
        if (battleContext?.isOpponentTurn) {
            // Pulse animation
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

            // Glow animation
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

    // Normalize round list from results array
    const roundList: any[] = useMemo(() => {
        const dataAny: any = listUserPokemonRound as any;
        if (dataAny?.results && Array.isArray(dataAny.results)) return dataAny.results as any[];
        if (Array.isArray(dataAny)) return dataAny as any[];
        return [];
    }, [listUserPokemonRound]);

    // Group Pokemon by type (from round list) - memoized for >100 items
    const pokemonByType = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        roundList.forEach((pokemon: any) => {
            // Support both item.types and item.pokemon.types structures
            const types = pokemon?.types || pokemon?.pokemon?.types || [];
            types.forEach((type: IPokemonType) => {
                if (!grouped[type.type_name]) grouped[type.type_name] = [];
                grouped[type.type_name].push(pokemon);
            });
        });
        return grouped;
    }, [roundList]);

    // Get unique types - no memo needed (lightweight operation)
    const availableTypes = Object.keys(pokemonByType);

    /**
     * Current type filter
     */
    const [currentTypeFilter, setCurrentTypeFilter] = useState<string | null>(null);
    const displayPokemons = useMemo(() => {
        if (!currentTypeFilter) return roundList;
        return pokemonByType[currentTypeFilter] || [];
    }, [roundList, currentTypeFilter, pokemonByType]);
    //------------------------End------------------------//


    /**
     * Current elemental name
     */
    const currentElementalName = useMemo(() => {
        const elemental = listElemental?.results?.find((elem: IElementalEntity) => elem.id === typeId);
        if (!elemental) return "";
        return elemental.display_name?.[language as keyof typeof elemental.display_name] ||
            elemental.display_name?.vi ||
            elemental.display_name?.en ||
            elemental.display_name?.ja ||
            elemental.type_name ||
            "";
    }, [listElemental, typeId, language]);
    //------------------------End------------------------//



    const getPokemonById = (pokemonId: number) => {
        // First, try to find in pickedPokemonMap (from battleContext) - this includes all picked Pokemon
        // This ensures we can display opponent's picks even if they're not in our available Pokemon list
        if (battleContext?.pickedPokemonMap?.has(pokemonId)) {
            return battleContext.pickedPokemonMap.get(pokemonId);
        }

        // Try to find in roundList (user's available Pokemon)
        let pokemon = roundList.find((pokemon: any) => pokemon?.id === pokemonId);

        // If not found, try to find in matchRound rounds (fallback)
        if (!pokemon && matchRound) {
            for (const round of matchRound.rounds) {
                for (const participant of round.participants) {
                    if (participant.selectedUserPokemon?.pokemon?.id === pokemonId) {
                        return participant.selectedUserPokemon.pokemon;
                    }
                    // Also check if selectedUserPokemonId matches
                    if (participant.selectedUserPokemonId === pokemonId && participant.selectedUserPokemon?.pokemon) {
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
        // For vi or en, use English name
        return pokemon.nameTranslations?.en || pokemon.nameJp || "";
    };


    /**
     * Handle Pokemon pick - allow selection anytime for preview
     */
    const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
    const handlePickPokemon = (pokemonId: number) => {
        const isSelected =
            (battleContext?.playerPicks || []).includes(pokemonId) ||
            (battleContext?.opponentPicks || []).includes(pokemonId);

        if (isSelected) return;

        setSelectedPokemonId(pokemonId);
    };
    //------------------------End------------------------//


    /**
     * Choose Pokemon
     */
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
    //------------------------End------------------------//


    /**
     * Set current match ID in store for layout to join rooms
     */
    const setCurrentMatchId = useMatchingStore((s) => s.setCurrentMatchId);

    useEffect(() => {
        if (matchId) {
            setCurrentMatchId(matchId);
        }

        return () => {
            setCurrentMatchId(null);
        };
    }, [matchId, setCurrentMatchId]);

    /**
     * Handle socket events for real-time updates
     */
    const accessToken = useAuthStore((s) => s.accessToken);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!accessToken || !matchId) return;

        const socket = getSocket("matching", accessToken);

        socket.on("select-pokemon", (payload: any) => {
            console.log("select-pokemon", payload);
            if (payload?.matchId && payload.matchId.toString() === matchId.toString()) {
                if (payload?.data) {
                    // SỬA LẠI NHƯ SAU:
                    queryClient.setQueryData(['list-match-round'], (oldData: any) => {
                        // payload.data chính là object IBattleMatchRound mới
                        // Chỉ cần return nó để thay thế hoàn toàn cache cũ.
                        return payload.data;
                    });
                }

                // Vẫn giữ lại invalidate để đảm bảo dữ liệu cuối cùng là chính xác từ server
                queryClient.invalidateQueries({ queryKey: ['list-match-round'] });
                queryClient.invalidateQueries({ queryKey: ['list-user-pokemon-round'] });
            }
        });

        socket.on("round-starting", (payload: any) => {
            if (payload?.matchId && payload?.roundNumber && payload?.delaySeconds) {
                setRoundStartingData({
                    matchId: payload.matchId,
                    roundNumber: payload.roundNumber,
                    delaySeconds: payload.delaySeconds,
                    message: payload.message || `Round ${payload.roundNumber} will start in ${payload.delaySeconds} seconds`,
                });
                setRemainingSeconds(payload.delaySeconds);
            }

            queryClient.invalidateQueries({ queryKey: ['list-match-round'] });
            queryClient.invalidateQueries({ queryKey: ['list-user-pokemon-round'] });
        });

        return () => {
            socket.off("select-pokemon");
            socket.off("round-starting");
        };
    }, [accessToken, matchId, queryClient]);

    /**
     * Countdown timer for round starting - decrement remainingSeconds
     */
    useEffect(() => {
        if (!roundStartingData || remainingSeconds === null || remainingSeconds <= 0) {
            if (roundStartingData && remainingSeconds !== null && remainingSeconds <= 0) {
                // Navigate to arena when countdown reaches 0
                router.replace({
                    pathname: ROUTES.APP.ARENA,
                    params: {
                        matchId: roundStartingData.matchId.toString(),
                        roundNumber: roundStartingData.roundNumber,
                    },
                });
            }
            return;
        }

        const timer = setTimeout(() => {
            setRemainingSeconds((prev) => {
                if (prev === null || prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, [remainingSeconds, roundStartingData, router]);
    //------------------------End------------------------//

    if (isLoadingMatchRound) {
        return (
            <ThemedView className="flex-1">
                <ImageBackground
                    source={require("../../../../assets/images/list_pokemon_bg.png")}
                    style={{ flex: 1 }}
                    imageStyle={{ resizeMode: "cover" }}
                >
                    <TWLinearGradient
                        colors={["rgba(17,24,39,0.85)", "rgba(17,24,39,0.6)", "rgba(17,24,39,0.85)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ ...StyleSheet.absoluteFillObject }}
                    />
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#22d3ee" />
                        <ThemedText style={{ color: "#93c5fd", marginTop: 16, fontSize: 16 }}>
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
                        <ThemedText style={{ color: "#fbbf24", fontSize: 20, fontWeight: "800" }}>
                            PICK PHASE
                        </ThemedText>
                        <View className="flex-row items-center gap-2">
                            <Clock size={16} color="#22d3ee" />
                            <ThemedText style={{ color: "#cbd5e1", fontSize: 14 }}>
                                Round {(() => {
                                    // Priority: roundStartingData > battleContext
                                    if (roundStartingData?.roundNumber) {
                                        const roundNum = roundStartingData.roundNumber;
                                        if (roundNum === "ONE") return "1";
                                        if (roundNum === "TWO") return "2";
                                        if (roundNum === "THREE") return "3";
                                        return roundNum; // Fallback if format is different
                                    }
                                    if (battleContext?.currentRound?.roundNumber) {
                                        const roundNum = battleContext.currentRound.roundNumber;
                                        if (roundNum === "ONE") return "1";
                                        if (roundNum === "TWO") return "2";
                                        if (roundNum === "THREE") return "3";
                                        return roundNum;
                                    }
                                    return (battleContext?.currentRoundIndex ?? 0) + 1;
                                })()}/3
                            </ThemedText>
                        </View>
                    </View>


                    {/* Opponent vs Player */}
                    <View className="flex-row items-center justify-between">
                        {/* Opponent */}
                        <View className="items-center flex-1" style={{ position: "relative" }}>
                            {/* Glow effect background when it's opponent turn */}
                            {battleContext?.isOpponentTurn && (
                                <Animated.View
                                    style={{
                                        position: "absolute",
                                        top: -8,
                                        left: "50%",
                                        marginLeft: -50,
                                        width: 100,
                                        height: 100,
                                        borderRadius: 50,
                                        backgroundColor: opponentGlowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.5)"],
                                        }),
                                        zIndex: 0,
                                    }}
                                />
                            )}

                            {/* Animated border ring */}
                            {battleContext?.isOpponentTurn && (
                                <Animated.View
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        left: "50%",
                                        marginLeft: -52,
                                        width: 104,
                                        height: 104,
                                        borderRadius: 52,
                                        borderWidth: 3,
                                        borderColor: opponentGlowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["rgba(239, 68, 68, 0.6)", "rgba(239, 68, 68, 1)"],
                                        }),
                                        zIndex: 1,
                                    }}
                                />
                            )}

                            {/* Avatar with pulse animation */}
                            <Animated.View
                                style={{
                                    transform: [{ scale: battleContext?.isOpponentTurn ? opponentPulseAnim : 1 }],
                                    zIndex: 2,
                                }}
                            >
                                <UserAvatar name={matchRound?.match.participants.find((p) => p.user.name === opponentName)?.user.name ?? ""} size="large" />
                            </Animated.View>

                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8, zIndex: 2 }}>
                                {matchRound?.match.participants.find((p) => p.user.name === opponentName)?.user.name ?? ""}
                            </ThemedText>

                            {/* Enhanced badge when it's opponent turn */}
                            {battleContext?.isOpponentTurn && (
                                <Animated.View
                                    style={{
                                        marginTop: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 999,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: opponentGlowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["rgba(239, 68, 68, 0.3)", "rgba(239, 68, 68, 0.5)"],
                                        }),
                                        borderWidth: 2,
                                        borderColor: "#ef4444",
                                        shadowColor: "#ef4444",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 8,
                                        elevation: 8,
                                        zIndex: 2,
                                    }}
                                >
                                    <Timer size={14} color="#fca5a5" />
                                    <ThemedText style={{ color: "#fca5a5", fontSize: 13, fontWeight: "800", letterSpacing: 0.5, marginLeft: 8 }}>
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
                                    <ThemedText style={{ color: "#ffffff", fontWeight: "800", fontSize: 18 }}>
                                        {formatTime(remainingSeconds)}
                                    </ThemedText>
                                ) : (
                                    <ThemedText style={{ color: "#ffffff", fontWeight: "800", fontSize: 18 }}>
                                        --
                                    </ThemedText>
                                )}
                                <ThemedText style={{ color: "#cbd5e1", fontWeight: "700", fontSize: 10, opacity: 0.85 }}>
                                    VS
                                </ThemedText>
                            </View>
                        </TWLinearGradient>

                        {/* Player */}
                        <View className="items-center flex-1" style={{ position: "relative" }}>
                            {/* Glow effect background when it's player turn */}
                            {battleContext?.isPlayerTurn && (
                                <Animated.View
                                    style={{
                                        position: "absolute",
                                        top: -8,
                                        left: "50%",
                                        marginLeft: -50,
                                        width: 100,
                                        height: 100,
                                        borderRadius: 50,
                                        backgroundColor: playerGlowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["rgba(34, 197, 94, 0.2)", "rgba(34, 197, 94, 0.5)"],
                                        }),
                                        zIndex: 0,
                                    }}
                                />
                            )}

                            {/* Animated border ring */}
                            {battleContext?.isPlayerTurn && (
                                <Animated.View
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        left: "50%",
                                        marginLeft: -52,
                                        width: 104,
                                        height: 104,
                                        borderRadius: 52,
                                        borderWidth: 3,
                                        borderColor: playerGlowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["rgba(34, 197, 94, 0.6)", "rgba(34, 197, 94, 1)"],
                                        }),
                                        zIndex: 1,
                                    }}
                                />
                            )}

                            {/* Avatar with pulse animation */}
                            <Animated.View
                                style={{
                                    transform: [{ scale: battleContext?.isPlayerTurn ? playerPulseAnim : 1 }],
                                    zIndex: 2,
                                }}
                            >
                                <UserAvatar name={"Bạn"} size="large" />
                            </Animated.View>

                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8, zIndex: 2 }}>
                                Bạn
                            </ThemedText>

                            {/* Enhanced badge when it's player turn */}
                            {battleContext?.isPlayerTurn && (
                                <Animated.View
                                    style={{
                                        marginTop: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 999,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: playerGlowAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["rgba(34, 197, 94, 0.3)", "rgba(34, 197, 94, 0.5)"],
                                        }),
                                        borderWidth: 2,
                                        borderColor: "#22c55e",
                                        shadowColor: "#22c55e",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.8,
                                        shadowRadius: 8,
                                        elevation: 8,
                                        zIndex: 2,
                                    }}
                                >
                                    <Zap size={14} color="#86efac" fill="#86efac" />
                                    <ThemedText style={{ color: "#86efac", fontSize: 13, fontWeight: "800", letterSpacing: 0.5, marginLeft: 8 }}>
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
                        {/* Opponent Picks */}
                        <View className="flex-1">
                            <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
                                Đối thủ ({matchRound?.match.participants.find((p) => p.user.name === opponentName)?.user.name ?? ""})
                            </ThemedText>
                            <View className="flex-row flex-wrap gap-2">
                                {[0, 1, 2].map((idx) => {
                                    const opponentPickId = battleContext?.opponentPicks[idx];
                                    const opponentPokemon = opponentPickId ? getPokemonById(opponentPickId) : null;

                                    return (
                                        <View key={idx} className="w-16 h-16 rounded-xl border border-white/20 bg-black/40">
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
                            <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
                                Bạn
                            </ThemedText>
                            <View className="flex-row flex-wrap gap-2">
                                {[0, 1, 2].map((idx) => {
                                    const playerPickId = battleContext?.playerPicks[idx];
                                    const playerPokemon = playerPickId ? getPokemonById(playerPickId) : null;

                                    return (
                                        <View key={idx} className="w-16 h-16 rounded-xl border border-white/20 bg-black/40">
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

                {/* Elemental Filter (sets typeId for useListUserPokemonRound) */}
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
                                        {(elem?.display_name?.[language as keyof typeof elem.display_name] || elem?.display_name?.vi || elem?.display_name?.en || elem?.display_name?.ja || elem?.type_name || "Elemental")}
                                    </ThemedText>
                                </HapticPressable>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Type Filter */}
                {availableTypes.length > 0 && (
                    <View className="px-5 mb-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-2">
                                {availableTypes.map((type) => (
                                    <HapticPressable
                                        key={type}
                                        onPress={() => {
                                            // Toggle: if already selected, deselect to show all
                                            setCurrentTypeFilter(currentTypeFilter === type ? null : type);
                                        }}
                                        className={`px-4 py-2 rounded-full border ${currentTypeFilter === type
                                            ? "border-cyan-400 bg-cyan-500/20"
                                            : "border-white/20 bg-white/5"
                                            }`}
                                    >
                                        <ThemedText
                                            style={{
                                                color: currentTypeFilter === type ? "#22d3ee" : "#cbd5e1",
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

                {/* Choose Button */}
                {selectedPokemonId && (
                    <View className="px-5 mb-4">
                        <HapticPressable
                            onPress={handleChoosePokemon}
                            disabled={choosePokemonMutation.isPending || !battleContext?.isPlayerTurn}
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
                                        fontWeight: "700"
                                    }}
                                >
                                    {battleContext?.isPlayerTurn ? "Chọn" : "Chờ đến lượt bạn"}
                                </ThemedText>
                            )}
                        </HapticPressable>
                    </View>
                )}

                {/* Pokemon List */}
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {isLoadingListUserPokemonRound ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#22d3ee" />
                            <ThemedText style={{ color: "#64748b", marginTop: 16, fontSize: 14 }}>
                                Đang tải Pokemon...
                            </ThemedText>
                        </View>
                    ) : !displayPokemons || displayPokemons.length === 0 ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <ThemedText style={{ color: "#64748b", marginTop: 16, fontSize: 14, textAlign: "center" }}>
                                {currentElementalName
                                    ? `Bạn không có Pokemon hệ ${currentElementalName}`
                                    : "Không có Pokemon nào"}
                            </ThemedText>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap gap-4 pb-8 justify-center">
                            {displayPokemons.map((pokemon: any) => {
                                // Pokemon is already the direct object from results
                                const isSelected =
                                    (battleContext?.playerPicks || []).includes(pokemon.id) ||
                                    (battleContext?.opponentPicks || []).includes(pokemon.id);
                                const isCurrentlySelected = selectedPokemonId === pokemon.id;
                                const canPick = pokemon?.canPick !== false; // Default to true if not specified

                                // Get rarity config first
                                const getRarityConfig = () => {
                                    const config: Record<string, { label: string; color: string; borderColor: string; stars: number; icon?: any }> = {
                                        COMMON: { label: "Common", color: "#94a3b8", borderColor: "#94a3b89e", stars: 1 },
                                        UNCOMMON: { label: "Uncommon", color: "#34d399", borderColor: "#34d3999e", stars: 2 },
                                        RARE: { label: "Rare", color: "#3b82f6", borderColor: "#3b82f69e", stars: 3 },
                                        EPIC: { label: "Epic", color: "#8b5cf6", borderColor: "#8b5cf69e", stars: 4, icon: Sparkles },
                                        LEGENDARY: { label: "Legendary", color: "#facc15", borderColor: "#facc159e", stars: 5, icon: Star },
                                    };
                                    return config[pokemon.rarity] || config.COMMON;
                                };

                                const rarityConfig = getRarityConfig();
                                const isEpicOrLegendary = pokemon.rarity === "EPIC" || pokemon.rarity === "LEGENDARY";

                                // Get rarity colors
                                const getRarityColors = (): string[] => {
                                    const rarityMap: Record<string, string[]> = {
                                        COMMON: ["rgba(248, 250, 252, 0.1)", "rgba(226, 232, 240, 0.15)", "rgba(203, 213, 225, 0.2)"],
                                        UNCOMMON: ["rgba(236, 253, 245, 0.15)", "rgba(167, 243, 208, 0.2)", "rgba(110, 231, 183, 0.25)"],
                                        RARE: ["rgba(239, 246, 255, 0.15)", "rgba(147, 197, 253, 0.2)", "rgba(96, 165, 250, 0.25)"],
                                        EPIC: ["rgba(250, 245, 255, 0.2)", "rgba(196, 181, 253, 0.25)", "rgba(167, 139, 250, 0.3)"],
                                        LEGENDARY: ["rgba(254, 252, 232, 0.25)", "rgba(254, 240, 138, 0.3)", "rgba(253, 224, 71, 0.35)"],
                                    };
                                    return rarityMap[pokemon.rarity] || rarityMap.COMMON;
                                };

                                // Get border color based on state
                                const getBorderColor = () => {
                                    if (isSelected) return "border-red-500/60";
                                    if (isCurrentlySelected) return "border-green-400 border-2";
                                    if (canPick) return "border-cyan-400/50";
                                    return "border-white/20";
                                };

                                // Get shadow color based on state and rarity
                                const getShadowStyle = () => {
                                    const rarityShadowColor = rarityConfig.color;

                                    if (isCurrentlySelected) {
                                        return {
                                            shadowColor: "#22d3ee",
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 12,
                                            elevation: 8,
                                        };
                                    }
                                    if (isEpicOrLegendary) {
                                        return {
                                            shadowColor: rarityShadowColor,
                                            shadowOffset: { width: 0, height: 3 },
                                            shadowOpacity: 0.6,
                                            shadowRadius: 10,
                                            elevation: 6,
                                        };
                                    }
                                    if (canPick && !isSelected) {
                                        return {
                                            shadowColor: "#06b6d4",
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.3,
                                            shadowRadius: 8,
                                            elevation: 4,
                                        };
                                    }
                                    return {
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    };
                                };

                                return (
                                    <HapticPressable
                                        key={pokemon.id}
                                        onPress={() => handlePickPokemon(pokemon.id)}
                                        disabled={isSelected || !canPick}
                                        className="relative"
                                        style={getShadowStyle()}
                                    >
                                        <View
                                            className={`w-32 h-44 rounded-3xl overflow-hidden ${getBorderColor()} ${isSelected ? "opacity-50" : "opacity-100"
                                                } ${isCurrentlySelected ? "scale-105" : "scale-100"}`}
                                            style={{
                                                borderWidth: isCurrentlySelected ? 2 : isEpicOrLegendary ? 2 : 1,
                                                borderColor: isCurrentlySelected
                                                    ? undefined
                                                    : isEpicOrLegendary
                                                        ? rarityConfig.borderColor
                                                        : undefined,
                                            }}
                                        >
                                            {/* Rarity gradient background */}
                                            <TWLinearGradient
                                                colors={getRarityColors() as any}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                                style={{ ...StyleSheet.absoluteFillObject, borderRadius: 24 }}
                                            />

                                            {/* Dark overlay for better contrast */}
                                            <TWLinearGradient
                                                colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.7)"]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 0, y: 1 }}
                                                style={{ ...StyleSheet.absoluteFillObject, borderRadius: 24 }}
                                            />

                                            {/* Rarity badge */}
                                            <View className="absolute top-1.5 left-1.5 z-20">
                                                <View
                                                    className="px-2 py-0.5 rounded-full flex-row items-center gap-1"
                                                    style={{
                                                        backgroundColor: `${rarityConfig.color}20`,
                                                        borderWidth: 1,
                                                        borderColor: rarityConfig.color,
                                                    }}
                                                >
                                                    {rarityConfig.icon && (
                                                        React.createElement(rarityConfig.icon, {
                                                            size: 10,
                                                            color: rarityConfig.color,
                                                            fill: rarityConfig.color,
                                                        })
                                                    )}
                                                    <ThemedText
                                                        style={{
                                                            color: rarityConfig.color,
                                                            fontSize: 8,
                                                            fontWeight: "800",
                                                            textTransform: "uppercase",
                                                            letterSpacing: 0.5,
                                                        }}
                                                    >
                                                        {rarityConfig.label.slice(0, 3)}
                                                    </ThemedText>
                                                </View>
                                            </View>

                                            {/* Rarity stars */}
                                            <View className="absolute top-1.5 right-1.5 z-20 flex-row gap-0.5">
                                                {Array.from({ length: rarityConfig.stars }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={8}
                                                        color={rarityConfig.color}
                                                        fill={rarityConfig.color}
                                                    />
                                                ))}
                                            </View>

                                            {/* Type badges */}
                                            <View className="absolute top-10 left-2 right-2 flex-row gap-1 flex-wrap z-10">
                                                {(pokemon.types || []).slice(0, 2).map((type: IPokemonType) => (
                                                    <TypeBadge key={type.id} type={type.type_name} />
                                                ))}
                                            </View>

                                            {/* Selected indicator */}
                                            {isCurrentlySelected && (
                                                <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1.5 z-10" style={{ shadowColor: "#22c55e", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 }}>
                                                    <Check size={14} color="#ffffff" strokeWidth={3} />
                                                </View>
                                            )}

                                            {/* Pokemon image */}
                                            <View className="flex-1 items-center justify-center pt-6 pb-2">
                                                <View className="bg-white/5 rounded-full p-3" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 }}>
                                                    <Image
                                                        source={{ uri: pokemon.imageUrl }}
                                                        style={{ width: 80, height: 80 }}
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                            </View>

                                            {/* Pokemon name and info */}
                                            <View className="px-3 pb-3 pt-1">
                                                <ThemedText
                                                    numberOfLines={1}
                                                    style={{
                                                        color: "#ffffff",
                                                        fontSize: 12,
                                                        fontWeight: "800",
                                                        textAlign: "center",
                                                        textShadowColor: "rgba(0, 0, 0, 0.75)",
                                                        textShadowOffset: { width: 0, height: 1 },
                                                        textShadowRadius: 3,
                                                        letterSpacing: 0.5,
                                                    }}
                                                >
                                                    {getPokemonName(pokemon)}
                                                </ThemedText>
                                                {pokemon.pokedex_number && (
                                                    <ThemedText
                                                        style={{
                                                            color: "#cbd5e1",
                                                            fontSize: 10,
                                                            fontWeight: "600",
                                                            textAlign: "center",
                                                            marginTop: 2,
                                                            opacity: 0.8,
                                                        }}
                                                    >
                                                        #{String(pokemon.pokedex_number).padStart(3, "0")}
                                                    </ThemedText>
                                                )}
                                            </View>

                                            {/* Disabled overlay */}
                                            {(isSelected || !canPick) && (
                                                <View className="absolute inset-0 bg-black/60 rounded-3xl items-center justify-center">
                                                    {isSelected && (
                                                        <View className="bg-red-500/80 px-3 py-1 rounded-full">
                                                            <ThemedText style={{ color: "#ffffff", fontSize: 10, fontWeight: "700" }}>
                                                                Đã chọn
                                                            </ThemedText>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </HapticPressable>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            </ImageBackground>
        </ThemedView>
    );
}