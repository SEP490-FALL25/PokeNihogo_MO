import * as SecureStore from 'expo-secure-store';

import { ROUTES } from '@routes/routes';
import { useAuthStore } from '@stores/auth/auth.config';
import { useLanguageSelector } from '@stores/global/global.selectors';
import axios, { AxiosError } from 'axios';
import { router } from 'expo-router';

const locale = useLanguageSelector();

const axiosClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale,
    },
});

const axiosPrivate = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale,
    },
    withCredentials: true,
});

// Token refresh concurrency control
let isRefreshing = false;
let pendingRequestsQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
    pendingRequestsQueue.forEach((callback) => callback(token));
    pendingRequestsQueue = [];
};

const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken?: string } | null> => {
    try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return null;

        // Call refresh token endpoint
        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh-token`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json', 'Accept-Language': locale } }
        );

        const newAccessToken: string | undefined = response?.data?.data?.accessToken;
        const newRefreshToken: string | undefined = response?.data?.data?.refreshToken;
        if (!newAccessToken) return null;

        // Persist tokens
        await SecureStore.setItemAsync('accessToken', newAccessToken);
        if (newRefreshToken) {
            await SecureStore.setItemAsync('refreshToken', newRefreshToken);
        }
        // Update zustand store
        useAuthStore.getState().setAccessToken(newAccessToken);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (e) {
        return null;
    }
};

// Interceptors cho axiosPrivate
axiosPrivate.interceptors.request.use(
    async (config) => {

        const token = useAuthStore.getState().accessToken;
        console.log('accessTokenAxios: ', token);

        // const decodedToken = await decodeToken();
        // const userRole = decodedToken?.role;

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // if (userRole) {
        //     config.headers['X-User-Role'] = userRole; // Gửi role trong header (tuỳ backend có cần hay không)
        // }
        // if (userRole) {
        //     config.headers['X-User-Role'] = userRole;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as (typeof error)['config'] & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // Queue the request until refresh completes
                return new Promise((resolve, reject) => {
                    pendingRequestsQueue.push((token) => {
                        if (!token) {
                            reject(error);
                            return;
                        }
                        if (!originalRequest.headers) originalRequest.headers = {} as any;
                        (originalRequest.headers as any)['Authorization'] = `Bearer ${token}`;
                        resolve(axiosPrivate(originalRequest));
                    });
                });
            }

            isRefreshing = true;
            const refreshed = await refreshAccessToken();
            isRefreshing = false;
            processQueue(refreshed?.accessToken ?? null);

            if (refreshed?.accessToken) {
                if (!originalRequest.headers) originalRequest.headers = {} as any;
                (originalRequest.headers as any)['Authorization'] = `Bearer ${refreshed.accessToken}`;
                return axiosPrivate(originalRequest);
            }

            // Refresh failed -> force logout
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            useAuthStore.getState().deleteAccessToken();
            router.replace(ROUTES.AUTH.WELCOME);
            return Promise.reject(error);
        }

        return Promise.reject(error);
    },
);

// Xử lý lỗi toàn cục
const handleError = (error: AxiosError) => {
    if (error.response) {
        const serverErrorData = error.response.data as { message?: string };
        const serverErrorMessage = serverErrorData?.message;

        if (serverErrorMessage) {
            return Promise.reject(new Error(serverErrorMessage));
        }
    } else if (error.request) {
        console.error('No Response from server:', error.request);
        alert('Không thể kết nối với server. Vui lòng kiểm tra lại mạng của bạn');
    } else {
        console.error('Error:', error.message);
    }
    return Promise.reject(error);
};

axiosClient.interceptors.response.use((response) => response, handleError);

export { axiosClient, axiosPrivate };

