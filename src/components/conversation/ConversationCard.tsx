import { ThemedText } from "@components/ThemedText";
import { ConversationRoom } from "@services/conversation";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

interface ConversationCardProps {
  conversation: ConversationRoom;
  isActive?: boolean;
  onPress: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isActive = false,
  onPress,
}) => {
  const formatTime = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const title = conversation.title || "Cuộc trò chuyện mới";
  const lastMessage = conversation.lastMessage || "Chưa có tin nhắn";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        padding: 12,
        borderRadius: 8,
        marginBottom: 4,
        backgroundColor: isActive ? "#e3f2fd" : "transparent",
        borderLeftWidth: isActive ? 3 : 0,
        borderLeftColor: isActive ? "#007AFF" : "transparent",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Avatar */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#f3f4f6",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            overflow: "hidden",
          }}
        >
          <Image
            source={require("@assets/images/PokeNihongoLogo.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 4,
            }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#1f2937",
                flex: 1,
              }}
              numberOfLines={1}
            >
              {title}
            </ThemedText>
            {conversation.lastMessageAt && (
              <ThemedText
                style={{
                  fontSize: 11,
                  color: "#999",
                  marginLeft: 8,
                }}
              >
                {formatTime(conversation.lastMessageAt)}
              </ThemedText>
            )}
          </View>

          <ThemedText
            style={{
              fontSize: 12,
              color: "#666",
            }}
            numberOfLines={1}
          >
            {lastMessage}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

