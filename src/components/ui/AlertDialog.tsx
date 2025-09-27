import React, { useState } from 'react'
import { Animated, Modal, Text, TextProps, TouchableOpacity, View, ViewProps } from 'react-native'

interface AlertDialogProps {
  children: React.ReactNode
}

interface AlertDialogTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface AlertDialogContentProps extends ViewProps {
  children: React.ReactNode
}

interface AlertDialogHeaderProps extends ViewProps {
  children: React.ReactNode
}

interface AlertDialogFooterProps extends ViewProps {
  children: React.ReactNode
}

interface AlertDialogTitleProps extends TextProps {
  children: React.ReactNode
}

interface AlertDialogDescriptionProps extends TextProps {
  children: React.ReactNode
}

interface AlertDialogActionProps extends ViewProps {
  children: React.ReactNode
  onPress?: () => void
}

interface AlertDialogCancelProps extends ViewProps {
  children: React.ReactNode
  onPress?: () => void
}

const AlertDialog = ({ children }: AlertDialogProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            onOpenChange: handleOpenChange,
          } as any)
        }
        return child
      })}
    </>
  )
}

const AlertDialogTrigger = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, AlertDialogTriggerProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, isOpen, onOpenChange, ...props }, ref) => {
    const handlePress = () => {
      onOpenChange?.(true)
    }

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }
)

AlertDialogTrigger.displayName = 'AlertDialogTrigger'

const AlertDialogContent = React.forwardRef<View, AlertDialogContentProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, isOpen, onOpenChange, style, ...props }, ref) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current
    const opacityAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      if (isOpen) {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start()
      } else {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start()
      }
    }, [isOpen, scaleAnim, opacityAnim])

    if (!isOpen) return null

    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => onOpenChange?.(false)}
      >
        {/* Overlay */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: opacityAnim,
          }}
        >
          <Animated.View
            ref={ref}
            style={[
              {
                backgroundColor: '#ffffff',
                borderRadius: 8,
                padding: 24,
                margin: 16,
                width: '90%',
                maxWidth: 400,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
                gap: 16,
                transform: [{ scale: scaleAnim }],
              },
              style,
            ]}
            {...props}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </Modal>
    )
  }
)

AlertDialogContent.displayName = 'AlertDialogContent'

const AlertDialogHeader = React.forwardRef<View, AlertDialogHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'column',
          gap: 8,
          alignItems: 'center',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogFooter = React.forwardRef<View, AlertDialogFooterProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'column-reverse',
          gap: 8,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

AlertDialogFooter.displayName = 'AlertDialogFooter'

const AlertDialogTitle = React.forwardRef<Text, AlertDialogTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 18,
          fontWeight: '600',
          color: '#111827',
          textAlign: 'center',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

AlertDialogTitle.displayName = 'AlertDialogTitle'

const AlertDialogDescription = React.forwardRef<Text, AlertDialogDescriptionProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 14,
          color: '#6b7280',
          textAlign: 'center',
          lineHeight: 20,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

AlertDialogDescription.displayName = 'AlertDialogDescription'

const AlertDialogAction = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, AlertDialogActionProps & { onOpenChange?: (open: boolean) => void }>(
  ({ children, onPress, onOpenChange, style, ...props }, ref) => {
    const handlePress = () => {
      onPress?.()
      onOpenChange?.(false)
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            backgroundColor: '#dc2626',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        {...props}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#ffffff',
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    )
  }
)

AlertDialogAction.displayName = 'AlertDialogAction'

const AlertDialogCancel = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, AlertDialogCancelProps & { onOpenChange?: (open: boolean) => void }>(
  ({ children, onPress, onOpenChange, style, ...props }, ref) => {
    const handlePress = () => {
      onPress?.()
      onOpenChange?.(false)
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#d1d5db',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        {...props}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#374151',
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    )
  }
)

AlertDialogCancel.displayName = 'AlertDialogCancel'

export {
    AlertDialog, AlertDialogAction,
    AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
}
export type {
    AlertDialogActionProps,
    AlertDialogCancelProps, AlertDialogContentProps, AlertDialogDescriptionProps, AlertDialogFooterProps, AlertDialogHeaderProps, AlertDialogProps, AlertDialogTitleProps, AlertDialogTriggerProps
}

