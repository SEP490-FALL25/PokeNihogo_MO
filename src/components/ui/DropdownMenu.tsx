import React, { useState } from 'react'
import { Modal, Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface DropdownMenuContentProps extends ViewProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

interface DropdownMenuItemProps extends ViewProps {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
}

interface DropdownMenuSeparatorProps extends ViewProps {}

interface DropdownMenuLabelProps extends ViewProps {
  children: React.ReactNode
}

interface DropdownMenuGroupProps extends ViewProps {
  children: React.ReactNode
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
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

const DropdownMenuTrigger = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, DropdownMenuTriggerProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, isOpen, onOpenChange, ...props }, ref) => {
    const handlePress = () => {
      onOpenChange?.(!isOpen)
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

DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

const DropdownMenuContent = React.forwardRef<View, DropdownMenuContentProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, align = 'start', sideOffset = 4, isOpen, onOpenChange, style, ...props }, ref) => {
    if (!isOpen) return null

    const getAlignStyles = (): ViewProps['style'] => {
      switch (align) {
        case 'start':
          return { alignItems: 'flex-start' }
        case 'end':
          return { alignItems: 'flex-end' }
        default:
          return { alignItems: 'center' }
      }
    }

    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => onOpenChange?.(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingTop: 100,
          }}
          activeOpacity={1}
          onPress={() => onOpenChange?.(false)}
        >
          <TouchableOpacity
            ref={ref}
            style={[
              {
                backgroundColor: '#ffffff',
                borderRadius: 8,
                padding: 8,
                minWidth: 200,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
                marginTop: sideOffset,
              },
              getAlignStyles(),
              style,
            ]}
            activeOpacity={1}
            onPress={() => {}}
            {...props}
          >
            {children}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    )
  }
)

DropdownMenuContent.displayName = 'DropdownMenuContent'

const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, DropdownMenuItemProps & { onOpenChange?: (open: boolean) => void }>(
  ({ children, onPress, disabled = false, onOpenChange, style, ...props }, ref) => {
    const handlePress = () => {
      if (!disabled) {
        onPress?.()
        onOpenChange?.(false)
      }
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 6,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        {...props}
      >
        <Text
          style={{
            fontSize: 16,
            color: '#111827',
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    )
  }
)

DropdownMenuItem.displayName = 'DropdownMenuItem'

const DropdownMenuSeparator = ({ style, ...props }: DropdownMenuSeparatorProps) => (
  <View
    style={[
      {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 4,
        marginHorizontal: 8,
      },
      style,
    ]}
    {...props}
  />
)

const DropdownMenuLabel = ({ children, style, ...props }: DropdownMenuLabelProps) => (
  <Text
    style={[
      {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 8,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </Text>
)

const DropdownMenuGroup = ({ children, ...props }: DropdownMenuGroupProps) => (
  <View {...props}>
    {children}
  </View>
)

export {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
}
export type {
    DropdownMenuContentProps, DropdownMenuGroupProps, DropdownMenuItemProps, DropdownMenuLabelProps, DropdownMenuProps, DropdownMenuSeparatorProps, DropdownMenuTriggerProps
}

