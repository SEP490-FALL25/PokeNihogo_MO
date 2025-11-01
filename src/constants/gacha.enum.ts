export const GACHA_BANNER_STATUS = {
    PREVIEW: 'PREVIEW',
    EXPIRED: 'EXPIRED',
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
} as const;

export const RARITY_MAP: { [key: string]: number } = {
    'COMMON': 1,
    'UNCOMMON': 2,
    'RARE': 3,
    'EPIC': 4,
    'LEGENDARY': 5,
};

export const STAR_TYPE_MAP: { [key: string]: number } = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5,
};
