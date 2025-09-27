import React, { useState } from 'react'
import { Animated, Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface CollapsibleProps extends ViewProps {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CollapsibleTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface CollapsibleContentProps extends ViewProps {
  children: React.ReactNode
}

const Collapsible = ({ 
  children, 
  defaultOpen = false, 
  open, 
  onOpenChange, 
  ...props 
}: CollapsibleProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = open ?? internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  return (
    <View {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            onOpenChange: handleOpenChange,
          } as any)
        }
        return child
      })}
    </View>
  )
}

const CollapsibleTrigger = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, CollapsibleTriggerProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }>(
  ({ children, isOpen, onOpenChange, style, ...props }, ref) => {
    const handlePress = () => {
      onOpenChange?.(!isOpen)
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 16,
          },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
        <View
          style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#6b7280',
            }}
          >
            ▼
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
)

CollapsibleTrigger.displayName = 'CollapsibleTrigger'

const CollapsibleContent = React.forwardRef<View, CollapsibleContentProps & { isOpen?: boolean }>(
  ({ children, isOpen, style, ...props }, ref) => {
    const heightAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      Animated.timing(heightAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
    }, [isOpen, heightAnim])

    const animatedHeight = heightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200], // Adjust max height as needed
    })

    if (!isOpen) {
      return null
    }

    return (
      <Animated.View
        ref={ref}
        style={[
          {
            overflow: 'hidden',
            paddingHorizontal: 16,
            paddingBottom: 16,
          },
          { height: animatedHeight },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.View>
    )
  }
)

CollapsibleContent.displayName = 'CollapsibleContent'

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
export type { CollapsibleContentProps, CollapsibleProps, CollapsibleTriggerProps }

