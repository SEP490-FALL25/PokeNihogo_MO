enum APP {
  PROFILE = "/(app)/profile",
  POKEMON_COLLECTION = "/(app)/pokemon-collection",
}

enum AUTH {
  WELCOME = "/(auth)/welcome",
  EMAIL = "/(auth)/email",
  OTP = "/(auth)/otp",
  PASSWORD = "/(auth)/password",
  CREATE_ACCOUNT = "/(auth)/create-account",
  FORGOT_PASSWORD = "/(auth)/forgot-password",
  RESET_PASSWORD = "/(auth)/reset-password",
}

enum STARTER {
  CHOOSE_STARTER = "/(app)/(starter)/choose-starter",
  SELECT_LEVEL = "/(app)/(starter)/select-level",
  PLACEMENT_TEST = "/(app)/(starter)/placement-test",
  CONGRATS = "/(app)/(starter)/congrats",
}

enum TABS {
  ROOT = "/(app)/(tabs)",
  HOME = "/(app)/(tabs)/home",
  LEARN = "/(app)/(tabs)/learn",
  READING = "/(app)/(tabs)/reading",
  LISTENING = "/(app)/(tabs)/listening",
  BATTLE = "/(app)/(tabs)/battle",
  EXPLORE = "/(app)/(tabs)/explore",
  DEMO = "/(app)/(tabs)/demo",
  PROFILE = "/(app)/(tabs)/profile",
}

export const ROUTES = {
  AUTH,
  TABS,
  STARTER,
  APP,
};
