import React, { useState } from 'react'
import { Modal, ScrollView, Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

interface SelectTriggerProps extends ViewProps {
  children: React.ReactNode
  placeholder?: string
}

interface SelectContentProps extends ViewProps {
  children: React.ReactNode
}

interface SelectItemProps extends ViewProps {
  value: string
  children: React.ReactNode
}

interface SelectLabelProps extends ViewProps {
  children: React.ReactNode
}

interface SelectSeparatorProps extends ViewProps {}

interface SelectValueProps {
  placeholder?: string
}

const Select = ({ value, defaultValue, onValueChange, children }: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const currentValue = value ?? internalValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            currentValue,
            onValueChange: handleValueChange,
          } as any)
        }
        return child
      })}
    </>
  )
}

const SelectTrigger = React.forwardRef<TouchableOpacity, SelectTriggerProps & { currentValue?: string; onValueChange?: (value: string) => void }>(
  ({ children, placeholder, currentValue, onValueChange, style, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    const handlePress = () => {
      setIsOpen(true)
    }

    return (
      <>
        <TouchableOpacity
          ref={ref}
          style={[
            {
              height: 40,
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 6,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: '#ffffff',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            style,
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
          {...props}
        >
          <Text
            style={{
              fontSize: 16,
              color: currentValue ? '#111827' : '#9ca3af',
              flex: 1,
            }}
          >
            {currentValue || placeholder}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#6b7280',
            }}
          >
            ▼
          </Text>
        </TouchableOpacity>

        {/* Modal for dropdown */}
        <SelectContent
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          currentValue={currentValue}
          onValueChange={onValueChange}
        >
          {children}
        </SelectContent>
      </>
    )
  }
)

SelectTrigger.displayName = 'SelectTrigger'

const SelectContent = React.forwardRef<View, SelectContentProps & { isOpen?: boolean; onClose?: () => void; currentValue?: string; onValueChange?: (value: string) => void }>(
  ({ children, isOpen, onClose, currentValue, onValueChange, style, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            ref={ref}
            style={[
              {
                backgroundColor: '#ffffff',
                borderRadius: 8,
                minWidth: 200,
                maxHeight: 300,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
              },
              style,
            ]}
            {...props}
          >
            <ScrollView style={{ maxHeight: 300 }}>
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child, {
                    currentValue,
                    onValueChange: (value: string) => {
                      onValueChange?.(value)
                      onClose?.()
                    },
                  } as any)
                }
                return child
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }
)

SelectContent.displayName = 'SelectContent'

const SelectItem = React.forwardRef<TouchableOpacity, SelectItemProps & { currentValue?: string; onValueChange?: (value: string) => void }>(
  ({ value, children, currentValue, onValueChange, style, ...props }, ref) => {
    const isSelected = currentValue === value

    const handlePress = () => {
      onValueChange?.(value)
    }

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
          },
          style,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        {...props}
      >
        {isSelected && (
          <Text
            style={{
              fontSize: 16,
              color: '#3b82f6',
              marginRight: 8,
            }}
          >
            ✓
          </Text>
        )}
        <Text
          style={{
            fontSize: 16,
            color: '#111827',
            flex: 1,
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    )
  }
)

SelectItem.displayName = 'SelectItem'

const SelectLabel = React.forwardRef<Text, SelectLabelProps>(
  ({ children, style, ...props }, ref) => (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 14,
          fontWeight: '600',
          color: '#374151',
          paddingHorizontal: 16,
          paddingVertical: 8,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  )
)

SelectLabel.displayName = 'SelectLabel'

const SelectSeparator = React.forwardRef<View, SelectSeparatorProps>(
  ({ style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          height: 1,
          backgroundColor: '#e5e7eb',
          marginHorizontal: 16,
          marginVertical: 4,
        },
        style,
      ]}
      {...props}
    />
  )
)

SelectSeparator.displayName = 'SelectSeparator'

const SelectValue = ({ placeholder }: SelectValueProps) => {
  return <Text>{placeholder}</Text>
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue
}
export type {
    SelectContentProps,
    SelectItemProps,
    SelectLabelProps, SelectProps, SelectSeparatorProps, SelectTriggerProps, SelectValueProps
}

