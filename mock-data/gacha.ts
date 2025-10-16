// src/data/gacha.ts
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

// Banner hiện tại
export const CURRENT_BANNER = {
    id: 'banner-01',
    name: 'Draconic Flames',
    featuredPokemon: POKEMON_POOL.find((p: any) => p.id === 149), // Dragonite
    rateUpPokemon: [ // Tăng tỉ lệ
        POKEMON_POOL.find((p: any) => p.id === 4),   // Charmander
        POKEMON_POOL.find((p: any) => p.id === 147), // Dratini
        POKEMON_POOL.find((p: any) => p.id === 133), // Eevee
    ],
    // backgroundImage: require('../assets/images/gacha-banner-bg.jpg'), // Bạn cần thêm ảnh này
};