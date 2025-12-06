import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import React from 'react';
import { Image, ImageProps, View, ViewProps } from 'react-native';

cssInterop(LinearGradient, { className: 'style' });
const TWLinearGradient = LinearGradient as unknown as React.ComponentType<React.ComponentProps<typeof LinearGradient> & { className?: string }>;

const rarityBackgroundConfig: Record<string, { colors: readonly [string, string, string], borderColor: string }> = {
    COMMON: {
        colors: ['#f8fafc', '#e2e8f0', '#cbd5e1'] as const,
        borderColor: '#94a3b89e',
    },
    UNCOMMON: {
        colors: ['#ecfdf5', '#a7f3d0', '#6ee7b7'] as const,
        borderColor: '#34d3999e',
    },
    RARE: {
        colors: ['#eff6ff', '#93c5fd', '#60a5fa'] as const,
        borderColor: '#3b82f69e',
    },
    EPIC: {
        colors: ['#faf5ff', '#c4b5fd', '#a78bfa'] as const,
        borderColor: '#8b5cf69e',
    },
    LEGENDARY: {
        colors: ['#fefce8', '#fef08a', '#fde047'] as const,
        borderColor: '#facc159e',
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
