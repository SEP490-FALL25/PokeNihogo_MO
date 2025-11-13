// src/app/(app)/achievements.tsx
import BackScreen from '@components/molecules/Back';
import { useAchievement } from '@hooks/useAchievement';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CheckCircle2, ImageOff, Sparkles } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, SectionList, StatusBar, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

type AchievementCardItem = {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    statusLabel: string;
    progress: number;
    progressLabel: string;
    imageUrl: string | null;
    badgeColors: [string, string];
    rewardLabel?: string;
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

const AchievementCard = ({ item }: { item: AchievementCardItem }) => (
    <View className="flex-1 my-2">
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

                <View className="mt-3">
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
                </View>
            </View>
        </TWLinearGradient>
    </View>
);

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
                    const status = achievement.userAchievement?.status ?? (achievedAt ? 'COMPLETED' : null);
                    const unlocked = Boolean(achievedAt) || status === 'COMPLETED';
                    // Only show progress for completed (100%) or locked (0%), not for IN_PROGRESS since we don't have actual progress value
                    const progress = unlocked ? 1 : 0;
                    const showProgress = unlocked || !achievement.userAchievement; // Show progress only if completed or locked
                    const statusLabel = unlocked
                        ? t('achievements.status.completed')
                        : status === 'IN_PROGRESS'
                            ? t('achievements.status.in_progress')
                            : t('achievements.status.locked');
                    const progressLabel = unlocked ? '100%' : '0%';

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
                        name: achievement.nameTranslation ?? achievement.nameKey,
                        description: conditionDescription,
                        unlocked,
                        statusLabel,
                        progress,
                        progressLabel,
                        imageUrl: achievement.imageUrl,
                        badgeColors: getTierColors(achievement.achievementTierType),
                        rewardLabel: achievement.reward?.nameTranslation ?? achievement.reward?.nameKey ?? undefined,
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
                    renderItem={({ item }) => <AchievementCard item={item} />}
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
        </SafeAreaView>
    );
}