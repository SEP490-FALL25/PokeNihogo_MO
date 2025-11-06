import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "small" | "large";
  style?: any;
  onPress?: () => void;
}

export default function UserAvatar({
  name,
  avatar,
  size = "small",
  style,
  onPress,
}: UserAvatarProps) {
  const isLarge = size === "large";
  const avatarSize = isLarge ? 96 : 40;
  const fontSize = isLarge ? 40 : 18;

  const AvatarContent = () => (
    <View
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize },
        style,
      ]}
    >
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          style={[
            styles.avatar,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Text style={[styles.placeholderText, { fontSize }]}>
            {name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <AvatarContent />
      </TouchableOpacity>
    );
  }

  return <AvatarContent />;
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  placeholder: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  placeholderText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
