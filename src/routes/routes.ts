enum AUTH {
    WELCOME = '/(auth)/welcome',
    SELECT_LEVEL = '/(auth)/select-level',
    PLACEMENT_TEST = '/(auth)/placement-test',
    CHOOSE_STARTER = '/(auth)/choose-starter',
    LOGIN = '/(auth)/login',
    REGISTER = '/(auth)/register',
    FORGOT_PASSWORD = '/(auth)/forgot-password',
    RESET_PASSWORD = '/(auth)/reset-password',
    OTP = '/(auth)/otp',
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