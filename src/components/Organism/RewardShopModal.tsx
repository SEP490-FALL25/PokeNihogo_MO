
import { LinearGradient } from 'expo-linear-gradient';
import { Star, X } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, Image, ImageBackground, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

interface RewardShopModalProps {
    isVisible: boolean;
    onClose: () => void;
    userPoints: number;
}

// Component con cho mỗi "viên nang" Pokémon
const ShopItemCapsule = ({ item, userPoints }: { item: any, userPoints: number }) => {
    const canAfford = userPoints >= item.cost;
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;

    const handlePurchase = () => { /* ... (logic không đổi) ... */ };

    return (
        <View className="w-1/2 p-2">
            <View className="bg-white rounded-3xl shadow-lg shadow-slate-300 overflow-hidden">
                {/* Phần hiển thị Pokémon */}
                <View className="items-center p-4 bg-slate-100">
                    <Image source={{ uri: imageUrl }} className="w-24 h-24" />
                </View>

                {/* Phần thông tin */}
                <View className="p-3">
                    <Text className="text-slate-800 font-bold text-lg text-center" numberOfLines={1}>{item.name}</Text>
                    <View className="flex-row items-center justify-center my-2">
                        <Star size={16} color="#f59e0b" fill="#fbbf24" />
                        <Text className="text-amber-500 font-bold text-base ml-1">{item.cost.toLocaleString()}</Text>
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
                                    <Text className="text-xl font-bold text-teal-700">ポイント交換</Text>
                                    <Text className="text-slate-500 font-semibold">Cửa hàng Điểm thưởng</Text>
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

                            <FlatList
                                data={SHOP_POKEMON}
                                numColumns={2} // Lưới 2 cột
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => <ShopItemCapsule item={item} userPoints={userPoints} />}
                                showsVerticalScrollIndicator={false}
                                style={{ height: 400 }} // Giới hạn chiều cao
                                contentContainerStyle={{ padding: 4 }}
                            />
                        </View>
                    </TWLinearGradient>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

import { StyleSheet } from 'react-native';
import { SHOP_POKEMON } from '../../../mock-data/shop';

