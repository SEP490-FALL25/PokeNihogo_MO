import React from 'react'
import { TouchableOpacity, View, ViewProps } from 'react-native'

interface CheckboxProps extends ViewProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const Checkbox = React.forwardRef<TouchableOpacity, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled = false, style, ...props }, ref) => {
    const handlePress = () => {
      if (!disabled) {
        onCheckedChange?.(!checked)
      }
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            width: 16,
            height: 16,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: checked ? '#3b82f6' : '#d1d5db',
            backgroundColor: checked ? '#3b82f6' : 'transparent',
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
        {checked && (
          <View
            style={{
              width: 8,
              height: 8,
              backgroundColor: '#ffffff',
              borderRadius: 2,
            }}
          />
        )}
      </TouchableOpacity>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export type { CheckboxProps }

