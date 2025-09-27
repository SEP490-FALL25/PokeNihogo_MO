import React, { useState } from 'react'
import { Animated, Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface AccordionProps extends ViewProps {
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children: React.ReactNode
}

interface AccordionItemProps extends ViewProps {
  value: string
  children: React.ReactNode
}

interface AccordionTriggerProps extends ViewProps {
  children: React.ReactNode
}

interface AccordionContentProps extends ViewProps {
  children: React.ReactNode
}

const Accordion = ({ 
  type = 'single', 
  value, 
  defaultValue, 
  onValueChange, 
  children, 
  ...props 
}: AccordionProps) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (type === 'single' ? '' : [])
  )
  const currentValue = value ?? internalValue

  const handleValueChange = (itemValue: string) => {
    if (type === 'single') {
      const newValue = currentValue === itemValue ? '' : itemValue
      if (value === undefined) {
        setInternalValue(newValue as string)
      }
      onValueChange?.(newValue as string)
    } else {
      const currentArray = Array.isArray(currentValue) ? currentValue : []
      const newValue = currentArray.includes(itemValue)
        ? currentArray.filter(v => v !== itemValue)
        : [...currentArray, itemValue]
      
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }
  }

  const isItemOpen = (itemValue: string): boolean => {
    if (type === 'single') {
      return currentValue === itemValue
    } else {
      return Array.isArray(currentValue) && currentValue.includes(itemValue)
    }
  }

  return (
    <View {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen: isItemOpen((child.props as any).value),
            onToggle: handleValueChange,
          } as any)
        }
        return child
      })}
    </View>
  )
}

const AccordionItem = React.forwardRef<View, AccordionItemProps & { isOpen?: boolean; onToggle?: (value: string) => void }>(
  ({ value, children, isOpen, onToggle, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        props.style,
      ]}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            isOpen,
            onToggle,
          } as any)
        }
        return child
      })}
    </View>
  )
)

AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<TouchableOpacity, AccordionTriggerProps & { value?: string; isOpen?: boolean; onToggle?: (value: string) => void }>(
  ({ children, value, isOpen, onToggle, style, ...props }, ref) => {
    const rotation = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      Animated.timing(rotation, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }, [isOpen])

    const rotate = rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    })

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingHorizontal: 0,
          },
          style,
        ]}
        onPress={() => value && onToggle?.(value)}
        activeOpacity={0.7}
        {...props}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '500',
            color: '#111827',
            flex: 1,
          }}
        >
          {children}
        </Text>
        <Animated.View
          style={{
            transform: [{ rotate }],
            marginLeft: 8,
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
        </Animated.View>
      </TouchableOpacity>
    )
  }
)

AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef<View, AccordionContentProps & { value?: string; isOpen?: boolean }>(
  ({ children, isOpen, style, ...props }, ref) => {
    const height = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
      Animated.timing(height, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
    }, [isOpen])

    const animatedHeight = height.interpolate({
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
            paddingTop: 0,
            paddingBottom: 16,
            overflow: 'hidden',
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.View>
    )
  }
)

AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
export type { AccordionContentProps, AccordionItemProps, AccordionProps, AccordionTriggerProps }

