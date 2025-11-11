import UserAvatar from "@components/atoms/UserAvatar";
import { Award, Crown, Trophy } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface LeaderboardEntry {
    position: number;
    userId: number;
    name: string;
    avatar: string | null;
    finalElo: number;
    finalRank: string;
}

interface LeaderboardData {
    results: LeaderboardEntry[];
    pagination: {
        current: number;
        pageSize: number;
        totalPage: number;
        totalItem: number;
    };
    me: LeaderboardEntry | null;
}

interface ModalLeaderboardProps {
    visible: boolean;
    onRequestClose: () => void;
    rankName?: string;
}

// Generate mock data
const generateMockEntries = (rank: string, count: number, startPosition: number = 1): LeaderboardEntry[] => {
    const names = [
        "Minh Phuoc", "Ad", "Sakura", "Takeshi", "Ayame", "Sensei", "Kana", "Raito",
        "Hiroshi", "Yuki", "Akira", "Mei", "Kenji", "Sora", "Ren", "Mio",
        "Taro", "Hana", "Kaito", "Emi", "Daiki", "Nana", "Riku", "Yui",
        "Sato", "Tanaka", "Yamada", "Watanabe", "Ito", "Nakamura", "Kobayashi", "Kato"
    ];

    return Array.from({ length: count }, (_, i) => {
        const position = startPosition + i;
        const nameIndex = (position - 1) % names.length;
        const baseElo = rank === "N5" ? 300 : rank === "N4" ? 800 : 1200;
        const elo = Math.max(50, baseElo - (position - 1) * 2);

        return {
            position,
            userId: 1000 + position,
            name: `${names[nameIndex]}${position > names.length ? ` ${Math.floor((position - 1) / names.length) + 1}` : ""}`,
            avatar: null,
            finalElo: elo,
            finalRank: rank,
        };
    });
};

// Mock data per rank - total items
const TOTAL_ITEMS = 500; // Total users per rank
const PAGE_SIZE = 100;

// Mock data per rank
const mockLeaderboardByRank: Record<string, { me: LeaderboardEntry | null; totalItem: number }> = {
    N5: {
        me: {
            position: 2,
            userId: 3,
            name: "Ad",
            avatar: null,
            finalElo: 243,
            finalRank: "N5",
        },
        totalItem: TOTAL_ITEMS,
    },
    N4: {
        me: {
            position: 12,
            userId: 3,
            name: "Ad",
            avatar: null,
            finalElo: 540,
            finalRank: "N4",
        },
        totalItem: TOTAL_ITEMS,
    },
    N3: {
        me: null,
        totalItem: TOTAL_ITEMS,
    },
};

