import React from 'react'
import { TouchableOpacity, ViewProps } from 'react-native'

interface ToggleProps extends ViewProps {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  children: React.ReactNode
}

const Toggle = React.forwardRef<TouchableOpacity, ToggleProps>(
  ({ 
    pressed = false, 
    onPressedChange, 
    variant = 'default', 
    size = 'default', 
    children, 
    style, 
    ...props 
  }, ref) => {
    const handlePress = () => {
      onPressedChange?.(!pressed)
    }

    const getVariantStyles = (): ViewProps['style'] => {
      switch (variant) {
        case 'default':
          return {
            backgroundColor: pressed ? '#f3f4f6' : 'transparent',
          }
        case 'outline':
          return {
            backgroundColor: pressed ? '#f3f4f6' : 'transparent',
            borderWidth: 1,
            borderColor: '#d1d5db',
          }
        default:
          return {
            backgroundColor: pressed ? '#f3f4f6' : 'transparent',
          }
      }
    }

    const getSizeStyles = (): ViewProps['style'] => {
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
          },
          getVariantStyles(),
          getSizeStyles(),
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle }
export type { ToggleProps }

