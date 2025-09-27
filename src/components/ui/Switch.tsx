import React from 'react'
import { Switch as RNSwitch, SwitchProps } from 'react-native'

interface CustomSwitchProps extends Omit<SwitchProps, 'onValueChange'> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<RNSwitch, CustomSwitchProps>(
  ({ onCheckedChange, ...props }, ref) => {
    const handleValueChange = (value: boolean) => {
      onCheckedChange?.(value)
    }

    return (
      <RNSwitch
        ref={ref}
        onValueChange={handleValueChange}
        trackColor={{
          false: '#e5e7eb',
          true: '#3b82f6',
        }}
        thumbColor={props.value ? '#ffffff' : '#ffffff'}
        ios_backgroundColor="#e5e7eb"
        {...props}
      />
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
export type { CustomSwitchProps as SwitchProps }

