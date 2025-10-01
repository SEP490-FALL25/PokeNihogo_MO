import React from 'react'
import { View, ViewProps } from 'react-native'

interface ProgressProps extends ViewProps {
  value?: number // 0-100
  max?: number
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ value = 0, max = 100, style, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <View
        ref={ref}
        style={[
          {
            width: '100%',
            height: 8,
            backgroundColor: '#d1d5db',
            borderRadius: 9999,
            overflow: 'hidden',
          },
          style,
        ]}
        {...props}
      >
        <View
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            borderRadius: 9999,
          }}
        />
      </View>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
export type { ProgressProps }

