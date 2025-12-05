import type { IUserSubscriptionFeatureDetail } from "@models/subscription/subscription.response";

declare global {
    namespace ZUSTAND {
        interface IGlobalState {
            language: string;
            setLanguage: (language: string) => Promise<void>;
            initializeLanguage: () => Promise<void>;

            // DraggableOverlay position management
            overlayPosition: { x: number; y: number };
            isOverlayPositionLoaded: boolean;
            setOverlayPosition: (position: { x: number; y: number }) => void;
            setOverlayPositionLoaded: (loaded: boolean) => void;
            resetOverlayPosition: () => void;

            // Subscription features management
            subscriptionKeys: string[];
            subscriptionFeatureDetails: Record<string, IUserSubscriptionFeatureDetail>;
            setSubscriptionFeatures: (features: IUserSubscriptionFeatureDetail[]) => void;
            clearSubscriptionFeatures: () => void;
            hasFeature: (featureKey: string) => boolean;
            getFeatureValue: (featureKey: string) => number | null;
        }

        interface IAuthState {
            accessToken: string;
            isLoading: boolean;
            initialize: () => Promise<void>;
            setAccessToken: (accessToken: string) => Promise<void>;
            deleteAccessToken: () => Promise<void>;
            setIsLoading: (isLoading: boolean) => void;
        }

        interface IUserState {
            email: string;
            setEmail: (email: string) => void;
            starterId?: string;
            setStarterId: (starterId: string) => void;
            isFirstTimeLogin?: boolean;
            setIsFirstTimeLogin: (value: boolean) => void;
            level?: "N5" | "N4" | "N3";
            setLevel: (level: "N5" | "N4" | "N3") => void;
            hasCompletedPlacementTest: boolean;
            setHasCompletedPlacementTest: (value: boolean) => void;
        }

        interface IWalletState {
            sparklesBalance: number;
            pokeCoinsBalance: number;
            setSparklesBalance: (balance: number) => void;
            setPokeCoinsBalance: (balance: number) => void;
        }

        interface IMatchingState {
            // Matching status
            isInQueue: boolean;
            setIsInQueue: (inQueue: boolean) => void;

            // Current active match ID (for battle screens)
            currentMatchId: string | null;
            setCurrentMatchId: (matchId: string | null) => void;

            // Last match result payload
            lastMatchResult: any | null;
            setLastMatchResult: (result: any) => void;
            clearLastMatchResult: () => void;

            // Match found modal (reuse ModalBattleAccept)
            matchFoundModal: {
                show: boolean;
                matchedPlayer: any | null; // IBattleMatchFound
                matchId: string | null;
                statusMatch: "reject" | "accept" | null;
            };
            showMatchFoundModal: (matchedPlayer: any, matchId: string) => void; // IBattleMatchFound
            hideMatchFoundModal: () => void;
            setMatchStatus: (status: "reject" | "accept" | null) => void;
        }
    }
}

export { };

