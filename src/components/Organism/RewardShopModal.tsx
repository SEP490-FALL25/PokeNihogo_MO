
import { useLanguage } from '@hooks/useLanguage';
import { useShopBanner } from '@hooks/useShopBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Star, X } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Image, ImageBackground, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

interface RewardShopModalProps {
    isVisible: boolean;
    onClose: () => void;
    userPoints: number;
}

interface ShopItem {
    id: number;
    shopBannerId: number;
    pokemonId: number;
    price: number;
    purchaseLimit: number;
    purchasedCount: number;
    isActive: boolean;
    canBuy: boolean;
    pokemon: {
        id: number;
        pokedex_number: number;
        nameJp: string;
        nameTranslations: {
            en: string;
            ja: string;
            vi: string;
        };
        imageUrl: string;
        rarity: string;
    };
}

// Component đếm ngược thời gian
const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const end = new Date(endDate).getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [endDate]);

    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        return null;
    }

    const formatTime = () => {
        if (timeLeft.days > 0) {
            return `${timeLeft.days} ngày ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
        }
        return `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
    };

    return (
        <View className="flex-row items-center justify-center bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-200">
            <Clock size={16} color="#f59e0b" />
            <Text className="text-amber-700 font-semibold text-sm ml-2">
                Còn lại: <Text className="font-bold">{formatTime()}</Text>
            </Text>
        </View>
    );
};

// Component con cho mỗi "viên nang" Pokémon
const ShopItemCapsule = ({ item, userPoints, language }: { item: ShopItem, userPoints: number, language: string }) => {
    const canAfford = userPoints >= item.price && item.canBuy;
    const pokemonName = item.pokemon.nameTranslations[language as keyof typeof item.pokemon.nameTranslations] || item.pokemon.nameJp;

    const handlePurchase = () => {
        // TODO: Implement purchase logic
        console.log('Purchase item:', item);
    };

    return (
        <View className="w-1/2 p-2">
            <View className="bg-white rounded-3xl shadow-lg shadow-slate-300 overflow-hidden">
                {/* Phần hiển thị Pokémon */}
                <View className="items-center p-4 bg-slate-100">
                    <Image
                        source={{ uri: item.pokemon.imageUrl }}
                        className="w-24 h-24"
                        style={{ resizeMode: 'contain' }}
                    />
                </View>

                {/* Phần thông tin */}
                <View className="p-3">
                    <Text className="text-slate-800 font-bold text-lg text-center" numberOfLines={1}>{item.pokemon.nameJp}</Text>
                    <Text className="text-slate-500 text-xs text-center mt-0.5" numberOfLines={1}>{pokemonName}</Text>
                    <View className="flex-row items-center justify-center my-2">
                        <Star size={16} color="#f59e0b" fill="#fbbf24" />
                        <Text className="text-amber-500 font-bold text-base ml-1">{item.price.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handlePurchase}
                        disabled={!canAfford}
                    >
                        <TWLinearGradient
                            colors={canAfford ? ['#22c55e', '#16a34a'] : ['#e2e8f0', '#cbd5e1']}
                            className="px-4 py-2.5 rounded-xl"
                        >
                            <Text className={`font-bold text-center ${canAfford ? 'text-white' : 'text-slate-500'}`}>Đổi</Text>
                        </TWLinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};


export default function RewardShopModal({ isVisible, onClose, userPoints }: RewardShopModalProps) {
    // Animation
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const { shopBanner, isLoading } = useShopBanner();
    const { language } = useLanguage();

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
                                        {shopBanner?.nameTranslation || 'ポイント交換'}
                                    </Text>
                                    <Text className="text-slate-500 font-semibold text-sm mt-1">
                                        Cửa hàng Điểm thưởng
                                    </Text>
                                </View>
                            </View>
                        </ImageBackground>

                        {/* Nội dung Modal */}
                        <View className="p-2">
                            <View className="flex-row justify-center items-center my-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                <Text className="text-base text-slate-600 mr-2">Điểm của bạn:</Text>
                                <Star size={20} color="#f59e0b" fill="#fbbf24" />
                                <Text className="text-amber-500 font-extrabold text-xl ml-1">{userPoints.toLocaleString()}</Text>
                            </View>

                            {shopBanner?.endDate && (
                                <View className="my-2 items-center">
                                    <CountdownTimer endDate={shopBanner.endDate} />
                                </View>
                            )}

                            {isLoading ? (
                                <View className="items-center justify-center p-8" style={{ height: 360 }}>
                                    <Text className="text-slate-500 text-base">Đang tải...</Text>
                                </View>
                            ) : shopItems.length === 0 ? (
                                <View className="items-center justify-center p-8" style={{ height: 360 }}>
                                    <Text className="text-slate-500 text-base">Không có sản phẩm nào</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={shopItems}
                                    numColumns={2} // Lưới 2 cột
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => <ShopItemCapsule item={item} userPoints={userPoints} language={language} />}
                                    showsVerticalScrollIndicator={false}
                                    style={{ height: 360 }} // Giới hạn chiều cao
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
