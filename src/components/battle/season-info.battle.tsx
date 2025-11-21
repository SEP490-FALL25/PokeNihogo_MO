import { CountdownTimer } from "@components/atoms/CountdownTimer";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { ThemedText } from "@components/ThemedText";
import { useUserStatsSeason, SeasonResponseType } from "@hooks/useSeason";
import { Crown, Info } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import ModalRank, { type RankRule } from "./modal-rank";

interface SeasonInfoProps {
    insetsTop: number;
}

const DEFAULT_RANK_RULES: RankRule[] = [
    { name: "N5", min: 0, max: 999 },
    { name: "N4", min: 1000, max: 1499 },
    { name: "N3", min: 1500, max: 1899 },
    { name: "N2", min: 1900, max: 2199 },
    { name: "N1", min: 2200, max: null },
];

export default function SeasonInfo({ insetsTop }: SeasonInfoProps) {
    const { t } = useTranslation();
    const { data, isLoading, responseType } = useUserStatsSeason();
    const [showRankInfo, setShowRankInfo] = useState<boolean>(false);
    const rankRules = useMemo<RankRule[]>(() => {
        const raw =
            (data as any)?.leaderboardSeason?.rankRules ??
            (data as any)?.leaderboardSeason?.rankThresholds ??
            (data as any)?.rankRules ??
            [];

        if (Array.isArray(raw)) {
            const mapped = raw
                .map((item: any) => {
                    const name = item?.rankName ?? item?.name ?? item?.label;
                    const min = typeof item?.minElo === "number" ? item?.minElo : typeof item?.min === "number" ? item?.min : null;
                    const max = typeof item?.maxElo === "number" ? item?.maxElo : typeof item?.max === "number" ? item?.max : null;
                    if (!name || min === null || isNaN(min)) return null;
                    return {
                        name,
                        min,
                        max: typeof max === "number" ? max : null,
                    } as RankRule;
                })
                .filter(Boolean) as RankRule[];

            if (mapped.length > 0) {
                return mapped.sort((a, b) => a.min - b.min);
            }
        }

        return DEFAULT_RANK_RULES;
    }, [data]);

    if (isLoading) {
        return (
            <View className="px-5" style={{ paddingTop: insetsTop + 8 }}>
                <TWLinearGradient
                    colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 16, padding: 1 }}
                >
                    <View className="rounded-2xl bg-black/40 px-4 py-3">
                        <View className="flex-row items-center justify-center">
                            <ActivityIndicator size="small" color="#22d3ee" />
                        </View>
                    </View>
                </TWLinearGradient>
            </View>
        );
    }

    // Only show season info for ACTIVE season
    if (responseType !== 'ACTIVE') {
        return null;
    }

    const seasonName = data?.leaderboardSeason?.name || "Season 1";
    const endDate = data?.leaderboardSeason?.endDate;
    const rankName = data?.rank?.rankName || "N5";
    const eloScore = data?.rank?.eloscore || 0;

    const handleOpenRankInfo = () => setShowRankInfo(true);
    const handleCloseRankInfo = () => setShowRankInfo(false);

    return (
        <>
            <View className="px-5" style={{ paddingTop: insetsTop + 8 }}>
                <TWLinearGradient
                    colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ borderRadius: 16, padding: 1 }}
                >
                    <View className="rounded-2xl bg-black/40 px-4 py-3">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-row items-center justify-between w-full">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-2 h-2 rounded-full bg-cyan-400" />
                                    <ThemedText style={{ color: "#93c5fd", fontWeight: "700", fontSize: 15 }}>{seasonName}</ThemedText>
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 13 }}>
                                        {t("battle.season_info.ends_in")}
                                    </ThemedText>
                                </View>

                                {endDate && (
                                    <View className="mt-1 flex-row items-center gap-2">
                                        <CountdownTimer endDate={endDate} daysLabel={t("battle.season_info.days_label")} />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between mt-3">
                            <View className="flex-row items-center justify-center gap-2">
                                <Crown size={14} color="#fbbf24" />
                                <ThemedText style={{ color: "#fde68a", fontSize: 12, fontWeight: "600" }}>{rankName}</ThemedText>
                                <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>• {eloScore} ELO</ThemedText>
                            </View>
                            <TouchableOpacity
                                onPress={handleOpenRankInfo}
                                activeOpacity={0.7}
                                className="w-6 h-6 rounded-full border border-[rgba(56,189,248,0.3)] bg-[rgba(14,116,144,0.25)] items-center justify-center"
                            >
                                <Info size={15} color="#38bdf8" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TWLinearGradient>
            </View>

            <ModalRank
                visible={showRankInfo}
                onClose={handleCloseRankInfo}
                eloScore={eloScore}
                rankName={rankName}
                rankRules={rankRules}
            />
        </>
    );
}