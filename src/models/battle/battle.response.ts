
import { BATTLE_STATUS } from "@constants/battle.enum";
import { BackendResponsePaginationModel } from "@models/backend/common";
import { z } from "zod";
import { BattleUserMatchingHistoryEntitySchema } from "./battle.entity";

/**
 * Battle Match Found Schema
 */
export const BattleMatchFound = z.object({
    type: z.enum([BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_FOUND, BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCHMAKING_FAILED]),
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
    type: z.enum([BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCH_STATUS_UPDATE, BATTLE_STATUS.BATTLE_TYPE_EVENT.MATCHMAKING_FAILED]),
    status: z.string(),
});

export type IBattleMatchStatusUpdate = z.infer<typeof BattleMatchStatusUpdate>;
//------------------------End------------------------//

/**
 * Battle Match Round Schema
 */
export const BattleMatchRoundSchema = z.object({
    match: z.object({
        id: z.number(),
        status: z.string(),
        participants: z.array(z.object({
            id: z.number(),
            userId: z.number(),
            user: z.object({
                id: z.number(),
                name: z.string(),
                email: z.string(),
                eloscore: z.number(),
                avatar: z.string().optional(),
            }),
        })),
    }),
    rounds: z.array(z.object({
        id: z.number(),
        roundNumber: z.enum(["ONE", "TWO", "THREE"]),
        status: z.enum(["PENDING", "SELECTING_POKEMON", "SELECTED_POKEMON", "COMPLETED"]),
        endTimeRound: z.string().optional(),
        participants: z.array(z.object({
            id: z.number(),
            matchParticipantId: z.number(),
            orderSelected: z.number(),
            endTimeSelected: z.string().optional(),
            selectedUserPokemonId: z.number().optional(),
            selectedUserPokemon: z.object({
                id: z.number(),
                userId: z.number(),
                pokemonId: z.number(),
                pokemon: z.object({
                    id: z.number(),
                    pokedex_number: z.number(),
                    nameJp: z.string(),
                    nameTranslations: z.object({
                        en: z.string(),
                        ja: z.string(),
                        vi: z.string(),
                    }),
                    imageUrl: z.string().url(),
                    rarity: z.string(),
                }),
            }).optional(),
        })),
    })),
});

export type IBattleMatchRound = z.infer<typeof BattleMatchRoundSchema>;
//------------------------End------------------------//

/**
 * Submit Answer Schema
 */
export const SubmitAnswerSchema = z.object({
    answerId: z.number(),
    timeAnswerMs: z.number(),
});

export type ISubmitAnswer = z.infer<typeof SubmitAnswerSchema>;
//------------------------End------------------------//

/**
 * Battle User Matching History Response Schema
 */
export const BattleUserMatchingHistoryResponseSchema = BackendResponsePaginationModel(BattleUserMatchingHistoryEntitySchema)

export type IBattleUserMatchingHistoryResponse = z.infer<typeof BattleUserMatchingHistoryResponseSchema>;
//------------------------End------------------------//

/**
 * Match Tracking Response Schema
 * Used to check current match status when user returns to battle screen
 */
export const BattleMatchTrackingResponseSchema = z.object({
    type: z.enum([
        "NO_ACTIVE_MATCH",
        "ROUND_IN_PROGRESS",
        "ROUND_STARTING",
        "ROUND_SELECTING_POKEMON",
        "BETWEEN_ROUNDS",
        "MATCH_FOUND",
    ]),
    matchId: z.number().optional(),
    match: z.object({
        id: z.number(),
        status: z.string(),
        createdAt: z.string(),
        endTime: z.string().optional(),
    }).optional(),
    opponent: z.object({
        id: z.number(),
        name: z.string(),
        avatar: z.string().nullable().optional(),
    }).optional(),
    participant: z.object({
        id: z.number(),
        hasAccepted: z.boolean(),
        userId: z.number(),
        matchId: z.number(),
    }).optional(),
    roundNumber: z.enum(["ONE", "TWO", "THREE"]).optional(),
});

export type IBattleMatchTrackingResponse = z.infer<typeof BattleMatchTrackingResponseSchema>;
//------------------------End------------------------//