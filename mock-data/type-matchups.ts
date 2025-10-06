// src/data/type-matchups.ts

// Bảng màu cho từng hệ
export const TYPE_COLORS = {
    normal: '#A8A878',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F8D030',
    grass: '#7AC74C',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    steel: '#B7B7CE',
    fairy: '#EE99AC',
};

// Bảng dữ liệu khắc hệ
export const TYPE_MATCHUPS = {
    fire: { strongAgainst: ['grass', 'ice', 'bug', 'steel'], weakAgainst: ['water', 'ground', 'rock'] },
    water: { strongAgainst: ['fire', 'ground', 'rock'], weakAgainst: ['grass', 'electric'] },
    grass: { strongAgainst: ['water', 'ground', 'rock'], weakAgainst: ['fire', 'ice', 'poison', 'flying', 'bug'] },
    electric: { strongAgainst: ['water', 'flying'], weakAgainst: ['ground'] },
    ice: { strongAgainst: ['grass', 'ground', 'flying', 'dragon'], weakAgainst: ['fire', 'fighting', 'rock', 'steel'] },
    fighting: { strongAgainst: ['normal', 'ice', 'rock', 'steel'], weakAgainst: ['flying', 'psychic', 'fairy'] },
    poison: { strongAgainst: ['grass', 'fairy'], weakAgainst: ['ground', 'psychic'] },
    ground: { strongAgainst: ['fire', 'electric', 'poison', 'rock', 'steel'], weakAgainst: ['water', 'grass', 'ice'] },
    flying: { strongAgainst: ['grass', 'fighting', 'bug'], weakAgainst: ['electric', 'ice', 'rock'] },
    psychic: { strongAgainst: ['fighting', 'poison'], weakAgainst: ['bug', 'ghost'] },
    bug: { strongAgainst: ['grass', 'psychic'], weakAgainst: ['fire', 'flying', 'rock'] },
    rock: { strongAgainst: ['fire', 'ice', 'flying', 'bug'], weakAgainst: ['water', 'grass', 'fighting', 'ground', 'steel'] },
    ghost: { strongAgainst: ['psychic', 'ghost'], weakAgainst: ['ghost'] },
    dragon: { strongAgainst: ['dragon'], weakAgainst: ['ice', 'dragon', 'fairy'] },
    steel: { strongAgainst: ['ice', 'rock', 'fairy'], weakAgainst: ['fire', 'fighting', 'ground'] },
    fairy: { strongAgainst: ['fighting', 'dragon'], weakAgainst: ['poison', 'steel'] },
    normal: { strongAgainst: [], weakAgainst: ['fighting'] },
};