export default function ModalLeaderboard({ visible, onRequestClose, rankName = "N5" }: ModalLeaderboardProps) {
    const rankOptions = useMemo(() => Object.keys(mockLeaderboardByRank), []);
    const [selectedRank, setSelectedRank] = useState(rankName);
    const [currentPage, setCurrentPage] = useState(1);
    const [allResults, setAllResults] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const rankConfig = mockLeaderboardByRank[selectedRank] ?? mockLeaderboardByRank.N5;
    const totalPages = Math.ceil(rankConfig.totalItem / PAGE_SIZE);

    // Load initial data
    useEffect(() => {
        if (visible && rankName) {
            setSelectedRank(rankName);
            setCurrentPage(1);
            setAllResults([]);
        }
    }, [rankName, visible]);

    // Load data when rank or page changes
    useEffect(() => {
        if (!visible) return;

        const loadData = async () => {
            setIsLoading(true);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const startPosition = (currentPage - 1) * PAGE_SIZE + 1;
            const newEntries = generateMockEntries(selectedRank, PAGE_SIZE, startPosition);

            if (currentPage === 1) {
                setAllResults(newEntries);
            } else {
                setAllResults(prev => [...prev, ...newEntries]);
            }

            setIsLoading(false);
        };

        loadData();
    }, [selectedRank, currentPage, visible]);

    const leaderboardData: LeaderboardData = useMemo(() => {
        return {
            results: allResults,
            pagination: {
                current: currentPage,
                pageSize: PAGE_SIZE,
                totalPage: totalPages,
                totalItem: rankConfig.totalItem,
            },
            me: rankConfig.me,
        };
    }, [allResults, currentPage, totalPages, rankConfig]);

    const loadMore = () => {
        if (!isLoading && currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const getPositionIcon = (position: number) => {
        if (position === 1) return <Crown size={20} color="#fbbf24" />;
        if (position === 2) return <Trophy size={20} color="#94a3b8" />;
        if (position === 3) return <Award size={20} color="#cd7f32" />;
        return null;
    };

    const getPositionStyle = (position: number, isMe: boolean) => {
        if (isMe) return { bg: "bg-cyan-500/10", border: "border-cyan-500/30" };
        if (position === 1) return { bg: "bg-yellow-500/10", border: "border-yellow-500/30" };
        if (position === 2) return { bg: "bg-slate-400/10", border: "border-slate-400/30" };
        if (position === 3) return { bg: "bg-amber-700/10", border: "border-amber-700/30" };
        return { bg: "bg-slate-700/20", border: "border-slate-600/30" };
    };

    const isCurrentUser = (entry: LeaderboardEntry) => {
        return leaderboardData.me && entry.userId === leaderboardData.me.userId;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <View className="flex-1 bg-black/80 justify-center items-center p-5">
                <View className="bg-slate-800 rounded-3xl w-full border border-white/10" style={{ maxWidth: 500, height: "85%" }}>
                    {/* Header */}
                    <View className="px-6 py-5 border-b border-slate-700/50">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-2xl font-extrabold text-white mb-1">Bảng xếp hạng</Text>
                                <Text className="text-sm text-slate-400 font-semibold">Hạng {selectedRank}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={onRequestClose}
                                className="w-8 h-8 rounded-full bg-white/10 justify-center items-center"
                                activeOpacity={0.7}
                            >
                                <Text className="text-xl text-slate-300 font-semibold">×</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Rank Switcher */}
                    <View className="px-6 pt-4 pb-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {rankOptions.map((option) => {
                                const isActive = option === selectedRank;
                                return (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => setSelectedRank(option)}
                                        activeOpacity={0.7}
                                        className={`px-4 py-2 rounded-full border ${isActive ? "bg-cyan-500/20 border-cyan-500/50" : "bg-white/5 border-white/10"
                                            }`}
                                    >
                                        <Text className={`text-sm font-semibold ${isActive ? "text-cyan-300" : "text-slate-300"}`}>
                                            Rank {option}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Leaderboard List */}
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="px-6"
                            contentContainerStyle={{ paddingBottom: 16, paddingTop: 8 }}
                            onScroll={({ nativeEvent }) => {
                                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                                const paddingToBottom = 20;
                                if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                                    loadMore();
                                }
                            }}
                            scrollEventThrottle={400}
                        >
                            {(() => {
                                return leaderboardData?.results && leaderboardData.results.length > 0 ? (
                                    <>
                                        {leaderboardData.results.map((entry, index) => {
                                            const isMe = isCurrentUser(entry) ?? false;
                                            const positionIcon = getPositionIcon(entry.position);
                                            const positionStyle = getPositionStyle(entry.position, isMe);

                                            return (
                                                <View
                                                    key={`${selectedRank}-${entry.userId}-${entry.position}`}
                                                    className={`flex-row items-center p-4 rounded-2xl mb-3 border ${positionStyle.border} ${positionStyle.bg}`}
                                                >
                                                    {/* Position */}
                                                    <View className="w-12 items-center justify-center mr-3">
                                                        {positionIcon ? (
                                                            positionIcon
                                                        ) : (
                                                            <Text className="text-lg font-bold text-slate-300">#{entry.position}</Text>
                                                        )}
                                                    </View>

                                                    {/* Avatar */}
                                                    <View className="mr-3">
                                                        <UserAvatar name={entry.name} avatar={entry.avatar || undefined} size="small" />
                                                    </View>

                                                    {/* Name and Rank */}
                                                    <View className="flex-1 mr-3">
                                                        <View className="flex-row items-center gap-2 mb-1">
                                                            <Text className={`text-base font-bold ${isMe ? "text-cyan-300" : "text-white"}`}>
                                                                {entry.name}
                                                            </Text>
                                                            {isMe && (
                                                                <View className="bg-cyan-500/30 px-2 py-0.5 rounded-full">
                                                                    <Text className="text-xs font-bold text-cyan-200">Bạn</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View className="flex-row items-center gap-2">
                                                            <View className="bg-slate-700/50 px-2 py-0.5 rounded">
                                                                <Text className="text-xs font-semibold text-slate-300">{entry.finalRank}</Text>
                                                            </View>
                                                        </View>
                                                    </View>

                                                    {/* ELO */}
                                                    <View className="items-end">
                                                        <Text className={`text-lg font-extrabold ${isMe ? "text-cyan-300" : "text-white"}`}>
                                                            {entry.finalElo}
                                                        </Text>
                                                        <Text className="text-xs text-slate-400 font-medium">ELO</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                        {isLoading && (
                                            <View className="py-4 items-center">
                                                <ActivityIndicator size="small" color="#22d3ee" />
                                                <Text className="text-slate-400 text-xs mt-2">Đang tải thêm...</Text>
                                            </View>
                                        )}
                                        {!isLoading && currentPage >= totalPages && allResults.length > 0 && (
                                            <View className="py-4 items-center">
                                                <Text className="text-slate-400 text-xs">Đã hiển thị tất cả</Text>
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View className="py-10 items-center">
                                        {isLoading ? (
                                            <ActivityIndicator size="large" color="#22d3ee" />
                                        ) : (
                                            <>
                                                <Text className="text-slate-400">Không có dữ liệu</Text>
                                                <Text className="text-slate-500 text-xs mt-2">Rank: {selectedRank}, Results: {leaderboardData?.results?.length || 0}</Text>
                                            </>
                                        )}
                                    </View>
                                );
                            })()}
                        </ScrollView>
                    </View>

                    {/* User's Entry - Fixed at bottom */}
                    {leaderboardData.me && (
                        <View className="px-6 py-4 border-t border-slate-700/50">
                            <View className="flex-row items-center p-4 rounded-2xl border border-cyan-500/50 bg-cyan-500/10">
                                {/* Position */}
                                <View className="w-12 items-center justify-center mr-3">
                                    <Text className="text-lg font-bold text-cyan-300">#{leaderboardData.me.position}</Text>
                                </View>

                                {/* Avatar */}
                                <View className="mr-3">
                                    <UserAvatar name={leaderboardData.me.name} avatar={leaderboardData.me.avatar || undefined} size="small" />
                                </View>

                                {/* Name and Rank */}
                                <View className="flex-1 mr-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Text className="text-base font-bold text-cyan-300">
                                            {leaderboardData.me.name}
                                        </Text>
                                        <View className="bg-cyan-500/30 px-2 py-0.5 rounded-full">
                                            <Text className="text-xs font-bold text-cyan-200">Bạn</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-slate-700/50 px-2 py-0.5 rounded">
                                            <Text className="text-xs font-semibold text-slate-300">{leaderboardData.me.finalRank}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* ELO */}
                                <View className="items-end">
                                    <Text className="text-lg font-extrabold text-cyan-300">
                                        {leaderboardData.me.finalElo}
                                    </Text>
                                    <Text className="text-xs text-slate-400 font-medium">ELO</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

