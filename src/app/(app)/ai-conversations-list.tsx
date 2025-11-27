import { ThemedText } from "@components/ThemedText";
import { ConversationCard } from "@components/conversation/ConversationCard";
import { useConversationRooms } from "@hooks/useConversation";
import { ROUTES } from "@routes/routes";
import { ConversationRoom } from "@services/conversation";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowLeft, MessageSquare, Plus } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AiConversationsListScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, refetch } = useConversationRooms({
    currentPage: 1,
    pageSize: 50,
  });

  const conversations = data?.results || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationRoom) => {
    router.push({
      pathname: ROUTES.APP.AI_CONVERSATION,
      params: { conversationId: conversation.conversationId },
    });
  }, []);

  const handleNewConversation = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["conversation-rooms"] });
    router.push(ROUTES.APP.AI_CONVERSATION);
  }, [queryClient]);

  const renderItem: ListRenderItem<ConversationRoom> = useCallback(
    ({ item }) => (
      <ConversationCard
        conversation={item}
        onPress={() => handleSelectConversation(item)}
      />
    ),
    [handleSelectConversation]
  );

  const keyExtractor = useCallback(
    (item: ConversationRoom) => item.conversationId,
    []
  );

  const renderEmpty = useCallback(
    () => (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
          paddingHorizontal: 40,
        }}
      >
        <MessageSquare size={64} color="#d1d5db" />
        <ThemedText
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#374151",
            marginTop: 16,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {t("home.ai.conversation.list_empty_title", "No conversations yet")}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 14,
            color: "#6b7280",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          {t(
            "home.ai.conversation.list_empty_description",
            "Start a new conversation to practice Japanese with AI"
          )}
        </ThemedText>
        <TouchableOpacity
          onPress={handleNewConversation}
          style={{
            marginTop: 24,
            backgroundColor: "#007AFF",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Plus size={20} color="#ffffff" />
          <ThemedText
            style={{
              color: "#ffffff",
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 8,
            }}
          >
            {t("home.ai.conversation.new_conversation", "New Conversation")}
          </ThemedText>
        </TouchableOpacity>
      </View>
    ),
    [handleNewConversation, t]
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
      {isLoading && conversations.length === 0 ? (
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
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      {conversations.length > 0 && (
        <TouchableOpacity
          onPress={handleNewConversation}
          style={styles.fab}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

