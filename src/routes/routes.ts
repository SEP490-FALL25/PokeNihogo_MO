enum AUTH {
    WELCOME = '/(auth)/welcome',
    CONGRATS = '/(auth)/congrats',
    EMAIL = '/(auth)/email',
    OTP = '/(auth)/otp',
    PASSWORD = '/(auth)/password',
    CREATE_ACCOUNT = '/(auth)/create-account',
    FORGOT_PASSWORD = '/(auth)/forgot-password',
    RESET_PASSWORD = '/(auth)/reset-password',
    SELECT_LEVEL = '/(auth)/select-level',
    PLACEMENT_TEST = '/(auth)/placement-test',
    CHOOSE_STARTER = '/(auth)/choose-starter',
    USER_PROFILE = '/(auth)/profile',
}

enum TABS {
    ROOT = '/(tabs)',
    HOME = '/(tabs)/home',
    LEARN = '/(tabs)/learn',
    READING = '/(tabs)/reading',
    LISTENING = '/(tabs)/listening',
    BATTLE = '/(tabs)/battle',
    EXPLORE = '/(tabs)/explore',
    DEMO = '/(tabs)/demo',
    PROFILE = '/(tabs)/profile',
}

enum MAIN_NAVIGATION {
    LEARN = '/learn',
    READING = '/reading',
    LISTENING = '/listening',
    BATTLE = '/battle',
    OTHER = '/other',
}


export const ROUTES = {
    AUTH,
    TABS,
    MAIN_NAVIGATION,
};