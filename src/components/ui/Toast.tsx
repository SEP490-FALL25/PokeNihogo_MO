import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Text, TextProps, TouchableOpacity, View, ViewProps } from 'react-native'

interface ToastProps extends ViewProps {
  variant?: 'default' | 'destructive' | 'Success'
  children: React.ReactNode
  duration?: number
  onDismiss?: () => void
}

interface ToastTitleProps extends TextProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'Success'
}

interface ToastDescriptionProps extends TextProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'Success'
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
    backgroundColor: variant === 'destructive' ? '#fecaca' : variant === 'Success' ? '#d1fae5' : '#bbf7d0',
  }

  return (
    <View style={iconStyle}>
      <Text
        style={{
          fontSize: 16,
          color: variant === 'destructive' ? '#dc2626' : variant === 'Success' ? '#10b981' : '#16a34a',
          fontWeight: 'bold',
        }}
      >
        {variant === 'destructive' ? '✕' : variant === 'Success' ? '✓' : '✓'}
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
        case 'Success':
          return {
            backgroundColor: '#d1fae5',
            borderColor: '#10b981',
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
            color: variant === 'destructive' ? '#b91c1c' : variant === 'Success' ? '#10b981' : '#15803d',
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
            color: variant === 'destructive' ? '#dc2626' : variant === 'Success' ? '#10b981' : '#16a34a',
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

const ToastClose = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ToastCloseProps>(
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

type ToastVariant = 'default' | 'destructive' | 'Success'

interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: (item: Omit<ToastItem, 'id'> & { id?: string }) => string
  dismiss: (id?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const generateId = () => Math.random().toString(36).slice(2)

const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id?: string) => {
    setToasts((prev) => (id ? prev.filter((t) => t.id !== id) : []))
    if (id) {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id])
        delete timersRef.current[id]
      }
    } else {
      Object.values(timersRef.current).forEach(clearTimeout)
      timersRef.current = {}
    }
  }, [])

  const toast = useCallback<ToastContextValue['toast']>((item) => {
    const id = item.id ?? generateId()
    const duration = item.duration ?? 4000
    setToasts((prev) => [{ id, ...item, duration }, ...prev])
    timersRef.current[id] = setTimeout(() => dismiss(id), duration + 600)
    return id
  }, [dismiss])

  const value = useMemo<ToastContextValue>(() => ({ toasts, toast, dismiss }), [toasts, toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
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
  Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, useToast
}
export type { ToastCloseProps, ToastDescriptionProps, ToastProps, ToastTitleProps }

export const Toaster = () => {
  const { toasts, dismiss } = useToast()

  if (!toasts.length) return null

  return (
    <ToastViewport>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          duration={t.duration}
          onDismiss={() => dismiss(t.id)}
        >

          {t.title && (
            <ToastTitle variant={t.variant}>{t.title}</ToastTitle>
          )}
          <ToastDescription variant={t.variant}>{t.description ?? ''}</ToastDescription>

        </Toast>
      ))}
    </ToastViewport>
  )
}
