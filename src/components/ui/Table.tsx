import React from 'react'
import { ScrollView, Text, View, ViewProps } from 'react-native'

interface TableProps extends ViewProps {
  children: React.ReactNode
}

interface TableHeaderProps extends ViewProps {
  children: React.ReactNode
}

interface TableBodyProps extends ViewProps {
  children: React.ReactNode
}

interface TableFooterProps extends ViewProps {
  children: React.ReactNode
}

interface TableRowProps extends ViewProps {
  children: React.ReactNode
}

interface TableHeadProps extends ViewProps {
  children: React.ReactNode
}

interface TableCellProps extends ViewProps {
  children: React.ReactNode
}

interface TableCaptionProps extends ViewProps {
  children: React.ReactNode
}

const Table = React.forwardRef<ScrollView, TableProps>(
  ({ children, style, ...props }, ref) => (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={true}
      style={[
        {
          width: '100%',
        },
        style,
      ]}
      {...props}
    >
      <View
        style={{
          minWidth: '100%',
        }}
      >
        {children}
      </View>
    </ScrollView>
  )
)

Table.displayName = 'Table'

const TableHeader = React.forwardRef<View, TableHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<View, TableBodyProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          // Remove border from last row
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<View, TableFooterProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#f9fafb',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<View, TableRowProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          backgroundColor: 'transparent',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
)

TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<View, TableHeadProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
          justifyContent: 'center',
          alignItems: 'flex-start',
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#6b7280',
        }}
      >
        {children}
      </Text>
    </View>
  )
)

TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<View, TableCellProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 12,
          justifyContent: 'center',
          alignItems: 'flex-start',
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={{
          fontSize: 14,
          color: '#111827',
        }}
      >
        {children}
      </Text>
    </View>
  )
)

TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<View, TableCaptionProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          marginTop: 16,
          paddingHorizontal: 16,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={{
          fontSize: 14,
          color: '#6b7280',
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
    </View>
  )
)

TableCaption.displayName = 'TableCaption'

export {
    Table, TableBody, TableCaption, TableCell, TableFooter,
    TableHead, TableHeader, TableRow
}
export type {
    TableBodyProps, TableCaptionProps, TableCellProps, TableFooterProps, TableHeaderProps, TableHeadProps, TableProps, TableRowProps
}

