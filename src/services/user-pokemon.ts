import { axiosPrivate } from "@configs/axios";
import { IGetNewPokemonRequest } from "@models/user-pokemon/user-pokemon.request";

const userPokemonService = {
  getNewPokemon: async (data: IGetNewPokemonRequest) => {
    return axiosPrivate.post(`/user-pokemon`, data);
  },
  getOwnedPokemons: async () => {
    return axiosPrivate.get(`/user-pokemon`);
  },
};

export default userPokemonService;
