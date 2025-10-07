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

    if (user?.data?.level !== null) {
        return <Redirect href={ROUTES.TABS.HOME} />;
    }

    const href = isAuthenticated ? ROUTES.STARTER.SELECT_LEVEL : ROUTES.AUTH.WELCOME;

    return <Redirect href={href} />;
}