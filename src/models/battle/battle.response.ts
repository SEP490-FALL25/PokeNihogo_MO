
import { BATTLE_STATUS } from "@constants/battle.enum";
import { z } from "zod";

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