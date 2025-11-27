import { ThemedText } from "@components/ThemedText";
import { ConversationRoom } from "@services/conversation";
import { TFunction } from "i18next";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface ConversationCardProps {
  conversation: ConversationRoom;
  isActive?: boolean;
  onPress: () => void;
}

const formatRelativeTime = (
  dateString: string | undefined,
  locale: string,
  t: TFunction
): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return t("home.ai.conversation.time.just_now", "Just now");
    }
    if (diffMins < 60) {
      return t("home.ai.conversation.time.minutes", {
        count: diffMins,
        defaultValue: "{{count}} minutes ago",
      });
    }
    if (diffHours < 24) {
      return t("home.ai.conversation.time.hours", {
        count: diffHours,
        defaultValue: "{{count}} hours ago",
      });
    }
    if (diffDays < 7) {
      return t("home.ai.conversation.time.days", {
        count: diffDays,
        defaultValue: "{{count}} days ago",
      });
    }

    return new Intl.DateTimeFormat(locale || "en-US", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

const ConversationCardComponent: React.FC<ConversationCardProps> = ({
  conversation,
  isActive = false,
  onPress,
}) => {
  const { t, i18n } = useTranslation();
  const title =
    conversation.title ||
    t("home.ai.conversation.card_new_conversation", "New conversation");
  const lastMessage =
    conversation.lastMessage ||
    t("home.ai.conversation.card_no_messages", "No messages yet");
  const lastMessageTime = useMemo(
    () =>
      formatRelativeTime(conversation.lastMessageAt, i18n.language, t),
    [conversation.lastMessageAt, i18n.language, t]
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, isActive && styles.cardActive]}
    >
      <View style={styles.row}>
        <View style={styles.avatarWrapper}>
          <Image
            source={require("@assets/images/PokeNihongoLogo.png")}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {title}
            </ThemedText>
            {conversation.lastMessageAt && (
              <ThemedText style={styles.timeText}>{lastMessageTime}</ThemedText>
            )}
          </View>

          <ThemedText style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  cardActive: {
    backgroundColor: "#e3f2fd",
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: "#999",
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 12,
    color: "#666",
  },
});

const arePropsEqual = (
  prev: ConversationCardProps,
  next: ConversationCardProps
) => {
  const prevRoom = prev.conversation;
  const nextRoom = next.conversation;
  const hasSameConversation =
    prevRoom.conversationId === nextRoom.conversationId &&
    prevRoom.title === nextRoom.title &&
    prevRoom.lastMessage === nextRoom.lastMessage &&
    prevRoom.lastMessageAt === nextRoom.lastMessageAt;

  return (
    hasSameConversation &&
    prev.isActive === next.isActive &&
    prev.onPress === next.onPress
  );
};

export const ConversationCard = memo(ConversationCardComponent, arePropsEqual);
