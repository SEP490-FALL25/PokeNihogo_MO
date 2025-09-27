import React from 'react'
import {
    Text,
    TextInput,
    TextInputProps,
    View,
    ViewProps
} from 'react-native'

interface TextareaProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewProps['style']
  rows?: number
}

const Textarea = React.forwardRef<TextInput, TextareaProps>(
  ({ 
    label, 
    error, 
    containerStyle, 
    style, 
    rows = 4,
    ...props 
  }, ref) => {
    const minHeight = rows * 20

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
          multiline
          numberOfLines={rows}
          style={[
            {
              minHeight,
              borderWidth: 1,
              borderColor: error ? '#ef4444' : '#d1d5db',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 16,
              color: '#111827',
              backgroundColor: '#ffffff',
              textAlignVertical: 'top',
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

Textarea.displayName = 'Textarea'

export { Textarea }
export type { TextareaProps }

