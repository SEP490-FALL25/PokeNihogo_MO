import EyeShowPassword from '@components/atoms/EyeShowPassword'; // Giả định bạn có component này
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text, TextInput, type TextInputProps, TouchableOpacity, View, type ViewProps } from 'react-native';

import { cn } from '../../utils/cn';

const inputContainerVariants = cva(
  'rounded-xl border h-16', // Loại bỏ flex-row và items-center ở đây
  {
    variants: {
      variant: {
        default: 'bg-white/20 border-white/50',
        destructive: 'bg-white/20 border-red-500',
        original: 'bg-white border-[#d1d5db]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const textInputVariants = cva(
  'flex-1 h-full', // Đảm bảo TextInput chiếm toàn bộ chiều cao
  {
    variants: {
      variant: {
        default: 'text-white',
        destructive: 'text-white',
        original: 'text-[#111827]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface InputProps extends TextInputProps, VariantProps<typeof inputContainerVariants> {
  label?: string;
  error?: string;
  containerStyle?: ViewProps['style'];
  isPassword?: boolean;
}

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      containerStyle,
      style,
      variant,
      className,
      isPassword,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    // Khi variant là 'original', giữ variant để text color luôn là màu tối
    // Chỉ đổi container variant để hiển thị border đỏ khi có lỗi
    const containerVariant = error && variant !== 'original' ? 'destructive' : variant;
    const textVariant = variant === 'original' ? 'original' : (error ? 'destructive' : variant);

    return (
      <View style={[{ marginBottom: 16 }, containerStyle]}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            {label}
          </Text>
        )}
        {/* View container chính với bo viền và màu nền */}
        <View 
          className={cn(inputContainerVariants({ 
            variant: error && variant === 'original' ? 'original' : containerVariant, 
            className 
          }))}
          style={error && variant === 'original' ? { borderColor: '#ef4444' } : undefined}
        >
          {/* Thêm một View bao bọc bên trong để xử lý lỗi trên iOS */}
          <View className="flex-1 flex-row items-center px-5">
            <TextInput
              ref={ref}
              className={cn(textInputVariants({ variant: textVariant }))}
              style={[{ fontSize: 16 }, style]}
              secureTextEntry={isPassword && !showPassword}
              placeholderTextColor={variant === 'original' ? '#9ca3af' : '#FFFFFF99'}
              {...props}
            />
            {isPassword && (
              <TouchableOpacity
                className="p-4 -mr-4" // Điều chỉnh padding để không ảnh hưởng layout
                onPress={() => setShowPassword(!showPassword)}
              >
                <EyeShowPassword showPassword={showPassword} size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {error && (
          <Text
            style={{
              fontSize: 12,
              color: '#ef4444',
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputContainerVariants as inputVariants };
export type { InputProps };

