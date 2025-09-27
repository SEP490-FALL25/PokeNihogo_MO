import React from 'react'
import { View, ViewProps } from 'react-native'

interface SeparatorProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical'
}

const Separator = React.forwardRef<View, SeparatorProps>(
  ({ orientation = 'horizontal', style, ...props }, ref) => {
    const getStyles = (): ViewProps['style'] => {
      if (orientation === 'horizontal') {
        return {
          height: 1,
          backgroundColor: '#e5e7eb',
          width: '100%',
        }
      } else {
        return {
          width: 1,
          backgroundColor: '#e5e7eb',
          height: '100%',
        }
      }
    }

    return (
      <View
        ref={ref}
        style={[getStyles(), style]}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

export { Separator }
export type { SeparatorProps }

