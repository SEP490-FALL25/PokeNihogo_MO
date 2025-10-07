import authService from '@services/auth';
import { useAuthStore } from '@stores/auth/auth.config';
import { useQuery } from '@tanstack/react-query';

export const useAuth = () => {
    const { accessToken } = useAuthStore();

    const { data: user, isLoading, ...rest } = useQuery({
        queryKey: ['user-profile', accessToken],
        queryFn: () => authService.getProfile(),
        enabled: !!accessToken,
    })

    return {
        isAuthenticated: !!user,
        isLoading, 
        user,
    };
}

export default useAuth;