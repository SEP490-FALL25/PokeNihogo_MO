import * as SecureStore from 'expo-secure-store';

import { ROUTES } from '@routes/routes';
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

// Interceptors cho axiosPrivate
axiosPrivate.interceptors.request.use(
    async (config) => {

        const token = await SecureStore.getItemAsync('accessToken');
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
        if (error.response?.status === 401) {
            // Xử lý khi bị unauthorized
            console.error('Unauthorized! Token expired or invalid. Logging out...');
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            router.replace(ROUTES.AUTH.WELCOME);
            alert('Token expired or invalid. Logging out...');
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
axiosPrivate.interceptors.response.use((response) => response, handleError);

export { axiosClient, axiosPrivate };

