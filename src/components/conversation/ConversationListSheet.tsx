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
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
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
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useConversationRooms({
    currentPage: 1,
    pageSize: 50,
  });
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const conversations = data?.results || [];

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
    queryClient.invalidateQueries({ queryKey: ["conversation-rooms"] });
    if (onSelectConversation) {
      onSelectConversation("");
    } else {
      router.push(ROUTES.APP.AI_CONVERSATION);
    }
    onClose();
  }, [onClose, onSelectConversation, queryClient]);


  return (
    <BottomSheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent
        snapPoints={[0.7]}
        enablePanDownToClose={true}
        backdropOpacity={0.5}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0, 1]}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
      >
        <BottomSheetHeader style={{ backgroundColor: "#ffffff" }}>
          <BottomSheetTitle>
            {t("home.ai.conversation.list_title", "Conversations")}
          </BottomSheetTitle>
        </BottomSheetHeader>

        {/* New Conversation Button */}
        <View
          style={{
            marginBottom: 12,
            paddingBottom: 4,
            backgroundColor: "#ffffff",
          }}
        >
          <TouchableOpacity
            onPress={handleNewConversation}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#007AFF",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ThemedText
              style={{
                color: "#ffffff",
                fontSize: 14,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              ✏️ {t("home.ai.conversation.new_conversation", "New Conversation")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* List */}
        {isLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 40,
            }}
          >
            <ActivityIndicator color="#007AFF" />
            <ThemedText
              style={{
                marginTop: 12,
                fontSize: 14,
                color: "#666",
              }}
            >
              {t("home.ai.conversation.loading", "Loading...")}
            </ThemedText>
          </View>
        ) : conversations.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 40,
            }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                color: "#999",
                textAlign: "center",
              }}
            >
              {t(
                "home.ai.conversation.empty_list",
                "No conversations yet. Start a new conversation!"
              )}
            </ThemedText>
          </View>
        ) : (
          <View style={{ paddingBottom: 24 }}>
            {conversations.map((item) => (
              <View key={item.conversationId} style={{ marginBottom: 12 }}>
                <ConversationCard
                  conversation={item}
                  isActive={item.conversationId === currentConversationId}
                  onPress={() => handleSelectConversation(item)}
                />
              </View>
            ))}
          </View>
        )}
      </BottomSheetContent>
    </BottomSheet>
  );
};
