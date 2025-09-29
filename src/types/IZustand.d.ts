declare namespace ZUSTAND {

    export interface IGlobalState {
        language: string;
        setLanguage: (language: string) => void;
    }

    export interface IUserState {
        email: string;
        setEmail: (email: string) => void;
    }
}