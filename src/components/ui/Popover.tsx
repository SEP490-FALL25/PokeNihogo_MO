import React, { useState } from 'react'
import { Modal, TouchableOpacity, View, ViewProps } from 'react-native'

interface PopoverProps {
  children: React.ReactNode
}

interface PopoverTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface PopoverContentProps extends ViewProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const Popover = ({ children }: PopoverProps) => {
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

const PopoverTrigger = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, PopoverTriggerProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
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

PopoverTrigger.displayName = 'PopoverTrigger'

const PopoverContent = React.forwardRef<View, PopoverContentProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, align = 'center', sideOffset = 4, isOpen, onOpenChange, style, ...props }, ref) => {
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
          style={[
            {
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              justifyContent: 'center',
              padding: 16,
            },
            getAlignStyles(),
          ]}
          activeOpacity={1}
          onPress={() => onOpenChange?.(false)}
        >
          <TouchableOpacity
            ref={ref}
            style={[
              {
                backgroundColor: '#ffffff',
                borderRadius: 8,
                padding: 16,
                width: 288, // w-72 equivalentmarginTop: sideOffset,
              },
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

PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverContent, PopoverTrigger }
export type { PopoverContentProps, PopoverProps, PopoverTriggerProps }

