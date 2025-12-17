export enum BATTLE_TYPE_EVENT {
    MATCH_FOUND = "MATCH_FOUND",
    MATCH_STATUS_UPDATE = "MATCH_STATUS_UPDATE",
    MATCHMAKING_FAILED = "MATCHMAKING_FAILED",
    MATCH_CANCELLED = "MATCH_CANCELLED",
}

export enum MATCH_DEBUFF_TYPE {
    ADD_QUESTION = "ADD_QUESTION",
    DECREASE_POINT = "DECREASE_POINT",
    DISCOMFORT_VISION = "DISCOMFORT_VISION"
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

export enum MATCH_TRACKING_STATUS {
    NO_ACTIVE_MATCH = "NO_ACTIVE_MATCH",
    ROUND_IN_PROGRESS = "ROUND_IN_PROGRESS",
    ROUND_STARTING = "ROUND_STARTING",
    ROUND_SELECTING_POKEMON = "ROUND_SELECTING_POKEMON",
    BETWEEN_ROUNDS = "BETWEEN_ROUNDS",
    MATCH_FOUND = "MATCH_FOUND",
}

export enum RANK_CHANGE_STATUS {
    RANK_UP = "RANK_UP",
    RANK_DOWN = "RANK_DOWN",
    RANK_MAINTAIN = "RANK_MAINTAIN",
}

export const BATTLE_STATUS = {
    BATTLE_TYPE_EVENT,
    RANKING_RULES,
    MATCH_TRACKING_STATUS,
};