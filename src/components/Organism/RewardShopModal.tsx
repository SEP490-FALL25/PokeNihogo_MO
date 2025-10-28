
import { CountdownTimer } from '@components/atoms/CountdownTimer';
import { TWLinearGradient } from '@components/atoms/TWLinearGradient';
import { useShopBanner } from '@hooks/useShopBanner';
import { useWalletUser } from '@hooks/useWallet';
import { useSparklesBalanceSelector } from '@stores/wallet/wallet.selectors';
import { Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, FlatList, ImageBackground, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ShopItemCapsule from './ShopItemCapsule';

interface RewardShopModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function RewardShopModal({ isVisible, onClose }: RewardShopModalProps) {


    const { t } = useTranslation();
    const { shopBanner, isLoading } = useShopBanner();

    /**
     * Get sparkles balance
     */
    useWalletUser();
    const sparklesBalance = useSparklesBalanceSelector();
    //------------------------End------------------------//


    /**
     * Animation
     */
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [isVisible]);

    if (!isVisible) return null;
    //----------------------End----------------------//


    const shopItems = shopBanner?.shopItems || [];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <Animated.View style={{ opacity: opacityAnim }} className="flex-1 bg-black/50 justify-center items-center p-4">
                <Pressable onPress={onClose} style={{ ...StyleSheet.absoluteFillObject }} />
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }} className="w-full max-w-md">
                    {/* Giao diện "Máy Gashapon" */}
                    <TWLinearGradient
                        colors={['#e2e8f0', '#f1f5f9', '#ffffff']}
                        className="rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <ImageBackground
                            // source={require('../../../assets/images/seigaiha-pattern.png')} // Họa tiết sóng
                            resizeMode="cover"
                            imageStyle={{ opacity: 0.05, tintColor: '#6FAFB2' }}
                        >
                            <View className="p-4 border-b border-slate-200">
                                <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 p-2 bg-black/10 rounded-full z-10">
                                    <X size={20} color="white" />
                                </TouchableOpacity>
                                <View className="items-center">
                                    <Text className="text-xl font-bold text-teal-700">
                                        {shopBanner?.nameTranslation || t('reward_shop.title')}
                                    </Text>
                                    <Text className="text-slate-500 font-semibold text-sm mt-1">
                                        {t('reward_shop.subtitle')}
                                    </Text>
                                </View>
                            </View>
                        </ImageBackground>

                        {/* Nội dung Modal */}
                        <View className="p-2">
                            <View className="flex-row justify-center items-center my-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <Text className="text-base text-slate-600 mr-2">{t('reward_shop.your_points')}</Text>
                                <Text className="text-amber-500 font-extrabold text-xl mr-1">{sparklesBalance.toLocaleString()}</Text>
                                <Sparkles size={20} color="#f59e0b" />
                            </View>

                            {shopBanner?.endDate && (
                                <View className="my-2 items-end">
                                    <CountdownTimer endDate={shopBanner.endDate || ''} daysLabel={t('reward_shop.days')} />
                                </View>
                            )}

                            {isLoading ? (
                                <View className="items-center justify-center p-8" style={{ height: 360 }}>
                                    <Text className="text-slate-500 text-base">{t('reward_shop.loading')}</Text>
                                </View>
                            ) : shopItems.length === 0 ? (
                                <View className="items-center justify-center p-8" style={{ height: 360 }}>
                                    <Text className="text-slate-500 text-base">{t('reward_shop.no_products')}</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={shopItems}
                                    numColumns={2}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => <ShopItemCapsule item={item} userPoints={sparklesBalance} exchangeLabel={t('reward_shop.exchange')} />}
                                    showsVerticalScrollIndicator={false}
                                    style={{ height: 360 }}
                                    contentContainerStyle={{ padding: 4 }}
                                />
                            )}
                        </View>
                    </TWLinearGradient>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}
