import { LinearGradient } from "expo-linear-gradient";
import { ClipboardList } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface QuestIconProps {
    onPress: () => void;
    size?: "small" | "medium" | "large";
    style?: any;
}

export default function QuestIcon({ onPress, size = "small", style }: QuestIconProps) {
    const getSize = () => {
        switch (size) {
            case "small":
                return { container: 40, icon: 20 };
            case "medium":
                return { container: 50, icon: 24 };
            case "large":
                return { container: 60, icon: 28 };
            default:
                return { container: 40, icon: 20 };
        }
    };

    const sizes = getSize();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.container, { width: sizes.container, height: sizes.container }, style]}
        >
            <LinearGradient
                colors={['rgba(52, 202, 150, 0.643)', 'rgba(39, 220, 226, 0.664)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradient, { borderRadius: sizes.container / 2 }]}
            >
                <ClipboardList
                    size={sizes.icon}
                    color="#ffffff"
                    strokeWidth={2.5}
                />
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,},
    gradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

