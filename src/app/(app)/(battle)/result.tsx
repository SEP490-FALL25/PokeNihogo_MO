import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ImageBackground, StyleSheet, View } from "react-native";
import { useMatchingStore } from "@stores/matching/matching.config";

export default function BattleResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const matchIdParam = params.matchId as string | undefined;
    const lastResult = useMatchingStore((s) => (s as any).lastMatchResult);
    const clearLast = useMatchingStore((s) => (s as any).clearLastMatchResult);

    const { player, opponent, playerTotal, opponentTotal, winnerId, playerName, opponentName } = useMemo(() => {
        const res: any = {
            player: null,
            opponent: null,
            playerTotal: 0,
            opponentTotal: 0,
            winnerId: lastResult?.match?.winnerId ?? null,
            playerName: "Bạn",
            opponentName: "Đối thủ",
        };
        if (!lastResult?.match || !lastResult?.rounds) return res;

        // Identify users from participants (top-level participants in match)
        const participants = lastResult.match.participants || [];
        // Try to detect current user by comparing matchIdParam with store currentMatchId is not enough; fallback order of participants
        const [p1, p2] = participants;
        res.player = p1;
        res.opponent = p2;
        res.playerName = p1?.user?.name || p1?.user?.email || "Người chơi 1";
        res.opponentName = p2?.user?.name || p2?.user?.email || "Người chơi 2";

        // Sum points from rounds.participants where matchParticipantId matches p1.id or p2.id
        for (const r of lastResult.rounds) {
            for (const rp of r.participants || []) {
                if (rp.matchParticipantId === p1?.id) res.playerTotal += rp.points || 0;
                if (rp.matchParticipantId === p2?.id) res.opponentTotal += rp.points || 0;
            }
        }

        return res;
    }, [lastResult, matchIdParam]);

    const handleBack = () => {
        try { clearLast(); } catch { }
        router.replace("/(app)");
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

                <View className="px-5 pt-16 pb-6">
                    <View className="items-center mb-4">
                        <ThemedText style={{ color: "#fbbf24", fontSize: 20, fontWeight: "800" }}>
                            KẾT QUẢ TRẬN ĐẤU
                        </ThemedText>
                        <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                            Match #{matchIdParam || lastResult?.match?.id}
                        </ThemedText>
                    </View>

                    <View className="bg-black/40 rounded-2xl p-6">
                        {/* Opponent block */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                {lastResult?.opponent?.selectedUserPokemon?.pokemon?.imageUrl ? (
                                    <Image
                                        source={{ uri: lastResult.opponent.selectedUserPokemon.pokemon.imageUrl }}
                                        style={{ width: 48, height: 48 }}
                                        resizeMode="contain"
                                    />
                                ) : null}
                                <View className="ml-3">
                                    <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 16 }}>
                                        {opponentName}
                                    </ThemedText>
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>
                                        Tổng điểm
                                    </ThemedText>
                                </View>
                            </View>
                            <ThemedText style={{ color: "#ef4444", fontSize: 24, fontWeight: "900" }}>
                                {opponentTotal}
                            </ThemedText>
                        </View>

                        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 8 }} />

                        {/* Player block */}
                        <View className="flex-row items-center justify-between mt-2">
                            <View className="flex-row items-center">
                                {lastResult?.participant?.selectedUserPokemon?.pokemon?.imageUrl ? (
                                    <Image
                                        source={{ uri: lastResult.participant.selectedUserPokemon.pokemon.imageUrl }}
                                        style={{ width: 48, height: 48 }}
                                        resizeMode="contain"
                                    />
                                ) : null}
                                <View className="ml-3">
                                    <ThemedText style={{ color: "#e5e7eb", fontWeight: "700", fontSize: 16 }}>
                                        {playerName}
                                    </ThemedText>
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>
                                        Tổng điểm
                                    </ThemedText>
                                </View>
                            </View>
                            <ThemedText style={{ color: "#22c55e", fontSize: 24, fontWeight: "900" }}>
                                {playerTotal}
                            </ThemedText>
                        </View>

                        <View className="items-center mt-6">
                            <TWLinearGradient
                                colors={winnerId && lastResult?.match?.participants?.find((p: any) => p.userId === winnerId) ? ["#22c55e", "#16a34a"] : ["#64748b", "#475569"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 }}
                            >
                                <ThemedText style={{ color: "#ffffff", fontWeight: "800" }}>
                                    {winnerId ? "Kết thúc trận đấu" : "Tổng kết"}
                                </ThemedText>
                            </TWLinearGradient>

                            <View className="mt-3">
                                <ThemedText onPress={handleBack} style={{ color: "#93c5fd", fontSize: 14, textDecorationLine: "underline" }}>
                                    Về trang chính
                                </ThemedText>
                            </View>
                        </View>
                    </View>
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
});


