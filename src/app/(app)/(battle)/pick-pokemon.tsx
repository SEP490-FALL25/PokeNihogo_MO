import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import TypeBadge from "@components/atoms/TypeBadge";
import UserAvatar from "@components/atoms/UserAvatar";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import useAuth from "@hooks/useAuth";
import { useChoosePokemon, useListMatchRound, useListUserPokemonRound } from "@hooks/useBattle";
import { useListElemental } from "@hooks/useElemental";
import { IBattleMatchRound } from "@models/battle/battle.response";
import { IElementalEntity } from "@models/elemental/elemental.entity";
import { IPokemonType } from "@models/pokemon/pokemon.common";
import { useGlobalStore } from "@stores/global/global.config";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Clock, Sparkles, Star } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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


    // if (!matchId) {
    //     router.replace(ROUTES.TABS.BATTLE);
    //     return;
    // }


    /**
     * List elemental
     */
    const { data: listElemental, isLoading: isLoadingListElemental } = useListElemental();
    //------------------------End------------------------//


    /**
     * Hooks
     */
    const { user } = useAuth();
    const language = useGlobalStore((s) => s.language);
    const { data: matchRound, isLoading: isLoadingMatchRound } = useListMatchRound() as { data: IBattleMatchRound; isLoading: boolean };

    const currentUserId = user?.data?.id as number | undefined;
    const opponentName = useMemo(() => {
        const opponent = matchRound?.match?.participants?.find((p) => {
            if (currentUserId !== undefined) return p.user.id !== currentUserId;
            return p.user.name !== "Bạn";
        });
        return opponent?.user.name || "";
    }, [matchRound, currentUserId]);

    //---------------End---------------//


    /**
     * List user pokemon round
     * @param typeId Type ID
     */
    const [typeId, setTypeId] = useState<number>(1);
    const { data: listUserPokemonRound, isLoading: isLoadingListUserPokemonRound } = useListUserPokemonRound(typeId);
    console.log("listUserPokemonRound", listUserPokemonRound);

    //------------------------End------------------------//


    const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
    const [currentTypeFilter, setCurrentTypeFilter] = useState<string | null>(null);

    // Choose Pokemon mutation
    const choosePokemonMutation = useChoosePokemon();


    // Derive battle participant mapping (player/opponent) from matchRound and params
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

        // Determine current round index
        const currentRoundIndex = matchRound.rounds.findIndex((r) => r.status === "SELECTING_POKEMON" || r.status === "PENDING");
        const safeCurrentRoundIndex = currentRoundIndex === -1 ? 2 : currentRoundIndex;

        // Determine turn based on orderSelected and whether already selected
        const currentRound = matchRound.rounds[safeCurrentRoundIndex];
        const currentPlayer = currentRound?.participants.find((rp) => rp.matchParticipantId === playerMatchParticipantId);
        const currentOpponent = currentRound?.participants.find((rp) => rp.matchParticipantId === opponentMatchParticipantId);

        let isPlayerTurn = false;
        let isOpponentTurn = false;

        if (currentRound?.status === "SELECTING_POKEMON") {
            const playerHasPicked = !!currentPlayer?.selectedUserPokemonId;
            const opponentHasPicked = !!currentOpponent?.selectedUserPokemonId;
            if (!playerHasPicked && !opponentHasPicked) {
                if (currentPlayer?.orderSelected === 1) isPlayerTurn = true;
                if (currentOpponent?.orderSelected === 1) isOpponentTurn = true;
            } else if (!playerHasPicked && opponentHasPicked) {
                isPlayerTurn = true;
            } else if (playerHasPicked && !opponentHasPicked) {
                isOpponentTurn = true;
            }
        }

        // Determine current picker and deadline
        const currentPicker: "player" | "opponent" | null = isPlayerTurn ? "player" : isOpponentTurn ? "opponent" : null;
        const pickDeadline = (() => {
            if (currentRound?.status === "SELECTING_POKEMON") {
                if (currentPicker === "player") return currentPlayer?.endTimeSelected || null;
                if (currentPicker === "opponent") return currentOpponent?.endTimeSelected || null;
            }
            return null; // only rely on endTimeSelected per requirement
        })();

        // Build picks arrays for UI display (length 3)
        const playerPicks: Array<number | null> = [null, null, null];
        const opponentPicks: Array<number | null> = [null, null, null];
        matchRound.rounds.forEach((round, idx) => {
            const rpPlayer = round.participants.find((rp) => rp.matchParticipantId === playerMatchParticipantId);
            const rpOpponent = round.participants.find((rp) => rp.matchParticipantId === opponentMatchParticipantId);
            playerPicks[idx] = rpPlayer?.selectedUserPokemon?.pokemon?.id ?? null;
            opponentPicks[idx] = rpOpponent?.selectedUserPokemon?.pokemon?.id ?? null;
        });

        return {
            playerMatchParticipantId,
            opponentMatchParticipantId,
            currentRoundIndex: safeCurrentRoundIndex,
            isPlayerTurn,
            isOpponentTurn,
            currentPicker,
            pickDeadline,
            playerPicks,
            opponentPicks,
        };
    }, [matchRound, currentUserId]);

    // Countdown for current picker
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

    useEffect(() => {
        if (!battleContext?.pickDeadline) {
            setRemainingSeconds(null);
            return;
        }
        const compute = () => {
            const endTs = new Date(battleContext.pickDeadline as string).getTime();
            const now = Date.now();
            const secs = Math.max(0, Math.floor((endTs - now) / 1000));
            setRemainingSeconds(Number.isFinite(secs) ? secs : null);
        };
        compute();
        const interval = setInterval(compute, 1000);
        return () => clearInterval(interval);
    }, [battleContext?.pickDeadline]);

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

    // Get Pokemon to display based on type filter - memoized for >100 items
    const displayPokemons = useMemo(() => {
        if (!currentTypeFilter) return roundList;
        return pokemonByType[currentTypeFilter] || [];
    }, [roundList, currentTypeFilter, pokemonByType]);

    // Get current elemental name by typeId
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

    // Helper to get Pokemon by ID
    const getPokemonById = (pokemonId: number) => {
        return roundList.find((pokemon: any) => pokemon?.id === pokemonId);
    };

    // Helper to get Pokemon name based on language
    const getPokemonName = (pokemon: any) => {
        if (!pokemon) return "";
        if (language === "ja") {
            return pokemon.nameTranslations?.ja || pokemon.nameJp || "";
        }
        // For vi or en, use English name
        return pokemon.nameTranslations?.en || pokemon.nameJp || "";
    };

    // Handle Pokemon pick - allow selection anytime for preview
    const handlePickPokemon = (pokemonId: number) => {
        // Check if Pokemon is already selected by player or opponent
        const isSelected =
            (battleContext?.playerPicks || []).includes(pokemonId) ||
            (battleContext?.opponentPicks || []).includes(pokemonId);

        // Don't allow selecting already picked Pokemon
        if (isSelected) return;

        setSelectedPokemonId(pokemonId);
    };

    // Handle choose Pokemon
    const handleChoosePokemon = async () => {
        if (!selectedPokemonId || !matchRound?.match?.id) return;

        try {
            await choosePokemonMutation.mutateAsync({
                matchId: matchRound.match.id,
                pokemonId: selectedPokemonId,
            });
            setSelectedPokemonId(null);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể chọn Pokemon. Vui lòng thử lại.");
        }
    };



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
                                Round {(battleContext?.currentRoundIndex ?? 0) + 1}/3
                            </ThemedText>
                        </View>
                    </View>

                    {/* Opponent vs Player */}
                    <View className="flex-row items-center justify-between">
                        {/* Opponent */}
                        <View className="items-center flex-1">
                            <UserAvatar name={matchRound?.match.participants.find((p) => p.user.name === opponentName)?.user.name ?? ""} size="large" />
                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                {matchRound?.match.participants.find((p) => p.user.name === opponentName)?.user.name ?? ""}
                            </ThemedText>
                            {battleContext?.isOpponentTurn && (
                                <View className="mt-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                                    <ThemedText style={{ color: "#fca5a5", fontSize: 11, fontWeight: "700" }}>
                                        ĐANG PICK
                                    </ThemedText>
                                </View>
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
                                <ThemedText style={{ color: "#ffffff", fontWeight: "800", fontSize: 18 }}>
                                    {formatTime(remainingSeconds)}
                                </ThemedText>
                                <ThemedText style={{ color: "#cbd5e1", fontWeight: "700", fontSize: 10, opacity: 0.85 }}>
                                    VS
                                </ThemedText>
                            </View>
                        </TWLinearGradient>

                        {/* Player */}
                        <View className="items-center flex-1">
                            <UserAvatar name={"Bạn"} size="large" />
                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                Bạn
                            </ThemedText>
                            {battleContext?.isPlayerTurn && (
                                <View className="mt-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40">
                                    <ThemedText style={{ color: "#86efac", fontSize: 11, fontWeight: "700" }}>
                                        CHỌN NGAY
                                    </ThemedText>
                                </View>
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
                                {[0, 1, 2].map((idx) => (
                                    <View key={idx} className="w-16 h-16 rounded-xl border border-white/20 bg-black/40">
                                        {battleContext && battleContext.opponentPicks[idx] ? (
                                            <View className="flex-1 items-center justify-center">
                                                {getPokemonById(battleContext.opponentPicks[idx]!) && (
                                                    <Image
                                                        source={{ uri: getPokemonById(battleContext.opponentPicks[idx]!)!.imageUrl }}
                                                        style={{ width: 48, height: 48 }}
                                                        resizeMode="contain"
                                                    />
                                                )}
                                            </View>
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <Animated.View style={{ opacity: 0.3 }}>
                                                    <Clock size={24} color="#64748b" />
                                                </Animated.View>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Player Picks */}
                        <View className="flex-1">
                            <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>
                                Bạn
                            </ThemedText>
                            <View className="flex-row flex-wrap gap-2">
                                {[0, 1, 2].map((idx) => (
                                    <View key={idx} className="w-16 h-16 rounded-xl border border-white/20 bg-black/40">
                                        {battleContext && battleContext.playerPicks[idx] ? (
                                            <View className="flex-1 items-center justify-center">
                                                {getPokemonById(battleContext.playerPicks[idx]!) && (
                                                    <Image
                                                        source={{ uri: getPokemonById(battleContext.playerPicks[idx]!)!.imageUrl }}
                                                        style={{ width: 48, height: 48 }}
                                                        resizeMode="contain"
                                                    />
                                                )}
                                            </View>
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <Animated.View style={{ opacity: 0.3 }}>
                                                    <Clock size={24} color="#64748b" />
                                                </Animated.View>
                                            </View>
                                        )}
                                    </View>
                                ))}
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


