import React, { useState } from 'react'
import { Animated, Modal, Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface SheetProps {
  children: React.ReactNode
}

interface SheetTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface SheetContentProps extends ViewProps {
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

interface SheetHeaderProps extends ViewProps {
  children: React.ReactNode
}

interface SheetFooterProps extends ViewProps {
  children: React.ReactNode
}

interface SheetTitleProps extends ViewProps {
  children: React.ReactNode
}

interface SheetDescriptionProps extends ViewProps {
  children: React.ReactNode
}

interface SheetCloseProps extends ViewProps {
  children: React.ReactNode
}

const Sheet = ({ children }: SheetProps) => {
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

const SheetTrigger = React.forwardRef<TouchableOpacity, SheetTriggerProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
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

SheetTrigger.displayName = 'SheetTrigger'

const SheetContent = React.forwardRef<View, SheetContentProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, side = 'right', isOpen, onOpenChange, style, ...props }, ref) => {
    const slideAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      if (isOpen) {
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start()
      } else {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start()
      }
    }, [isOpen])

    const getSlideTransform = () => {
      switch (side) {
        case 'top':
          return {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-400, 0],
                }),
              },
            ],
          }
        case 'bottom':
          return {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0],
                }),
              },
            ],
          }
        case 'left':
          return {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-300, 0],
                }),
              },
            ],
          }
        default: // right
          return {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
          }
      }
    }

    const getPositionStyles = (): ViewProps['style'] => {
      switch (side) {
        case 'top':
          return {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 400,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          }
        case 'bottom':
          return {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 400,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          }
        case 'left':
          return {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '75%',
            maxWidth: 400,
            borderRightWidth: 1,
            borderRightColor: '#e5e7eb',
          }
        default: // right
          return {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '75%',
            maxWidth: 400,
            borderLeftWidth: 1,
            borderLeftColor: '#e5e7eb',
          }
      }
    }

    if (!isOpen) return null

    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => onOpenChange?.(false)}
      >
        {/* Overlay */}
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
          activeOpacity={1}
          onPress={() => onOpenChange?.(false)}
        >
          <Animated.View
            ref={ref}
            style={[
              {
                backgroundColor: '#ffffff',
                padding: 24,gap: 16,
              },
              getPositionStyles(),
              getSlideTransform(),
              style,
            ]}
            {...props}
          >
            {/* Close Button */}
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
                zIndex: 10,
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
            {children}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    )
  }
)

SheetContent.displayName = 'SheetContent'

const SheetHeader = React.forwardRef<View, SheetHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'column',
          gap: 8,
          textAlign: 'center',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

SheetHeader.displayName = 'SheetHeader'

const SheetFooter = React.forwardRef<View, SheetFooterProps>(
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

SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<Text, SheetTitleProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 18,
          fontWeight: '600',
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

SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<Text, SheetDescriptionProps>(
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

SheetDescription.displayName = 'SheetDescription'

const SheetClose = React.forwardRef<TouchableOpacity, SheetCloseProps & { onOpenChange?: (open: boolean) => void }>(
  ({ children, onOpenChange, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      onPress={() => onOpenChange?.(false)}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
)

SheetClose.displayName = 'SheetClose'

export {
    Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger
}
export type {
    SheetCloseProps, SheetContentProps, SheetDescriptionProps, SheetFooterProps, SheetHeaderProps, SheetProps, SheetTitleProps, SheetTriggerProps
}

