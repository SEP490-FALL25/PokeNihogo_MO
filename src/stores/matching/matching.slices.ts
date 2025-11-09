import { IBattleMatchFound } from "@models/battle/battle.response";

export const createMatchingSlice = (set: any) => ({
    // Matching status
    isInQueue: false,
    setIsInQueue: (inQueue: boolean) => set({ isInQueue: inQueue }),

    // Match found modal (reuse ModalBattleAccept)
    matchFoundModal: {
        show: false,
        matchedPlayer: null as IBattleMatchFound | null,
        matchId: null as string | null,
        statusMatch: null as "reject" | "accept" | null,
    },
    showMatchFoundModal: (matchedPlayer: IBattleMatchFound, matchId: string) =>
        set({
            matchFoundModal: {
                show: true,
                matchedPlayer,
                matchId,
                statusMatch: null,
            },
        }),
    hideMatchFoundModal: () =>
        set({
            matchFoundModal: {
                show: false,
                matchedPlayer: null,
                matchId: null,
                statusMatch: null,
            },
        }),
    setMatchStatus: (status: "reject" | "accept" | null) =>
        set((state: any) => ({
            matchFoundModal: {
                ...state.matchFoundModal,
                statusMatch: status,
            },
        })),
});
