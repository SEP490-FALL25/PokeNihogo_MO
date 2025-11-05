import { HapticPressable } from '@components/HapticPressable'
import { ThemedText } from '@components/ThemedText'
import { Award, History, Target, Trophy, View } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import { Insets, Modal, ScrollView } from 'react-native'

// Mock battle history data
const mockBattleHistory = [
    { id: 1, opponent: "Trainer Alice", result: "win", mmrChange: +25, date: "2 giờ trước", score: "3-1" },
    { id: 2, opponent: "Trainer Bob", result: "win", mmrChange: +22, date: "5 giờ trước", score: "3-2" },
    { id: 3, opponent: "Trainer Charlie", result: "loss", mmrChange: -18, date: "1 ngày trước", score: "1-3" },
    { id: 4, opponent: "Trainer Diana", result: "win", mmrChange: +28, date: "1 ngày trước", score: "3-0" },
    { id: 5, opponent: "Trainer Eve", result: "win", mmrChange: +24, date: "2 ngày trước", score: "3-1" },
    { id: 6, opponent: "Trainer Frank", result: "loss", mmrChange: -20, date: "2 ngày trước", score: "2-3" },
    { id: 7, opponent: "Trainer Grace", result: "win", mmrChange: +26, date: "3 ngày trước", score: "3-2" },
];

interface BattleHistoryProps {
    showHistory: boolean
    setShowHistory: (show: boolean) => void
    insets: Insets
}

const BattleHistory = ({ showHistory, setShowHistory, insets }: BattleHistoryProps) => {
    const [historyFilter, setHistoryFilter] = useState<"all" | "win" | "loss">("all");
    const filteredHistory = useMemo(() => {
        if (historyFilter === "all") return mockBattleHistory;
        return mockBattleHistory.filter(battle => battle.result === historyFilter);
    }, [historyFilter]);

    // Calculate stats dynamically
    const stats = useMemo(() => {
        const wins = mockBattleHistory.filter(battle => battle.result === "win").length;
        const losses = mockBattleHistory.filter(battle => battle.result === "loss").length;
        const total = mockBattleHistory.length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        return { wins, losses, winRate };
    }, []);

    // Calculate filter counts
    const winCount = useMemo(() => mockBattleHistory.filter(battle => battle.result === "win").length, []);
    const lossCount = useMemo(() => mockBattleHistory.filter(battle => battle.result === "loss").length, []);

    return (
        <Modal
            visible={showHistory}
            animationType="slide"
            transparent
            onRequestClose={() => setShowHistory(false)}
        >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)" }}>
                <View style={{ flex: 1, marginTop: (insets.top ?? 0) + 40 }}>
                    <View className="flex-1 bg-slate-900 rounded-t-3xl">
                        {/* Modal Header */}
                        <View className="px-6 py-5 border-b border-white/10">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-3">
                                    <History size={24} color="#22d3ee" />
                                    <ThemedText style={{ color: "#e5e7eb", fontSize: 20, fontWeight: "700" }}>Lịch sử thi đấu</ThemedText>
                                </View>
                                <HapticPressable
                                    className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                                    onPress={() => setShowHistory(false)}
                                >
                                    <ThemedText style={{ color: "#94a3b8", fontSize: 20 }}>✕</ThemedText>
                                </HapticPressable>
                            </View>

                            {/* Quick Stats */}
                            <View className="flex-row gap-3 mt-4">
                                <View className="flex-1 rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Award size={14} color="#22c55e" />
                                        <ThemedText style={{ color: "#86efac", fontSize: 11 }}>Thắng</ThemedText>
                                    </View>
                                    <ThemedText style={{ color: "#22c55e", fontSize: 20, fontWeight: "700" }}>{stats.wins}</ThemedText>
                                </View>
                                <View className="flex-1 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Target size={14} color="#ef4444" />
                                        <ThemedText style={{ color: "#fca5a5", fontSize: 11 }}>Thua</ThemedText>
                                    </View>
                                    <ThemedText style={{ color: "#ef4444", fontSize: 20, fontWeight: "700" }}>{stats.losses}</ThemedText>
                                </View>
                                <View className="flex-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Trophy size={14} color="#22d3ee" />
                                        <ThemedText style={{ color: "#a5f3fc", fontSize: 11 }}>Tỉ lệ</ThemedText>
                                    </View>
                                    <ThemedText style={{ color: "#22d3ee", fontSize: 20, fontWeight: "700" }}>{stats.winRate}%</ThemedText>
                                </View>
                            </View>

                            {/* Filter Tabs */}
                            <View className="flex-row gap-2 mt-4">
                                <HapticPressable
                                    className={`flex-1 py-2 rounded-full ${historyFilter === "all" ? "bg-cyan-500" : "bg-white/5"}`}
                                    onPress={() => setHistoryFilter("all")}
                                >
                                    <ThemedText style={{ color: historyFilter === "all" ? "#ffffff" : "#94a3b8", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                                        Tất cả ({mockBattleHistory.length})
                                    </ThemedText>
                                </HapticPressable>
                                <HapticPressable
                                    className={`flex-1 py-2 rounded-full ${historyFilter === "win" ? "bg-green-500" : "bg-white/5"}`}
                                    onPress={() => setHistoryFilter("win")}
                                >
                                    <ThemedText style={{ color: historyFilter === "win" ? "#ffffff" : "#94a3b8", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                                        Thắng ({winCount})
                                    </ThemedText>
                                </HapticPressable>
                                <HapticPressable
                                    className={`flex-1 py-2 rounded-full ${historyFilter === "loss" ? "bg-red-500" : "bg-white/5"}`}
                                    onPress={() => setHistoryFilter("loss")}
                                >
                                    <ThemedText style={{ color: historyFilter === "loss" ? "#ffffff" : "#94a3b8", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                                        Thua ({lossCount})
                                    </ThemedText>
                                </HapticPressable>
                            </View>
                        </View>

                        {/* Battle List */}
                        <ScrollView className="flex-1 px-6 pt-4">
                            {filteredHistory.map((battle) => (
                                <HapticPressable
                                    key={battle.id}
                                    className="py-4 border-b border-white/5"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <View className={`px-2 py-0.5 rounded-full ${battle.result === "win" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                                                    <ThemedText style={{ color: battle.result === "win" ? "#22c55e" : "#ef4444", fontSize: 10, fontWeight: "700" }}>
                                                        {battle.result === "win" ? "THẮNG" : "THUA"}
                                                    </ThemedText>
                                                </View>
                                                <ThemedText style={{ color: "#64748b", fontSize: 11 }}>{battle.date}</ThemedText>
                                            </View>
                                            <ThemedText style={{ color: "#e5e7eb", fontSize: 15, fontWeight: "600" }}>{battle.opponent}</ThemedText>
                                            <ThemedText style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>Tỉ số: {battle.score}</ThemedText>
                                        </View>
                                        <View className="items-end">
                                            <ThemedText style={{ color: battle.mmrChange > 0 ? "#22c55e" : "#ef4444", fontSize: 18, fontWeight: "700" }}>
                                                {battle.mmrChange > 0 ? "+" : ""}{battle.mmrChange}
                                            </ThemedText>
                                            <ThemedText style={{ color: "#64748b", fontSize: 11 }}>MMR</ThemedText>
                                        </View>
                                    </View>
                                </HapticPressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default BattleHistory