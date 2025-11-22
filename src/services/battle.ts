import { axiosPrivate } from "@configs/axios";
import { ISubmitAnswer } from "@models/battle/battle.response";
import { IQueryRequest } from "@models/common/common.request";

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
        return axiosPrivate.put(`/match-round-participant/choose-pokemon/round/${matchId}`, { pokemonId });
    },

    submitAnswer: async (roundQuestionId: number, data: ISubmitAnswer) => {
        return axiosPrivate.put(`/round-question/answer/${roundQuestionId}`, data);
    },

    getUserMatchingHistory: async (params?: IQueryRequest) => {
        const queryParams: IQueryRequest = {
            currentPage: params?.currentPage || 1,
            pageSize: params?.pageSize || 20,
            ...params,
        };
        return axiosPrivate.get(`/user/matching/history`, { params: queryParams });
    },

    claimRewardSeason: async (userSeasonHistoryId: number) => {
        return axiosPrivate.put(`/user-season-history/get-reward/${userSeasonHistoryId}`);
    },

    joinNewSeason: async () => {
        return axiosPrivate.post(`/user-season-history/join`);
    },

    matchTracking: async () => {
        return axiosPrivate.get('/match/tracking')
    }
};

export default battleService;

