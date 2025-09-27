import React from 'react'
import { Text, View, ViewProps } from 'react-native'

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children: React.ReactNode
}

const Badge = React.forwardRef<View, BadgeProps>(
  ({ variant = 'default', children, style, ...props }, ref) => {
    const getVariantStyles = (): ViewProps['style'] => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: '#3b82f6',
            borderWidth: 0,
          }
        case 'secondary':
          return {
            backgroundColor: '#f3f4f6',
            borderWidth: 0,
          }
        case 'destructive':
          return {
            backgroundColor: '#ef4444',
            borderWidth: 0,
          }
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#e5e7eb',
          }
        default:
          return {
            backgroundColor: '#3b82f6',
            borderWidth: 0,
          }
      }
    }

    const getTextColor = (): string => {
      switch (variant) {
        case 'default':
          return '#ffffff'
        case 'secondary':
          return '#374151'
        case 'destructive':
          return '#ffffff'
        case 'outline':
          return '#374151'
        default:
          return '#ffffff'
      }
    }

    return (
      <View
        ref={ref}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 9999,
            paddingHorizontal: 10,
            paddingVertical: 2,
          },
          getVariantStyles(),
          style,
        ]}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: getTextColor(),
            }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
export type { BadgeProps }

