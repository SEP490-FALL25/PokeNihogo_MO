// src/data/gacha.ts
import { IGachaBannerSchema } from '@models/gacha/gacha.entity';
import { ALL_POKEMON } from './pokemon';

// Định nghĩa các bậc hiếm
export const RARITY = {
    COMMON: 3,    // 3 sao
    RARE: 4,      // 4 sao
    LEGENDARY: 5, // 5 sao
};

// Gán độ hiếm cho từng Pokémon
export const POKEMON_POOL = ALL_POKEMON.map((p: any) => {
    if ([144, 145, 146, 150, 151].includes(p.id)) {
        return { ...p, rarity: RARITY.LEGENDARY };
    }
    if ([3, 6, 9, 26, 65, 94, 130, 143, 149].includes(p.id)) {
        return { ...p, rarity: RARITY.RARE };
    }
    return { ...p, rarity: RARITY.COMMON };
});

// Banner hiện tại (legacy)
export const CURRENT_BANNER = {
    id: 'banner-01',
    name: 'Draconic Flames',
    featuredPokemon: POKEMON_POOL.find((p: any) => p.id === 149), // Dragonite
    rateUpPokemon: [ // Tăng tỉ lệ
        POKEMON_POOL.find((p: any) => p.id === 4),   // Charmander
        POKEMON_POOL.find((p: any) => p.id === 147), // Dratini
        POKEMON_POOL.find((p: any) => p.id === 133), // Eevee
    ],
};

