import React from 'react'
import { Text, View, ViewProps } from 'react-native'

interface AlertProps extends ViewProps {
  variant?: 'default' | 'destructive'
  children: React.ReactNode
}

const Alert = React.forwardRef<View, AlertProps>(
  ({ variant = 'default', children, style, ...props }, ref) => {
    const getVariantStyles = (): ViewProps['style'] => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: '#f0f9ff',
            borderColor: '#bae6fd',
            borderWidth: 1,
          }
        case 'destructive':
          return {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
            borderWidth: 1,
          }
        default:
          return {
            backgroundColor: '#f0f9ff',
            borderColor: '#bae6fd',
            borderWidth: 1,
          }
      }
    }

    return (
      <View
        ref={ref}
        style={[
          {
            borderRadius: 6,
            padding: 16,
          },
          getVariantStyles(),
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    )
  }
)

Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<Text, React.ComponentProps<typeof Text> & { children: React.ReactNode }>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 16,
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: 4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<Text, React.ComponentProps<typeof Text> & { children: React.ReactNode }>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 14,
          color: '#4b5563',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle }
export type { AlertProps }

