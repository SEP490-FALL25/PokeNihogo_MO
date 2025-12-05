import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/common.request";
import { IGetNewPokemonRequest } from "@models/user-pokemon/user-pokemon.request";

const userPokemonService = {
  getAll: async (params: IQueryRequest) => {
    const queryParams = new URLSearchParams();
    const filters: string[] = [];

    if (params.currentPage) queryParams.append('currentPage', params.currentPage.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (typeof params.hasPokemon === 'boolean') queryParams.append('hasPokemon', params.hasPokemon.toString());

    if (params.types && params.types !== 'all') {
      filters.push(`types=${params.types}`);
    }

    if (params.types && params.types !== 'all') {
      const typesValue = Array.isArray(params.types)
        ? params.types.map(String).join('|')
        : String(params.types);
      if (typesValue.length > 0) filters.push(`types=${typesValue}`);
    }
    if (params.rarity && params.rarity !== 'all') {
      filters.push(`rarity=${params.rarity}`);
    }
    if (params.search) {
      filters.push(`nameTranslations.en:like=${params.search}`);
    }
    if (params.sort) {
      filters.push(`sort:${params.sort}`);
    }

    if (filters.length > 0) {
      const qsValue = filters.join(',');
      queryParams.append('qs', qsValue);
    }

    const queryString = queryParams.toString();
    return await axiosPrivate.get(`/user-pokemon/user/pokemons?${queryString}`);
  },
  getNewPokemon: async (data: IGetNewPokemonRequest) => {
    return axiosPrivate.post(`/user-pokemon`, data);
  },
  getOwnedPokemons: async () => {
    return axiosPrivate.get(`/user-pokemon`);
  },
  getUserPokemonStats: async () => {
    return axiosPrivate.get(`/user-pokemon/user/pokemons/stats`);
  },
  getbyPokemonIdWithEvolechain: async (id: string) => {
    return axiosPrivate.get(`/user-pokemon/evolves/${id}`);
  },
};

export default userPokemonService;
