import { RarityBackground } from "@components/atoms/RarityBackground";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import TypeBadge from "@components/atoms/TypeBadge";
import UserAvatar from "@components/atoms/UserAvatar";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import useAuth from "@hooks/useAuth";
import { useListMatchRound, useListUserPokemonRound } from "@hooks/useBattle";
import { useListElemental } from "@hooks/useElemental";
import { IBattleMatchRound } from "@models/battle/battle.response";
import { IPokemonType } from "@models/pokemon/pokemon.common";
import { ROUTES } from "@routes/routes";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Clock } from "lucide-react-native";
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


    if (!matchId) {
        router.replace(ROUTES.TABS.BATTLE);
        return;
    }


    /**
     * List elemental
     */
    const { data: listElemental, isLoading: isLoadingListElemental } = useListElemental();
    console.log("listElemental", listElemental);
    //------------------------End------------------------//


    /**
     * Hooks
     */
    const { user } = useAuth();
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


    const [typeId, setTypeId] = useState<number>(1);
    const { data: listUserPokemonRound, isLoading: isLoadingListUserPokemonRound } = useListUserPokemonRound(typeId);
    console.log("listUserPokemonRound", listUserPokemonRound);

    const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
    const [currentTypeFilter, setCurrentTypeFilter] = useState<string | null>(null);


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
                // First picker by orderSelected === 1
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

    // Group Pokemon by type (from round list)
    const pokemonByType = useMemo(() => {
        const src: any[] = Array.isArray(listUserPokemonRound) ? (listUserPokemonRound as any[]) : [];
        const grouped: Record<string, any[]> = {};
        src.forEach((item: any) => {
            (item?.pokemon?.types || []).forEach((type: IPokemonType) => {
                if (!grouped[type.type_name]) grouped[type.type_name] = [];
                grouped[type.type_name].push(item);
            });
        });
        return grouped;
    }, [listUserPokemonRound]);

    // Get unique types
    const availableTypes = useMemo(() => Object.keys(pokemonByType), [pokemonByType]);

    // Get Pokemon to display based on type filter
    const displayPokemons = useMemo(() => {
        const src: any[] = Array.isArray(listUserPokemonRound) ? (listUserPokemonRound as any[]) : [];
        if (!currentTypeFilter) return src;
        return pokemonByType[currentTypeFilter] || [];
    }, [listUserPokemonRound, currentTypeFilter, pokemonByType]);

    // Helper to get Pokemon by ID
    const getPokemonById = (pokemonId: number) => {
        const src: any[] = Array.isArray(listUserPokemonRound) ? (listUserPokemonRound as any[]) : [];
        return src.find((up: any) => up?.pokemon?.id === pokemonId)?.pokemon;
    };

    // Handle Pokemon pick (pending backend integration)
    const handlePickPokemon = async (pokemonId: number) => {
        if (!battleContext?.isPlayerTurn) return;
        setSelectedPokemonId(pokemonId);
        Alert.alert("Thông báo", "Chức năng chọn Pokemon sẽ sớm được kích hoạt.");
        setSelectedPokemonId(null);
    };

    // No simulated opponent pick; live data comes from matchRound


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
                            {(listElemental || []).map((elem: any) => (
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
                                        {(elem?.nameTranslations?.vi || elem?.name || elem?.type_name || "Elemental")}
                                    </ThemedText>
                                </HapticPressable>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Type Filter */}
                <View className="px-5 mb-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-2">
                            <HapticPressable
                                onPress={() => setCurrentTypeFilter(null)}
                                className={`px-4 py-2 rounded-full border ${currentTypeFilter === null
                                    ? "border-cyan-400 bg-cyan-500/20"
                                    : "border-white/20 bg-white/5"
                                    }`}
                            >
                                <ThemedText
                                    style={{
                                        color: currentTypeFilter === null ? "#22d3ee" : "#cbd5e1",
                                        fontSize: 13,
                                        fontWeight: "600",
                                    }}
                                >
                                    Tất cả
                                </ThemedText>
                            </HapticPressable>
                            {availableTypes.map((type) => (
                                <HapticPressable
                                    key={type}
                                    onPress={() => setCurrentTypeFilter(type)}
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

                {/* Pokemon List */}
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {isLoadingListUserPokemonRound || !displayPokemons || displayPokemons.length === 0 ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#22d3ee" />
                            <ThemedText style={{ color: "#64748b", marginTop: 16, fontSize: 14 }}>
                                {isLoadingListUserPokemonRound ? "Đang tải Pokemon..." : "Không có Pokemon nào"}
                            </ThemedText>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap gap-3 pb-8">
                            {displayPokemons.map((userPokemon: any) => {
                                const pokemon = userPokemon.pokemon as any;
                                const isSelected =
                                    (battleContext?.playerPicks || []).includes(pokemon.id) ||
                                    (battleContext?.opponentPicks || []).includes(pokemon.id);
                                const isCurrentlySelected = selectedPokemonId === pokemon.id;

                                return (
                                    <HapticPressable
                                        key={userPokemon.id}
                                        onPress={() => handlePickPokemon(pokemon.id)}
                                        disabled={!battleContext?.isPlayerTurn || isSelected}
                                        className="relative"
                                    >
                                        <RarityBackground rarity={pokemon.rarity} className="rounded-2xl overflow-hidden">
                                            <View
                                                className={`w-24 h-32 border-2 rounded-2xl overflow-hidden ${isSelected
                                                    ? "border-red-500 opacity-50"
                                                    : isCurrentlySelected
                                                        ? "border-green-500"
                                                        : battleContext?.isPlayerTurn
                                                            ? "border-cyan-400"
                                                            : "border-white/20"
                                                    }`}
                                            >
                                                <View className="relative flex-1 bg-black/40">
                                                    <View className="absolute top-1 left-1 right-1 flex-row gap-1 flex-wrap">
                                                        {pokemon.types.map((type: IPokemonType) => (
                                                            <TypeBadge key={type.id} type={type.type_name} />
                                                        ))}
                                                    </View>
                                                    <View className="flex-1 items-center justify-center pt-2">
                                                        <Image
                                                            source={{ uri: pokemon.imageUrl }}
                                                            style={{ width: 60, height: 60 }}
                                                            resizeMode="contain"
                                                        />
                                                    </View>
                                                    <View className="px-2 pb-1">
                                                        <ThemedText
                                                            numberOfLines={1}
                                                            style={{
                                                                color: "#ffffff",
                                                                fontSize: 10,
                                                                fontWeight: "700",
                                                                textAlign: "center",
                                                            }}
                                                        >
                                                            {pokemon.nameTranslations.vi || pokemon.nameJp}
                                                        </ThemedText>
                                                    </View>
                                                </View>
                                            </View>
                                        </RarityBackground>
                                        {isCurrentlySelected && (
                                            <View className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                                <Check size={16} color="#ffffff" />
                                            </View>
                                        )}
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


