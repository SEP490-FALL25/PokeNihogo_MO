import { MATCH_DEBUFF_TYPE } from "@constants/battle.enum";
import { BlurView } from "expo-blur";
import React from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";

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

    // Debug logging
    React.useEffect(() => {
        if (debuff) {
            console.log("[DiscomfortVision] Debuff received:", {
                typeDebuff: debuff.typeDebuff,
                isDiscomfortVision,
                shouldApply,
                valueDebuff: debuff.valueDebuff,
            });
        }
    }, [debuff, isDiscomfortVision, shouldApply]);

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

    console.log("[DiscomfortVision] Applying blur effect, intensity:", blurIntensity);

    // For web, use CSS filter blur as fallback
    const isWeb = Platform.OS === "web";

    if (isWeb) {
        // Web fallback: Use CSS filter blur
        return (
            <View style={[styles.container, style]}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            filter: `blur(${blurIntensity / 2}px)`,
                            WebkitFilter: `blur(${blurIntensity / 2}px)`,
                            opacity: opacityAnim.interpolate({
                                inputRange: [0.3, 0.6],
                                outputRange: [0.7, 0.9],
                            }),
                        },
                    ]}
                >
                    {children}
                </Animated.View>
                {/* Dark overlay for web */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            opacity: opacityAnim,
                        },
                    ]}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {/* Use BlurView to wrap content - this applies blur to everything inside */}
            <BlurView
                intensity={blurIntensity}
                tint="dark"
                style={StyleSheet.absoluteFill}
            >
                {/* Additional dark overlay with animation for extra difficulty */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            opacity: opacityAnim,
                        },
                    ]}
                />

                {/* Content */}
                <View style={styles.content}>
                    {children}
                </View>
            </BlurView>
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

