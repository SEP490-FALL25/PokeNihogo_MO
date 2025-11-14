// src/app/(app)/achievements.tsx
import MinimalGameAlert from '@components/atoms/MinimalAlert';
import BackScreen from '@components/molecules/Back';
import { USER_ACHIEVEMENT_STATUS } from '@constants/user-achievement.enum';
import { useAchievement, useReceiveAchievementReward } from '@hooks/useAchievement';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CheckCircle2, ImageOff, Sparkles } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Animated, Image, SectionList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

type AchievementCardItem = {
    id: string;
    achievementId: number;
    name: string;
    description: string;
    unlocked: boolean;
    statusLabel: string;
    progress: number;
    progressLabel: string;
    showProgress: boolean;
    imageUrl: string | null;
    badgeColors: [string, string];
    rewardLabel?: string;
    rewardId?: number;
    userAchievementId?: number;
    canReceiveReward: boolean;
};

type AchievementSection = {
    title: string;
    data: AchievementCardItem[];
};

const tierColorMap: Record<string, [string, string]> = {
    BASIC: ['#38bdf8', '#0ea5e9'],
    ADVANCED: ['#fbbf24', '#f59e0b'],
    ELITE: ['#a855f7', '#7c3aed'],
};

const getTierColors = (tier: string | undefined): [string, string] => tierColorMap[tier ?? ''] ?? ['#64748b', '#475569'];

const AchievementCard = ({
    item,
    onReceiveReward,
    isReceivingReward,
    t
}: {
    item: AchievementCardItem;
    onReceiveReward: (id: string) => void;
    isReceivingReward: boolean;
    t: (key: string, options?: any) => string;
}) => {
    const glowAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (item.canReceiveReward) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnimation, {
                        toValue: 1.3,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                    Animated.timing(glowAnimation, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: false,
                    }),
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [item.canReceiveReward, glowAnimation]);

    const animatedShadowOpacity = glowAnimation.interpolate({
        inputRange: [1, 1.3],
        outputRange: [0.6, 1],
    });

    const animatedShadowRadius = glowAnimation.interpolate({
        inputRange: [1, 1.3],
        outputRange: [12, 18],
    });

    const cardContent = (
        <TWLinearGradient
            colors={item.unlocked ? ['#1e293b', '#334155'] : ['#374151', '#4b5563']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-4 shadow-black/40 shadow-lg flex-row items-center gap-4"
        >
            <TWLinearGradient
                colors={item.badgeColors}
                className={`w-20 h-20 rounded-2xl items-center justify-center shadow-lg ${!item.unlocked && 'opacity-60'}`}
                style={{ shadowColor: item.badgeColors[1] }}
            >
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        resizeMode="cover"
                        className="w-16 h-16 rounded-xl"
                    />
                ) : (
                    <View className="items-center justify-center">
                        <ImageOff size={28} color="white" />
                    </View>
                )}

                {item.unlocked && (
                    <View className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full items-center justify-center border-2 border-slate-800">
                        <CheckCircle2 size={14} color="white" />
                    </View>
                )}
            </TWLinearGradient>

            <View className="flex-1">
                <Text className={`text-base font-extrabold ${item.unlocked ? 'text-white' : 'text-slate-300'}`}>{item.name}</Text>
                <Text className="text-xs text-slate-400 mt-1" numberOfLines={2}>{item.description}</Text>
                {item.rewardLabel && (
                    <Text className="text-xs text-emerald-300 mt-1" numberOfLines={1}>{item.rewardLabel}</Text>
                )}

                {item.canReceiveReward && (
                    <TouchableOpacity
                        onPress={() => onReceiveReward(item.userAchievementId?.toString() ?? '')}
                        disabled={isReceivingReward}
                        className={`mt-2 px-4 py-2 rounded-lg ${isReceivingReward ? 'bg-emerald-500/50' : 'bg-emerald-500'}`}
                        activeOpacity={0.7}
                    >
                        <Text className="text-white text-xs font-semibold text-center">
                            {isReceivingReward ? t('common.loading') : t('achievements.reward.receive_button', { defaultValue: 'Nhận thưởng' })}
                        </Text>
                    </TouchableOpacity>
                )}

                <View className="mt-3">
                    {item.showProgress ? (
                        <>
                            <Progress.Bar
                                progress={item.progress}
                                width={null}
                                height={6}
                                color={item.unlocked ? '#22c55e' : item.badgeColors[1]}
                                borderWidth={0}
                                borderRadius={3}
                                unfilledColor="#1e293b"
                            />
                            <Text className="text-right text-xs font-semibold text-slate-400 mt-1">
                                {item.statusLabel} • {item.progressLabel}
                            </Text>
                        </>
                    ) : (
                        <Text className="text-right text-xs font-semibold text-slate-400 mt-1">
                            {item.statusLabel}
                        </Text>
                    )}
                </View>
            </View>
        </TWLinearGradient>
    );

    return (
        <View className="flex-1 my-2">
            {item.canReceiveReward ? (
                <Animated.View
                    style={{
                        borderWidth: 2,
                        borderColor: '#22c55e',
                        borderRadius: 16,
                        shadowColor: '#22c55e',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: animatedShadowOpacity,
                        shadowRadius: animatedShadowRadius,
                        elevation: 12,
                    }}
                >
                    {cardContent}
                </Animated.View>
            ) : (
                cardContent
            )}
        </View>
    );
};

