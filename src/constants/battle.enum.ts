export enum BATTLE_TYPE_EVENT {
    MATCH_FOUND = "MATCH_FOUND",
    MATCH_STATUS_UPDATE = "MATCH_STATUS_UPDATE",
    MATCHMAKING_FAILED = "MATCHMAKING_FAILED",
    MATCH_CANCELLED = "MATCH_CANCELLED",
}

export const RANKING_RULES = {
    N5: {
        min: 0,
        max: 999,
    },
    N4: {
        min: 1000,
        max: 1499,
    },
    N3: {
        min: 1500,
        max: 1899,
    },
    N2: {
        min: 1900,
        max: 2199,
    },
    N1: {
        min: 2200,
        max: null,
    },
} as const;

export const BATTLE_STATUS = {
    BATTLE_TYPE_EVENT,
    RANKING_RULES,
};