import React from 'react'
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle
} from 'react-native'

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    loading = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: '#3b82f6', // bg-primary
            borderWidth: 0,
          }
        case 'destructive':
          return {
            backgroundColor: '#ef4444', // bg-destructive
            borderWidth: 0,
          }
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#e5e7eb', // border-input
          }
        case 'secondary':
          return {
            backgroundColor: '#f3f4f6', // bg-secondary
            borderWidth: 0,
          }
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            borderWidth: 0,
          }
        case 'link':
          return {
            backgroundColor: 'transparent',
            borderWidth: 0,
          }
        default:
          return {
            backgroundColor: '#3b82f6',
            borderWidth: 0,
          }
      }
    }

    const getSizeStyles = (): ViewStyle => {
      switch (size) {
        case 'sm':
          return {
            height: 36,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 6,
          }
        case 'lg':
          return {
            height: 44,
            paddingHorizontal: 32,
            paddingVertical: 12,
            borderRadius: 6,
          }
        case 'icon':
          return {
            height: 40,
            width: 40,
            paddingHorizontal: 0,
            paddingVertical: 0,
            borderRadius: 6,
          }
        default:
          return {
            height: 40,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 6,
          }
      }
    }

    const getTextColor = (): string => {
      switch (variant) {
        case 'default':
          return '#ffffff'
        case 'destructive':
          return '#ffffff'
        case 'outline':
          return '#374151'
        case 'secondary':
          return '#374151'
        case 'ghost':
          return '#374151'
        case 'link':
          return '#3b82f6'
        default:
          return '#ffffff'
      }
    }

    const getTextSize = (): number => {
      switch (size) {
        case 'sm':
          return 14
        case 'lg':
          return 16
        case 'icon':
          return 14
        default:
          return 14
      }
    }

    const buttonStyle: ViewStyle = {
      ...getVariantStyles(),
      ...getSizeStyles(),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDisabled ? 0.5 : 1,
    }

    const textStyle: TextStyle = {
      color: getTextColor(),
      fontSize: getTextSize(),
      fontWeight: '500',
      textAlign: 'center',
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={buttonStyle}
        disabled={isDisabled}
        activeOpacity={0.8}
        {...props}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
          />
        ) : (
          typeof children === 'string' ? (
            <Text style={textStyle}>{children}</Text>
          ) : (
            children
          )
        )}
      </TouchableOpacity>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }

