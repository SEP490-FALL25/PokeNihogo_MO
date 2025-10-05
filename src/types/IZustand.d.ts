declare namespace ZUSTAND {

    export interface IGlobalState {
        language: string;
        setLanguage: (language: string) => void;
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