import UserAvatar from "@components/atoms/UserAvatar";
import { useLeaderboard } from "@hooks/useLeaderboard";
import { ILeaderboardResponse } from "@models/leaderboard/leaderboard.response";
import { Award, Crown, Trophy } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

type LeaderboardEntry = ILeaderboardResponse["results"][0];

interface ModalLeaderboardProps {
    visible: boolean;
    onRequestClose: () => void;
    rankName?: string;
}

const PAGE_SIZE = 100;

export default function ModalLeaderboard({ visible, onRequestClose, rankName = "N5" }: ModalLeaderboardProps) {
    const { t } = useTranslation();
    const rankOptions = useMemo(() => ["N5", "N4", "N3"], []);

    /**
     * Selected rank and current page
     */
    const [selectedRank, setSelectedRank] = useState<string>(rankName);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [allResults, setAllResults] = useState<LeaderboardEntry[]>([]);
    const [allPagesData, setAllPagesData] = useState<Map<number, ILeaderboardResponse>>(new Map());

    useEffect(() => {
        if (visible && rankName) {
            setSelectedRank(rankName);
            setCurrentPage(1);
            setAllResults([]);
            setAllPagesData(new Map());
        }
    }, [rankName, visible]);

    const { leaderboard, pagination, isLoading, isError } = useLeaderboard({
        rankName: selectedRank,
        currentPage,
        pageSize: PAGE_SIZE,
        enabled: visible && Boolean(selectedRank),
    });


    const leaderboardResponse = useMemo(() => {
        if (!leaderboard) return null;
        if (typeof leaderboard === 'object' && 'results' in leaderboard) {
            return leaderboard as ILeaderboardResponse;
        }
        if (Array.isArray(leaderboard)) {
            return {
                results: leaderboard as LeaderboardEntry[],
                pagination: pagination || { current: currentPage, pageSize: PAGE_SIZE, totalPage: 1, totalItem: 0 },
            };
        }
        return null;
    }, [leaderboard, pagination, currentPage]);

    useEffect(() => {
        if (!leaderboardResponse || !leaderboardResponse.results || leaderboardResponse.results.length === 0) return;
        if (!pagination) return;

        setAllPagesData(prev => {
            const newMap = new Map(prev);
            newMap.set(currentPage, leaderboardResponse);
            return newMap;
        });
    }, [leaderboardResponse, currentPage, pagination]);

    useEffect(() => {
        const sortedPages = Array.from(allPagesData.entries())
            .sort(([a], [b]) => a - b)
            .map(([, data]) => data.results)
            .flat();

        setAllResults(sortedPages);
    }, [allPagesData]);

    const leaderboardData = useMemo(() => {
        const latestData = allPagesData.get(currentPage) || leaderboardResponse;
        const results = allResults.length > 0 ? allResults : (leaderboardResponse?.results || []);

        const me = (latestData && typeof latestData === 'object' && 'me' in latestData ? latestData.me : undefined)
            || (leaderboardResponse && typeof leaderboardResponse === 'object' && 'me' in leaderboardResponse ? leaderboardResponse.me : undefined);

        console.log("[Leaderboard] leaderboardData:", {
            resultsLength: results.length,
            allResultsLength: allResults.length,
            leaderboardResponseResultsLength: leaderboardResponse?.results?.length || 0,
            hasMe: !!me
        });

        return {
            results,
            pagination: pagination || {
                current: currentPage,
                pageSize: PAGE_SIZE,
                totalPage: 1,
                totalItem: 0,
            },
            me,
        };
    }, [allResults, pagination, currentPage, allPagesData, leaderboardResponse]);

    const loadMore = () => {
        if (!isLoading && pagination && currentPage < pagination.totalPage) {
            setCurrentPage(prev => prev + 1);
        }
    };
    //--------------------------------End--------------------------------//

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
        const me = leaderboardData.me;
        if (!me || typeof me !== 'object' || !('userId' in me)) return false;
        return entry.userId === (me as LeaderboardEntry).userId;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
            <View className="flex-1 bg-black/80 justify-center items-center p-5">
                <View className="bg-slate-800 rounded-3xl w-full border border-white/10" style={{ maxWidth: 500, height: "85%" }}>
                    {/* Header */}
                    <View className="px-6 py-5 border-b border-slate-700/50">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-2xl font-extrabold text-white mb-1">{t("leaderboard.title")}</Text>
                                <Text className="text-sm text-slate-400 font-semibold">{t("leaderboard.rank")} {selectedRank}</Text>
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
                                            {t("leaderboard.rank_label", { rank: option })}
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
                                return leaderboardData.results && leaderboardData.results.length > 0 ? (
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
                                                                    <Text className="text-xs font-bold text-cyan-200">{t("leaderboard.you")}</Text>
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
                                                        <Text className="text-xs text-slate-400 font-medium">{t("leaderboard.elo")}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                        {isLoading && (
                                            <View className="py-4 items-center">
                                                <ActivityIndicator size="small" color="#22d3ee" />
                                                <Text className="text-slate-400 text-xs mt-2">{t("leaderboard.loading_more")}</Text>
                                            </View>
                                        )}
                                        {!isLoading && pagination && currentPage >= pagination.totalPage && leaderboardData.results.length > 0 && (
                                            <View className="py-4 items-center">
                                                <Text className="text-slate-400 text-xs">{t("leaderboard.all_loaded")}</Text>
                                            </View>
                                        )}
                                        {isError && (
                                            <View className="py-4 items-center">
                                                <Text className="text-red-400 text-xs">{t("leaderboard.error_loading")}</Text>
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View className="py-10 items-center">
                                        {isLoading ? (
                                            <ActivityIndicator size="large" color="#22d3ee" />
                                        ) : (
                                            <>
                                                <Text className="text-slate-400">{t("leaderboard.no_data")}</Text>
                                                <Text className="text-slate-500 text-xs mt-2">{t("leaderboard.rank")}: {selectedRank}, Results: {leaderboardData?.results?.length || 0}</Text>
                                            </>
                                        )}
                                    </View>
                                );
                            })()}
                        </ScrollView>
                    </View>

                    {/* User's Entry - Fixed at bottom */}
                    {leaderboardData.me && typeof leaderboardData.me === 'object' && 'position' in leaderboardData.me && (
                        <View className="px-6 py-4 border-t border-slate-700/50">
                            <View className="flex-row items-center p-4 rounded-2xl border border-cyan-500/50 bg-cyan-500/10">
                                {/* Position */}
                                <View className="w-12 items-center justify-center mr-3">
                                    <Text className="text-lg font-bold text-cyan-300">#{(leaderboardData.me as LeaderboardEntry).position}</Text>
                                </View>

                                {/* Avatar */}
                                <View className="mr-3">
                                    <UserAvatar name={(leaderboardData.me as LeaderboardEntry).name} avatar={(leaderboardData.me as LeaderboardEntry).avatar || undefined} size="small" />
                                </View>

                                {/* Name and Rank */}
                                <View className="flex-1 mr-3">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Text className="text-base font-bold text-cyan-300">
                                            {(leaderboardData.me as LeaderboardEntry).name}
                                        </Text>
                                        <View className="bg-cyan-500/30 px-2 py-0.5 rounded-full">
                                            <Text className="text-xs font-bold text-cyan-200">{t("leaderboard.you")}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-slate-700/50 px-2 py-0.5 rounded">
                                            <Text className="text-xs font-semibold text-slate-300">{(leaderboardData.me as LeaderboardEntry).finalRank}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* ELO */}
                                <View className="items-end">
                                    <Text className="text-lg font-extrabold text-cyan-300">
                                        {(leaderboardData.me as LeaderboardEntry).finalElo}
                                    </Text>
                                    <Text className="text-xs text-slate-400 font-medium">{t("leaderboard.elo")}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

