export interface Starter {
    id: string;
    name: string;
    type: string[];
    image: string;
}

export interface StarterCardProps {
    starter: Starter;
    selected: boolean;
    onSelect: (id: string) => void;
}

export type PokemonType =
    | 'fire'
    | 'water'
    | 'grass'
    | 'electric'
    | 'ground'
    | 'rock'
    | 'flying'
    | 'ice';

export interface TypeConfig {
    icon: string;
    color: string;
}
