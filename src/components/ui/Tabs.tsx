import React, { createContext, useContext, useState } from "react";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";

interface TabsContextType {
  currentValue: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps extends ViewProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps extends ViewProps {
  children: React.ReactNode;
}

interface TabsTriggerProps extends ViewProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps extends ViewProps {
  value: string;
  children: React.ReactNode;
}

const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "tab1");
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{ currentValue, onValueChange: handleValueChange }}
    >
      <View {...props}>{children}</View>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef<View, TabsListProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: "row",
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3f4f6",
          borderRadius: 6,
          padding: 4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
);

TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<any, TabsTriggerProps>(
  ({ value, children, style, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) {
      throw new Error("TabsTrigger must be used within a Tabs component");
    }

    const { currentValue, onValueChange } = context;
    const isActive = currentValue === value;

    return (
      <TouchableOpacity
        ref={ref}
        style={[
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 4,
            backgroundColor: isActive ? "#ffffff" : "transparent",
          },
          isActive && {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
          },
          style,
        ]}
        onPress={() => {
          onValueChange(value);
        }}
        activeOpacity={0.8}
        {...props}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: isActive ? "#111827" : "#6b7280",
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<View, TabsContentProps>(
  ({ value, children, style, ...props }, ref) => {
    const context = useContext(TabsContext);
    if (!context) {
      throw new Error("TabsContent must be used within a Tabs component");
    }

    const { currentValue } = context;

    if (currentValue !== value) {
      return null;
    }

    return (
      <View
        ref={ref}
        style={[
          {
            marginTop: 8,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
export type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps };

