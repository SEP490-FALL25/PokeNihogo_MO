import { IBattleDraftState, IBattleMatch, IBattleState } from "@models/battle/battle.types";

// Store draft state in memory for demo
let draftStateStore: Record<string, IBattleDraftState> = {};

const battleService = {
    // Start queue for ranked matchmaking (mock - no API call)
    startQueue: async (): Promise<void> => {
        // Simulate starting queue - no real API call
        await new Promise((resolve) => setTimeout(resolve, 100));
    },

    // Cancel queue (mock - no API call)
    cancelQueue: async (): Promise<void> => {
        // Simulate canceling queue - no real API call
        await new Promise((resolve) => setTimeout(resolve, 100));
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

