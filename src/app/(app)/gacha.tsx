import { TWLinearGradient } from '@components/atoms/TWLinearGradient';
import BackScreen from '@components/molecules/Back';
import GachaAnimation from '@components/Organism/GachaAnimation';
import { STAR_TYPE_MAP } from '@constants/gacha.enum';
import { useGachaBannerToday, useGachaPurchase, useGetGachaPurchaseHistory, useGetPityByUser } from '@hooks/useGacha';
import { useWalletUser } from '@hooks/useWallet';
import { IGachaBannerSchema } from '@models/gacha/gacha.entity';
import { useSparklesBalanceSelector } from '@stores/wallet/wallet.selectors';
import { formatHistoryTime } from '@utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, History, Shield, Sparkles, X } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, ImageBackground, Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';


export default function GachaScreen() {
    /**
     * Variables defines
     */
    const { t, i18n } = useTranslation();
    const insets = useSafeAreaInsets();
    //---------------------End---------------------//

    /**
     * Gacha Banner Today Hook
     */
    const { gachaBannerList, isLoading: isLoadingBanners } = useGachaBannerToday();
    //---------------------End---------------------//

    /**
     * Wallet Hooks
     */
    const sparklesBalance = useSparklesBalanceSelector();
    const { refetch: refetchWallet } = useWalletUser();
    //---------------------End---------------------//


    /**
     * Gacha Purchase History Hook (Infinite Scroll)
     */
    const {
        data: historyData,
        isLoading: isLoadingHistory,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isError: isHistoryError,
        error: historyError,
        refetch: refetchHistory,
    } = useGetGachaPurchaseHistory();
    //---------------------End---------------------//

    /**
     * Pity Hook (Chung cho tất cả banners)
     */
    const { data: pityData } = useGetPityByUser();
    const currentPity = pityData?.data?.data?.pityCount || 0;
    //---------------------End---------------------//

    const [gachaResults, setGachaResults] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    /**
     * Gacha Purchase Hook
     */
    const { mutate: gachaPurchase, isPending: isPendingPurchase } = useGachaPurchase();
    const handleWish = (count: number) => {
        if (!selectedBanner) return;

        gachaPurchase({
            bannerId: selectedBanner.id,
            rollCount: count,
        }, {
            onSuccess: (response) => {
                const results = response.data.data.map((item: any) => ({
                    id: item.pokemon.pokedex_number || item.pokemon.id,
                    name: item.pokemon.nameTranslations?.en || item.pokemon.nameTranslations?.vi || item.pokemon.nameJp || 'Unknown',
                    rarity: STAR_TYPE_MAP[item.starType] || 1,
                    imageUrl: item.pokemon.imageUrl,
                    pokemon: item.pokemon,
                    isDuplicate: item.isDuplicate,
                    sparkles: item.parseItem.sparkles,
                }));

                setGachaResults(results);
                setIsAnimating(true);
            },
            onError: (error) => {
                console.error('Gacha purchase error:', error.message);
                //TODO: Show Modal
            },
        });
    };
    //---------------------End---------------------//


    /**
     * Animation Hook
     */
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const handleAnimationFinish = () => {
        setIsAnimating(false);
        setGachaResults([]);
    };
    //---------------------End---------------------//


    /**
     * Handle select banner
     */
    const [selectedBannerIndex, setSelectedBannerIndex] = useState<number>(0);

    const activeBanners = useMemo(() => {
        if (!gachaBannerList) return [];
        return gachaBannerList.filter((banner: IGachaBannerSchema) => banner.status === 'ACTIVE');
    }, [gachaBannerList]);

    const selectedBanner = activeBanners[selectedBannerIndex];
    const handleNextBanner = () => {
        setSelectedBannerIndex((prev) => (prev + 1) % activeBanners.length);
    };

    const handlePrevBanner = () => {
        setSelectedBannerIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
    };
    //---------------------End---------------------//

    // Get featured pokemon (from pokemon field)
    const featuredPokemon = useMemo(() => {
        if (!selectedBanner) return null;
        return selectedBanner.pokemon;
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

    // Get banner name by ID (for history)
    const getBannerNameById = useCallback((bannerId: number) => {
        const banner = gachaBannerList?.find((b: IGachaBannerSchema) => b.id === bannerId);
        if (!banner) return '';
        if (banner.nameTranslations && Array.isArray(banner.nameTranslations)) {
            const translation = banner.nameTranslations.find((trans: { key: string; value: string }) => trans.key === i18n.language);
            if (translation) return translation.value;
        }
        return banner.nameTranslation || banner.nameKey;
    }, [gachaBannerList, i18n.language]);

    // Transform and group history data by purchaseId
    const gachaHistory = useMemo(() => {
        if (!historyData?.pages) return [];

        // Flatten all pages
        const allItems = historyData.pages.flatMap((page: any) => page?.data?.data?.results || []);

        if (allItems.length === 0) {
            return [];
        }

        // Group by purchaseId
        const grouped = allItems.reduce((acc: { [key: number]: any[] }, item: any) => {
            const purchaseId = item.purchaseId;
            if (!acc[purchaseId]) {
                acc[purchaseId] = [];
            }
            acc[purchaseId].push(item);
            return acc;
        }, {});

        // Transform to UI format
        return Object.values(grouped).map((items: any[]) => {
            const firstItem = items[0];
            const bannerName = getBannerNameById(firstItem.bannerId);

            return {
                id: `purchase-${firstItem.purchaseId}`,
                timestamp: new Date(firstItem.createdAt),
                bannerId: firstItem.bannerId,
                bannerName: bannerName,
                count: firstItem.purchase.rollCount,
                results: items.map((item: any) => ({
                    id: item.pokemon.pokedex_number || item.pokemon.id,
                    name: item.pokemon.nameTranslations?.[i18n.language] || item.pokemon.nameTranslations?.en || item.pokemon.nameJp || 'Unknown',
                    rarity: STAR_TYPE_MAP[item.rarity] || 1,
                    imageUrl: item.pokemon.imageUrl,
                })),
            };
        }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by newest first
    }, [historyData, getBannerNameById, i18n.language]);

    // Handle infinite scroll
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

            {/* Sparkles Balance - Always visible */}
            <View className="px-4 pt-2 pb-1">
                <View className="bg-amber-500/20 px-3 py-1.5 rounded-xl flex-row items-center gap-2 border border-amber-500/30 self-end">
                    <Sparkles size={14} color="#f59e0b" strokeWidth={2.5} />
                    <Text className="text-amber-400 text-sm font-extrabold">
                        {sparklesBalance.toLocaleString()}
                    </Text>
                </View>
            </View>

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
                                const bannerFeaturedPokemon = banner.pokemon || null;
                                const pityProgress = currentPity / (banner.hardPity5Star || 90);

                                return (
                                    <TouchableOpacity
                                        key={banner.id}
                                        onPress={() => setSelectedBannerIndex(index)}
                                        activeOpacity={0.85}
                                        style={{ marginRight: 16 }}
                                        className='my-1'
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
                                                                    {currentPity}/{banner.hardPity5Star || 90}
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
                                                            {currentPity}/{banner.hardPity5Star || 90}
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
                        disabled={!selectedBanner || isPendingPurchase || isAnimating}
                        className={`p-4 rounded-xl items-center ${selectedBanner && !isPendingPurchase && !isAnimating ? 'bg-cyan-500' : 'bg-slate-700'}`}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">{t('gacha.wish_single')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleWish(10)}
                        disabled={!selectedBanner || isPendingPurchase || isAnimating}
                        className={`p-4 rounded-xl items-center ${selectedBanner && !isPendingPurchase && !isAnimating ? 'bg-purple-600' : 'bg-slate-700'}`}
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold text-lg">
                            {t('gacha.wish_ten', { guarantee: '3★' })}
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
                transparent={false}
                onRequestClose={() => setShowHistory(false)}
            >
                <View className="flex-1 bg-slate-900" style={{ paddingTop: insets.top }}>
                    <StatusBar barStyle="light-content" />
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-slate-800">
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
                    {isHistoryError ? (
                        <View className="flex-1 items-center justify-center px-4">
                            <Text className="text-red-400 text-base font-semibold mb-2">
                                {t('gacha.history_error') || 'Error loading history'}
                            </Text>
                            <Text className="text-slate-500 text-sm text-center">
                                {historyError?.message || 'Unknown error'}
                            </Text>
                        </View>
                    ) : isLoadingHistory && gachaHistory.length === 0 ? (
                        <View className="flex-1 items-center justify-center px-4">
                            <ActivityIndicator size="large" color="#06b6d4" />
                        </View>
                    ) : gachaHistory.length === 0 ? (
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
                            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                            showsVerticalScrollIndicator={false}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                isFetchingNextPage ? (
                                    <View className="py-4 items-center">
                                        <ActivityIndicator size="small" color="#06b6d4" />
                                    </View>
                                ) : null
                            }
                            renderItem={({ item }) => (
                                <View className="bg-slate-800/60 rounded-2xl p-4 mb-3 border border-slate-700">
                                    {/* Header */}
                                    <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-700">
                                        <View className="flex-1">
                                            <Text className="text-white font-extrabold text-base mb-1" numberOfLines={1}>
                                                {item.bannerName}
                                            </Text>
                                            <Text className="text-slate-400 text-xs">
                                                {formatHistoryTime(item.timestamp, t)}
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
                                                2: ['#94a3b8', '#64748b'], // 2 Star
                                                1: ['#78716c', '#57534e'], // 1 Star
                                            };
                                            const starColors: { [key: number]: string } = {
                                                5: '#facc15', // Gold
                                                4: '#c084fc', // Purple
                                                3: '#94a3b8', // Slate
                                                2: '#e2e8f0', // Light slate
                                                1: '#d4d4d8', // Gray
                                            };
                                            const colors = rarityColors[pokemon.rarity] || rarityColors[1];
                                            const starColor = starColors[pokemon.rarity] || starColors[1];

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
                                                                <Text key={i} style={{ color: starColor }} className="text-[8px]">★</Text>
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
                </View>
            </Modal>
        </SafeAreaView>
    );
}