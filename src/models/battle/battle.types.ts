
import { BATTLE_STATUS } from "@constants/battle.enum";
import { z } from "zod";

/**
 * Battle Match Found Schema
 */
export const BattleMatchFound = z.object({
    type: z.enum([BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_FOUND, BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_STATUS_UPDATE, BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCHMAKING_FAILED]),
    match: z.object({
        createdAt: z.string(),
        endTime: z.string(),
        id: z.number(),
        status: z.string(),
    }),
    matchId: z.number(),
    opponent: z.object({
        id: z.number(),
        name: z.string(),
        avatar: z.string().optional(),
    }),
    participant: z.object({
        id: z.number(),
        matchId: z.number(),
        hasAccepted: z.boolean(),
        userId: z.number(),
    }),
});

export type IBattleMatchFound = z.infer<typeof BattleMatchFound>;
//------------------------End------------------------//


/**
 * Battle Match Status Update Schema
 */
export const BattleMatchStatusUpdate = z.object({
    matchId: z.number(),
    message: z.string(),
    type: z.enum([BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_STATUS_UPDATE]),
    status: z.string(),
});

export type IBattleMatchStatusUpdate = z.infer<typeof BattleMatchStatusUpdate>;
//------------------------End------------------------//


export const BattleMatchSchema = z.object({
    id: z.string(),
    playerId: z.number(),
    opponentId: z.number(),
    playerName: z.string(),
    opponentName: z.string(),
    playerAvatar: z.string().optional(),
    opponentAvatar: z.string().optional(),
    status: z.enum(["matching", "matched", "draft", "in_progress", "finished"]),
    createdAt: z.string(),
});

export const BattlePickTurnSchema = z.object({
    turn: z.number().min(1).max(5),
    picker: z.enum(["player", "opponent", "simultaneous"]),
    isSimultaneous: z.boolean(),
});

// Draft pick data
export const BattleDraftPickSchema = z.object({
    pokemonId: z.number(),
    pickedBy: z.enum(["player", "opponent"]),
    turn: z.number(),
    isRevealed: z.boolean(),
});

// Battle draft state
export const BattleDraftStateSchema = z.object({
    matchId: z.string(),
    playerPicks: z.array(z.number()),
    opponentPicks: z.array(z.number()),
    currentTurn: z.number().min(1).max(5),
    isComplete: z.boolean(),
});

// Battle round data
export const BattleRoundSchema = z.object({
    round: z.number().min(1).max(3),
    playerScore: z.number(),
    opponentScore: z.number(),
    questionId: z.number(),
    playerAnswered: z.boolean(),
    opponentAnswered: z.boolean(),
    playerCorrect: z.boolean(),
    opponentCorrect: z.boolean(),
    turn: z.number().min(1).max(10),
});

// Battle state
export const BattleStateSchema = z.object({
    matchId: z.string(),
    currentRound: z.number().min(1).max(3),
    playerScore: z.number(),
    opponentScore: z.number(),
    rounds: z.array(BattleRoundSchema),
    isComplete: z.boolean(),
});

// Export types
export type IBattleMatch = z.infer<typeof BattleMatchSchema>;
export type IBattlePickTurn = z.infer<typeof BattlePickTurnSchema>;
export type IBattleDraftPick = z.infer<typeof BattleDraftPickSchema>;
export type IBattleDraftState = z.infer<typeof BattleDraftStateSchema>;
export type IBattleRound = z.infer<typeof BattleRoundSchema>;
export type IBattleState = z.infer<typeof BattleStateSchema>;

