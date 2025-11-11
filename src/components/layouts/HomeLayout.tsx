import GachaIcon from "@components/atoms/GachaIcon";
import StoreIcon from "@components/atoms/StoreIcon";
import RewardShopModal from "@components/Organism/ShopPokemon";
import UserProfileHeaderAtomic from "@components/Organism/UserProfileHeader";
import HomeTourGuide from "@components/ui/HomeTourGuide";
import { useWalletUser } from "@hooks/useWallet";
import { router } from "expo-router";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { CopilotStep, walkthroughable } from "react-native-copilot";
import { SafeAreaView } from "react-native-safe-area-context";

import useAuth from "@hooks/useAuth";
import { ROUTES } from "@routes/routes";

interface HomeLayoutProps {
  children?: React.ReactNode;
  user?: {
    name: string;
    level: number;
    currentExp: number;
    expToNextLevel: number;
    avatar?: string;
  };
  refreshControl?: React.ReactElement<any>;
}

export interface HomeLayoutRef {
  scrollTo: (y: number) => void;
}

const HomeLayout = forwardRef<HomeLayoutRef, HomeLayoutProps>(
  function HomeLayout({ children, refreshControl }, ref) {
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const { user } = useAuth();
    const [isShopVisible, setIsShopVisible] = useState(false);
    const [showDailyQuests, setShowDailyQuests] = useState(false);

    useWalletUser();

    // Note: Main pokemon logic moved to tab layout level to prevent re-mounting

    useImperativeHandle(ref, () => ({
      scrollTo: (y: number) => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y,
            animated: true,
          });
        }
      },
    }));

    const handleStorePress = () => {
      setIsShopVisible(true);
    };

    const handleShopClose = () => {
      setIsShopVisible(false);
    };

    // Walkthroughable container for attaching steps to real elements
    const WTView = walkthroughable(View);

    return (
      <HomeTourGuide>
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/duzumnf05/image/upload/v1762878756/background/images/file_nv77kp.png",
          }}
          style={styles.container}
          imageStyle={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Overlay để làm mờ ảnh nền */}
          <View style={styles.overlay} />
          <SafeAreaView style={styles.safeArea}>
            {/* Fixed Header */}
            <CopilotStep text={t("tour.header_description")} order={1} name="header">
              <WTView style={styles.fixedHeader}>
                <UserProfileHeaderAtomic user={user.data} />
              </WTView>
            </CopilotStep>

            {/* Scrollable Content */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={refreshControl}
            >
              {/* Main Content Area */}
              <View style={styles.contentSection}>{children}</View>
            </ScrollView>
          </SafeAreaView>

          {/* Store Icon - positioned at bottom right */}
          <View className="absolute top-52 right-4">
            <CopilotStep text={t("tour.store_description")} order={3} name="store">
              <WTView>
                <StoreIcon onPress={handleStorePress} size="small" />
              </WTView>
            </CopilotStep>
            {/* <CopilotStep text={t("tour.quest_description")} order={4} name="quest">
              <WTView style={{ marginTop: 12, alignSelf: "flex-end" }}>
                <QuestIcon
                  onPress={() => setShowDailyQuests(true)}
                  size="small"
                />
              </WTView>
            </CopilotStep> */}
            <CopilotStep text={t("tour.gacha_description")} order={5} name="gacha">
              <WTView style={{ marginTop: 12, alignSelf: "flex-end" }}>
                <GachaIcon
                  onPress={() => router.push(ROUTES.APP.GACHA)}
                  size="small"
                />
              </WTView>
            </CopilotStep>
          </View>

          {/* Shop Modal */}
          <RewardShopModal
            isVisible={isShopVisible}
            onClose={handleShopClose}
          />

          {/* Daily Quest Modal */}
          {/* <DailyQuestModal
            visible={showDailyQuests}
            onClose={() => setShowDailyQuests(false)}
            requests={dailyQuestsMock}
          /> */}
        </ImageBackground>
      </HomeTourGuide>
    );
  }
);

export default HomeLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.55)", // Làm mờ với màu trắng 50% opacity
  },
  safeArea: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  contentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  storeIconContainer: {
    position: "absolute",
    bottom: 100, // Position above the tab bar
    right: 20,
    zIndex: 1000,
  },

  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#1f2937",
    fontWeight: "600",
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    textAlign: "center",
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  quickStatsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentActivityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  activityText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#9ca3af",
  },
  draggableContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none", // Allow touch events to pass through to DraggableOverlay
    zIndex: 1000,
  },
  testPokemonContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1002,
  },
  pokemonTourPlaceholder: {
    position: "absolute",
    top: "50%", // Vị trí giữa màn hình
    left: "50%",
    marginTop: -75, // Để căn giữa (150px / 2)
    marginLeft: -75, // Để căn giữa (150px / 2)
    width: 150,
    height: 150,
    backgroundColor: "transparent", // Trong suốt
    zIndex: 998, // Thấp hơn DraggableOverlay
    pointerEvents: "none", // Không chặn touch events
  },
});
