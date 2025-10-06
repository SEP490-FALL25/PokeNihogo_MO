import BackScreen from '@components/molecules/Back';
import GunnyEffect from '@components/molecules/GlowingRingEffect';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockPokemonCollection = [
    { id: 25, name: 'Pikachu', caught: true, platformColor: '#F7D02C' },
    { id: 4, name: 'Charmander', caught: true, platformColor: '#EE8130' },
    { id: 7, name: 'Squirtle', caught: true, platformColor: '#6390F0' },
    { id: 1, name: 'Bulbasaur', caught: true, platformColor: '#7AC74C' },
    { id: 149, name: 'Dragonite', caught: false, platformColor: '#6F35FC' },
];

export default function PokemonCollectionScreen() {
    const [selectedPokemon, setSelectedPokemon] = useState(mockPokemonCollection.find(p => p.caught));
    const pokemonFloat = useSharedValue(0);

    useEffect(() => {
        'worklet';
        pokemonFloat.value = withRepeat(
            withTiming(10, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
    }, []);

    const pokemonAnimatedStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [{ translateY: pokemonFloat.value }],
        };
    });

    if (!selectedPokemon) {
        return <SafeAreaView className="flex-1 bg-slate-900" />;
    }

    const selectedPokemonImageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`;

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <StatusBar barStyle="light-content" />
            <BackScreen onPress={() => router.back()} color="white">
                <Text className="text-2xl font-bold text-white">Pokédex</Text>
            </BackScreen>

            <View className="flex-1 items-center justify-center">
                <View className="items-center mb-4">
                    <Text className="text-5xl font-bold text-white tracking-wider">{selectedPokemon.name}</Text>
                    <Text className="text-2xl font-semibold text-slate-400">#{String(selectedPokemon.id).padStart(3, '0')}</Text>
                </View>

                {/* --- Pokémon Display --- */}
                <View className="w-80 h-80 items-center justify-center">
                    {/* --- Pokemon Image --- */}
                    <Animated.View style={pokemonAnimatedStyle} className="z-10">
                        <Image
                            source={{ uri: selectedPokemonImageUrl }}
                            className="w-64 h-64"
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {/* --- Gunny Effect --- */}
                    <View className="absolute -bottom-28">
                        <GunnyEffect color={selectedPokemon.platformColor} ringSize={250} />
                    </View>
                </View>
            </View>

            {/* --- Băng chuyền chọn Pokémon --- */}
            <View className="h-36 border-t-2 border-cyan-400/30">
                <Text className="text-white font-bold text-lg text-center py-2">Bộ sưu tập</Text>
                <FlatList
                    data={mockPokemonCollection}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}
                    renderItem={({ item }) => {
                        const isSelected = item.id === selectedPokemon.id;
                        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;

                        return (
                            <TouchableOpacity
                                onPress={() => item.caught && setSelectedPokemon(item)}
                                className={`w-20 h-20 rounded-full mx-2 items-center justify-center border-2 ${isSelected ? 'border-cyan-400' : 'border-transparent'}`}
                            >
                                <View className="p-1 bg-white/10 rounded-full">
                                    <Image
                                        source={{ uri: imageUrl }}
                                        className="w-16 h-16"
                                        style={!item.caught ? { tintColor: '#1e293b' } : {}}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </SafeAreaView>
    );
}