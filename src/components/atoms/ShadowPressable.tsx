// @/components/atoms/PushableButton.tsx

import React from 'react';
import { Pressable, Vibration, View, ViewStyle } from 'react-native';

interface PushableButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    className?: string;
    borderColor?: string;
    borderBottomWidth?: number;
    withHaptics?: boolean;
}

const PushableButton: React.FC<PushableButtonProps> = ({
    children,
    onPress,
    className,
    borderColor = '#000',
    borderBottomWidth = 2,
    withHaptics = false,
}) => {
    const handlePress = () => {
        if (withHaptics) {
            Vibration.vibrate(10);
        }
        onPress?.();
    };

    return (
        // Pressable bây giờ chỉ là một trình bao bọc vô hình để xử lý sự kiện nhấn.
        // Nó không nhận bất kỳ style nào liên quan đến giao diện.
        <Pressable onPress={handlePress}>
            {({ pressed }) => {
                // Style động vẫn như cũ
                const dynamicStyles: ViewStyle = {
                    borderBottomWidth: pressed ? 0 : borderBottomWidth,
                    borderColor: borderColor,
                    transform: [{ translateY: pressed ? borderBottomWidth : 0 }],
                };

                return (
                    // Toàn bộ className và style động được áp dụng cho View này.
                    // Cấu trúc này đáng tin cậy hơn nhiều.
                    <View style={dynamicStyles} className={className}>
                        {children}
                    </View>
                );
            }}
        </Pressable>
    );
};

export default PushableButton;