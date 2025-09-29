import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from "react";

export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            const token = await SecureStore.getItemAsync('token');
            setIsLoggedIn(!!token);
        };
        checkToken();
    }, []);

    return { isLoggedIn, isLoading: isLoggedIn === null };
}

export default useAuth;