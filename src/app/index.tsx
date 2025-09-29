// File: app/index.tsx

import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect } from 'expo-router';
import React from 'react';
import SplashScreen from './splash'; // Import SplashScreen component của bạn

export default function IndexScreen() {
    const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

    // 1. Trong khi đang kiểm tra auth, hiển thị Splash Screen
    // Điều này giúp tránh việc màn hình bị nháy sang trang login rồi mới vào app
    if (isAuthLoading) {
        return <SplashScreen />;
    }

    console.log('isLoggedIn', isLoggedIn);

    // 2. Khi đã có kết quả, xác định đường dẫn và redirect
    const href = isLoggedIn ? ROUTES.TABS.ROOT : ROUTES.AUTH.WELCOME;

    // 3. Thực hiện Redirect
    return <Redirect href={href} />;
}