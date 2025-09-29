import useAuth from '@hooks/useAuth';
import { ROUTES } from '@routes/routes';
import { Redirect } from 'expo-router';
import React from 'react';

export default function InitialRedirectScreen() {
    const { isLoggedIn } = useAuth();

    const href = isLoggedIn ? ROUTES.TABS.ROOT : ROUTES.AUTH.WELCOME;

    return <Redirect href={href} />;
}