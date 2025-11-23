// src/components/ui/GlowingRing.tsx
import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface GlowingRingProps {
    size?: number;
    color?: string;
}

export default function GlowingRing({ size = 400, color = '#00FFFF' }: GlowingRingProps) {
    const ringRadius = size / 2 - 20; // Bán kính vòng chính
    const centerX = size / 2;
    const centerY = size / 2;

    return (
        <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
            <Defs>
                {/* Định nghĩa hiệu ứng tỏa sáng bằng gradient */}
                <RadialGradient
                    id="glow"
                    cx={centerX}
                    cy={centerY}
                    rx={centerX}
                    ry={centerY}
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop offset="0.6" stopColor={color} stopOpacity="0.05" />
                    <Stop offset="0.8" stopColor={color} stopOpacity="0.27" />
                    <Stop offset="0.95" stopColor={color} stopOpacity="0" />
                </RadialGradient>
            </Defs>

            {/* Vòng sáng bên ngoài */}
            <Circle cx={centerX} cy={centerY} r={ringRadius + 10} fill="url(#glow)" />

            {/* Vòng chính */}
            <Circle
                cx={centerX}
                cy={centerY}
                r={ringRadius}
                stroke={color}
                strokeWidth="2"
                fill="none"
                strokeOpacity={0.5}
            />
            <Circle
                cx={centerX}
                cy={centerY}
                r={ringRadius}
                stroke={color}
                strokeWidth="2"
                fill="none"
                strokeDasharray="90, 100"
            />
            {/* Vòng phụ bên trong */}
            <Circle
                cx={centerX}
                cy={centerY}
                r={ringRadius - 10}
                stroke={color}
                strokeWidth="2"
                fill="none"
                strokeOpacity={0.5}
                strokeDasharray="30, 50"
            // highlight-end
            />
        </Svg>
    );
}