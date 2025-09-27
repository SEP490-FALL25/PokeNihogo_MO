import React from 'react'
import { Image, Text, View, ViewProps } from 'react-native'

interface AvatarProps extends ViewProps {
  src?: string
  alt?: string
  fallback?: string
  size?: number
}

const Avatar = React.forwardRef<View, AvatarProps>(
  ({ src, alt, fallback, size = 40, style, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    const [imageLoading, setImageLoading] = React.useState(true)

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const avatarStyle: ViewProps['style'] = {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#f3f4f6',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }

    return (
      <View ref={ref} style={[avatarStyle, style]} {...props}>
        {src && !imageError ? (
          <Image
            source={{ uri: src }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
            }}
            onError={() => setImageError(true)}
            onLoad={() => setImageLoading(false)}
          />
        ) : (
          <Text
            style={{
              fontSize: size * 0.4,
              fontWeight: '600',
              color: '#6b7280',
            }}
          >
            {fallback ? getInitials(fallback) : '?'}
          </Text>
        )}
      </View>
    )
  }
)

Avatar.displayName = 'Avatar'

export { Avatar }
export type { AvatarProps }

