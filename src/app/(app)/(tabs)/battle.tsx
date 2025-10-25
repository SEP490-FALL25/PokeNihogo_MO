import HomeLayout from "@components/layouts/HomeLayout";
import { ThemedText } from "@components/ThemedText";
import { ThemedView } from "@components/ThemedView";
import { IconSymbol } from "@components/ui/IconSymbol";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const sampleBattles = [
  {
    id: 1,
    title: "Vocabulary Duel",
    description: "Test your vocabulary knowledge against other players",
    difficulty: "Easy",
    players: 2,
    duration: "5 min",
    icon: "textformat.abc",
    color: "#10b981",
    isActive: true,
  },
  {
    id: 2,
    title: "Grammar Challenge",
    description: "Battle with Japanese grammar questions",
    difficulty: "Medium",
    players: 4,
    duration: "8 min",
    icon: "doc.text.fill",
    color: "#f59e0b",
    isActive: true,
  },
  {
    id: 3,
    title: "Kanji Master",
    description: "Compete in kanji recognition and writing",
    difficulty: "Hard",
    players: 6,
    duration: "12 min",
    icon: "character.book.closed.fill",
    color: "#ef4444",
    isActive: false,
  },
  {
    id: 4,
    title: "Speed Reading",
    description: "Fast-paced reading comprehension battles",
    difficulty: "Medium",
    players: 3,
    duration: "10 min",
    icon: "eye.fill",
    color: "#3b82f6",
    isActive: true,
  },
  {
    id: 5,
    title: "Listening Warrior",
    description: "Audio-based comprehension challenges",
    difficulty: "Hard",
    players: 2,
    duration: "15 min",
    icon: "ear.fill",
    color: "#8b5cf6",
    isActive: false,
  },
  {
    id: 6,
    title: "Culture Quiz",
    description: "Test your knowledge of Japanese culture",
    difficulty: "Easy",
    players: 8,
    duration: "6 min",
    icon: "globe.asia.australia.fill",
    color: "#06b6d4",
    isActive: true,
  },
];

const BattleCard: React.FC<{
  battle: (typeof sampleBattles)[0];
  onPress: () => void;
}> = ({ battle, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.battleCard,
        { borderLeftColor: battle.color },
        !battle.isActive && styles.inactiveCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!battle.isActive}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: battle.color }]}>
          <IconSymbol name={battle.icon as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.battleInfo}>
          <ThemedText type="subtitle" style={styles.battleTitle}>
            {battle.title}
          </ThemedText>
          <ThemedText style={styles.battleDescription}>
            {battle.description}
          </ThemedText>
        </View>
        {battle.isActive ? (
          <View style={styles.activeBadge}>
            <ThemedText style={styles.activeText}>LIVE</ThemedText>
          </View>
        ) : (
          <View style={styles.inactiveBadge}>
            <ThemedText style={styles.inactiveText}>SOON</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaInfo}>
          <View
            style={[styles.difficultyBadge, { backgroundColor: battle.color }]}
          >
            <ThemedText style={styles.difficultyText}>
              {battle.difficulty}
            </ThemedText>
          </View>
          <ThemedText style={styles.playersText}>
            👥 {battle.players} players
          </ThemedText>
          <ThemedText style={styles.durationText}>
            ⏱️ {battle.duration}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function BattleScreen() {
  const { t } = useTranslation();
  
  const handleBattlePress = (battleId: number) => {
    console.log(`Battle ${battleId} pressed`);
    // Navigate to battle detail screen
  };

  return (
    <HomeLayout>
      <ThemedText type="title" style={styles.title}>
        ⚔️ {t("battle.title")}
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        {t("battle.subtitle")}
      </ThemedText>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        🏆 {t("battle.available_battles")}
      </ThemedText>

      <View style={styles.battlesContainer}>
        {sampleBattles.map((battle) => (
          <BattleCard
            key={battle.id}
            battle={battle}
            onPress={() => handleBattlePress(battle.id)}
          />
        ))}
      </View>

      <ThemedView style={styles.statsCard}>
        <ThemedText type="subtitle" style={styles.statsTitle}>
          🏅 {t("battle.statistics_title")}
        </ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>24</ThemedText>
            <ThemedText style={styles.statLabel}>{t("battle.battles_won")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>8</ThemedText>
            <ThemedText style={styles.statLabel}>{t("battle.battles_lost")}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>75%</ThemedText>
            <ThemedText style={styles.statLabel}>{t("battle.win_rate")}</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.leaderboardCard}>
        <ThemedText type="subtitle" style={styles.leaderboardTitle}>
          🥇 {t("battle.top_players")}
        </ThemedText>
        <View style={styles.leaderboardList}>
          <View style={styles.leaderboardItem}>
            <ThemedText style={styles.rank}>1st</ThemedText>
            <ThemedText style={styles.playerName}>Sakura_Chan</ThemedText>
            <ThemedText style={styles.playerScore}>2,450 pts</ThemedText>
          </View>
          <View style={styles.leaderboardItem}>
            <ThemedText style={styles.rank}>2nd</ThemedText>
            <ThemedText style={styles.playerName}>NihongoMaster</ThemedText>
            <ThemedText style={styles.playerScore}>2,380 pts</ThemedText>
          </View>
          <View style={styles.leaderboardItem}>
            <ThemedText style={styles.rank}>3rd</ThemedText>
            <ThemedText style={styles.playerName}>AnimeFan2024</ThemedText>
            <ThemedText style={styles.playerScore}>2,250 pts</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.tipsCard}>
        <ThemedText type="subtitle" style={styles.tipsTitle}>
          💪 {t("battle.tips_title")}
        </ThemedText>
        <View style={styles.tipsList}>
          <ThemedText style={styles.tipItem}>
            • {t("battle.tip_1")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("battle.tip_2")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("battle.tip_3")}
          </ThemedText>
          <ThemedText style={styles.tipItem}>
            • {t("battle.tip_4")}
          </ThemedText>
        </View>
      </ThemedView>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  battlesContainer: {
    gap: 16,
  },
  battleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  battleInfo: {
    flex: 1,
  },
  battleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  battleDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  activeBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  inactiveBadge: {
    backgroundColor: "#6b7280",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  cardFooter: {
    gap: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
  playersText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  durationText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  leaderboardCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  rank: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f59e0b",
    width: 40,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
    flex: 1,
    marginLeft: 12,
  },
  playerScore: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  tipsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
