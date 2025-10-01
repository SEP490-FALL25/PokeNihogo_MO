enum AUTH {
    WELCOME = '/(auth)/welcome',
    EMAIL = '/(auth)/email',
    OTP = '/(auth)/otp',
    CREATE_ACCOUNT = '/(auth)/create-account',
    FORGOT_PASSWORD = '/(auth)/forgot-password',
    RESET_PASSWORD = '/(auth)/reset-password',
}

enum TABS {
    ROOT = '/(tabs)',
    HOME = '/(tabs)/index',
    EXPLORE = '/(tabs)/explore',
    DEMO = '/(tabs)/demo',
}


export const ROUTES = {
    AUTH,
    TABS,
};