import React, { useState } from 'react'
import { Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface TooltipContentProps extends ViewProps {
  children: React.ReactNode
  sideOffset?: number
}

interface TooltipProviderProps {
  children: React.ReactNode
}

const Tooltip = ({ children }: TooltipProps) => {
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

const TooltipTrigger = React.forwardRef<TouchableOpacity, TooltipTriggerProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, isOpen, onOpenChange, ...props }, ref) => {
    const handlePressIn = () => {
      onOpenChange?.(true)
    }

    const handlePressOut = () => {
      onOpenChange?.(false)
    }

    return (
      <TouchableOpacity
        ref={ref}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }
)

TooltipTrigger.displayName = 'TooltipTrigger'

const TooltipContent = React.forwardRef<View, TooltipContentProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, sideOffset = 4, isOpen, onOpenChange, style, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <View
        ref={ref}
        style={[
          {
            position: 'absolute',
            top: -40,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: '#1f2937',
            borderRadius: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginTop: sideOffset,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          },
          style,
        ]}
        {...props}
      >
        <Text
          style={{
            fontSize: 12,
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          {children}
        </Text>
        {/* Arrow */}
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            marginLeft: -4,
            width: 0,
            height: 0,
            borderLeftWidth: 4,
            borderRightWidth: 4,
            borderTopWidth: 4,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#1f2937',
          }}
        />
      </View>
    )
  }
)

TooltipContent.displayName = 'TooltipContent'

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
export type { TooltipContentProps, TooltipProps, TooltipProviderProps, TooltipTriggerProps }

