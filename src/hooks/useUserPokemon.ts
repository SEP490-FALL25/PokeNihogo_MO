import { IQueryRequest } from "@models/common/common.request";
import { IUserPokemonResponsePagination, IUserPokemonStatsData } from "@models/user-pokemon/user-pokemon.response";
import userPokemonService from "@services/user-pokemon";
import { useQuery } from "@tanstack/react-query";

export const useListUserPokemons = (params: IQueryRequest) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-pokemons', params],
        queryFn: () => userPokemonService.getAll(params),
    });
    return { data: data?.data as IUserPokemonResponsePagination, isLoading, isError };
};

export const useGetUserPokemonStats = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-pokemon-stats'],
        queryFn: () => userPokemonService.getUserPokemonStats(),
    });
    return { data: data?.data.data as IUserPokemonStatsData, isLoading, isError };
};