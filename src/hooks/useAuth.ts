import authService from '@services/auth';
import { useAuthStore } from '@stores/auth/auth.config';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useAuth = () => {
    const { accessToken } = useAuthStore();

    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ['user-profile', accessToken],
        queryFn: () => authService.getProfile(),
        enabled: !!accessToken,
    });

    useEffect(() => {
        if (isError) {
            console.error("--- LỖI TỪ API GET PROFILE ---");
            console.error("Lỗi chi tiết:", error.message);
        }
    }, [isError, error]);

    return {
        isAuthenticated: !!user,
        isLoading,
        user: user?.data,
    };
};

export default useAuth;