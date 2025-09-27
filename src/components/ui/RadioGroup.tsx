import React, { useState } from 'react'
import { TouchableOpacity, View, ViewProps } from 'react-native'

interface RadioGroupProps extends ViewProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface RadioGroupItemProps extends ViewProps {
  value: string
  disabled?: boolean
}

const RadioGroup = ({ value, defaultValue, onValueChange, children, ...props }: RadioGroupProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const currentValue = value ?? internalValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <View
      style={[
        {
          gap: 8,
        },
        props.style,
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
  )
}

const RadioGroupItem = React.forwardRef<TouchableOpacity, RadioGroupItemProps & { currentValue?: string; onValueChange?: (value: string) => void }>(
  ({ value, disabled = false, style, currentValue, onValueChange, ...props }, ref) => {
    const isSelected = currentValue === value

    const handlePress = () => {
      if (!disabled) {
        onValueChange?.(value)
      }
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            width: 16,
            height: 16,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: isSelected ? '#3b82f6' : '#d1d5db',
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {isSelected && (
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#3b82f6',
            }}
          />
        )}
      </TouchableOpacity>
    )
  }
)

RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
export type { RadioGroupItemProps, RadioGroupProps }

