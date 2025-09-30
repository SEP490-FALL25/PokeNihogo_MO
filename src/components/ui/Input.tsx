import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text, TextInput, type TextInputProps, TouchableOpacity, View, type ViewProps } from 'react-native';

// Assuming you have an EyeShowPassword component, if not, you can create one
// or use an icon library like @expo/vector-icons.
// import { EyeShowPassword } from '@components/icons/EyeShowPassword';
import EyeShowPassword from '@components/atoms/EyeShowPassword';

import { cn } from '../../utils/cn';

const inputContainerVariants = cva(
  'flex-row items-center rounded-xl border',
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
  'flex-1 p-5',
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
    const activeVariant = error ? 'destructive' : variant;

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
        <View className={cn(inputContainerVariants({ variant: activeVariant, className }))}>
          <TextInput
            ref={ref}
            className={cn(textInputVariants({ variant: activeVariant }))}
            style={[{ fontSize: 16 }, style]}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor={variant === 'original' ? '#9ca3af' : '#FFFFFF99'}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              className="p-4"
              onPress={() => setShowPassword(!showPassword)}
            >
              <EyeShowPassword showPassword={showPassword} size={20} color="white" />
            </TouchableOpacity>
          )}
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