// Mock Gacha Banners
export const MOCK_GACHA_BANNERS: IGachaBannerSchema[] = [
    {
        id: 2,
        nameKey: "gachaBanner.name.2",
        startDate: "2025-10-27T00:00:00.000Z",
        endDate: "2025-11-27T00:00:00.000Z",
        status: "ACTIVE",
        enablePrecreate: true,
        precreateBeforeEndDays: 2,
        isRandomItemAgain: true,
        hardPity5Star: 90,
        costRoll: 160,
        amount5Star: 1,
        amount4Star: 2,
        amount3Star: 3,
        amount2Star: 4,
        amount1Star: 5,
        createdById: 1,
        updatedById: null,
        deletedById: null,
        deletedAt: null,
        createdAt: "2025-10-30T17:43:53.011Z",
        updatedAt: "2025-10-30T17:43:53.042Z",
        nameTranslation: "Banner Ước Nguyện Giáng Sinh",
        nameTranslations: [
            { key: "en", value: "Christmas Wish Banner" },
            { key: "ja", value: "クリスマス願いバナー" },
            { key: "vi", value: "Banner Ước Nguyện Giáng Sinh" }
        ],
        items: [
            {
                id: 3001,
                bannerId: 2,
                pokemonId: 25, // Pikachu
                gachaItemRateId: 1,
                createdById: 1,
                updatedById: null,
                deletedById: null,
                createdAt: "2025-10-30T17:43:53.011Z",
                updatedAt: "2025-10-30T17:43:53.011Z",
                deletedAt: null,
                pokemon: {
                    id: 25,
                    pokedex_number: 25,
                    nameJp: "ピカチュウ",
                    nameTranslations: { en: "Pikachu", ja: "ピカチュウ", vi: "Pikachu" },
                    description: "Electric mouse Pokemon",
                    conditionLevel: 10,
                    isStarted: false,
                    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
                    rarity: "RARE",
                    createdById: 1,
                    updatedById: null,
                    deletedById: null,
                    createdAt: "2025-10-30T17:43:53.011Z",
                    updatedAt: "2025-10-30T17:43:53.011Z",
                    deletedAt: null,
                }
            },
            {
                id: 3002,
                bannerId: 2,
                pokemonId: 1, // Bulbasaur
                gachaItemRateId: 2,
                createdById: 1,
                updatedById: null,
                deletedById: null,
                createdAt: "2025-10-30T17:43:53.011Z",
                updatedAt: "2025-10-30T17:43:53.011Z",
                deletedAt: null,
                pokemon: {
                    id: 1,
                    pokedex_number: 1,
                    nameJp: "フシギダネ",
                    nameTranslations: { en: "Bulbasaur", ja: "フシギダネ", vi: "Fushigidane" },
                    description: "Seed Pokemon",
                    conditionLevel: 5,
                    isStarted: false,
                    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
                    rarity: "COMMON",
                    createdById: 1,
                    updatedById: null,
                    deletedById: null,
                    createdAt: "2025-10-30T17:43:53.011Z",
                    updatedAt: "2025-10-30T17:43:53.011Z",
                    deletedAt: null,
                }
            },
        ]
    },
    {
        id: 5,
        nameKey: "gachaBanner.name.5",
        startDate: "2025-10-31T00:00:00.000Z",
        endDate: "2025-12-30T00:00:00.000Z",
        status: "ACTIVE",
        enablePrecreate: true,
        precreateBeforeEndDays: 2,
        isRandomItemAgain: false,
        hardPity5Star: 90,
        costRoll: 160,
        amount5Star: 1,
        amount4Star: 20,
        amount3Star: 400,
        amount2Star: 150,
        amount1Star: 150,
        createdById: 1,
        updatedById: 1,
        deletedById: null,
        deletedAt: null,
        createdAt: "2025-10-31T18:23:34.052Z",
        updatedAt: "2025-11-01T07:28:17.429Z",
        nameTranslation: "Cuộc Gặp Gỡ Thường Trực",
        nameTranslations: [
            { key: "en", value: "Standard Encounter" },
            { key: "ja", value: "通常の出会い" },
            { key: "vi", value: "Cuộc Gặp Gỡ Thường Trực" }
        ],
        items: [
            {
                id: 3075,
                bannerId: 5,
                pokemonId: 115, // Kangaskhan
                gachaItemRateId: 5,
                createdById: 1,
                updatedById: 1,
                deletedById: null,
                createdAt: "2025-11-01T07:22:27.469Z",
                updatedAt: "2025-11-01T07:22:27.469Z",
                deletedAt: null,
                pokemon: {
                    id: 115,
                    pokedex_number: 115,
                    nameJp: "ガルーラ",
                    nameTranslations: { en: "Kangaskhan", ja: "ガルーラ", vi: "Garuura" },
                    description: "Parent Pokemon",
                    conditionLevel: 20,
                    isStarted: false,
                    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/115.png",
                    rarity: "COMMON",
                    createdById: 1,
                    updatedById: 1,
                    deletedById: null,
                    createdAt: "2025-11-01T07:22:27.469Z",
                    updatedAt: "2025-11-01T07:22:27.469Z",
                    deletedAt: null,
                }
            },
            {
                id: 3076,
                bannerId: 5,
                pokemonId: 128, // Tauros
                gachaItemRateId: 5,
                createdById: 1,
                updatedById: 1,
                deletedById: null,
                createdAt: "2025-11-01T07:22:27.469Z",
                updatedAt: "2025-11-01T07:22:27.469Z",
                deletedAt: null,
                pokemon: {
                    id: 128,
                    pokedex_number: 128,
                    nameJp: "ケンタロス",
                    nameTranslations: { en: "Tauros", ja: "ケンタロス", vi: "Kentarosu" },
                    description: "Wild Bull Pokemon",
                    conditionLevel: 15,
                    isStarted: false,
                    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png",
                    rarity: "COMMON",
                    createdById: 1,
                    updatedById: 1,
                    deletedById: null,
                    createdAt: "2025-11-01T07:22:27.469Z",
                    updatedAt: "2025-11-01T07:22:27.469Z",
                    deletedAt: null,
                }
            },
            {
                id: 3077,
                bannerId: 5,
                pokemonId: 127, // Pinsir
                gachaItemRateId: 5,
                createdById: 1,
                updatedById: 1,
                deletedById: null,
                createdAt: "2025-11-01T07:22:27.469Z",
                updatedAt: "2025-11-01T07:22:27.469Z",
                deletedAt: null,
                pokemon: {
                    id: 127,
                    pokedex_number: 127,
                    nameJp: "カイロス",
                    nameTranslations: { en: "Pinsir", ja: "カイロス", vi: "Kairosu" },
                    description: "Stag Beetle Pokemon",
                    conditionLevel: 18,
                    isStarted: false,
                    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png",
                    rarity: "COMMON",
                    createdById: 1,
                    updatedById: 1,
                    deletedById: null,
                    createdAt: "2025-11-01T07:22:27.469Z",
                    updatedAt: "2025-11-01T07:22:27.469Z",
                    deletedAt: null,
                }
            },
            {
                id: 3078,
                bannerId: 5,
                pokemonId: 131, // Lapras
                gachaItemRateId: 5,
                createdById: 1,
                updatedById: 1,
                deletedById: null,
                createdAt: "2025-11-01T07:22:27.469Z",
                updatedAt: "2025-11-01T07:22:27.469Z",
                deletedAt: null,
                pokemon: {
                    id: 131,
                    pokedex_number: 131,
                    nameJp: "ラプラス",
                    nameTranslations: { en: "Lapras", ja: "ラプラス", vi: "Rapurasu" },
                    description: "Transport Pokemon",
                    conditionLevel: 25,
                    isStarted: false,
                    imageUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png",
                    rarity: "RARE",
                    createdById: 1,
                    updatedById: 1,
                    deletedById: null,
                    createdAt: "2025-11-01T07:22:27.469Z",
                    updatedAt: "2025-11-01T07:22:27.469Z",
                    deletedAt: null,
                }
            },
        ]
    },
];