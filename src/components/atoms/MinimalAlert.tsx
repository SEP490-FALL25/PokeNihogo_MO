import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface MinimalGameAlertProps {
    message: string;
    visible: boolean;
    onHide: () => void;
    type?: AlertType;
}

interface AlertWrapperProps {
    children: React.ReactNode;
    visible: boolean;
    onHide?: () => void;
}

/**
 * Wrapper component cho alert layout
 * Quản lý Modal, positioning, và basic structure
 */
const AlertWrapper = ({ children, visible }: AlertWrapperProps) => {
    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            <View
                className="flex-1 justify-start items-center"
                style={{ paddingTop: SCREEN_HEIGHT * 0.12 }}
                pointerEvents="box-none"
            >
                {children}
            </View>
        </View>
    );
};

const MinimalGameAlert = ({ message, visible, onHide, type = 'error' }: MinimalGameAlertProps) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onHide();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, onHide]);

    const getTextColor = () => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            case 'info': return 'text-blue-400';
            default: return 'text-red-400';
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return 'border-green-500/70';
            case 'error': return 'border-red-500/70';
            case 'warning': return 'border-yellow-500/70';
            case 'info': return 'border-blue-500/70';
            default: return 'border-red-500/70';
        }
    };

    const getGlowColor = () => {
        switch (type) {
            case 'success': return 'rgba(34, 197, 94, 0.4)';
            case 'error': return 'rgba(239, 68, 68, 0.4)';
            case 'warning': return 'rgba(234, 179, 8, 0.4)';
            case 'info': return 'rgba(59, 130, 246, 0.4)';
            default: return 'rgba(239, 68, 68, 0.4)';
        }
    };

    return (
        <View
            className={`${getBorderColor()} rounded-lg overflow-hidden`}
            style={{
                borderWidth: 2,minWidth: 280,
                maxWidth: '85%',
            }}
            pointerEvents="auto"
        >
            {/* Background với gradient mờ */}
            <View className="bg-black/50 px-5 py-3">
                <Text className={`font-bold text-base text-center ${getTextColor()}`}>
                    {message}
                </Text>
            </View>
        </View>
    );
};

// Export AlertWrapper để có thể dùng ở nơi khác
export { AlertWrapper };
export default MinimalGameAlert;
