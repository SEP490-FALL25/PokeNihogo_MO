import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { router, Stack } from 'expo-router';
import React, { useEffect } from 'react';

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.replace(ROUTES.AUTH.WELCOME);
            }
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading || !isAuthenticated) {
        return <SplashScreen />;
    }
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="me" />
        </Stack>
    );
}