import React from 'react'
import { Text, TextProps, TouchableOpacity, View, ViewProps } from 'react-native'

interface BreadcrumbProps extends ViewProps {
  children: React.ReactNode
  separator?: React.ReactNode
}

interface BreadcrumbListProps extends ViewProps {
  children: React.ReactNode
}

interface BreadcrumbItemProps extends ViewProps {
  children: React.ReactNode
}

interface BreadcrumbLinkProps extends ViewProps {
  children: React.ReactNode
  onPress?: () => void
}

interface BreadcrumbPageProps extends TextProps {
  children: React.ReactNode
}

interface BreadcrumbSeparatorProps extends TextProps {
  children?: React.ReactNode
}

type BreadcrumbEllipsisProps = ViewProps

const Breadcrumb = ({ children, separator, ...props }: BreadcrumbProps) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    }}
    {...props}
  >
    {React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          separator,
          isLast: index === React.Children.count(children) - 1,
        } as any)
      }
      return child
    })}
  </View>
)

const BreadcrumbList = ({ children, style, ...props }: BreadcrumbListProps) => (
  <View
    style={[
      {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
)

const BreadcrumbItem = ({ children, style, ...props }: BreadcrumbItemProps) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
)

const BreadcrumbLink = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, BreadcrumbLinkProps>(
  ({ children, onPress, style, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      style={[
        {
          paddingVertical: 4,
          paddingHorizontal: 2,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <Text
        style={{
          fontSize: 14,
          color: '#3b82f6',
          textDecorationLine: 'underline',
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
)

BreadcrumbLink.displayName = 'BreadcrumbLink'

const BreadcrumbPage = ({ children, style, ...props }: BreadcrumbPageProps) => (
  <Text
    style={[
      {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
        paddingVertical: 4,
        paddingHorizontal: 2,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </Text>
)

const BreadcrumbSeparator = ({ children, style, ...props }: BreadcrumbSeparatorProps) => (
  <Text
    style={[
      {
        fontSize: 14,
        color: '#6b7280',
        marginHorizontal: 4,
      },
      style,
    ]}
    {...props}
  >
    {children || '›'}
  </Text>
)

const BreadcrumbEllipsis = ({ style, ...props }: BreadcrumbEllipsisProps) => (
  <View
    style={[
      {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
      },
      style,
    ]}
    {...props}
  >
    <Text
      style={{
        fontSize: 14,
        color: '#6b7280',
      }}
    >
      ...
    </Text>
  </View>
)

export {
    Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem,
    BreadcrumbLink, BreadcrumbList, BreadcrumbPage,
    BreadcrumbSeparator
}
export type {
    BreadcrumbEllipsisProps, BreadcrumbItemProps,
    BreadcrumbLinkProps, BreadcrumbListProps, BreadcrumbPageProps, BreadcrumbProps, BreadcrumbSeparatorProps
}

