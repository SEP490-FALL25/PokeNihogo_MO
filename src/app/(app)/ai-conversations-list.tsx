import { ThemedText } from "@components/ThemedText";
import MinimalGameAlert, { AlertWrapper } from "@components/atoms/MinimalAlert";
import { ConversationCard } from "@components/conversation/ConversationCard";
import { ConfirmModal } from "@components/ui/ConfirmModal";
import { SubscriptionFeatureKey } from "@constants/subscription.enum";
import { useConversationRooms, useDeleteConversationRoom } from "@hooks/useConversation";
import { useSubscriptionMarketplacePackages } from "@hooks/useSubscription";
import { useCheckFeature } from "@hooks/useSubscriptionFeatures";
import { ROUTES } from "@routes/routes";
import { ConversationRoom } from "@services/conversation";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, MessageSquare, Plus, ShieldCheck, Sparkles } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList, Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

type MarketplaceFeature = {
  id: number;
  featureId: number;
  value?: string | null;
  feature?: {
    id: number;
    featureKey?: string;
    nameKey?: string;
    nameTranslation?: string;
  };
};

type MarketplacePlan = {
  id: number;
  subscriptionId: number;
  price: number;
  type: string;
  durationInDays?: number | null;
  isActive: boolean;
};

type MarketplacePackage = {
  id: number;
  tagName?: string;
  nameTranslation?: string;
  descriptionTranslation?: string;
  plans?: MarketplacePlan[];
  features?: MarketplaceFeature[];
  isPopular?: boolean;
  canBuy?: boolean;
};

