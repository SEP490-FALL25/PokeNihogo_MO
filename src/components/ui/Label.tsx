import React from 'react'
import { Text, TextProps } from 'react-native'

interface LabelProps extends TextProps {
  children: React.ReactNode
}

const Label = React.forwardRef<Text, LabelProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 14,
          fontWeight: '500',
          color: '#374151',
          marginBottom: 8,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

Label.displayName = 'Label'

export { Label }
export type { LabelProps }

