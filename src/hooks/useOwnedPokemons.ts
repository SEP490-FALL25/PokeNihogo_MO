import userPokemonService from '@services/user-pokemon';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useOwnedPokemons = () => {
    const { data: ownedPokemons, isLoading, isError, error } = useQuery({
        queryKey: ['owned-pokemons'],
        queryFn: () => userPokemonService.getOwnedPokemons(),
    });

    useEffect(() => {
        if (isError) {
            console.error("--- LỖI TỪ API GET OWNED POKEMONS ---");
            console.error("Lỗi chi tiết:", error?.message);
        }
    }, [isError, error]);

    return {
        ownedPokemons: ownedPokemons?.data,
        isLoading,
        isError,
        error,
    };
};

export default useOwnedPokemons;
