import React, { createContext, useContext, useState } from 'react'
import { TouchableOpacity, View, ViewProps } from 'react-native'

interface ToggleGroupProps extends ViewProps {
  children: React.ReactNode
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

interface ToggleGroupItemProps extends ViewProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
}

interface ToggleGroupContextType {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  value?: string | string[]
  type?: 'single' | 'multiple'
  onValueChange?: (itemValue: string) => void
}

const ToggleGroupContext = createContext<ToggleGroupContextType>({
  variant: 'default',
  size: 'default',
})

const ToggleGroup = ({ 
  children, 
  type = 'single', 
  value, 
  defaultValue, 
  onValueChange, 
  variant = 'default', 
  size = 'default',
  style,
  ...props 
}: ToggleGroupProps) => {
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

  return (
    <ToggleGroupContext.Provider value={{ variant, size, value: currentValue, type, onValueChange: handleValueChange }}>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          },
          style,
        ]}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              currentValue,
              onValueChange: handleValueChange,
            } as any)
          }
          return child
        })}
      </View>
    </ToggleGroupContext.Provider>
  )
}

const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ToggleGroupItemProps & { currentValue?: string | string[]; onValueChange?: (value: string) => void }>(
  ({ value, children, disabled = false, style, currentValue, onValueChange, ...props }, ref) => {
    const context = useContext(ToggleGroupContext)
    const isSelected = Array.isArray(currentValue) 
      ? currentValue.includes(value)
      : currentValue === value

    const handlePress = () => {
      if (!disabled) {
        onValueChange?.(value)
      }
    }

    const getVariantStyles = (): ViewProps['style'] => {
      const variant = context.variant || 'default'
      switch (variant) {
        case 'default':
          return {
            backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
          }
        case 'outline':
          return {
            backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
            borderWidth: 1,
            borderColor: '#d1d5db',
          }
        default:
          return {
            backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
          }
      }
    }

    const getSizeStyles = (): ViewProps['style'] => {
      const size = context.size || 'default'
      switch (size) {
        case 'sm':
          return {
            height: 36,
            paddingHorizontal: 10,
            minWidth: 36,
          }
        case 'lg':
          return {
            height: 44,
            paddingHorizontal: 20,
            minWidth: 44,
          }
        default:
          return {
            height: 40,
            paddingHorizontal: 12,
            minWidth: 40,
          }
      }
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            gap: 8,
            opacity: disabled ? 0.5 : 1,
          },
          getVariantStyles(),
          getSizeStyles(),
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }
)

ToggleGroupItem.displayName = 'ToggleGroupItem'

export { ToggleGroup, ToggleGroupItem }
export type { ToggleGroupItemProps, ToggleGroupProps }

