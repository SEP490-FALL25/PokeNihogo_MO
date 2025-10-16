import { IQueryRequest } from "@models/common/common.request";
import userPokemonService from "@services/user-pokemon";
import { useQuery } from "@tanstack/react-query";

export const useListUserPokemons = (params: IQueryRequest) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-pokemons', params],
        queryFn: () => userPokemonService.getAll(params),
    });
    return { data: data?.data?.data, isLoading, isError };
};