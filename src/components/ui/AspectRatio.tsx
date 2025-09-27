import React from 'react'
import { View, ViewProps } from 'react-native'

interface AspectRatioProps extends ViewProps {
  children: React.ReactNode
  ratio?: number
}

const AspectRatio = ({ children, ratio = 1, style, ...props }: AspectRatioProps) => {
  return (
    <View
      style={[
        {
          aspectRatio: ratio,
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

export { AspectRatio }
export type { AspectRatioProps }

