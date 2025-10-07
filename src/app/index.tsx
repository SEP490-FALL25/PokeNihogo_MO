import SplashScreen from '@app/splash';
import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect } from 'expo-router';
import React from 'react';
import '../../global.css';

export default function IndexScreen() {

    const { isAuthenticated, isLoading: isUserLoading } = useAuth();

    if (isUserLoading) {
        return <SplashScreen />;
    }

    // if (user?.data?.level !== null) {
    //     return <Redirect href={ROUTES.TABS.HOME} />;
    // }

    //TODO: Remove this after testing
    // const href = isAuthenticated ? ROUTES.STARTER.SELECT_LEVEL : ROUTES.AUTH.WELCOME;

    const href = isAuthenticated ? ROUTES.TABS.HOME : ROUTES.AUTH.WELCOME;


    return <Redirect href={href} />;
}