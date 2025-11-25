import { MATCH_DEBUFF_TYPE } from "@constants/battle.enum";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

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
export default function DiscomfortVision({
    children,
    debuff,
    enabled,
    style,
}: DiscomfortVisionProps) {
    const isDiscomfortVision =
        debuff?.typeDebuff === MATCH_DEBUFF_TYPE.DISCOMFORT_VISION;
    const shouldApply = enabled !== undefined ? enabled : isDiscomfortVision;

    const opacityAnim = React.useRef(new Animated.Value(0.3)).current;
    const stripeAnim = React.useRef(new Animated.Value(0)).current;
    const [severity, setSeverity] = React.useState(1);
    const decayTimer = React.useRef<ReturnType<typeof setInterval> | null>(null);

    React.useEffect(() => {
        if (!shouldApply) {
            setSeverity(0);
            if (decayTimer.current) {
                clearInterval(decayTimer.current);
                decayTimer.current = null;
            }
            return;
        }

        setSeverity(1);

        if (decayTimer.current) {
            clearInterval(decayTimer.current);
            decayTimer.current = null;
        }

        const durationMs = debuff?.valueDebuff ?? 4000;
        const steps = 24;
        const stepDuration = Math.max(50, durationMs / steps);
        const minSeverity = 0.25;
        let currentStep = 0;

        decayTimer.current = setInterval(() => {
            currentStep += 1;
            setSeverity((prev) => {
                const next =
                    Math.max(
                        minSeverity,
                        1 - (currentStep / steps) * (1 - minSeverity)
                    ) || minSeverity;
                return Number.isFinite(next) ? next : minSeverity;
            });
            if (currentStep >= steps) {
                if (decayTimer.current) {
                    clearInterval(decayTimer.current);
                    decayTimer.current = null;
                }
            }
        }, stepDuration);

        return () => {
            if (decayTimer.current) {
                clearInterval(decayTimer.current);
                decayTimer.current = null;
            }
        };
    }, [debuff?.valueDebuff, shouldApply]);

    React.useEffect(() => {
        if (!shouldApply) {
            opacityAnim.stopAnimation(() => opacityAnim.setValue(0));
            stripeAnim.stopAnimation(() => stripeAnim.setValue(0));
            return;
        }

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

        const stripeAnimation = Animated.loop(
            Animated.timing(stripeAnim, {
                toValue: 1,
                duration: 4500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        pulseAnimation.start();
        stripeAnimation.start();

        return () => {
            pulseAnimation.stop();
            stripeAnimation.stop();
        };
    }, [opacityAnim, shouldApply, stripeAnim]);

    const overlayOpacity = opacityAnim.interpolate({
        inputRange: [0.3, 0.6],
        outputRange: [0.05 * severity, 0.25 * severity],
    });

    const stripeTranslate = stripeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -60],
    });

    const blurIntensity = debuff?.valueDebuff
        ? Math.min(Math.max(debuff.valueDebuff / 240, 10), 18)
        : 12;
    const adjustedBlur = blurIntensity * (0.4 + 0.6 * severity);

    const isWeb = Platform.OS === "web";

    if (!shouldApply) {
        return <View style={[styles.container, style]}>{children}</View>;
    }

    const overlayLayers = (
        <>
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    styles.tintOverlay,
                    { opacity: overlayOpacity },
                ]}
            />
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    styles.stripeOverlay,
                    {
                        transform: [{ translateY: stripeTranslate }],
                        opacity: opacityAnim.interpolate({
                            inputRange: [0.3, 0.6],
                            outputRange: [0.12 * severity, 0.26 * severity],
                        }),
                    },
                ]}
            >
                <LinearGradient
                    colors={[
                        "rgba(248,250,252,0.25)",
                        "rgba(30,41,59,0.25)",
                        "rgba(0,0,0,0)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </>
    );

    if (isWeb) {
        const webBlurStyle: any = {
            filter: `blur(${adjustedBlur / 2}px)`,
            WebkitFilter: `blur(${adjustedBlur / 2}px)`,
        };

        return (
            <View style={[styles.container, style]}>
                <Animated.View
                    style={[styles.content, webBlurStyle]}
                >
                    {children}
                </Animated.View>
                {overlayLayers}
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <View style={styles.content}>{children}</View>
            <BlurView
                pointerEvents="none"
                intensity={adjustedBlur}
                tint="dark"
                style={[StyleSheet.absoluteFill, styles.blurLayer]}
            />
            {overlayLayers}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "relative",
        overflow: "hidden",
    },
    content: {
        width: "100%",
    },
    blurLayer: {},
    tintOverlay: {
        backgroundColor: "rgba(15, 23, 42, 0.4)",
    },
    stripeOverlay: {
        overflow: "hidden",
    },
});

