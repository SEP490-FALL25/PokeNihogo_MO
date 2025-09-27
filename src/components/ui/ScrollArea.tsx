import React from 'react'
import { ScrollView, View, ViewProps } from 'react-native'

interface ScrollAreaProps extends ViewProps {
  children: React.ReactNode
  onScroll?: (event: any) => void
}

interface ScrollBarProps extends ViewProps {
  orientation?: 'vertical' | 'horizontal'
}

const ScrollArea = React.forwardRef<ScrollView, ScrollAreaProps>(
  ({ children, onScroll, style, ...props }, ref) => (
    <View
      style={[
        {
          position: 'relative',
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      <ScrollView
        ref={ref}
        style={{
          height: '100%',
          width: '100%',
        }}
        onScroll={onScroll}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={true}
      >
        {children}
      </ScrollView>
    </View>
  )
)

ScrollArea.displayName = 'ScrollArea'

const ScrollBar = React.forwardRef<View, ScrollBarProps>(
  ({ orientation = 'vertical', style, ...props }, ref) => {
    const getOrientationStyles = (): ViewProps['style'] => {
      if (orientation === 'horizontal') {
        return {
          height: 10,
          flexDirection: 'column',
          borderTopWidth: 1,
          borderTopColor: 'transparent',
          paddingVertical: 1,
        }
      }
      return {
        width: 10,
        height: '100%',
        borderLeftWidth: 1,
        borderLeftColor: 'transparent',
        paddingHorizontal: 1,
      }
    }

    return (
      <View
        ref={ref}
        style={[
          {
            backgroundColor: '#d1d5db',
            borderRadius: 5,
            position: 'absolute',
            right: 0,
            bottom: 0,
          },
          getOrientationStyles(),
          style,
        ]}
        {...props}
      />
    )
  }
)

ScrollBar.displayName = 'ScrollBar'

export { ScrollArea, ScrollBar }
export type { ScrollAreaProps, ScrollBarProps }

