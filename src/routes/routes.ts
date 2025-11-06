enum APP {
  GACHA = "/(app)/gacha",
  CONVERSATION = "/(app)/conversation",
  DEMO = "/(app)/lesson-demo",

}

enum ME {
  PROFILE = "/(app)/(me)/profile",
  POKEMON_COLLECTION = "/(app)/(me)/pokemon-collection",
  ACHIEVEMENTS = "/(app)/(me)/achievements",
  SETTINGS = "/(app)/(me)/settings",
  POKEMON_DETAIL = "/(app)/(me)/pokemon/[id]",
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

enum QUIZ {
  QUIZ = "/(app)/quiz",
  RESULT = "/(app)/quiz/result",
  HISTORY = "/(app)/quiz/history",
  STATS = "/(app)/quiz/stats",
  REVIEW = "/(app)/quiz/review",
}

enum TABS {
  ROOT = "/(app)/(tabs)",
  HOME = "/(app)/(tabs)/home",
  LEARN = "/(app)/(tabs)/learn",
  LESSONS = "/(app)/(tabs)/lessons",
  READING = "/(app)/(tabs)/reading",
  LISTENING = "/(app)/(tabs)/listening",
  SPEAKING = "/(app)/(tabs)/speaking",
  BATTLE = "/(app)/(tabs)/battle",
  EXPLORE = "/(app)/(tabs)/explore",
  DEMO = "/(app)/(tabs)/demo",
  PROFILE = "/(app)/(tabs)/profile",
}

enum LESSON {
  LIST_WITH_ID = "/(app)/lessons-list",
  DETAIL = "/(app)/lesson-details",
}

enum READING {
  DETAIL = "/(app)/reading-details/[id]",
}

export const ROUTES = {
  AUTH,
  TABS,
  STARTER,
  QUIZ,
  ME,
  LESSON,
  READING,
  APP,
};
