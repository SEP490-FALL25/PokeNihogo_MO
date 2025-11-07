import { axiosPrivate } from "@configs/axios";

const battleService = {
    matchQueue: async () => {
        return await axiosPrivate.post(`/match-queue`);
    },

    cancelQueue: async () => {
        return axiosPrivate.delete(`/match-queue/user`);
    },

    updateMatchParticipant: async (matchId: string, hasAccepted: boolean) => {
        return axiosPrivate.put(`/match-participant/${matchId}`, { hasAccepted });
    },

    getListMatchRound: async () => {
        return axiosPrivate.get(`/match-round/now/user`);
    },

    getListUserPokemonRound: async (typeId: number) => {
        return await axiosPrivate.get(`/user-pokemon/user/rounds/pokemons?qs=types=${typeId}`);
    },

    choosePokemon: async (matchId: number, pokemonId: number) => {
        console.log("choosePokemon", matchId, pokemonId);
        return axiosPrivate.put(`/match-round-participant/choose-pokemon/round/${matchId}`, { pokemonId });
    },
};

export default battleService;

