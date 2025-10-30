import { IQueryRequest } from "@models/common/common.request";
import { IUserPokemonResponsePagination, IUserPokemonStatsData } from "@models/user-pokemon/user-pokemon.response";
import userPokemonService from "@services/user-pokemon";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
//------------------------End------------------------//


/**
 * Infinite list of user pokemons with pagination support
 */
export const useInfiniteUserPokemons = (params: Omit<IQueryRequest, 'currentPage'>) => {

    console.log('params', params);
    const query = useInfiniteQuery({
        queryKey: ['user-pokemons-infinite', params],
        queryFn: ({ pageParam = 1 }) =>
            userPokemonService.getAll({
                ...params,
                currentPage: pageParam as number,
                pageSize: (params as IQueryRequest).pageSize ?? 15,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = (lastPage as any)?.data?.data?.pagination;
            if (!pagination) return undefined;
            const { current, totalPage } = pagination;
            return current < totalPage ? current + 1 : undefined;
        },
    });

    return query;
};
//------------------------End------------------------//


/**
 * Get pokemon by id with evolution chain
 * @param id 
 * @returns 
 */
export const useGetPokemonByIdWithEvolechain = (id: string) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user-pokemon-evolution-chain', id],
        queryFn: () => userPokemonService.getbyPokemonIdWithEvolechain(id),
    });
    console.log('data', data?.data);
    return { data: data?.data.data, isLoading, isError };
};
//------------------------End------------------------//