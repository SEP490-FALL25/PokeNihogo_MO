import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import useAuth from "@hooks/useAuth";
import { ROUTES } from "@routes/routes";
import { useMatchingStore } from "@stores/matching/matching.config";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image, ImageBackground, Pressable, StyleSheet, View } from "react-native";

export default function BattleResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const matchIdParam = params.matchId as string | undefined;
    const lastResult = useMatchingStore((s) => (s as any).lastMatchResult);
    const clearLast = useMatchingStore((s) => (s as any).clearLastMatchResult);
    const { user } = useAuth();
    const currentUserId = user?.data?.id as number | undefined;
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const {
        me,
        foe,
        meTotal,
        foeTotal,
        meName,
        foeName,
        meAvatarUrl,
        foeAvatarUrl,
        winnerId,
        eloDeltaText,
        eloDeltaPositive,
        roundDetails,
        pointDiff,
    } = useMemo(() => {
        const result: any = {
            me: null,
            foe: null,
            meTotal: 0,
            foeTotal: 0,
            meName: t("battle.result.you"),
            foeName: t("battle.result.opponent"),
            meAvatarUrl: null,
            foeAvatarUrl: null,
            winnerId: lastResult?.match?.winnerId ?? null,
            eloDeltaText: "",
            eloDeltaPositive: true,
            roundDetails: [] as Array<{ label: string; me: number; foe: number; winnerUserId?: number | null }>,
            pointDiff: 0,
        };
        if (!lastResult?.match) return result;

        const participants = lastResult.match.participants || [];
        const rounds = lastResult.match.rounds || lastResult.rounds || []; // Support both structures

        // Find participants by userId (payload has participants[].userId directly)
        const meP = participants.find((p: any) => p.userId === currentUserId) || participants[0];
        const foeP = participants.find((p: any) => p.userId !== currentUserId && p.userId !== meP?.userId) || participants[1];
        result.me = meP;
        result.foe = foeP;
        result.meName = meP?.user?.name || meP?.user?.email || t("battle.result.you");
        result.foeName = foeP?.user?.name || foeP?.user?.email || t("battle.result.opponent");

        // Pick last selected pokémon avatars if available in last round snapshot-like data (if provided)
        // Otherwise show nothing; UI still works
        try {
            // try to find most recent selectedUserPokemon per side
            const allRoundParticipants = rounds.flatMap((r: any) => r.participants || []);
            const meRps = allRoundParticipants.filter((rp: any) => rp.matchParticipantId === meP?.id);
            const foeRps = allRoundParticipants.filter((rp: any) => rp.matchParticipantId === foeP?.id);
            const meLast = meRps[meRps.length - 1];
            const foeLast = foeRps[foeRps.length - 1];
            result.meAvatarUrl = meLast?.selectedUserPokemon?.pokemon?.imageUrl || null;
            result.foeAvatarUrl = foeLast?.selectedUserPokemon?.pokemon?.imageUrl || null;
        } catch { /* noop */ }

        // Sum points for each side from rounds[].participants[].points
        const roundOrder = (rn: string) => rn === "ONE" ? 1 : rn === "TWO" ? 2 : rn === "THREE" ? 3 : 999;
        const roundsSorted = [...rounds].sort((a: any, b: any) => roundOrder(a.roundNumber) - roundOrder(b.roundNumber));

        // Reset totals before summing
        result.meTotal = 0;
        result.foeTotal = 0;

        for (const r of roundsSorted) {
            let mePts = 0;
            let foePts = 0;
            // Iterate through round participants and sum points by matchParticipantId
            for (const rp of r.participants || []) {
                const pts = typeof rp.points === "number" ? rp.points : 0;
                if (rp.matchParticipantId === meP?.id) {
                    result.meTotal += pts;
                    mePts += pts;
                } else if (rp.matchParticipantId === foeP?.id) {
                    result.foeTotal += pts;
                    foePts += pts;
                }
            }
            // Get winner userId from roundWinner
            // Support multiple structures: roundWinner.userId, roundWinner.user.id, or roundWinnerId
            let roundWinnerUserId: number | null = null;
            if (r.roundWinner) {
                roundWinnerUserId = r.roundWinner.userId ?? r.roundWinner.user?.id ?? null;
            } else if (r.roundWinnerId) {
                // If roundWinnerId is a participant ID, find the userId
                const winnerParticipant = participants.find((p: any) => p.id === r.roundWinnerId);
                roundWinnerUserId = winnerParticipant?.userId ?? null;
            }
            const roundLabel = r.roundNumber === "ONE"
                ? t("battle.result.round_1")
                : r.roundNumber === "TWO"
                    ? t("battle.result.round_2")
                    : r.roundNumber === "THREE"
                        ? t("battle.result.round_3")
                        : r.roundNumber || t("battle.result.round_default");

            result.roundDetails.push({
                label: roundLabel,
                me: mePts,
                foe: foePts,
                winnerUserId: roundWinnerUserId,
            });
        }

        // Calculate point difference (me - foe)
        result.pointDiff = result.meTotal - result.foeTotal;

        // Compute own ELO delta: show ONLY my ELO change
        const gained = lastResult?.match?.eloGained ?? 0;
        const lost = lastResult?.match?.eloLost ?? 0;
        const iWon = result.winnerId !== null && meP?.userId === result.winnerId;
        const delta = iWon ? gained : -lost;
        result.eloDeltaText = `${delta >= 0 ? "+" : ""}${delta} ELO`;
        result.eloDeltaPositive = delta >= 0;

        return result;
    }, [lastResult, currentUserId, matchIdParam, t]);

    const handleBack = async () => {
        try { clearLast(); } catch { /* noop */ }

        try {
            await Promise.all([
                queryClient.refetchQueries({ queryKey: ['user-matching-history'] }),
                queryClient.refetchQueries({ queryKey: ['user-stats-season'], type: 'all' }),
                queryClient.removeQueries({ queryKey: ['leaderboard'] }),
            ]);
        } catch (error) {
            console.warn('[BattleResult] Failed to refresh battle queries', error);
        }

        // Navigate directly to battle tab instead of using router.back()
        router.replace(ROUTES.TABS.BATTLE);
    };

    // Show loading/empty state if no data
    if (!lastResult || !lastResult.match) {
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
                    <View className="flex-1 items-center justify-center px-5">
                        <ThemedText style={{ color: "#fbbf24", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
                            {t("battle.result.loading_title")}
                        </ThemedText>
                        <ThemedText style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
                            {t("battle.result.loading_subtitle")}
                        </ThemedText>
                        <ThemedText onPress={() => { void handleBack(); }} style={{ color: "#93c5fd", fontSize: 14, textDecorationLine: "underline" }}>
                            {t("battle.result.back_to_home")}
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

                <View className="px-5 pt-16 pb-6">
                    <View className="items-center mb-5">
                        <ThemedText style={{ color: "#fbbf24", fontSize: 22, fontWeight: "900" }}>
                            {t("battle.result.title")}
                        </ThemedText>
                        <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
                            {t("battle.result.match_label", { matchId: matchIdParam || lastResult?.match?.id })}
                        </ThemedText>
                    </View>

                    {/* Two columns style like MOBA result */}
                    <View className="flex-row gap-4">
                        {/* Left: Opponent */}
                        <View className="flex-1">
                            <TWLinearGradient
                                colors={["#ef4444", "#b91c1c"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ padding: 2, borderRadius: 16 }}
                            >
                                <View className="bg-black/50 rounded-xl p-4">
                                    <View className="flex-row items-center">
                                        {foeAvatarUrl ? (
                                            <Image source={{ uri: foeAvatarUrl }} style={{ width: 52, height: 52 }} resizeMode="contain" />
                                        ) : (
                                            <View style={{ width: 52, height: 52 }} />
                                        )}
                                        <View className="ml-3 flex-1">
                                            <ThemedText
                                                style={{
                                                    color: "#e5e7eb",
                                                    fontWeight: "800",
                                                    fontSize: 16,
                                                    lineHeight: (foeName && foeName.length > 15) ? 20 : 22
                                                }}
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                            >
                                                {foeName}
                                            </ThemedText>
                                            <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>
                                                {t("battle.result.total_points")}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <View className="items-end mt-3">
                                        <ThemedText style={{ color: "#ef9a9a", fontSize: 24, fontWeight: "900" }}>
                                            {foeTotal}
                                        </ThemedText>
                                        {pointDiff < 0 && (
                                            <ThemedText style={{ color: "#fca5a5", fontSize: 12, marginTop: 4 }}>
                                                {t("battle.result.points_diff", { points: Math.abs(pointDiff) })}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                            </TWLinearGradient>
                        </View>

                        {/* Right: Me */}
                        <View className="flex-1">
                            <TWLinearGradient
                                colors={["#22c55e", "#16a34a"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ padding: 2, borderRadius: 16 }}
                            >
                                <View className="bg-black/50 rounded-xl p-4">
                                    <View className="flex-row items-center">
                                        {meAvatarUrl ? (
                                            <Image source={{ uri: meAvatarUrl }} style={{ width: 52, height: 52 }} resizeMode="contain" />
                                        ) : (
                                            <View style={{ width: 52, height: 52 }} />
                                        )}
                                        <View className="ml-3 flex-1">
                                            <ThemedText
                                                style={{
                                                    color: "#e5e7eb",
                                                    fontWeight: "800",
                                                    fontSize: 16,
                                                    lineHeight: (meName && meName.length > 15) ? 20 : 22
                                                }}
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                            >
                                                {meName}
                                            </ThemedText>
                                            <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>
                                                {t("battle.result.total_points")}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <View className="items-end mt-2">
                                        <ThemedText style={{ color: "#86efac", fontSize: 24, fontWeight: "900" }}>
                                            {meTotal}
                                        </ThemedText>
                                        {pointDiff > 0 && (
                                            <ThemedText style={{ color: "#86efac", fontSize: 12, marginTop: 4 }}>
                                                {t("battle.result.points_diff", { points: pointDiff })}
                                            </ThemedText>
                                        )}
                                    </View>
                                    {/* Show ONLY my ELO change */}
                                    <View className="mt-2 items-end">
                                        <View className={`px-3 py-1 rounded-full ${eloDeltaPositive ? "bg-green-500/20 border border-green-500/40" : "bg-red-500/20 border border-red-500/40"}`}>
                                            <ThemedText style={{ color: eloDeltaPositive ? "#86efac" : "#fca5a5", fontWeight: "800" }}>
                                                {eloDeltaText}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            </TWLinearGradient>
                        </View>
                    </View>

                    {/* Per-round breakdown */}
                    <View className="mt-6 bg-black/40 rounded-2xl p-6">
                        <ThemedText style={{ color: "#e5e7eb", fontWeight: "800", fontSize: 16, marginBottom: 8 }}>
                            {t("battle.result.round_details")}
                        </ThemedText>
                        {roundDetails.map((rd: { label: string; me: number; foe: number; winnerUserId?: number | null }, idx: number) => {
                            const meWin = rd.winnerUserId !== undefined && rd.winnerUserId !== null && me?.userId === rd.winnerUserId;
                            const foeWin = rd.winnerUserId !== undefined && rd.winnerUserId !== null && foe?.userId === rd.winnerUserId;
                            return (
                                <View key={idx} className="mb-3">
                                    <View className="flex-row items-center justify-between">
                                        <ThemedText style={{ color: "#94a3b8", fontSize: 12, fontWeight: "700" }}>
                                            {rd.label}
                                        </ThemedText>
                                        <View className="flex-row items-center gap-3">
                                            <ThemedText style={{ color: meWin ? "#86efac" : "#e5e7eb", fontWeight: "800" }}>
                                                {meName}: {rd.me}
                                            </ThemedText>
                                            <ThemedText style={{ color: "#64748b" }}>|</ThemedText>
                                            <ThemedText style={{ color: foeWin ? "#fca5a5" : "#e5e7eb", fontWeight: "800" }}>
                                                {foeName}: {rd.foe}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    {/* Small dual progress bar to visualize round points */}
                                    <View style={{ height: 8 }} className="mt-2 rounded-full overflow-hidden bg-white/10">
                                        {(() => {
                                            const total = Math.max(1, rd.me + rd.foe);
                                            const mePct = Math.round((rd.me / total) * 100);
                                            const foePct = 100 - mePct;
                                            return (
                                                <View style={{ flexDirection: "row", width: "100%", height: "100%" }}>
                                                    <View style={{ width: `${mePct}%`, backgroundColor: "#22c55e" }} />
                                                    <View style={{ width: `${foePct}%`, backgroundColor: "#ef4444" }} />
                                                </View>
                                            );
                                        })()}
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Footer actions */}
                    <View className="items-center mt-8">
                        <Pressable onPress={() => { void handleBack(); }} style={{ borderRadius: 999, overflow: "hidden" }}>
                            <TWLinearGradient
                                colors={["#06b6d4", "#3b82f6"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ paddingVertical: 14, paddingHorizontal: 32, minWidth: 200 }}
                            >
                                <ThemedText
                                    style={{ color: "#ffffff", fontWeight: "800", fontSize: 16, textAlign: "center" }}
                                >
                                    {t("battle.result.back_to_home")}
                                </ThemedText>
                            </TWLinearGradient>
                        </Pressable>
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

