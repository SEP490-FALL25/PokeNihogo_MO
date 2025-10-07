import BackScreen from '@components/molecules/Back';
import PokemonGridItem from '@components/Organism/PokemonGridItem';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Search, Trophy } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_POKEMON } from '../../../../mock-data/pokemon';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3; // 3 columns with padding

const userCaughtPokemonIds = new Set([1, 4, 5, 7, 10, 13, 16, 25, 39, 52, 92, 93, 133, 147, 148]);

interface Pokemon {
    id: number;
    name: string;
    caught: boolean;
}

const fullPokedexData: Pokemon[] = ALL_POKEMON.map((pokemon: any) => ({
    ...pokemon,
    caught: userCaughtPokemonIds.has(pokemon.id),
}));

export default function PokemonCollectionScreen() {
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate collection stats
    const collectionStats = useMemo(() => {
        const totalCaught = fullPokedexData.filter(p => p.caught).length;
        const totalPokemon = fullPokedexData.length;
        const percentage = Math.round((totalCaught / totalPokemon) * 100);
        return { totalCaught, totalPokemon, percentage };
    }, []);

    // Filter pokemon list based on search query
    const filteredCollection = useMemo(() => {
        if (!searchQuery) return fullPokedexData;
        return fullPokedexData.filter((p: Pokemon) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(p.id).padStart(3, '0').includes(searchQuery)
        );
    }, [searchQuery]);

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <BackScreen onPress={() => router.back()} color='black' title='Pokémon' />

            {/* Collection Stats Card */}
            <View className="px-4 pt-2 pb-3">
                <LinearGradient
                    colors={['#6FAFB2', '#538f91']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statsCard}
                    className="rounded-3xl p-5 overflow-hidden shadow-lg"
                >
                    {/* Decorative circles */}
                    <View className="absolute w-30 h-30 rounded-full bg-white/10" />
                    <View className="absolute w-20 h-20 rounded-full bg-white/8" />

                    <View className="flex-row items-center mb-4">
                        <View className="w-14 h-14 rounded-2xl bg-white/25 items-center justify-center mr-3.5">
                            <Trophy size={28} color="white" strokeWidth={2.5} />
                        </View>

                        <View className="flex-1">
                            <Text className="text-lg font-extrabold text-white mb-1 tracking-tight">Bộ sưu tập của bạn</Text>
                            <Text className="text-sm font-semibold text-white/90 tracking-wide">
                                {collectionStats.totalCaught} / {collectionStats.totalPokemon} Pokémon
                            </Text>
                        </View>

                        <View className="bg-white/25 px-4 py-2 rounded-2xl">
                            <Text className="text-xl font-extrabold text-white tracking-tight">
                                {collectionStats.percentage}%
                            </Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View className="mt-1">
                        <View className="h-2 bg-white/25 rounded-sm overflow-hidden">
                            <LinearGradient
                                colors={['#10b981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressBarFill,
                                    { width: `${collectionStats.percentage}%` }
                                ]}
                                className="h-full rounded-sm"
                            />
                        </View>
                    </View>
                </LinearGradient>
            </View>

            {/* Search and collection area */}
            <View className="flex-1 px-4">
                {/* Enhanced Search Bar */}
                <View className="mb-3">
                    <LinearGradient
                        colors={['#ffffff', '#fefefe']}
                        style={styles.searchBar}
                    >
                        <View className="w-9 h-9 rounded-xl bg-teal-50 items-center justify-center mr-3">
                            <Search size={20} color="#6FAFB2" strokeWidth={2.5} />
                        </View>
                        <TextInput
                            placeholder="Tìm kiếm theo tên hoặc số thứ tự..."
                            placeholderTextColor="#94A3B8"
                            className="flex-1 text-base font-semibold text-slate-800 tracking-wide"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable
                                onPress={() => setSearchQuery('')}
                                className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
                            >
                                <Text className="text-base font-bold text-slate-500">✕</Text>
                            </Pressable>
                        )}
                    </LinearGradient>
                </View>

                {/* Results count */}
                {searchQuery.length > 0 && (
                    <Text className="text-sm font-bold text-slate-500 mb-3 ml-1 tracking-wide">
                        Tìm thấy {filteredCollection.length} kết quả
                    </Text>
                )}

                {/* Pokemon grid */}
                <FlatList
                    data={filteredCollection}
                    numColumns={3}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <PokemonGridItem item={item} />}
                    showsVerticalScrollIndicator={false}
                    columnWrapperStyle={styles.gridRow}
                    className="pb-6"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Stats Card
    statsCard: {
        borderRadius: 24,
        padding: 20,
        overflow: 'hidden',
        shadowColor: '#6FAFB2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },

    // Search Bar - Complex shadow styles
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },

    // Grid
    gridRow: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
});