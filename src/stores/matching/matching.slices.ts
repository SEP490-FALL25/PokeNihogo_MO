import { IBattleMatchFound } from "@models/battle/battle.response";

export const createMatchingSlice = (set: any) => ({
  // Matching status
  isInQueue: false,
  setIsInQueue: (inQueue: boolean) => set({ isInQueue: inQueue }),

  // Current active match ID (for battle screens)
  currentMatchId: null as string | null,
  setCurrentMatchId: (matchId: string | null) =>
    set({ currentMatchId: matchId }),

  // Last match result payload to show on result screen
  lastMatchResult: null as any,
  setLastMatchResult: (result: any) => set({ lastMatchResult: result }),
  clearLastMatchResult: () => set({ lastMatchResult: null }),

  // --- [MỚI] TIME SYNC & HANDOVER DATA ---
  serverTimeOffset: 0,
  setServerTimeOffset: (offset: number) => set({ serverTimeOffset: offset }),

  startRoundPayload: null as any,
  setStartRoundPayload: (payload: any) => set({ startRoundPayload: payload }),

  roundStartingData: null as {
    matchId: number;
    roundNumber: string;
    delaySeconds: number;
    message: string;
  } | null,
  setRoundStartingData: (data: {
    matchId: number;
    roundNumber: string;
    delaySeconds: number;
    message: string;
  } | null) => set({ roundStartingData: data }),
  // ---------------------------------------

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