export default function AiConversationsListScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<ConversationRoom | null>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  
  const hasAIKaiwa = useCheckFeature(SubscriptionFeatureKey.AI_KAIWA);
  const {
    data: marketplaceResponse,
    isLoading: isMarketplaceLoading,
  } = useSubscriptionMarketplacePackages();
  
  const { data, isLoading, refetch } = useConversationRooms({
    currentPage: 1,
    pageSize: 50,
  });
  
  const deleteMutation = useDeleteConversationRoom();

  const conversations = useMemo(
    () => data?.results ?? [],
    [data?.results]
  );

  const marketplacePackages: MarketplacePackage[] | undefined = useMemo(() => {
    return marketplaceResponse?.data?.data as MarketplacePackage[] | undefined;
  }, [marketplaceResponse]);

  const ultraPackage = useMemo(() => {
    if (!marketplacePackages) {
      return undefined;
    }
    return marketplacePackages.find(
      (pkg) =>
        pkg.tagName?.toUpperCase() === "ULTRA" ||
        pkg.nameTranslation?.toLowerCase().includes("ultra")
    );
  }, [marketplacePackages]);

  const ultraFeatures = useMemo(() => {
    return (
      ultraPackage?.features
        ?.map((feature) => {
          const name = feature.feature?.nameTranslation;
          if (!name) return null;
          const valueSuffix =
            feature.value && feature.value !== "null"
              ? ` (x${feature.value})`
              : "";
          return `${name}${valueSuffix}`;
        })
        ?.filter((item): item is string => Boolean(item)) ?? []
    );
  }, [ultraPackage]);

  const ultraPlanPrice = ultraPackage?.plans?.[0]?.price;

  const formattedUltraPrice = useMemo(() => {
    if (!ultraPlanPrice) return undefined;
    try {
      return `${new Intl.NumberFormat("vi-VN").format(ultraPlanPrice)}₫/tháng`;
    } catch {
      return `${ultraPlanPrice.toLocaleString()}₫/tháng`;
    }
  }, [ultraPlanPrice]);

  const priceHighlightText = useMemo(() => {
    if (!formattedUltraPrice) return undefined;
    return `Chỉ ${formattedUltraPrice}`;
  }, [formattedUltraPrice]);

  const priceSubHighlight = useMemo(() => {
    if (!ultraFeatures || ultraFeatures.length === 0) return undefined;
    const priorityKeywords = ["kaiwa", "xp", "kinh nghiệm", "xu", "coin"];
    const prioritized = ultraFeatures.filter((feature) => {
      const lower = feature.toLowerCase();
      return priorityKeywords.some((keyword) => lower.includes(keyword));
    });
    const highlightSource =
      prioritized.length > 0 ? prioritized : ultraFeatures;
    return highlightSource
      .slice(0, 2)
      .map((feature) => feature.replace(/\(x[0-9.]+\)/i, "").trim())
      .join(" · ");
  }, [ultraFeatures]);

  const heroContent = useMemo(
    () => ({
      badge: t("home.ai.conversation.hero_badge"),
      title: t("home.ai.conversation.hero_title"),
      subtitle: t("home.ai.conversation.hero_subtitle"),
    }),
    [t]
  );

  const heroStats = useMemo(
    () => [
      {
        value: t("home.ai.conversation.hero_stats_response_value"),
        label: t("home.ai.conversation.hero_stats_response_label"),
      },
      {
        value: t("home.ai.conversation.hero_stats_speed_value"),
        label: t("home.ai.conversation.hero_stats_speed_label"),
      },
      {
        value: t("home.ai.conversation.hero_stats_consistency_value"),
        label: t("home.ai.conversation.hero_stats_consistency_label"),
      },
    ],
    [t]
  );

  const featureHighlights = useMemo(() => {
    if (ultraFeatures && ultraFeatures.length > 0) {
      return ultraFeatures.slice(0, 3);
    }
    return [
      t("home.ai.conversation.feature_feedback"),
      t("home.ai.conversation.feature_library"),
      t("home.ai.conversation.feature_rewards"),
    ];
  }, [ultraFeatures, t]);

  const socialProofText = useMemo(
    () => t("home.ai.conversation.social_proof"),
    [t]
  );

  const guaranteeCopy = useMemo(
    () => ({
      title: t("home.ai.conversation.guarantee_title"),
      subtitle: t("home.ai.conversation.guarantee_subtitle"),
    }),
    [t]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const closeAllSwipeables = useCallback(() => {
    // Close all swipeable items
    Object.keys(swipeableRefs.current).forEach((id) => {
      if (swipeableRefs.current[id]) {
        swipeableRefs.current[id]?.close();
      }
    });
  }, []);

  const handleSelectConversation = useCallback(
    (conversation: ConversationRoom) => {
      // Close all swipeables before navigating
      closeAllSwipeables();
      router.push({
        pathname: ROUTES.APP.AI_CONVERSATION,
        params: { conversationId: conversation.conversationId },
      });
    },
    [closeAllSwipeables]
  );

  const handleNewConversation = useCallback(() => {
    router.push(ROUTES.APP.AI_CONVERSATION);
  }, []);

  const handleSwipeableWillOpen = useCallback((conversationId: string) => {
    // Close all other swipeable items when a new one opens
    Object.keys(swipeableRefs.current).forEach((id) => {
      if (id !== conversationId && swipeableRefs.current[id]) {
        swipeableRefs.current[id]?.close();
      }
    });
  }, []);

  const handleSwipeableClose = useCallback(() => {
    // Optional: handle when swipeable closes
  }, []);

  const handleDeleteConversation = useCallback(
    (conversation: ConversationRoom) => {
      setConversationToDelete(conversation);
      setDeleteModalVisible(true);
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!conversationToDelete) return;

    try {
      await deleteMutation.mutateAsync(conversationToDelete.id);
      setDeleteModalVisible(false);
      setConversationToDelete(null);
      // Close swipeable after successful delete
      if (swipeableRefs.current[conversationToDelete.conversationId]) {
        swipeableRefs.current[conversationToDelete.conversationId]?.close();
      }
      setAlertMessage(
        t(
          "home.ai.conversation.delete_success",
          "Đã xóa cuộc hội thoại thành công"
        )
      );
      setAlertType("success");
      setAlertVisible(true);
    } catch {
      setDeleteModalVisible(false);
      setConversationToDelete(null);
      setAlertMessage(
        t(
          "home.ai.conversation.delete_error",
          "Không thể xóa cuộc hội thoại. Vui lòng thử lại."
        )
      );
      setAlertType("error");
      setAlertVisible(true);
    }
  }, [conversationToDelete, deleteMutation, t]);

  const handleCancelDelete = useCallback(() => {
    if (conversationToDelete) {
      // Close swipeable when canceling
      if (swipeableRefs.current[conversationToDelete.conversationId]) {
        swipeableRefs.current[conversationToDelete.conversationId]?.close();
      }
    }
    setDeleteModalVisible(false);
    setConversationToDelete(null);
  }, [conversationToDelete]);

  const renderItem: ListRenderItem<ConversationRoom> = useCallback(
    ({ item }) => (
      <ConversationCard
        conversation={item}
        onPress={() => handleSelectConversation(item)}
        onDelete={() => handleDeleteConversation(item)}
        swipeableRef={(ref) => {
          swipeableRefs.current[item.conversationId] = ref;
        }}
        onSwipeableWillOpen={() => handleSwipeableWillOpen(item.conversationId)}
        onSwipeableClose={handleSwipeableClose}
      />
    ),
    [handleSelectConversation, handleDeleteConversation, handleSwipeableWillOpen, handleSwipeableClose]
  );

  const keyExtractor = useCallback(
    (item: ConversationRoom) => item.conversationId,
    []
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MessageSquare size={64} color="#d1d5db" />
        <ThemedText style={styles.emptyTitle}>
          {t("home.ai.conversation.list_empty_title", "No conversations yet")}
        </ThemedText>
        <ThemedText style={styles.emptyDescription}>
          {t(
            "home.ai.conversation.list_empty_description",
            "Start a new conversation to practice Japanese with AI"
          )}
        </ThemedText>
        <TouchableOpacity
          onPress={handleNewConversation}
          style={styles.emptyButton}
          activeOpacity={0.85}
        >
          <Plus size={20} color="#ffffff" />
          <ThemedText style={styles.emptyButtonText}>
            {t("home.ai.conversation.new_conversation", "New Conversation")}
          </ThemedText>
        </TouchableOpacity>
      </View>
    ),
    [handleNewConversation, t]
  );

  const hasConversations = conversations.length > 0;
  const isInitialLoading = isLoading && !hasConversations;
  const listContentStyle = useMemo(
    () =>
      hasConversations
        ? styles.listContent
        : [styles.listContent, styles.listContentEmpty],
    [hasConversations]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {t("home.ai.conversation.list_title", "AI Conversations")}
        </ThemedText>
        <View style={{ width: 22 }} />
      </View>

      {/* Content */}
      {!hasAIKaiwa ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#7c3aed", "#4c1d95"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 28,
              padding: 24,
              marginBottom: 20,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: "rgba(255,255,255,0.15)",
                borderRadius: 999,
                paddingVertical: 6,
                paddingHorizontal: 12,
                marginBottom: 16,
              }}
            >
              <Sparkles size={14} color="#fef9c3" style={{ marginRight: 6 }} />
              <ThemedText
                style={{ color: "#fffbea", fontSize: 13, fontWeight: "600" }}
              >
                {heroContent.badge}
              </ThemedText>
            </View>

            <ThemedText
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#ffffff",
                lineHeight: 32,
                marginBottom: 12,
              }}
            >
              {heroContent.title}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.85)",
                lineHeight: 22,
                marginBottom: 18,
              }}
            >
              {heroContent.subtitle}
            </ThemedText>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {featureHighlights.map((feature, index) => (
                <View
                  key={`${feature}-${index}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.12)",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Sparkles size={14} color="#fef3c7" style={{ marginRight: 6 }} />
                  <ThemedText
                    style={{
                      fontSize: 13,
                      color: "#ffffff",
                      fontWeight: "600",
                    }}
                  >
                    {feature}
                  </ThemedText>
                </View>
              ))}
            </View>

            <Image
              source={require("@assets/images/unnamed.jpg")}
              style={{
                width: 110,
                height: 110,
                position: "absolute",
                right: -10,
                bottom: -10,
                opacity: 0.25,
              }}
              resizeMode="contain"
            />
          </LinearGradient>

          <View
            style={{
              backgroundColor: "#f5f3ff",
              borderRadius: 20,
              paddingVertical: 18,
              paddingHorizontal: 22,
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {heroStats.map((stat, index) => (
              <View
                key={`${stat.label}-${index}`}
                style={{
                  flex: 1,
                  alignItems: index === 1 ? "center" : index === 2 ? "flex-end" : "flex-start",
                }}
              >
                <ThemedText
                  style={{ fontSize: 20, fontWeight: "800", color: "#5b21b6" }}
                >
                  {stat.value}
                </ThemedText>
                <ThemedText
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: "#5b21b6",
                    opacity: 0.8,
                  }}
                >
                  {stat.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
              marginBottom: 20,
            }}
          >
            <ThemedText
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#1f2937",
                marginBottom: 6,
              }}
            >
              {ultraPackage?.nameTranslation ||
                t("home.ai.conversation.locked_title")}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                color: "#4b5563",
                marginBottom: 18,
                lineHeight: 22,
              }}
            >
              {ultraPackage?.descriptionTranslation ||
                t("home.ai.conversation.locked_description")}
            </ThemedText>

            {formattedUltraPrice ? (
              <View
                style={{
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  marginBottom: 16,
                  backgroundColor: "#f5f3ff",
                  borderWidth: 1,
                  borderColor: "rgba(139,92,246,0.3)",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <ThemedText
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#6d28d9",
                    }}
                  >
                    {priceHighlightText || formattedUltraPrice}
                  </ThemedText>
                  {priceSubHighlight ? (
                    <ThemedText
                      style={{
                        marginTop: 4,
                        fontSize: 14,
                        color: "#4c1d95",
                        opacity: 0.85,
                      }}
                    >
                      {priceSubHighlight}
                    </ThemedText>
                  ) : null}
                </View>
                <View
                  style={{
                    backgroundColor: "#ede9fe",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color: "#6d28d9",
                      fontWeight: "700",
                    }}
                  >
                    Premium
                  </ThemedText>
                </View>
              </View>
            ) : null}

            {isMarketplaceLoading ? (
              <ActivityIndicator style={{ marginBottom: 16 }} color="#6d28d9" />
            ) : ultraFeatures.length > 0 ? (
              <View style={{ marginBottom: 10 }}>
                {ultraFeatures.map((feature, index) => (
                  <View
                    key={`${feature}-${index}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginBottom: index === ultraFeatures.length - 1 ? 0 : 10,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#8b5cf6",
                        marginTop: 7,
                        marginRight: 10,
                      }}
                    />
                    <ThemedText
                      style={{
                        flex: 1,
                        fontSize: 15,
                        color: "#1f2937",
                      }}
                    >
                      {feature}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (ultraPackage?.id) {
                router.push({
                  pathname: ROUTES.APP.SUBSCRIPTION as any,
                  params: { packageId: String(ultraPackage.id) },
                });
              } else {
                router.push(ROUTES.APP.SUBSCRIPTION as any);
              }
            }}
            style={{
              backgroundColor: "#111827",
              paddingVertical: 16,
              borderRadius: 16,
              marginBottom: 14,
              alignItems: "center",
            }}
          >
            <ThemedText
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {t("home.ai.conversation.subscribe_button")}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (ultraPackage?.id) {
                router.push({
                  pathname: ROUTES.APP.SUBSCRIPTION as any,
                  params: { packageId: String(ultraPackage.id) },
                });
              } else {
                router.push(ROUTES.APP.SUBSCRIPTION as any);
              }
            }}
            style={{
              borderWidth: 1,
              borderColor: "rgba(17,24,39,0.15)",
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <ThemedText
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              {t("home.ai.conversation.cta_secondary")}
            </ThemedText>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.05)",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#dbeafe",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <ShieldCheck color="#1d4ed8" size={22} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}
              >
                {guaranteeCopy.title}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  color: "#4b5563",
                  marginTop: 4,
                  lineHeight: 20,
                }}
              >
                {guaranteeCopy.subtitle}
              </ThemedText>
            </View>
          </View>

          <ThemedText
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#6b7280",
            }}
          >
            {socialProofText}
          </ThemedText>
        </ScrollView>
      ) : isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            {t("home.ai.conversation.loading", "Loading...")}
          </ThemedText>
        </View>
      ) : (
        <>
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={listContentStyle}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={closeAllSwipeables}
        />

      {/* Floating Action Button */}
      {hasConversations && (
        <TouchableOpacity
          onPress={handleNewConversation}
          style={styles.fab}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title={t("home.ai.conversation.delete_confirm_title", "Xóa cuộc hội thoại")}
        message={t(
          "home.ai.conversation.delete_confirm_message",
          "Bạn có chắc chắn muốn xóa cuộc hội thoại này? Hành động này không thể hoàn tác."
        )}
        buttons={[
          {
            label: t("common.cancel", "Hủy"),
            onPress: handleCancelDelete,
            variant: "secondary",
          },
          {
            label: t("home.ai.conversation.delete", "Xóa"),
            onPress: handleConfirmDelete,
            variant: "danger",
          },
        ]}
        onRequestClose={handleCancelDelete}
      />

      {/* Alert Notification */}
      <AlertWrapper visible={alertVisible}>
        <MinimalGameAlert
          message={alertMessage}
          visible={alertVisible}
          onHide={() => setAlertVisible(false)}
          type={alertType}
        />
      </AlertWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    position: "absolute",
    left: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",},
});

