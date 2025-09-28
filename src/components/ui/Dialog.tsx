import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
  ViewProps
} from 'react-native'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface DialogTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface DialogContentProps extends ViewProps {
  children: React.ReactNode
  showCloseIcon?: boolean
}

interface DialogHeaderProps extends ViewProps {
  children: React.ReactNode
}

interface DialogFooterProps extends ViewProps {
  children: React.ReactNode
}

interface DialogTitleProps extends ViewProps {
  children: React.ReactNode
}

interface DialogDescriptionProps extends ViewProps {
  children: React.ReactNode
}

interface DialogCloseProps extends ViewProps {
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open !== undefined ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
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

const DialogTrigger = React.forwardRef<View, DialogTriggerProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, isOpen, onOpenChange, ...props }, ref) => (
    <TouchableOpacity
      ref={ref as any}
      onPress={() => onOpenChange?.(true)}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
)

DialogTrigger.displayName = 'DialogTrigger'

const DialogContent = React.forwardRef<View, DialogContentProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, showCloseIcon = true, isOpen, onOpenChange, style, ...props }, ref) => {
    const scale = useRef(new Animated.Value(0)).current
    const opacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
      if (isOpen) {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start()
      } else {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start()
      }
    }, [isOpen, scale, opacity])

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
            padding: 16,
            opacity,
          }}
        >
          <Animated.View
            ref={ref}
            style={[
              {
                backgroundColor: '#ffffff',
                borderRadius: 8,
                padding: 24,
                width: '100%',
                maxWidth: 500,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
                transform: [{ scale }],
              },
              style,
            ]}
            {...props}
          >
            {showCloseIcon && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6',
                }}
                onPress={() => onOpenChange?.(false)}
                activeOpacity={0.7}
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
            )}
            {children}
          </Animated.View>
        </Animated.View>
      </Modal>
    )
  }
)

DialogContent.displayName = 'DialogContent'

const DialogHeader = React.forwardRef<View, DialogHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'column',
          gap: 6,
          marginBottom: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

DialogHeader.displayName = 'DialogHeader'

const DialogFooter = React.forwardRef<View, DialogFooterProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<Text, DialogTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 18,
          fontWeight: '600',
          color: '#111827',
          lineHeight: 24,
        } as any,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<Text, DialogDescriptionProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 14,
          color: '#6b7280',
          lineHeight: 20,
        } as any,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

DialogDescription.displayName = 'DialogDescription'

const DialogClose = React.forwardRef<View, DialogCloseProps & { onOpenChange?: (open: boolean) => void }>(
  ({ children, onOpenChange, ...props }, ref) => (
    <TouchableOpacity
      ref={ref as any}
      onPress={() => onOpenChange?.(false)}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
)

DialogClose.displayName = 'DialogClose'

export {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
}
export type {
  DialogCloseProps, DialogContentProps, DialogDescriptionProps, DialogFooterProps, DialogHeaderProps, DialogProps, DialogTitleProps, DialogTriggerProps
}

