import { axiosPrivate } from "@configs/axios";
import { IBattleDraftState, IBattleMatch, IBattleState } from "@models/battle/battle.response";

// Store draft state in memory for demo
let draftStateStore: Record<string, IBattleDraftState> = {};

const battleService = {
    matchQueue: async () => {
        return await axiosPrivate.post(`/match-queue`);
    },

    cancelQueue: async () => {
        return axiosPrivate.delete(`/match-queue/user`);
    },

    updateMatchParticipant: async (matchId: string, hasAccepted: boolean) => {
        console.log("updateMatchParticipant", matchId, hasAccepted);
        return axiosPrivate.put(`/match-participant/${matchId}`, { hasAccepted });
    },

    getListMatchRound: async () => {
        return axiosPrivate.get(`/match-round/now/user`);
    },

    getListUserPokemonRound: async (typeId: number) => {
        return axiosPrivate.get(`/user-pokemon/user/rounds/pokemons?qs=types=${typeId}`);
    },

    // Get current match status (simulated)
    getCurrentMatch: async (): Promise<IBattleMatch> => {
        // Simulated matchmaking with random delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockMatch: IBattleMatch = {
            id: `match_${Date.now()}`,
            playerId: 1,
            opponentId: 2,
            playerName: "You",
            opponentName: "Trainer Alice",
            playerAvatar: undefined,
            opponentAvatar: undefined,
            status: "matched",
            createdAt: new Date().toISOString(),
        };

        return mockMatch;
    },

    // Accept match
    acceptMatch: async (matchId: string): Promise<IBattleDraftState> => {
        // Simulate accepting match
        await new Promise((resolve) => setTimeout(resolve, 500));

        const draftState: IBattleDraftState = {
            matchId,
            playerPicks: [],
            opponentPicks: [],
            currentTurn: 1,
            isComplete: false,
        };

        // Store state
        draftStateStore[matchId] = draftState;

        return draftState;
    },

    // Submit draft pick
    submitDraftPick: async (matchId: string, pokemonId: number, turn: number, isPlayerPick: boolean = true): Promise<IBattleDraftState> => {
        // Simulate submitting pick
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Get current state
        const currentState = draftStateStore[matchId] || {
            matchId,
            playerPicks: [],
            opponentPicks: [],
            currentTurn: 1,
            isComplete: false,
        };

        // Update picks based on who is picking
        const updatedState: IBattleDraftState = {
            matchId,
            playerPicks: isPlayerPick
                ? [...currentState.playerPicks, pokemonId]
                : currentState.playerPicks,
            opponentPicks: !isPlayerPick
                ? [...currentState.opponentPicks, pokemonId]
                : currentState.opponentPicks,
            currentTurn: turn + 1,
            isComplete: (turn + 1) > 6,
        };

        // Store updated state
        draftStateStore[matchId] = updatedState;

        return updatedState;
    },

    // Start battle after draft
    startBattle: async (matchId: string): Promise<IBattleState> => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
            matchId,
            currentRound: 1,
            playerScore: 0,
            opponentScore: 0,
            rounds: [],
            isComplete: false,
        };
    },

    // Submit battle answer
    submitAnswer: async (matchId: string, round: number, answerId: number): Promise<IBattleState> => {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock battle state update
        return {
            matchId,
            currentRound: round,
            playerScore: 1,
            opponentScore: 0,
            rounds: [],
            isComplete: false,
        };
    },
};

export default battleService;

