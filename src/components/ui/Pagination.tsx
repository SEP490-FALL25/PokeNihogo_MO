import React from "react";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";

interface PaginationProps extends ViewProps {
  children: React.ReactNode;
}

interface PaginationContentProps extends ViewProps {
  children: React.ReactNode;
}

interface PaginationItemProps extends ViewProps {
  children: React.ReactNode;
}

interface PaginationLinkProps extends ViewProps {
  isActive?: boolean;
  children: React.ReactNode;
  onPress?: () => void;
}

interface PaginationPreviousProps extends ViewProps {
  onPress?: () => void;
  disabled?: boolean;
}

interface PaginationNextProps extends ViewProps {
  onPress?: () => void;
  disabled?: boolean;
}

type PaginationEllipsisProps = ViewProps;

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemCount?: boolean;
}

const Pagination = ({ children, style, ...props }: PaginationProps) => (
  <View
    style={[
      {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
);

const PaginationContent = ({ children, style, ...props }: PaginationContentProps) => (
  <View
    style={[
      {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      },
      style,
    ]}
    {...props}
  >
    {children}
  </View>
);

const PaginationItem = ({ children, ...props }: PaginationItemProps) => <View {...props}>{children}</View>;

const PaginationLink = ({ isActive = false, children, onPress, style, ...props }: PaginationLinkProps) => (
  <TouchableOpacity
    style={[
      {
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        backgroundColor: isActive ? "#3b82f6" : "transparent",
        borderWidth: isActive ? 0 : 1,
        borderColor: "#d1d5db",
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
        fontWeight: "500",
        color: isActive ? "#ffffff" : "#6b7280",
      }}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

const PaginationPrevious = ({ onPress, disabled = false, style, ...props }: PaginationPreviousProps) => (
  <TouchableOpacity
    style={[
      {
        height: 32,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#d1d5db",
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
        color: "#3b82f6",
      }}
    >
      ←
    </Text>
  </TouchableOpacity>
);

const PaginationNext = ({ onPress, disabled = false, style, ...props }: PaginationNextProps) => (
  <TouchableOpacity
    style={[
      {
        height: 32,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#d1d5db",
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
        color: "#3b82f6",
      }}
    >
      →
    </Text>
  </TouchableOpacity>
);

const PaginationEllipsis = ({ style, ...props }: PaginationEllipsisProps) => (
  <View
    style={[
      {
        height: 32,
        width: 32,
        alignItems: "center",
        justifyContent: "center",
      },
      style,
    ]}
    {...props}
  >
    <Text
      style={{
        fontSize: 14,
        color: "#6b7280",
      }}
    >
      ...
    </Text>
  </View>
);

const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemCount = false,
}) => {
  const safeTotalPages = Math.max(totalPages, 1);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const canPrev = currentPage > 1;
  const canNext = currentPage < safeTotalPages;

  return (
    <View style={{ alignItems: "center" }}>
      {showItemCount && (
        <Text
          style={{
            fontSize: 13,
            color: "#bfdbfe",
            marginBottom: 6,
          }}
        >
          {startItem}-{endItem} / {totalItems}
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity
          style={{
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            opacity: canPrev ? 1 : 0.4,
          }}
          onPress={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
        >
          <Text style={{ fontSize: 20, color: "#1d4ed8", fontWeight: "600" }}>‹</Text>
        </TouchableOpacity>

        <View
          style={{
            minWidth: 70,
            paddingHorizontal: 14,
            paddingVertical: 6,
            backgroundColor: "#fff",
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#1d4ed8",
              fontWeight: "700",
            }}
          >
            {currentPage}/{safeTotalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            height: 36,
            width: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            opacity: canNext ? 1 : 0.4,
          }}
          onPress={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
        >
          <Text style={{ fontSize: 20, color: "#1d4ed8", fontWeight: "600" }}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export {
  EnhancedPagination,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
};
export type {
  EnhancedPaginationProps,
  PaginationContentProps,
  PaginationEllipsisProps,
  PaginationItemProps,
  PaginationLinkProps,
  PaginationNextProps,
  PaginationPreviousProps,
  PaginationProps
};

