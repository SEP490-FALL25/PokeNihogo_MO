import BackScreen from '@components/molecules/Back';
import GachaAnimation from '@components/Organism/GachaAnimation';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CURRENT_BANNER, POKEMON_POOL, RARITY } from '../../../mock-data/gacha';

// --- Logic Gacha (giả lập) ---
const performWish = (count: number) => {
    const results = [];
    for (let i = 0; i < count; i++) {
        const rand = Math.random() * 100;
        let pool;
        if (rand < 5) { // 5% tỉ lệ ra 5 sao
            pool = POKEMON_POOL.filter((p: any) => p.rarity === RARITY.LEGENDARY);
        } else if (rand < 20) { // 15% tỉ lệ ra 4 sao
            pool = POKEMON_POOL.filter((p: any) => p.rarity === RARITY.RARE);
        } else { // 80% tỉ lệ ra 3 sao
            pool = POKEMON_POOL.filter((p: any) => p.rarity === RARITY.COMMON);
        }
        results.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return results;
};

export default function GachaScreen() {
    const [gachaResults, setGachaResults] = useState<any[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleWish = (count: number) => {
        const results = performWish(count);
        setGachaResults(results as any);
        setIsAnimating(true);
    };

    const handleAnimationFinish = () => {
        setIsAnimating(false);
        setGachaResults([]);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color="white" title="Cầu nguyện">
            </BackScreen>

            <View className="flex-1">
                {/* Banner */}
                <View className="p-4">
                    <ImageBackground source={{ uri: CURRENT_BANNER.featuredPokemon.image }} resizeMode="cover" className="h-56 rounded-2xl overflow-hidden justify-end p-4">
                        <Text className="text-white text-3xl font-bold">{CURRENT_BANNER.name}</Text>
                        <Text className="text-white/80">Tăng tỉ lệ nhận {CURRENT_BANNER.featuredPokemon.name}!</Text>
                    </ImageBackground>
                </View>

                {/* Wish Buttons */}
                <View className="px-4 mt-auto mb-4 gap-3">
                    <TouchableOpacity
                        onPress={() => handleWish(1)}
                        className="bg-cyan-500 p-4 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold text-lg">Cầu nguyện x1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleWish(10)}
                        className="bg-purple-600 p-4 rounded-xl items-center"
                    >
                        <Text className="text-white font-bold text-lg">Cầu nguyện x10 (Đảm bảo 1 Pokémon 4★ trở lên)</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Animation Overlay */}
            {isAnimating && <GachaAnimation results={gachaResults} onFinish={handleAnimationFinish} />}
        </SafeAreaView>
    );
}