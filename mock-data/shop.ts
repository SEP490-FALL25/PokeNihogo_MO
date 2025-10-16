

export interface ShopItemData {
    id: number;
    name: string;
    cost: number; // Giá bán bằng điểm
}

// Danh sách các Pokémon đặc biệt có trong cửa hàng
export const SHOP_POKEMON: ShopItemData[] = [
    { id: 143, name: 'Snorlax', cost: 15000 },
    { id: 131, name: 'Lapras', cost: 20000 },
    { id: 132, name: 'Ditto', cost: 25000 },
    { id: 137, name: 'Porygon', cost: 30000 },
    { id: 144, name: 'Articuno', cost: 50000 }, // Pokémon huyền thoại
    { id: 151, name: 'Mew', cost: 100000 },      // Pokémon huyền ảo
];