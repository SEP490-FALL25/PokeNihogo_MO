import { TWLinearGradient } from '@components/atoms/TWLinearGradient'
import UserAvatar from '@components/atoms/UserAvatar'
import { HapticPressable } from '@components/HapticPressable'
import { ThemedText } from '@components/ThemedText'
import useAuth from '@hooks/useAuth'
import { IBattleMatchFound } from '@models/battle/battle.response'
import battleService from '@services/battle'
import React, { useEffect, useState } from 'react'
import { Modal, View } from 'react-native'

interface ModalBattleAcceptProps {
    showAcceptModal: boolean;
    matchedPlayer: IBattleMatchFound;
    setShowAcceptModal: (show: boolean) => void;
    setMatchedPlayer: (player: IBattleMatchFound | null) => void;
    setInQueue: (inQueue: boolean) => void;
    statusMatch: "reject" | "accept" | null;
    setStatusMatch: (status: "reject" | "accept" | null) => void;
}

const ModalBattleAccept = ({ showAcceptModal, matchedPlayer, setShowAcceptModal, setMatchedPlayer, setInQueue, statusMatch, setStatusMatch }: ModalBattleAcceptProps) => {
    const { user } = useAuth();

    /**
     * Time remaining
     */
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    useEffect(() => {
        if (!showAcceptModal || !matchedPlayer?.match?.endTime) {
            setTimeRemaining(0);
            return;
        }

        const calculateTimeRemaining = () => {
            const endTime = new Date(matchedPlayer.match.endTime).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            return remaining;
        };

        setTimeRemaining(calculateTimeRemaining());

        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                clearInterval(interval); 0
                setShowAcceptModal(false);
                setMatchedPlayer(null);
                setInQueue(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [showAcceptModal, matchedPlayer?.match?.endTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    //------------------------End------------------------//

    /**
     * Handle accept match
     */
    const handleAcceptMatch = async () => {
        try {
            const response = await battleService.updateMatchParticipant(matchedPlayer.participant.id.toString(), true);
            if (response.status === 200) {
                setStatusMatch("accept");
            }
        }
        catch (error: any) {
            console.log(error.response.data.message);
        }
    };

    const handleRejectMatch = async () => {
        try {
            const response = await battleService.updateMatchParticipant(matchedPlayer.participant.id.toString(), false);
            if (response.status === 200) {
                setStatusMatch("reject");
            }
        }
        catch (error: any) {
            console.log(error.response.data.message);
        }
    };
    //------------------------End------------------------//

    return (
        <Modal
            visible={showAcceptModal}
            animationType="fade"
            transparent
            onRequestClose={handleRejectMatch}
        >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
                <View className="w-11/12 max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-white/10">
                    <TWLinearGradient
                        colors={["#22c55e", "#16a34a"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ padding: 20 }}
                    >
                        <View className="items-center">
                            <ThemedText style={{ color: "#ffffff", fontSize: 24, fontWeight: "900" }}>
                                🎮 TRẬN ĐẤU SẴN SÀNG
                            </ThemedText>
                        </View>
                    </TWLinearGradient>

                    <View className="p-6">
                        <View className="flex-row items-center justify-center gap-8 mb-6">
                            <View className="items-center">
                                <UserAvatar avatar={user?.data?.avatar} name={user?.data?.name || ""} size="large" />
                                <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                    {user?.data?.name || "Bạn"}
                                </ThemedText>
                            </View>
                            <TWLinearGradient
                                colors={["#ec4899", "#8b5cf6"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ padding: 2, borderRadius: 999 }}
                            >
                                <View className="px-4 py-2 rounded-full bg-black/70">
                                    <ThemedText style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>VS</ThemedText>
                                </View>
                            </TWLinearGradient>
                            <View className="items-center">
                                <UserAvatar avatar={matchedPlayer?.opponent.avatar} name={matchedPlayer?.opponent.name || ""} size="large" />
                                <ThemedText style={{ color: "#e5e7eb", fontSize: 14, fontWeight: "600", marginTop: 8 }}>
                                    {matchedPlayer?.opponent.name || "Opponent"}
                                </ThemedText>
                            </View>
                        </View>

                        <ThemedText style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginBottom: 8 }}>
                            Đã tìm thấy đối thủ phù hợp!
                        </ThemedText>

                        {/* Countdown Timer */}
                        {timeRemaining > 0 && (
                            <View className="items-center mb-6">
                                <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
                                    <ThemedText style={{ color: "#fbbf24", fontSize: 16, fontWeight: "700" }}>
                                        ⏱️
                                    </ThemedText>
                                    <ThemedText style={{ color: timeRemaining <= 10 ? "#ef4444" : "#fbbf24", fontSize: 18, fontWeight: "700" }}>
                                        {formatTime(timeRemaining)}
                                    </ThemedText>
                                </View>
                            </View>
                        )}

                        <View className="flex-row gap-3">
                            {statusMatch !== "accept" &&
                                <HapticPressable className="flex-1 py-4 rounded-2xl bg-white/10 border border-white/20" onPress={handleRejectMatch} disabled={statusMatch === "reject"}>
                                    <ThemedText style={{ color: statusMatch === "reject" ? "#64748b" : "#fca5a5", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                                        Từ chối
                                    </ThemedText>
                                </HapticPressable>
                            }
                            {statusMatch !== "reject" &&
                                <HapticPressable className="flex-1 rounded-2xl overflow-hidden" onPress={handleAcceptMatch} disabled={statusMatch === "accept"}>
                                    <TWLinearGradient
                                        colors={statusMatch === "accept" ? ["#64748b", "#374151"] : ["#22c55e", "#16a34a"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{ paddingVertical: 16 }}
                                    >
                                        <ThemedText style={{ color: "#ffffff", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                                            ĐỒNG Ý
                                        </ThemedText>
                                    </TWLinearGradient>
                                </HapticPressable>
                            }
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

export default ModalBattleAccept