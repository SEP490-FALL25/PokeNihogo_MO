import BackScreen from '@components/molecules/Back';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StatusBar, Text, TextInput, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_POKEMON } from '../../../mock-data/pokemon';

const userCaughtPokemonIds = new Set([1, 4, 5, 7, 10, 13, 16, 25, 39, 52, 92, 93, 133, 147, 148]);

const fullPokedexData = ALL_POKEMON.map((pokemon: any) => ({
    ...pokemon,
    caught: userCaughtPokemonIds.has(pokemon.id),
}));

const PokemonGridItem = React.memo(({ item }: { item: any }) => {
    const [isLoading, setIsLoading] = useState(true);
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;

    const handlePress = () => {
        if (item.caught) {
            router.push(`/pokemon/${item.id}`);
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            className="flex-1 m-1.5 items-center justify-center aspect-square"
        >
            <View className="absolute w-full h-full bg-slate-200 rounded-xl" />

            {/* Vòng xoay loading */}
            {isLoading && <ActivityIndicator size="small" color="#94a3b8" className="absolute" />}

            {/* Ảnh Pokémon */}
            <Image
                source={{ uri: imageUrl }}
                className="w-20 h-20"
                resizeMode="contain"
                onLoadEnd={() => setIsLoading(false)}
                style={!item.caught ? { tintColor: '#cbd5e1' } : {}}
            />

            {/* Dải băng tên và ID ở dưới */}
            <View className="absolute bottom-0 w-full p-1.5 bg-black/20 rounded-b-xl">
                <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>{item.name}</Text>
                <Text className="text-white/70 text-[10px] text-center">#{String(item.id).padStart(3, '0')}</Text>
            </View>
        </Pressable>
    );
});

export default function PokemonCollectionScreen() {

    const [searchQuery, setSearchQuery] = useState('');

    // Lọc danh sách Pokémon dựa trên tìm kiếm
    const filteredCollection = useMemo(() => {
        if (!searchQuery) return fullPokedexData;
        return fullPokedexData.filter((p: any) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(p.id).padStart(3, '0').includes(searchQuery)
        );
    }, [searchQuery]);

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <StatusBar barStyle="dark-content" />
            <BackScreen onPress={() => router.back()} color='black'>
                <Text className="text-2xl font-bold text-slate-800">Pokémon</Text>
            </BackScreen>

            {/* --- Khu vực tìm kiếm và bộ sưu tập --- */}
            <View className="flex-1 px-2">
                <View className="flex-row items-center bg-white rounded-full p-2 my-2 border border-slate-200 shadow-sm">
                    <Search size={20} color="#94A3B8" className="mx-2" />
                    <TextInput
                        placeholder="Tìm kiếm theo tên hoặc số thứ tự..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-slate-800 text-base"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* --- Lưới Pokémon --- */}
                <FlatList
                    data={filteredCollection}
                    numColumns={3}
                    keyExtractor={(item) => item.id.toString()} // eslint-disable-line @typescript-eslint/no-explicit-any
                    renderItem={({ item }) => <PokemonGridItem item={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </SafeAreaView>
    );
}   