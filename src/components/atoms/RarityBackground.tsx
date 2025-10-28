import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import React from 'react';
import { Image, ImageProps, View, ViewProps } from 'react-native';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

const rarityBackgroundConfig: Record<string, { colors: readonly [string, string, string], borderColor: string, shadowColor: string }> = {
    COMMON: {
        colors: ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const,
        borderColor: '#94a3b89e',
        shadowColor: 'rgba(148, 163, 184, 0.3)',
    },
    UNCOMMON: {
        colors: ['#ecfdf5', '#a7f3d0', '#6ee7b7'] as const,
        borderColor: '#34d3999e',
        shadowColor: 'rgba(52, 211, 153, 0.4)',
    },
    RARE: {
        colors: ['#eff6ff', '#93c5fd', '#60a5fa'] as const,
        borderColor: '#3b82f69e',
        shadowColor: 'rgba(59, 130, 246, 0.4)',
    },
    EPIC: {
        colors: ['#faf5ff', '#c4b5fd', '#a78bfa'] as const,
        borderColor: '#8b5cf69e',
        shadowColor: 'rgba(139, 92, 246, 0.5)',
    },
    LEGENDARY: {
        colors: ['#fefce8', '#fef08a', '#fde047'] as const,
        borderColor: '#facc159e',
        shadowColor: 'rgba(250, 204, 21, 0.5)',
    },
};

export const getRarityBorderColor = (rarity: string): string => {
    return rarityBackgroundConfig[rarity]?.borderColor || rarityBackgroundConfig.COMMON.borderColor;
};

interface RarityBackgroundProps extends ViewProps {
    rarity: string;
    children: React.ReactNode;
}

export const RarityBackground = ({ rarity, children, style, ...props }: RarityBackgroundProps) => {
    const backgroundConfig = rarityBackgroundConfig[rarity] || rarityBackgroundConfig.COMMON;
    const isSpecial = rarity === 'EPIC' || rarity === 'LEGENDARY';

    const containerStyle = {
        borderColor: backgroundConfig.borderColor,
        shadowColor: backgroundConfig.shadowColor,
        shadowOffset: { width: 0, height: isSpecial ? 8 : 4 },
        shadowOpacity: isSpecial ? 0.6 : 0.3,
        shadowRadius: isSpecial ? 12 : 8,
        elevation: isSpecial ? 15 : 8,
    };

    return (
        <View style={[containerStyle, style]} {...props}>
            <TWLinearGradient
                colors={[...backgroundConfig.colors] as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="items-center p-4"
            >
                {children}
            </TWLinearGradient>
        </View>
    );
};

interface RarityImageProps extends ImageProps {
    rarity: string;
}

export const RarityImage = ({ rarity, ...imageProps }: RarityImageProps) => {
    return (
        <RarityBackground rarity={rarity}>
            <Image {...imageProps} />
        </RarityBackground>
    );
};

export default RarityBackground;
