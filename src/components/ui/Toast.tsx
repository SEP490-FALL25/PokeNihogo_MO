import React, { useEffect, useState } from 'react'
import { Animated, Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface ToastProps extends ViewProps {
  variant?: 'default' | 'destructive'
  children: React.ReactNode
  duration?: number
  onDismiss?: () => void
}

interface ToastTitleProps extends ViewProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive'
}

interface ToastDescriptionProps extends ViewProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive'
}

interface ToastCloseProps extends ViewProps {
  onPress?: () => void
}

const ToastIcon = ({ variant }: { variant?: string }) => {
  const iconStyle = {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: variant === 'destructive' ? '#fecaca' : '#bbf7d0',
  }

  return (
    <View style={iconStyle}>
      <Text
        style={{
          fontSize: 16,
          color: variant === 'destructive' ? '#dc2626' : '#16a34a',
          fontWeight: 'bold',
        }}
      >
        {variant === 'destructive' ? '✕' : '✓'}
      </Text>
    </View>
  )
}

const Toast = React.forwardRef<View, ToastProps>(
  ({ variant = 'default', children, duration = 4000, onDismiss, style, ...props }, ref) => {
    const [visible, setVisible] = useState(true)
    const opacity = React.useRef(new Animated.Value(0)).current
    const translateY = React.useRef(new Animated.Value(-50)).current

    useEffect(() => {
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss()
      }, duration)

      return () => clearTimeout(timer)
    }, [])

    const handleDismiss = () => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false)
        onDismiss?.()
      })
    }

    if (!visible) return null

    const getVariantStyles = (): ViewProps['style'] => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: '#f0fdf4',
            borderColor: '#bbf7d0',
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
            backgroundColor: '#f0fdf4',
            borderColor: '#bbf7d0',
            borderWidth: 1,
          }
      }
    }

    return (
      <Animated.View
        ref={ref}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            marginBottom: 8,
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            opacity,
            transform: [{ translateY }],
          },
          getVariantStyles(),
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.View>
    )
  }
)

Toast.displayName = 'Toast'

const ToastTitle = React.forwardRef<Text, ToastTitleProps>(
  ({ children, variant, style, ...props }, ref) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <ToastIcon variant={variant} />
      <Text
        ref={ref}
        style={[
          {
            fontSize: 16,
            fontWeight: '700',
            color: variant === 'destructive' ? '#b91c1c' : '#15803d',
            flex: 1,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    </View>
  )
)

ToastTitle.displayName = 'ToastTitle'

const ToastDescription = React.forwardRef<Text, ToastDescriptionProps>(
  ({ children, variant, style, ...props }, ref) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <ToastIcon variant={variant} />
      <Text
        ref={ref}
        style={[
          {
            fontSize: 14,
            color: variant === 'destructive' ? '#dc2626' : '#16a34a',
            flex: 1,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    </View>
  )
)

ToastDescription.displayName = 'ToastDescription'

const ToastClose = React.forwardRef<TouchableOpacity, ToastCloseProps>(
  ({ onPress, style, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[
        {
          position: 'absolute',
          top: 8,
          right: 8,
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        style={{
          fontSize: 16,
          color: '#6b7280',
          fontWeight: 'bold',
        }}
      >
        ×
      </Text>
    </TouchableOpacity>
  )
)

ToastClose.displayName = 'ToastClose'

// Toast Provider for managing toasts
interface ToastProviderProps {
  children: React.ReactNode
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  return <>{children}</>
}

// Toast Viewport for positioning toasts
interface ToastViewportProps extends ViewProps {
  children: React.ReactNode
}

const ToastViewport = React.forwardRef<View, ToastViewportProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1000,
          maxWidth: 420,
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

ToastViewport.displayName = 'ToastViewport'

export {
    Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport
}
export type { ToastCloseProps, ToastDescriptionProps, ToastProps, ToastTitleProps }

