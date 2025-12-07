import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { useUserMatchingHistory } from "@hooks/useBattle";
import { IBattleUserMatchingHistoryEntity } from "@models/battle/battle.entity";
import { Clock, History } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, TouchableWithoutFeedback, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ModalBattleHistoryProps {
    visible: boolean;
    onRequestClose: () => void;
}

// Format relative time for createdAt
const formatBattleDate = (dateString: string, t: (key: string, options?: any) => string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const minutes = Math.floor(diffInSeconds / 60);
        const hours = Math.floor(diffInSeconds / 3600);
        const days = Math.floor(diffInSeconds / 86400);

        if (diffInSeconds < 60) return t("battle.lobby.history.list.just_now");
        if (minutes < 60) return t("battle.lobby.history.list.minutes_ago", { minutes });
        if (hours < 24) return t("battle.lobby.history.list.hours_ago", { hours });
        if (days < 7) return t("battle.lobby.history.list.days_ago", { days });

        return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
        return "";
    }
};

// Format timeMatch (in seconds) to MM:SS or seconds
const formatTimeMatch = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
};

export default function ModalBattleHistory({ visible, onRequestClose }: ModalBattleHistoryProps) {
    const { t } = useTranslation();
    const { data, isLoading, isError } = useUserMatchingHistory();
    const insets = useSafeAreaInsets();
    const screenHeight = Dimensions.get("window").height;
    const modalHeight = screenHeight * 0.7;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onRequestClose}>
            <TouchableWithoutFeedback onPress={onRequestClose}>
                <View className="flex-1 bg-[rgba(0,0,0,0.8)] justify-end">
                    <Pressable onPress={() => { }}>
                        <View
                            className="bg-slate-900 rounded-t-3xl"
                            style={{
                                height: modalHeight,
                                paddingBottom: Math.max(insets.bottom, 20),
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                            }}
                        >
                            {/* Header */}
                            <View className="px-6 py-5 border-b border-white/10">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center gap-3">
                                        <History size={24} color="#22d3ee" />
                                        <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>
                                            {t("battle.lobby.history.title")}
                                        </ThemedText>
                                    </View>
                                    <HapticPressable
                                        className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                                        onPress={onRequestClose}
                                    >
                                        <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                                    </HapticPressable>
                                </View>
                            </View>

                            {/* Content */}
                            {isLoading ? (
                                <View className="py-20 items-center justify-center flex-1">
                                    <ActivityIndicator size="large" color="#22d3ee" />
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 14, marginTop: 12 }}>
                                        {t("common.loading")}
                                    </ThemedText>
                                </View>
                            ) : isError ? (
                                <View className="py-20 items-center justify-center px-6 flex-1">
                                    <ThemedText style={{ color: "#ef4444", fontSize: 16, textAlign: "center" }}>
                                        {t("common.error")}
                                    </ThemedText>
                                </View>
                            ) : !data || data.length === 0 ? (
                                <View className="py-20 items-center justify-center px-6 flex-1">
                                    <History size={48} color="#64748b" />
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 16, marginTop: 12, textAlign: "center" }}>
                                        {t("battle.lobby.history.empty")}
                                    </ThemedText>
                                </View>
                            ) : (
                                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                                    {data.map((battle: IBattleUserMatchingHistoryEntity, index: number) => (
                                        <HapticPressable key={`${battle.opponent.id}-${index}`} className="py-4 border-b border-white/5">
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-1">
                                                    <View className="flex-row items-center gap-2 mb-1">
                                                        <View
                                                            className={`px-2 py-0.5 rounded-full ${battle.isWin ? "bg-green-500/20" : "bg-red-500/20"}`}
                                                        >
                                                            <ThemedText
                                                                style={{
                                                                    color: battle.isWin ? "#22c55e" : "#ef4444",
                                                                    fontSize: 10,
                                                                    fontWeight: "700",
                                                                }}
                                                            >
                                                                {battle.isWin
                                                                    ? t("battle.lobby.history.list.win_badge")
                                                                    : t("battle.lobby.history.list.loss_badge")}
                                                            </ThemedText>
                                                        </View>
                                                        <ThemedText style={{ color: "#64748b", fontSize: 11 }}>
                                                            {battle.leaderboardSeasonName}
                                                        </ThemedText>
                                                    </View>
                                                    <ThemedText style={{ color: "#e5e7eb", fontSize: 15, fontWeight: "600" }}>
                                                        {battle.opponent.name}
                                                    </ThemedText>
                                                    <View className="flex-row items-center gap-3 mt-1">
                                                        {battle.createdAt && (
                                                            <View className="flex-row items-center gap-1">
                                                                <Clock size={12} color="#64748b" />
                                                                <ThemedText style={{ color: "#64748b", fontSize: 10 }}>
                                                                    {formatBattleDate(battle.createdAt, t)}
                                                                </ThemedText>
                                                            </View>
                                                        )}
                                                        {battle.timeMatch && (
                                                            <ThemedText style={{ color: "#64748b", fontSize: 10 }}>
                                                                {t("battle.lobby.history.list.duration", "Thời gian")}: {formatTimeMatch(battle.timeMatch)}
                                                            </ThemedText>
                                                        )}
                                                    </View>
                                                </View>
                                                <View className="items-end">
                                                    <ThemedText
                                                        style={{
                                                            color: battle.isWin ? "#22c55e" : "#ef4444",
                                                            fontSize: 18,
                                                            fontWeight: "700",
                                                        }}
                                                    >
                                                        {battle.isWin ? "+" : "-"}
                                                        {battle.isWin ? battle.eloGain : Math.abs(battle.eloGain)}
                                                    </ThemedText>
                                                    <ThemedText style={{ color: "#64748b", fontSize: 11 }}>ELO</ThemedText>
                                                </View>
                                            </View>
                                        </HapticPressable>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    </Pressable>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

