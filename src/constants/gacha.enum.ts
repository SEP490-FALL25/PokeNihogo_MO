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