const LoadingState = () => {
    const { t } = useTranslation();
    return (
        <View className="flex-1 items-center justify-center py-24">
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text className="text-sm text-slate-400 mt-3">{t('achievements.loading')}</Text>
        </View>
    );
};

const EmptyState = () => {
    const { t } = useTranslation();
    return (
        <View className="flex-1 items-center justify-center py-24">
            <Sparkles size={28} color="#38bdf8" />
            <Text className="text-sm text-slate-400 mt-3">{t('achievements.empty')}</Text>
        </View>
    );
};

export default function AchievementsScreen() {
    const { t } = useTranslation();
    const { data, isLoading, error } = useAchievement({ sort: 'displayOrder' });
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);

    const { mutate: receiveReward, isPending: isReceivingReward } = useReceiveAchievementReward();

    const handleReceiveReward = (id: string) => {
        const achievementId = parseInt(id, 10);
        receiveReward(achievementId, {
            onSuccess: () => {
                setShowSuccessAlert(true);
            },
            onError: () => {
                setShowErrorAlert(true);
            },
        });
    };

    const sections = useMemo<AchievementSection[]>(() => {
        if (!data?.results) {
            return [];
        }

        return data.results
            .slice()
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((group) => ({
                title: group.nameTranslation ?? group.nameKey,
                data: group.achievements.results.map((achievement) => {
                    const achievedAt = achievement.userAchievement?.achievedAt ?? null;
                    const status = achievement.userAchievement?.status as USER_ACHIEVEMENT_STATUS | undefined;
                    const unlocked = Boolean(achievedAt) ||
                        status === USER_ACHIEVEMENT_STATUS.COMPLETED_NOT_CLAIMED ||
                        status === USER_ACHIEVEMENT_STATUS.CLAIMED;
                    // Only show progress for completed (100%) or locked (0%), not for IN_PROGRESS since we don't have actual progress value
                    const progress = unlocked ? 1 : 0;
                    const showProgress = unlocked || !achievement.userAchievement; // Show progress only if completed or locked
                    const statusLabel = status === USER_ACHIEVEMENT_STATUS.CLAIMED
                        ? t('achievements.status.claimed')
                        : status === USER_ACHIEVEMENT_STATUS.COMPLETED_NOT_CLAIMED
                            ? t('achievements.status.completed')
                            : status === USER_ACHIEVEMENT_STATUS.IN_PROGRESS
                                ? t('achievements.status.in_progress')
                                : t('achievements.status.locked');
                    const progressLabel = unlocked ? '100%' : '0%';
                    // Can receive reward only if achievement is completed but not yet claimed
                    const canReceiveReward = status === USER_ACHIEVEMENT_STATUS.COMPLETED_NOT_CLAIMED && achievement.reward !== null;

                    const conditionDescription = (() => {
                        switch (achievement.conditionType) {
                            case 'LEARNING_STREAK':
                                return t('achievements.condition_types.learning_streak', { days: achievement.conditionValue });
                            default:
                                return achievement.descriptionKey;
                        }
                    })();

                    return {
                        id: achievement.id.toString(),
                        achievementId: achievement.id,
                        name: achievement.nameTranslation ?? achievement.nameKey,
                        description: conditionDescription,
                        unlocked,
                        statusLabel,
                        progress,
                        progressLabel,
                        showProgress,
                        imageUrl: achievement.imageUrl,
                        badgeColors: getTierColors(achievement.achievementTierType),
                        rewardLabel: achievement.reward?.nameTranslation ?? achievement.reward?.nameKey ?? undefined,
                        rewardId: achievement.reward?.id,
                        userAchievementId: achievement.userAchievement?.id,
                        canReceiveReward,
                    } satisfies AchievementCardItem;
                }),
            }))
            .filter((section) => section.data.length > 0);
    }, [data, t]);

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color="white" title={t('achievements.title')} />

            {error ? (
                <View className="px-4 py-6">
                    <Text className="text-sm text-rose-400">{t('achievements.error')}</Text>
                </View>
            ) : null}

            {isLoading ? (
                <LoadingState />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AchievementCard
                            item={item}
                            onReceiveReward={handleReceiveReward}
                            isReceivingReward={isReceivingReward}
                            t={t}
                        />
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View className="flex-row items-center gap-3 px-4 pt-6 pb-2">
                            <TWLinearGradient colors={['#6FAFB2', '#7EC5C8']} className="w-8 h-8 rounded-lg items-center justify-center">
                                <Sparkles size={16} color="white" />
                            </TWLinearGradient>
                            <Text className="text-xl font-bold text-white">{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
                    ListEmptyComponent={!error ? EmptyState : undefined}
                />
            )}

            <MinimalGameAlert
                message={t('achievements.reward.receive_success')}
                visible={showSuccessAlert}
                onHide={() => setShowSuccessAlert(false)}
                type="success"
            />

            <MinimalGameAlert
                message={t('achievements.reward.receive_error')}
                visible={showErrorAlert}
                onHide={() => setShowErrorAlert(false)}
                type="error"
            />
        </SafeAreaView>
    );
}