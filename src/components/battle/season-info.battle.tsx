import { CountdownTimer } from "@components/atoms/CountdownTimer";
import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { ThemedText } from "@components/ThemedText";
import { useUserStatsSeason } from "@hooks/useSeason";
import { Crown } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, View } from "react-native";

interface SeasonInfoProps {
    insetsTop: number;
}

export default function SeasonInfo({ insetsTop }: SeasonInfoProps) {
    const { data, isLoading } = useUserStatsSeason();

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

    const seasonName = data?.leaderboardSeason?.name || "Season 1";
    const endDate = data?.leaderboardSeason?.endDate;
    const rankName = data?.rank?.rankName || "N5";
    const eloScore = data?.rank?.eloscore || 0;

    return (
        <View className="px-5" style={{ paddingTop: insetsTop + 8 }}>
            <TWLinearGradient
                colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 1 }}
            >
                <View className="rounded-2xl bg-black/40 px-4 py-3">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <View className="w-2 h-2 rounded-full bg-cyan-400" />
                            <ThemedText style={{ color: "#93c5fd", fontWeight: "700", fontSize: 15 }}>{seasonName}</ThemedText>
                            {endDate && (
                                <>
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 13 }}>Kết thúc sau</ThemedText>
                                    <CountdownTimer endDate={endDate} daysLabel="ngày" />
                                </>
                            )}
                        </View>
                    </View>
                    <View className="mt-2 flex-row items-center gap-2">
                        <Crown size={14} color="#fbbf24" />
                        <ThemedText style={{ color: "#fde68a", fontSize: 12, fontWeight: "600" }}>{rankName}</ThemedText>
                        <ThemedText style={{ color: "#94a3b8", fontSize: 12 }}>• {eloScore} ELO</ThemedText>
                    </View>
                </View>
            </TWLinearGradient>
        </View>
    );
}

