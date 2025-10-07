import { ROUTES } from "@routes/routes";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo, useState } from "react";
import { ActivityIndicator, Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 3;

interface Pokemon {
    id: number;
    name: string;
    caught: boolean;
}

interface PokemonGridItemProps {
    item: Pokemon;
}


const PokemonGridItem = memo<PokemonGridItemProps>(({ item }) => {
    const [isLoading, setIsLoading] = useState(true);
    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`;

    const handlePress = () => {
        if (item.caught) {
            router.push({
                pathname: ROUTES.ME.POKEMON_DETAIL,
                params: { id: item.id.toString() }
            });
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            style={[
                styles.pokemonCard,
            ]}
            className={`${!item.caught ? 'opacity-60' : ''}`}
        >
            {item.caught ? (
                <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    style={styles.pokemonCardGradient}
                    className="w-full h-full items-center justify-center shadow-lg"
                >
                    {/* Loading indicator */}
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color="#6FAFB2"
                            className="absolute"
                        />
                    )}

                    {/* Pokemon image */}
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.pokemonImage}
                        className="w-24 h-24"
                        resizeMode="contain"
                        onLoadEnd={() => setIsLoading(false)}
                    />

                    {/* Name and ID */}
                    <LinearGradient
                        colors={['rgba(111, 175, 178, 0.643)', 'rgba(95, 169, 171, 0.741)']}
                        style={styles.pokemonInfo}
                    >
                        <Text className="text-white text-xs font-extrabold text-center mb-0.5 tracking-wide capitalize" numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text className="text-white/85 text-xs font-bold text-center tracking-wider">
                            #{String(item.id).padStart(3, '0')}
                        </Text>
                    </LinearGradient>
                </LinearGradient>
            ) : (
                <View className="w-full h-full bg-slate-200 items-center justify-center">
                    {/* Loading indicator */}
                    {isLoading && (
                        <ActivityIndicator
                            size="small"
                            color="#cbd5e1"
                            className="absolute"
                        />
                    )}

                    {/* Pokemon silhouette */}
                    <Image
                        source={{ uri: imageUrl }}
                        style={[styles.pokemonImage, styles.pokemonImageUncaught]}
                        className="w-24 h-24"
                        resizeMode="contain"
                        onLoadEnd={() => setIsLoading(false)}
                    />

                    {/* Name and ID */}
                    <View className="absolute bottom-0 w-full py-1 px-3 bg-slate-400/30 rounded-b-2xl">
                        <Text className="text-slate-500 text-xs font-extrabold text-center mb-0.5 tracking-widest" numberOfLines={1}>
                            ???
                        </Text>
                        <Text className="text-slate-400 text-xs font-bold text-center tracking-wider">
                            #{String(item.id).padStart(3, '0')}
                        </Text>
                    </View>
                </View>
            )}
        </Pressable>
    );
});

const styles = StyleSheet.create({
    pokemonCard: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 4,
    },
    pokemonCardGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6FAFB2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    pokemonCardUncaught: {
        opacity: 0.6,
    },
    pokemonImage: {
        width: CARD_SIZE * 0.6,
        height: CARD_SIZE * 0.6,
    },
    pokemonImageUncaught: {
        tintColor: '#cbd5e1',
        opacity: 0.4,
    },
    pokemonInfo: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
});

export default PokemonGridItem;