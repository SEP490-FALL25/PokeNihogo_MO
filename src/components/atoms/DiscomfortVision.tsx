import { MATCH_DEBUFF_TYPE } from "@constants/battle.enum";
import { BlurView } from "expo-blur";
import React from "react";
import { Animated, StyleSheet, View } from "react-native";

interface DiscomfortVisionProps {
    children: React.ReactNode;
    debuff?: {
        id?: number;
        nameKey?: string;
        typeDebuff?: string;
        valueDebuff?: number;
    } | null;
    enabled?: boolean;
    style?: any;
}

/**
 * DiscomfortVision Component
 * 
 * Applies blur effect to make content harder to see when DISCOMFORT_VISION debuff is active.
 * Used in battle arena when opponent has type advantage or debuff is applied.
 * 
 * @param children - Content to be blurred (question and answers)
 * @param debuff - Debuff object with typeDebuff field
 * @param enabled - Optional override to enable/disable the effect
 */
export default function DiscomfortVision({ children, debuff, enabled, style }: DiscomfortVisionProps) {
    const isDiscomfortVision = debuff?.typeDebuff === MATCH_DEBUFF_TYPE.DISCOMFORT_VISION;
    const shouldApply = enabled !== undefined ? enabled : isDiscomfortVision;

    // Animation for subtle pulsing effect to make it harder to read
    const opacityAnim = React.useRef(new Animated.Value(0.3)).current;

    React.useEffect(() => {
        if (!shouldApply) {
            opacityAnim.setValue(0);
            return;
        }

        // Start pulsing animation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacityAnim, {
                    toValue: 0.6,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.3,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );

        pulseAnimation.start();

        return () => {
            pulseAnimation.stop();
        };
    }, [shouldApply, opacityAnim]);

    if (!shouldApply) {
        return <>{children}</>;
    }

    // Get blur intensity from valueDebuff
    // valueDebuff is typically in milliseconds (e.g., 4000), we'll use a reasonable blur intensity
    // Scale: 4000ms -> ~25 intensity (strong blur), 2000ms -> ~15 intensity (moderate blur)
    const blurIntensity = debuff?.valueDebuff
        ? Math.min(Math.max(debuff.valueDebuff / 160, 15), 30)
        : 20;

    return (
        <View style={[styles.container, style]}>
            {/* Blur overlay */}
            <BlurView
                intensity={blurIntensity}
                tint="dark"
                style={StyleSheet.absoluteFill}
            />

            {/* Additional dark overlay with animation for extra difficulty */}
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        opacity: opacityAnim,
                    },
                ]}
            />

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        overflow: "hidden",
    },
    content: {
        position: "relative",
        zIndex: 1,
    },
});

