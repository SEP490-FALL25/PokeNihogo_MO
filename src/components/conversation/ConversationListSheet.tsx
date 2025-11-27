import { ThemedText } from "@components/ThemedText";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
} from "@components/ui/BottomSheet";
import { useConversationRooms } from "@hooks/useConversation";
import { ROUTES } from "@routes/routes";
import { ConversationRoom } from "@services/conversation";
import { router } from "expo-router";
import React, { Fragment, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ConversationCard } from "./ConversationCard";

interface ConversationListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
}

export const ConversationListSheet: React.FC<ConversationListSheetProps> = ({
  isOpen,
  onClose,
  currentConversationId,
  onSelectConversation,
}) => {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useConversationRooms({
    currentPage: 1,
    pageSize: 50,
  });
  const [refreshing, setRefreshing] = useState(false);
  const snapPoints = useMemo(() => [0.7], []);
  const stickyHeaderIndices = useMemo(() => [0, 1], []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const conversations = useMemo(
    () => data?.results ?? [],
    [data?.results]
  );

  const handleSelectConversation = useCallback(
    (conversation: ConversationRoom) => {
      if (onSelectConversation) {
        onSelectConversation(conversation.conversationId);
      } else {
        router.push({
          pathname: ROUTES.APP.AI_CONVERSATION,
          params: { conversationId: conversation.conversationId },
        });
      }
      onClose();
    },
    [onClose, onSelectConversation]
  );

  const handleNewConversation = useCallback(() => {
    if (onSelectConversation) {
      onSelectConversation("");
    } else {
      router.push(ROUTES.APP.AI_CONVERSATION);
    }
    onClose();
  }, [onClose, onSelectConversation]);

  const renderConversation = useCallback(
    (item: ConversationRoom) => (
      <ConversationCard
        key={item.conversationId}
        conversation={item}
        isActive={item.conversationId === currentConversationId}
        onPress={() => handleSelectConversation(item)}
      />
    ),
    [currentConversationId, handleSelectConversation]
  );

  const renderEmptyList = useCallback(
    () => (
      <View style={styles.emptyState}>
        <ThemedText style={styles.emptyStateText}>
          {t(
            "home.ai.conversation.empty_list",
            "No conversations yet. Start a new conversation!"
          )}
        </ThemedText>
      </View>
    ),
    [t]
  );

  const renderSeparator = useCallback(
    () => <View style={styles.itemSeparator} />,
    []
  );

  const listContent = useMemo(() => {
    if (!conversations.length) {
      return renderEmptyList();
    }

    return (
      <View>
        {conversations.map((conversation, index) => (
          <Fragment key={conversation.conversationId}>
            {renderConversation(conversation)}
            {index < conversations.length - 1 && renderSeparator()}
          </Fragment>
        ))}
      </View>
    );
  }, [conversations, renderConversation, renderSeparator, renderEmptyList]);

  const refreshControlElement = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor="#007AFF"
      />
    ),
    [refreshing, handleRefresh]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );


  return (
    <BottomSheet open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheetContent
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropOpacity={0.5}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={stickyHeaderIndices}
        refreshControl={refreshControlElement}
        contentContainerStyle={styles.contentContainer}
      >
        <BottomSheetHeader style={styles.sheetHeader}>
          <BottomSheetTitle>
            {t("home.ai.conversation.list_title", "Conversations")}
          </BottomSheetTitle>
        </BottomSheetHeader>

        <View style={styles.newConversationWrapper}>
          <TouchableOpacity
            onPress={handleNewConversation}
            activeOpacity={0.8}
            style={styles.newConversationButton}
          >
            <ThemedText style={styles.newConversationText}>
              ✏️ {t("home.ai.conversation.new_conversation", "New Conversation")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#007AFF" />
            <ThemedText style={styles.loadingText}>
              {t("home.ai.conversation.loading", "Loading...")}
            </ThemedText>
          </View>
        ) : (
          <View
            style={[
              styles.listContent,
              conversations.length === 0 && styles.listEmptyPadding,
            ]}
          >
            {listContent}
          </View>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  sheetHeader: {
    backgroundColor: "#ffffff",
  },
  newConversationWrapper: {
    marginBottom: 12,
    paddingBottom: 4,
    backgroundColor: "#ffffff",
  },
  newConversationButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  newConversationText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  listEmptyPadding: {
    flexGrow: 1,
  },
  itemSeparator: {
    height: 12,
  },
});
