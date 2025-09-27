import React from 'react'
import { Text, View, ViewProps } from 'react-native'

interface CardProps extends ViewProps {
  children: React.ReactNode
}

const Card = React.forwardRef<View, CardProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

Card.displayName = 'Card'

const CardHeader = React.forwardRef<View, ViewProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'column',
          padding: 24,
          gap: 6,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<Text, React.ComponentProps<typeof Text> & { children: React.ReactNode }>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 24,
          fontWeight: '600',
          lineHeight: 28,
          letterSpacing: -0.025,
          color: '#111827',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<Text, React.ComponentProps<typeof Text> & { children: React.ReactNode }>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 14,
          color: '#6b7280',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<View, ViewProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          padding: 24,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<View, ViewProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 24,
          paddingTop: 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

CardFooter.displayName = 'CardFooter'

export {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
}
export type { CardProps }

