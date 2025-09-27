import React, { useEffect, useRef } from 'react'
import { Animated, View, ViewProps } from 'react-native'

interface SkeletonProps extends ViewProps {
  width?: number | string
  height?: number | string
}

const Skeleton = React.forwardRef<View, SkeletonProps>(
  ({ width = '100%', height = 20, style, ...props }, ref) => {
    const opacity = useRef(new Animated.Value(0.3)).current

    useEffect(() => {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => pulse())
      }
      pulse()
    }, [opacity])

    return (
      <Animated.View
        ref={ref}
        style={[
          {
            width: typeof width === 'string' ? undefined : width,
            height: typeof height === 'string' ? undefined : height,
            backgroundColor: '#e5e7eb',
            borderRadius: 4,
            opacity,
          },
          style,
        ]}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
export type { SkeletonProps }

