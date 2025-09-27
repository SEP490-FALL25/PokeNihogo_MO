import React from 'react'
import {
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewProps
} from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewProps['style']
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ 
    label, 
    error, 
    containerStyle, 
    style, 
    ...props 
  }, ref) => {
    return (
      <View style={[{ marginBottom: 16 }, containerStyle]}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          style={[
            {
              height: 40,
              borderWidth: 1,
              borderColor: error ? '#ef4444' : '#d1d5db',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 16,
              color: '#111827',
              backgroundColor: '#ffffff',
            },
            style,
          ]}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {error && (
          <Text
            style={{
              fontSize: 12,
              color: '#ef4444',
              marginTop: 4,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }

