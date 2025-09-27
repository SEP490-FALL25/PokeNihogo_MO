import React from 'react'
import { Text, TouchableOpacity, View, ViewProps } from 'react-native'

interface PaginationProps extends ViewProps {
  children: React.ReactNode
}

interface PaginationContentProps extends ViewProps {
  children: React.ReactNode
}

interface PaginationItemProps extends ViewProps {
  children: React.ReactNode
}

interface PaginationLinkProps extends ViewProps {
  isActive?: boolean
  children: React.ReactNode
  onPress?: () => void
}

interface PaginationPreviousProps extends ViewProps {
  onPress?: () => void
  disabled?: boolean
}

interface PaginationNextProps extends ViewProps {
  onPress?: () => void
  disabled?: boolean
}

interface PaginationEllipsisProps extends ViewProps {}

// Enhanced Pagination Component
interface EnhancedPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  showItemCount?: boolean
  maxVisiblePages?: number
}

const Pagination = ({ children, style, ...props }: PaginationProps) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
)

const PaginationContent = ({ children, style, ...props }: PaginationContentProps) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
)

const PaginationItem = ({ children, ...props }: PaginationItemProps) => (
  <View {...props}>
    {children}
  </View>
)

const PaginationLink = ({ isActive = false, children, onPress, style, ...props }: PaginationLinkProps) => (
  <TouchableOpacity
    style={[
      {
        height: 32,
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: isActive ? '#3b82f6' : 'transparent',
        borderWidth: isActive ? 0 : 1,
        borderColor: '#d1d5db',
      },
      style,
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    {...props}
  >
    <Text
      style={{
        fontSize: 14,
        fontWeight: '500',
        color: isActive ? '#ffffff' : '#6b7280',
      }}
    >
      {children}
    </Text>
  </TouchableOpacity>
)

const PaginationPrevious = ({ onPress, disabled = false, style, ...props }: PaginationPreviousProps) => (
  <TouchableOpacity
    style={[
      {
        height: 32,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#d1d5db',
        opacity: disabled ? 0.5 : 1,
      },
      style,
    ]}
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
    activeOpacity={0.8}
    {...props}
  >
    <Text
      style={{
        fontSize: 14,
        color: '#3b82f6',
      }}
    >
      ←
    </Text>
  </TouchableOpacity>
)

const PaginationNext = ({ onPress, disabled = false, style, ...props }: PaginationNextProps) => (
  <TouchableOpacity
    style={[
      {
        height: 32,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#d1d5db',
        opacity: disabled ? 0.5 : 1,
      },
      style,
    ]}
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
    activeOpacity={0.8}
    {...props}
  >
    <Text
      style={{
        fontSize: 14,
        color: '#3b82f6',
      }}
    >
      →
    </Text>
  </TouchableOpacity>
)

const PaginationEllipsis = ({ style, ...props }: PaginationEllipsisProps) => (
  <View
    style={[
      {
        height: 32,
        width: 32,
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

// Enhanced Pagination with integrated logic
const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemCount = true,
  maxVisiblePages = 5,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const renderPageNumbers = () => {
    const pages = []

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onPress={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      }
    } else {
      // Show first page
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onPress={() => onPageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      )

      // Show ellipsis if needed
      if (currentPage > 3) {
        pages.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i}
                onPress={() => onPageChange(i)}
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          )
        }
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        pages.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              isActive={currentPage === totalPages}
              onPress={() => onPageChange(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )
      }
    }

    return pages
  }

  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {showItemCount && (
        <Text
          style={{
            fontSize: 14,
            color: '#3b82f6',
          }}
        >
          {startItem}-{endItem} of {totalItems} items
        </Text>
      )}
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onPress={() => {
                if (currentPage > 1) {
                  onPageChange(currentPage - 1)
                }
              }}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {renderPageNumbers()}

          <PaginationItem>
            <PaginationNext
              onPress={() => {
                if (currentPage < totalPages) {
                  onPageChange(currentPage + 1)
                }
              }}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </View>
  )
}

export {
    EnhancedPagination, Pagination,
    PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious
}
export type {
    EnhancedPaginationProps, PaginationContentProps, PaginationEllipsisProps, PaginationItemProps,
    PaginationLinkProps, PaginationNextProps, PaginationPreviousProps, PaginationProps
}

