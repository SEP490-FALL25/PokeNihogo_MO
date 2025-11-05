import { RarityBackground } from "@components/atoms/RarityBackground";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import TypeBadge from "@components/atoms/TypeBadge";
import UserAvatar from "@components/atoms/UserAvatar";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import useOwnedPokemons from "@hooks/useOwnedPokemons";
import { IBattleDraftState, IBattleMatch } from "@models/battle/battle.types";
import { IPokemonType } from "@models/pokemon/pokemon.common";
import { IUserPokemon } from "@models/user-pokemon/user-pokemon.common";
import battleService from "@services/battle";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Clock } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, Animated, Image, ImageBackground, ScrollView, StyleSheet, View } from "react-native";

//TODO: Sáng làm
export default function BattleDraftScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const matchId = params.matchId as string;
    const opponentName = params.opponentName as string;

    const match: IBattleMatch = {
        id: matchId,
        playerId: 1,
        opponentId: 2,
        playerName: "You",
        opponentName,
        playerAvatar: undefined,
        opponentAvatar: undefined,
        status: "draft",
        createdAt: new Date().toISOString(),
    };
    const { ownedPokemons, isLoading } = useOwnedPokemons();
    const [draftState, setDraftState] = React.useState<IBattleDraftState | null>(null);
    const [isLoadingDraft, setIsLoadingDraft] = React.useState(true);
    const [selectedPokemonId, setSelectedPokemonId] = React.useState<number | null>(null);
    const [currentTypeFilter, setCurrentTypeFilter] = React.useState<string | null>(null);
    const [showOpponentPicks, setShowOpponentPicks] = React.useState<boolean[]>([]);

    // Initialize draft state
    React.useEffect(() => {
        const initializeDraft = async () => {
            try {
                const state = await battleService.acceptMatch(matchId);
                setDraftState(state);
                setIsLoadingDraft(false);
            } catch (error) {
                Alert.alert("Lỗi", "Không thể khởi tạo trận đấu");
                router.back();
            }
        };

        if (matchId) {
            initializeDraft();
        }
    }, [matchId, router]);

    // Picking turn logic: Alternate between player and opponent
    const getTurnPicker = (turn: number): "player" | "opponent" => {
        // Turn 1: player, Turn 2: opponent, Turn 3: player, Turn 4: opponent, Turn 5: player
        return turn % 2 === 1 ? "player" : "opponent";
    };

    const isPlayerTurn = draftState && getTurnPicker(draftState.currentTurn) === "player";
    const isOpponentTurn = draftState && getTurnPicker(draftState.currentTurn) === "opponent";

    // Group Pokemon by type
    const pokemonByType = React.useMemo(() => {
        if (!ownedPokemons || !Array.isArray(ownedPokemons)) return {};
        const grouped: Record<string, typeof ownedPokemons> = {};
        ownedPokemons.forEach((pokemon) => {
            pokemon.pokemon.types.forEach((type: IPokemonType) => {
                if (!grouped[type.type_name]) {
                    grouped[type.type_name] = [];
                }
                grouped[type.type_name].push(pokemon);
            });
        });
        return grouped;
    }, [ownedPokemons]);

    // Get unique types
    const availableTypes = React.useMemo(() => {
        return Object.keys(pokemonByType);
    }, [pokemonByType]);

    // Get Pokemon to display based on type filter
    const displayPokemons = React.useMemo(() => {
        if (!ownedPokemons || !Array.isArray(ownedPokemons)) return [];
        if (!currentTypeFilter) return ownedPokemons;
        return pokemonByType[currentTypeFilter] || [];
    }, [ownedPokemons, currentTypeFilter, pokemonByType]);

    // Helper to get Pokemon by ID
    const getPokemonById = (pokemonId: number) => {
        return ownedPokemons?.find((up: IUserPokemon) => up.pokemon.id === pokemonId)?.pokemon;
    };

    // Handle Pokemon pick
    const handlePickPokemon = async (pokemonId: number) => {
        if (!draftState || !isPlayerTurn) return;

        setSelectedPokemonId(pokemonId);

        try {
            const updatedState = await battleService.submitDraftPick(
                matchId,
                pokemonId,
                draftState.currentTurn,
                true // isPlayerPick
            );
            setDraftState(updatedState);
            setSelectedPokemonId(null);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể chọn Pokemon");
            setSelectedPokemonId(null);
        }
    };

    // Simulate opponent pick for demo
    React.useEffect(() => {
        if (!draftState || !isOpponentTurn || !displayPokemons.length) return;

        const timer = setTimeout(async () => {
            // Simulate opponent picking
            const randomPokemon = displayPokemons[Math.floor(Math.random() * displayPokemons.length)];
            if (randomPokemon) {
                const updatedState = await battleService.submitDraftPick(
                    matchId,
                    randomPokemon.pokemon.id,
                    draftState.currentTurn,
                    false // isPlayerPick
                );
                setDraftState(updatedState);

                // Check if draft is complete after opponent pick
                if (updatedState.isComplete || updatedState.currentTurn > 6) {
                    setTimeout(() => {
                        router.push({
                            pathname: "/(app)/(battle)/arena",
                            params: { matchId },
                        });
                    }, 2000);
                }
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [draftState, isOpponentTurn, matchId, displayPokemons, router]);


    if (isLoadingDraft) {
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
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#22d3ee" />
                        <ThemedText style={{ color: "#93c5fd", marginTop: 16, fontSize: 16 }}>
                            Đang khởi tạo trận đấu...
                        </ThemedText>
                    </View>
                </ImageBackground>
            </ThemedView>
        );
    }

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

                {/* Header */}
                <View className="px-5 pt-16 pb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <ThemedText style={{ color: "#fbbf24", fontSize: 20, fontWeight: "800" }}>
                            PICK PHASE
                        </ThemedText>
                        <View className="flex-row items-center gap-2">
                            <Clock size={16} color="#22d3ee" />
                            <ThemedText style={{ color: "#cbd5e1", fontSize: 14 }}>
                                Lượt {draftState?.currentTurn || 0}/6
                            </ThemedText>
                        </View>
                    </View>

                    {/* Opponent vs Player */}
                    <View className="flex-row items-center justify-between">
                        {/* Opponent */}
                        <View className="items-center flex-1">
                            <UserAvatar name={match.opponentName} size="large" />
                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                {match.opponentName}
                            </ThemedText>
                            {isOpponentTurn && (
                                <View className="mt-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40">
                                    <ThemedText style={{ color: "#fca5a5", fontSize: 11, fontWeight: "700" }}>
                                        ĐANG PICK...
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
                            <View className="px-4 py-2 rounded-full bg-black/70">
                                <ThemedText style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>VS</ThemedText>
                            </View>
                        </TWLinearGradient>

                        {/* Player */}
                        <View className="items-center flex-1">
                            <UserAvatar name={match.playerName} size="large" />
                            <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                Bạn
                            </ThemedText>
                            {isPlayerTurn && (
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
                                Đối thủ ({match.opponentName})
                            </ThemedText>
                            <View className="flex-row flex-wrap gap-2">
                                {[0, 1, 2].map((idx) => (
                                    <View key={idx} className="w-16 h-16 rounded-xl border border-white/20 bg-black/40">
                                        {draftState && draftState.opponentPicks[idx] ? (
                                            <View className="flex-1 items-center justify-center">
                                                {getPokemonById(draftState.opponentPicks[idx]) && (
                                                    <Image
                                                        source={{ uri: getPokemonById(draftState.opponentPicks[idx])!.imageUrl }}
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
                                        {draftState && draftState.playerPicks[idx] ? (
                                            <View className="flex-1 items-center justify-center">
                                                {getPokemonById(draftState.playerPicks[idx]) && (
                                                    <Image
                                                        source={{ uri: getPokemonById(draftState.playerPicks[idx])!.imageUrl }}
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
                    {isLoading || !displayPokemons || displayPokemons.length === 0 ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#22d3ee" />
                            <ThemedText style={{ color: "#64748b", marginTop: 16, fontSize: 14 }}>
                                {isLoading ? "Đang tải Pokemon..." : "Không có Pokemon nào"}
                            </ThemedText>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap gap-3 pb-8">
                            {displayPokemons.map((userPokemon) => {
                                const pokemon = userPokemon.pokemon;
                                const isSelected =
                                    draftState?.playerPicks.includes(pokemon.id) ||
                                    draftState?.opponentPicks.includes(pokemon.id);
                                const isCurrentlySelected = selectedPokemonId === pokemon.id;

                                return (
                                    <HapticPressable
                                        key={userPokemon.id}
                                        onPress={() => handlePickPokemon(pokemon.id)}
                                        disabled={!isPlayerTurn || isSelected}
                                        className="relative"
                                    >
                                        <RarityBackground rarity={pokemon.rarity} className="rounded-2xl overflow-hidden">
                                            <View
                                                className={`w-24 h-32 border-2 rounded-2xl overflow-hidden ${isSelected
                                                    ? "border-red-500 opacity-50"
                                                    : isCurrentlySelected
                                                        ? "border-green-500"
                                                        : isPlayerTurn
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
});

