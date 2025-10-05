import React from "react";
import { Image, Text, View, ViewProps } from "react-native";

interface MascotBubbleProps extends ViewProps {
  children: React.ReactNode;
  title?: string;
  // Local asset require path for mascot image
  mascotSource?: any;
  // Style overrides
  bubbleStyle?: ViewProps["style"]; // container of the bubble (padding, background, border)
  titleTextStyle?: any; // style for title text
  contentTextStyle?: any; // style for question/content text
  mascotImageStyle?: any; // style for mascot image
  action?: React.ReactNode; // element to render inside bubble (e.g., speaker button)
}

export default function MascotBubble({
  children,
  title,
  mascotSource,
  bubbleStyle,
  titleTextStyle,
  contentTextStyle,
  mascotImageStyle,
  action,
  style,
  ...props
}: MascotBubbleProps) {
  return (
    <View style={[{ alignItems: "center" }, style]} {...props}>
      <View style={{ width: "100%", alignItems: "flex-start" }}>
        <View
          style={[
            {
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              paddingVertical: 18,
              paddingHorizontal: 20,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
              position: "relative",
            },
            bubbleStyle,
          ]}
        >
          {action ? (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
              }}
            >
              {action}
            </View>
          ) : null}
          {title ? (
            <Text
              style={[
                {
                  fontWeight: "600",
                  fontSize: 14,
                  color: "#6b7280",
                  marginBottom: 6,
                },
                titleTextStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
          <Text
            style={[
              { fontSize: 18, lineHeight: 26, color: "#111827" },
              contentTextStyle,
            ]}
          >
            {children}
          </Text>
        </View>

        {/* Thought bubble tail */}
        <View style={{ position: "relative", height: 0 }}>
          <View
            style={{
              position: "absolute",
              left: 24,
              top: 8,
              width: 12,
              height: 12,
              backgroundColor: "#ffffff",
              borderLeftWidth: 1,
              borderTopWidth: 1,
              borderColor: "#e5e7eb",
              transform: [{ rotate: "45deg" }],
            }}
          />
        </View>
      </View>

      <View
        style={{
          width: "100%",
          marginTop: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Image
          source={
            mascotSource ?? {
              uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif",
            }
          }
          style={[{ width: 72, height: 72, borderRadius: 16 }, mascotImageStyle]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
