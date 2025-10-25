declare namespace ZUSTAND {

    export interface IGlobalState {
        language: string;
        setLanguage: (language: string) => Promise<void>;
        initializeLanguage: () => Promise<void>;

        // DraggableOverlay position management
        overlayPosition: { x: number; y: number };
        isOverlayPositionLoaded: boolean;
        setOverlayPosition: (position: { x: number; y: number }) => void;
        setOverlayPositionLoaded: (loaded: boolean) => void;
        resetOverlayPosition: () => void;
    }

    export interface IAuthState {
        accessToken: string;
        isLoading: boolean;
        initialize: () => Promise<void>;
        setAccessToken: (accessToken: string) => Promise<void>;
        deleteAccessToken: () => Promise<void>;
        setIsLoading: (isLoading: boolean) => void;
    }

    export interface IUserState {
        email: string;
        setEmail: (email: string) => void;
        level?: 'N5' | 'N4' | 'N3';
        setLevel: (level: 'N5' | 'N4' | 'N3') => void;
        starterId?: string;
        setStarterId: (starterId: string) => void;
        isFirstTimeLogin?: boolean;
        setIsFirstTimeLogin: (value: boolean) => void;
        hasCompletedPlacementTest: boolean;
        setHasCompletedPlacementTest: (value: boolean) => void;
    }
}