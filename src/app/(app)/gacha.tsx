import { TWLinearGradient } from '@components/atoms/TWLinearGradient';
import BackScreen from '@components/molecules/Back';
import GachaAnimation from '@components/Organism/GachaAnimation';
import { useGachaBannerList } from '@hooks/useGacha';
import { IGachaBannerSchema } from '@models/gacha/gacha.entity';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, History, Shield, X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Types
interface GachaHistoryEntry {
    id: string;
    timestamp: Date;
    bannerId: number;
    bannerName: string;
    count: number; // 1 or 10
    results: Array<{
        id: number;
        name: string;
        rarity: number;
        imageUrl: string;
    }>;
}

// Format time for history display
const formatHistoryTime = (date: Date, lang: string): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (lang === 'vi') {
        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else if (lang === 'ja') {
        if (minutes < 1) return 'たった今';
        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        if (days < 7) return `${days}日前`;
        return date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit', year: 'numeric' });
    } else {
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hr ago`;
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
};

// --- Logic Gacha ---
const RARITY_MAP: { [key: string]: number } = {
    'COMMON': 3,
    'UNCOMMON': 3,
    'RARE': 4,
    'EPIC': 4,
    'LEGENDARY': 5,
};

const performWish = (
    banner: IGachaBannerSchema,
    count: number,
    currentPity: number,
    setPity: (pity: number) => void
) => {
    const results = [];
    const bannerPokemons = banner.items.map(item => item.pokemon);
    const hardPity = banner.hardPity5Star || 90;
    let newPity = currentPity;

    for (let i = 0; i < count; i++) {
        newPity += 1;
        let selectedPokemon;

        // Hard pity: Đảm bảo ra 5 sao khi đạt hardPity5Star
        if (newPity >= hardPity) {
            const legendaryPool = bannerPokemons.filter((p: any) => p.rarity === 'LEGENDARY');
            selectedPokemon = legendaryPool.length > 0
                ? legendaryPool[Math.floor(Math.random() * legendaryPool.length)]
                : bannerPokemons[Math.floor(Math.random() * bannerPokemons.length)];
            newPity = 0; // Reset pity sau khi ra 5 sao
        } else {
            const rand = Math.random() * 100;

            // Logic dựa trên banner config (có thể tinh chỉnh theo rate)
            if (rand < 5) { // 5% tỉ lệ ra 5 sao
                const legendaryPool = bannerPokemons.filter((p: any) => p.rarity === 'LEGENDARY');
                selectedPokemon = legendaryPool.length > 0
                    ? legendaryPool[Math.floor(Math.random() * legendaryPool.length)]
                    : bannerPokemons[Math.floor(Math.random() * bannerPokemons.length)];
                newPity = 0; // Reset pity khi ra 5 sao
            } else if (rand < 20) { // 15% tỉ lệ ra 4 sao
                const rarePool = bannerPokemons.filter((p: any) => p.rarity === 'RARE' || p.rarity === 'EPIC');
                selectedPokemon = rarePool.length > 0
                    ? rarePool[Math.floor(Math.random() * rarePool.length)]
                    : bannerPokemons[Math.floor(Math.random() * bannerPokemons.length)];
            } else { // 80% tỉ lệ ra 3 sao trở xuống
                const commonPool = bannerPokemons.filter((p: any) => p.rarity === 'COMMON' || p.rarity === 'UNCOMMON');
                selectedPokemon = commonPool.length > 0
                    ? commonPool[Math.floor(Math.random() * commonPool.length)]
                    : bannerPokemons[Math.floor(Math.random() * bannerPokemons.length)];
            }
        }

        // Convert pokemon format to match GachaAnimation expected format
        const result = {
            id: selectedPokemon.pokedex_number || selectedPokemon.id,
            name: selectedPokemon.nameTranslations?.en || selectedPokemon.nameTranslations?.vi || selectedPokemon.nameJp || 'Unknown',
            rarity: RARITY_MAP[selectedPokemon.rarity] || 3,
            imageUrl: selectedPokemon.imageUrl,
            pokemon: selectedPokemon, // Keep original pokemon data for reference
        };

        results.push(result);
    }

    // Update pity sau khi quay xong
    setPity(newPity);
    return results;
};

export default function GachaScreen() {
    const { t, i18n } = useTranslation();
    const { gachaBannerList, isLoading: isLoadingBanners } = useGachaBannerList();
    const [selectedBannerIndex, setSelectedBannerIndex] = useState(0);
    const [gachaResults, setGachaResults] = useState<any[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [gachaHistory, setGachaHistory] = useState<GachaHistoryEntry[]>([]);

    // Pity counter cho mỗi banner (key = banner.id)
    const [pityCounters, setPityCounters] = useState<{ [key: number]: number }>({});

    // Filter active banners only
    const activeBanners = useMemo(() => {
        return gachaBannerList.filter((banner: IGachaBannerSchema) => banner.status === 'ACTIVE');
    }, [gachaBannerList]);

    const selectedBanner = activeBanners[selectedBannerIndex];

    // Get current pity cho banner được chọn
    const currentPity = useMemo(() => {
        if (!selectedBanner) return 0;
        return pityCounters[selectedBanner.id] || 0;
    }, [selectedBanner, pityCounters]);

    // Update pity cho banner cụ thể
    const updatePity = (bannerId: number, newPity: number) => {
        setPityCounters(prev => ({
            ...prev,
            [bannerId]: newPity,
        }));
    };

    const handleWish = (count: number) => {
        if (!selectedBanner) return;
        const results = performWish(
            selectedBanner,
            count,
            currentPity,
            (newPity) => updatePity(selectedBanner.id, newPity)
        );
        setGachaResults(results as any);
        setIsAnimating(true);
    };

    const handleAnimationFinish = () => {
        // Save to history
        if (gachaResults.length > 0 && selectedBanner) {
            const historyEntry: GachaHistoryEntry = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date(),
                bannerId: selectedBanner.id,
                bannerName: bannerName,
                count: gachaResults.length,
                results: gachaResults.map(r => ({
                    id: r.id,
                    name: r.name,
                    rarity: r.rarity,
                    imageUrl: r.imageUrl,
                })),
            };
            setGachaHistory(prev => [historyEntry, ...prev]);
        }
        setIsAnimating(false);
        setGachaResults([]);
    };

    const handleNextBanner = () => {
        setSelectedBannerIndex((prev) => (prev + 1) % activeBanners.length);
    };

    const handlePrevBanner = () => {
        setSelectedBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    };

    // Get featured pokemon (first pokemon in items)
    const featuredPokemon = useMemo(() => {
        if (!selectedBanner || selectedBanner.items.length === 0) return null;
        return selectedBanner.items[0]?.pokemon;
    }, [selectedBanner]);

    // Get banner name
    const bannerName = useMemo(() => {
        if (!selectedBanner) return '';
        // Try to get translation from nameTranslations
        if (selectedBanner.nameTranslations && Array.isArray(selectedBanner.nameTranslations)) {
            const translation = selectedBanner.nameTranslations.find((trans: { key: string; value: string }) => trans.key === i18n.language);
            if (translation) return translation.value;
        }
        return selectedBanner.nameTranslation || selectedBanner.nameKey;
    }, [selectedBanner, i18n.language]);

    if (isLoadingBanners) {
        return (
            <SafeAreaView className="flex-1 bg-slate-900">
                <StatusBar barStyle="light-content" />
                <BackScreen onPress={() => router.back()} color="white" title={t('gacha.title')} />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6FAFB2" />
                </View>
            </SafeAreaView>
        );
    }

    if (activeBanners.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-slate-900">
                <StatusBar barStyle="light-content" />
                <BackScreen onPress={() => router.back()} color="white" title={t('gacha.title')} />
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-white text-lg font-semibold text-center">
                        {t('gacha.no_banners')}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color="white" title={t('gacha.title')}>
                <TouchableOpacity
                    onPress={() => setShowHistory(true)}
                    className="bg-slate-800/60 px-3 py-1.5 rounded-xl flex-row items-center gap-2"
                    activeOpacity={0.7}
                >
                    <History size={16} color="#06b6d4" strokeWidth={2.5} />
                    {gachaHistory.length > 0 && (
                        <View className="bg-cyan-500 rounded-full px-2 py-0.5 min-w-[18px] items-center">
                            <Text className="text-white text-xs font-extrabold">{gachaHistory.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </BackScreen>

            <View className="flex-1">
                {/* Banner Switcher - Premium UI */}
                {activeBanners.length > 1 && (
                    <View className="px-4 pt-4 pb-3">
                        <View className="flex-row items-center justify-between mb-3 px-1">
                            <View className="flex-row items-center gap-2">
                                <TWLinearGradient
                                    colors={['#06b6d4', '#0891b2']}
                                    className="w-7 h-7 rounded-lg items-center justify-center"
                                >
                                    <Text className="text-white text-xs font-black">⚡</Text>
                                </TWLinearGradient>
                                <Text className="text-white/90 text-sm font-extrabold tracking-wide">
                                    {t('gacha.select_banner')}
                                </Text>
                            </View>
                            <View className="bg-slate-800/60 px-3 py-1 rounded-full">
                                <Text className="text-cyan-400 text-xs font-bold">
                                    {selectedBannerIndex + 1} / {activeBanners.length}
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 8, paddingRight: 24 }}
                            className="mb-3"
                            pagingEnabled={false}
                            decelerationRate="fast"
                        >
                            {activeBanners.map((banner: IGachaBannerSchema, index: number) => {
                                const isSelected = index === selectedBannerIndex;
                                const bannerDisplayName = banner.nameTranslations && Array.isArray(banner.nameTranslations)
                                    ? banner.nameTranslations.find((trans: { key: string; value: string }) => trans.key === i18n.language)?.value || banner.nameTranslation
                                    : banner.nameTranslation || banner.nameKey;
                                const bannerPity = pityCounters[banner.id] || 0;
                                const bannerFeaturedPokemon = banner.items && banner.items.length > 0 ? banner.items[0]?.pokemon : null;
                                const pityProgress = bannerPity / (banner.hardPity5Star || 90);

                                return (
                                    <TouchableOpacity
                                        key={banner.id}
                                        onPress={() => setSelectedBannerIndex(index)}
                                        activeOpacity={0.85}
                                        style={{ marginRight: 16 }}
                                    >
                                        {/* Glowing border effect for selected */}
                                        {isSelected && (
                                            <LinearGradient
                                                colors={['#06b6d4', '#3b82f6', '#a855f7']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: -2,
                                                    left: -2,
                                                    right: -2,
                                                    bottom: -2,
                                                    borderRadius: 24,
                                                    opacity: 0.6,
                                                }}
                                            />
                                        )}

                                        <View
                                            className={`relative ${isSelected ? 'w-[150px]' : 'w-[120px]'} rounded-3xl overflow-hidden`}
                                            style={{
                                                shadowColor: isSelected ? '#06b6d4' : '#000',
                                                shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
                                                shadowOpacity: isSelected ? 0.6 : 0.3,
                                                shadowRadius: isSelected ? 16 : 8,
                                                elevation: isSelected ? 12 : 6,
                                                backgroundColor: isSelected ? 'transparent' : 'transparent',
                                            }}
                                        >
                                            {bannerFeaturedPokemon ? (
                                                <ImageBackground
                                                    source={{ uri: bannerFeaturedPokemon.imageUrl }}
                                                    resizeMode="cover"
                                                    className={`${isSelected ? 'h-32' : 'h-28'}`}
                                                >
                                                    <LinearGradient
                                                        colors={isSelected
                                                            ? ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']
                                                            : ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']
                                                        }
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 0, y: 1 }}
                                                        style={StyleSheet.absoluteFill}
                                                    />

                                                    {/* Decorative elements */}
                                                    <View className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full" style={{ opacity: 0.3 }} />
                                                    <View className="absolute bottom-2 left-2 w-12 h-12 bg-cyan-400/20 rounded-full" style={{ opacity: 0.3 }} />

                                                    {/* Content */}
                                                    <View className="relative z-10 flex-1 justify-between p-3">
                                                        <View className="flex-1 justify-center">
                                                            <Text
                                                                className={`text-center font-extrabold ${isSelected ? 'text-white text-sm' : 'text-white/90 text-xs'} mb-1`}
                                                                numberOfLines={2}
                                                                style={{ textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}
                                                            >
                                                                {bannerDisplayName}
                                                            </Text>
                                                        </View>

                                                        {/* Pity info */}
                                                        <View className="bg-black/40 rounded-xl p-2 border border-white/10">
                                                            <View className="flex-row items-center justify-between mb-1">
                                                                <Text className="text-yellow-400 text-[10px] font-bold">Pity</Text>
                                                                <Text className={`${isSelected ? 'text-white' : 'text-white/80'} text-[10px] font-extrabold`}>
                                                                    {bannerPity}/{banner.hardPity5Star || 90}
                                                                </Text>
                                                            </View>
                                                            <View className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                <LinearGradient
                                                                    colors={['#facc15', '#fbbf24']}
                                                                    start={{ x: 0, y: 0 }}
                                                                    end={{ x: 1, y: 0 }}
                                                                    style={{ width: `${pityProgress * 100}%`, height: '100%' }}
                                                                />
                                                            </View>
                                                        </View>
                                                    </View>

                                                    {/* Active badge */}
                                                    {isSelected && (
                                                        <View className="absolute top-3 left-3">
                                                            <TWLinearGradient
                                                                colors={['#06b6d4', '#0891b2']}
                                                                className="rounded-full px-2.5 py-1"
                                                                style={{ shadowColor: '#06b6d4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 }}
                                                            >
                                                                <Text className="text-white text-[9px] font-black tracking-wide">ACTIVE</Text>
                                                            </TWLinearGradient>
                                                        </View>
                                                    )}
                                                </ImageBackground>
                                            ) : (
                                                <TWLinearGradient
                                                    colors={isSelected ? ['#06b6d4', '#0891b2'] : ['#334155', '#475569']}
                                                    className={`${isSelected ? 'h-32' : 'h-28'} justify-center items-center p-3`}
                                                >
                                                    <Text
                                                        className={`text-center font-extrabold ${isSelected ? 'text-white text-sm' : 'text-slate-300 text-xs'}`}
                                                        numberOfLines={2}
                                                    >
                                                        {bannerDisplayName}
                                                    </Text>
                                                    <View className="mt-2 w-full bg-black/20 rounded-lg p-1.5">
                                                        <Text className="text-yellow-400 text-[10px] font-bold text-center">
                                                            {bannerPity}/{banner.hardPity5Star || 90}
                                                        </Text>
                                                    </View>
                                                </TWLinearGradient>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Navigation dots with prev/next */}
                        <View className="flex-row items-center justify-center gap-3 mt-2">
                            <TouchableOpacity
                                onPress={handlePrevBanner}
                                className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center border border-slate-700"
                                activeOpacity={0.7}
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }}
                            >
                                <ChevronLeft size={18} color="#fff" strokeWidth={3} />
                            </TouchableOpacity>

                            <View className="flex-row gap-2 px-4">
                                {activeBanners.map((_, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setSelectedBannerIndex(index)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            className={`rounded-full ${index === selectedBannerIndex
                                                ? 'bg-cyan-500 w-8 h-2'
                                                : 'bg-slate-700 w-2 h-2'
                                                }`}
                                            style={index === selectedBannerIndex ? {
                                                shadowColor: '#06b6d4',
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.6,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            } : {}}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handleNextBanner}
                                className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center border border-slate-700"
                                activeOpacity={0.7}
                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }}
                            >
                                <ChevronRight size={18} color="#fff" strokeWidth={3} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Banner Display - Large Banner Card */}
                {selectedBanner && featuredPokemon && (
                    <View className="px-4 pb-3">
                        <ImageBackground
                            source={{ uri: featuredPokemon.imageUrl }}
                            resizeMode="cover"
                            className="rounded-3xl overflow-hidden"
                            style={{ minHeight: 200 }}
                        >
                            <LinearGradient
                                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />

                            <View className="relative z-10 p-6 justify-between" style={{ minHeight: 200 }}>
                                <View>
                                    <Text className="text-white text-3xl font-extrabold mb-2 tracking-tight" numberOfLines={2}>
                                        {bannerName}
                                    </Text>
                                    <Text className="text-cyan-300 text-base font-semibold mb-2">
                                        {t('gacha.rate_up_text', { pokemon: featuredPokemon.nameTranslations?.en || featuredPokemon.nameJp })}
                                    </Text>
                                    {selectedBanner.costRoll && (
                                        <View className="flex-row items-center gap-2 mt-2">
                                            <TWLinearGradient
                                                colors={['#06b6d4', '#0891b2']}
                                                className="px-3 py-1.5 rounded-lg"
                                            >
                                                <Text className="text-white text-sm font-bold">
                                                    {t('gacha.cost_per_roll', { cost: selectedBanner.costRoll })}
                                                </Text>
                                            </TWLinearGradient>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                )}

                {/* Pity Progress Bar - Only show when banner selected */}
                {selectedBanner && (
                    <View className="px-4 pb-3">
                        <View className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center gap-2">
                                    <TWLinearGradient
                                        colors={['#facc15', '#fbbf24']}
                                        className="w-8 h-8 rounded-lg items-center justify-center"
                                    >
                                        <Shield size={16} color="white" strokeWidth={2.5} />
                                    </TWLinearGradient>
                                    <Text className="text-white font-bold text-base">{t('gacha.pity_title')}</Text>
                                </View>
                                <Text className="text-yellow-400 font-extrabold text-lg">
                                    {currentPity} / {selectedBanner.hardPity5Star || 90}
                                </Text>
                            </View>
                            <View className="relative">
                                <View className="absolute w-full h-2.5 bg-slate-700 rounded-full" />
                                <Progress.Bar
                                    progress={currentPity / (selectedBanner.hardPity5Star || 90)}
                                    width={null}
                                    height={10}
                                    color="#facc15"
                                    unfilledColor={'#1e293b'}
                                    borderWidth={0}
                                    borderRadius={5}
                                />
                            </View>
                            <Text className="text-slate-400 text-xs mt-2 text-center">
                                {currentPity >= (selectedBanner.hardPity5Star || 90) - 1
                                    ? t('gacha.pity_guaranteed')
                                    : t('gacha.pity_description', { remaining: (selectedBanner.hardPity5Star || 90) - currentPity })
                                }
                            </Text>
                        </View>
                    </View>
                )}

                {/* Wish Buttons */}
                <View className="px-4 mt-auto mb-4 gap-3">
                    <TouchableOpacity
                        onPress={() => handleWish(1)}
                        disabled={!selectedBanner}
                        className={`p-4 rounded-xl items-center ${selectedBanner ? 'bg-cyan-500' : 'bg-slate-700'}`}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">{t('gacha.wish_single')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleWish(10)}
                        disabled={!selectedBanner}
                        className={`p-4 rounded-xl items-center ${selectedBanner ? 'bg-purple-600' : 'bg-slate-700'}`}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">
                            {t('gacha.wish_ten', { guarantee: '4★' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Animation Overlay */}
            {isAnimating && <GachaAnimation results={gachaResults} onFinish={handleAnimationFinish} />}

            {/* History Modal */}
            <Modal
                visible={showHistory}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowHistory(false)}
            >
                <SafeAreaView className="flex-1 bg-slate-900" edges={['top', 'bottom', 'left', 'right']}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800">
                        <Text className="text-white text-xl font-extrabold">{t('gacha.history_title')}</Text>
                        <TouchableOpacity
                            onPress={() => setShowHistory(false)}
                            className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <X size={20} color="#fff" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    {/* History List */}
                    {gachaHistory.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-4">
                            <History size={64} color="#475569" strokeWidth={1.5} />
                            <Text className="text-slate-500 text-lg font-semibold mt-4 text-center">
                                {t('gacha.history_empty')}
                            </Text>
                            <Text className="text-slate-600 text-sm mt-2 text-center">
                                {t('gacha.history_empty_desc')}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={gachaHistory}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ padding: 16 }}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <View className="bg-slate-800/60 rounded-2xl p-4 mb-3 border border-slate-700">
                                    {/* Header */}
                                    <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-700">
                                        <View className="flex-1">
                                            <Text className="text-white font-extrabold text-base mb-1" numberOfLines={1}>
                                                {item.bannerName}
                                            </Text>
                                            <Text className="text-slate-400 text-xs">
                                                {formatHistoryTime(item.timestamp, i18n.language)}
                                            </Text>
                                        </View>
                                        <View className="bg-cyan-500/20 px-3 py-1 rounded-lg border border-cyan-500/30">
                                            <Text className="text-cyan-400 font-bold text-xs">
                                                {t('gacha.wish_count', { count: item.count })}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Results Grid */}
                                    <View className="flex-row flex-wrap gap-2">
                                        {item.results.map((pokemon, idx) => {
                                            const rarityColors: { [key: number]: string[] } = {
                                                5: ['#facc15', '#fbbf24'], // Legendary
                                                4: ['#a855f7', '#9333ea'], // Epic/Rare
                                                3: ['#64748b', '#475569'], // Common/Uncommon
                                            };
                                            const colors = rarityColors[pokemon.rarity] || rarityColors[3];

                                            return (
                                                <View key={idx} className="relative">
                                                    <View className="relative w-20 h-20 rounded-xl overflow-hidden border-2" style={{ borderColor: colors[0] }}>
                                                        <Image
                                                            source={{ uri: pokemon.imageUrl }}
                                                            className="w-full h-full"
                                                            resizeMode="cover"
                                                        />
                                                        <LinearGradient
                                                            colors={[`${colors[0]}00`, `${colors[0]}80`]}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 0, y: 1 }}
                                                            style={StyleSheet.absoluteFill}
                                                        />
                                                        {/* Rarity Stars */}
                                                        <View className="absolute bottom-1 left-1 right-1 flex-row justify-center gap-0.5">
                                                            {Array.from({ length: pokemon.rarity }).map((_, i) => (
                                                                <Text key={i} className="text-yellow-400 text-[8px]">★</Text>
                                                            ))}
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}