import userPokemonService from '@services/user-pokemon';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

//TODO: Remove mock data when API is ready
// Mock Pokemon for demo when API fails
const mockOwnedPokemons = [
    {
        id: 1,
        pokemonId: 1,
        userId: 1,
        nickname: "Bulbasaur",
        exp: 50,
        levelId: 1,
        isEvolved: false,
        isMain: true,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pokemon: {
            id: 1,
            pokedex_number: 1,
            nameJp: "フシギダネ",
            nameTranslations: { en: "Bulbasaur", ja: "フシギダネ", vi: "Hạt cây" },
            description: "Seed Pokemon",
            imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            rarity: "common",
            types: [{ id: 1, type_name: "grass", display_name: { en: "Grass", ja: "草", vi: "Cỏ" }, color_hex: "#7AC74C" }],
        },
        level: { id: 1, levelNumber: 5, requiredExp: 100, levelType: "pokemon" },
        user: { id: 1, name: "User", email: "user@example.com" },
    },
    {
        id: 2,
        pokemonId: 4,
        userId: 1,
        nickname: "Charmander",
        exp: 75,
        levelId: 1,
        isEvolved: false,
        isMain: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pokemon: {
            id: 4,
            pokedex_number: 4,
            nameJp: "ヒトカゲ",
            nameTranslations: { en: "Charmander", ja: "ヒトカゲ", vi: "Charmander" },
            description: "Lizard Pokemon",
            imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
            rarity: "common",
            types: [{ id: 2, type_name: "fire", display_name: { en: "Fire", ja: "炎", vi: "Lửa" }, color_hex: "#EE8130" }],
        },
        level: { id: 1, levelNumber: 5, requiredExp: 100, levelType: "pokemon" },
        user: { id: 1, name: "User", email: "user@example.com" },
    },
    {
        id: 3,
        pokemonId: 7,
        userId: 1,
        nickname: "Squirtle",
        exp: 30,
        levelId: 1,
        isEvolved: false,
        isMain: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pokemon: {
            id: 7,
            pokedex_number: 7,
            nameJp: "ゼニガメ",
            nameTranslations: { en: "Squirtle", ja: "ゼニガメ", vi: "Squirtle" },
            description: "Tiny Turtle Pokemon",
            imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
            rarity: "common",
            types: [{ id: 3, type_name: "water", display_name: { en: "Water", ja: "水", vi: "Nước" }, color_hex: "#6390F0" }],
        },
        level: { id: 1, levelNumber: 5, requiredExp: 100, levelType: "pokemon" },
        user: { id: 1, name: "User", email: "user@example.com" },
    },
];

export const useOwnedPokemons = () => {
    const { data: ownedPokemons, isLoading, isError, error } = useQuery({
        queryKey: ['owned-pokemons'],
        queryFn: () => userPokemonService.getOwnedPokemons(),
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            console.error("--- LỖI TỪ API GET OWNED POKEMONS, SỬ DỤNG MOCK DATA ---");
            console.error("Lỗi chi tiết:", error?.message);
        }
    }, [isError, error]);

    // Always use mock data for demo (skip API call)
    const resultData = mockOwnedPokemons;

    return {
        ownedPokemons: resultData,
        isLoading: false, // Set to false so mock data shows immediately
        isError,
        error,
    };
};

export default useOwnedPokemons;
