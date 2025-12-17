import { TWLinearGradient } from "@components/atoms/TWLinearGradient";
import { HapticPressable } from "@components/HapticPressable";
import { ThemedText } from "@components/ThemedText";
import { useJoinNewSeason } from "@hooks/useBattle";
import { Crown, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, View } from "react-native";

interface ModalFirstTimeUserProps {
    visible: boolean;
    onRequestClose: () => void;
    onJoinComplete: (newSeasonInfo: any) => void;
}

export default function ModalFirstTimeUser({
    visible,
    onRequestClose,
    onJoinComplete
}: ModalFirstTimeUserProps) {
    const { t } = useTranslation();
    const [isJoining, setIsJoining] = useState(false);
    const joinNewSeasonMutation = useJoinNewSeason();

    const handleJoin = async () => {
        if (isJoining) return;

        setIsJoining(true);
        try {
            const response = await joinNewSeasonMutation.mutateAsync();
            const newSeasonInfo = response?.data?.data?.seasonNowInfo;
            if (newSeasonInfo) {
                onJoinComplete(newSeasonInfo);
            } else {
                onRequestClose();
            }
        } catch (error: any) {
            console.error("Failed to join new season:", error);
            onRequestClose();
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onRequestClose}>
            <View className="flex-1 bg-[rgba(0,0,0,0.9)] justify-center items-center p-6">
                <View className="w-full max-w-[420px] bg-slate-900 rounded-3xl border border-white/10">
                    {/* Header */}
                    <View className="px-6 py-5 border-b border-white/10">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3">
                                <Sparkles size={24} color="#22d3ee" />
                                <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>
                                    {t("battle.first_time.title") || "Chào mừng!"}
                                </ThemedText>
                            </View>
                            <HapticPressable
                                className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                                onPress={onRequestClose}
                                disabled={isJoining}
                            >
                                <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                            </HapticPressable>
                        </View>
                    </View>

                    {/* Content */}
                    <View className="px-6 py-6">
                        {/* Welcome message */}
                        <View className="items-center mb-6">
                            <ThemedText style={{ color: "#22d3ee", fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 4 }}>
                                {t("battle.first_time.welcome_header") || "Đấu Trường"}
                            </ThemedText>
                            <ThemedText style={{ color: "#94a3b8", fontSize: 13, textAlign: "center" }}>
                                {t("battle.first_time.welcome_subheader") || "Tham gia để tranh tài cùng mọi người"}
                            </ThemedText>
                        </View>

                        {/* Rank Info (Preview) */}
                        <View className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                            <View className="flex-row items-center justify-center gap-2 mb-2">
                                <Crown size={20} color="#fbbf24" />
                                <ThemedText style={{ color: "#fde68a", fontSize: 18, fontWeight: "700" }}>
                                    N5
                                </ThemedText>
                            </View>
                            <ThemedText style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
                                0 {t("battle.new_season.elo") || "ELO"}
                            </ThemedText>
                        </View>

                        <ThemedText style={{ color: "#64748b", fontSize: 13, textAlign: "center", marginBottom: 4, lineHeight: 20 }}>
                            {t("battle.first_time.message") || "Bắt đầu hành trình leo hạng của bạn ngay hôm nay!"}
                        </ThemedText>

                        {/* Join Button */}
                        <HapticPressable
                            className="rounded-2xl overflow-hidden mt-4"
                            onPress={handleJoin}
                            disabled={isJoining || joinNewSeasonMutation.isPending}
                        >
                            <TWLinearGradient
                                colors={isJoining || joinNewSeasonMutation.isPending ? ["#64748b", "#374151"] : ["#22c55e", "#16a34a"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ paddingVertical: 16 }}
                            >
                                {isJoining || joinNewSeasonMutation.isPending ? (
                                    <View className="flex-row items-center justify-center gap-2">
                                        <ActivityIndicator size="small" color="#ffffff" />
                                        <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
                                            {t("battle.first_time.joining") || "Đang tham gia..."}
                                        </ThemedText>
                                    </View>
                                ) : (
                                    <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                                        {t("battle.first_time.join") || "Tham gia ngay"}
                                    </ThemedText>
                                )}
                            </TWLinearGradient>
                        </HapticPressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

