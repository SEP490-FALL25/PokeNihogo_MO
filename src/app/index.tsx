import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect } from 'expo-router';
import React from 'react';
import '../../global.css';

export default function IndexScreen() {
    const { isAuthenticated, isLoading: isUserLoading, user } = useAuth();

    if (isUserLoading) {
        return <SplashScreen />;
    }

    // If not authenticated, redirect to welcome screen
    if (!isAuthenticated) {
        return <Redirect href={ROUTES.AUTH.WELCOME} />;
    }

    // If authenticated but user doesn't have level yet, redirect to select-level
    if (isAuthenticated && (user?.data?.level === null || user?.data?.level === undefined)) {
        return <Redirect href={ROUTES.STARTER.SELECT_LEVEL} />;
    }

    // If authenticated and has level, redirect to home
    return <Redirect href={ROUTES.TABS.HOME} />;
}