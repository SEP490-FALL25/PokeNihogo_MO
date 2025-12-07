import { ThemedText } from "@components/ThemedText";
import MinimalGameAlert, { AlertWrapper } from "@components/atoms/MinimalAlert";
import { ConversationCard } from "@components/conversation/ConversationCard";
import { ConfirmModal } from "@components/ui/ConfirmModal";
import { useConversationRooms, useDeleteConversationRoom } from "@hooks/useConversation";
import { ROUTES } from "@routes/routes";
import { ConversationRoom } from "@services/conversation";
import { router } from "expo-router";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList, Swipeable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AiConversationsListScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<ConversationRoom | null>(null);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  
  const { data, isLoading, refetch } = useConversationRooms({
    currentPage: 1,
    pageSize: 50,
  });
  
  const deleteMutation = useDeleteConversationRoom();

  const conversations = useMemo(
    () => data?.results ?? [],
    [data?.results]
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
      {isInitialLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            {t("home.ai.conversation.loading", "Loading...")}
          </ThemedText>
        </View>
      ) : (
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
      )}

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

