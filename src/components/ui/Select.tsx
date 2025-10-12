"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Animated, Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native"

interface SelectOption {
  label: string
  value: string
}

interface CustomSelectProps {
  options: SelectOption[]
  placeholder?: string
  onSelect?: (option: SelectOption) => void
  onValueChange?: (value: string) => void
  selectedValue?: string
  value?: string
  style?: any
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder = "Choose an option",
  onSelect,
  onValueChange,
  selectedValue,
  value,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  const currentValue = value || selectedValue;
  const selectedOption = options.find((option) => option.value === currentValue)

  const openModal = () => {
    setIsVisible(true)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false)
    })
  }

  const handleSelect = (option: SelectOption) => {
    onSelect?.(option)
    onValueChange?.(option.value)
    closeModal()
  }

  const renderOption = ({ item }: { item: SelectOption }) => (
    <Pressable
      style={[styles.option, currentValue === item.value && styles.selectedOption]}
      onPress={() => handleSelect(item)}
    >
      <Text style={[styles.optionText, currentValue === item.value && styles.selectedOptionText]}>{item.label}</Text>
    </Pressable>
  )

  return (
    <>
      <Pressable style={[styles.trigger, style]} onPress={openModal}>
        <Text style={[styles.triggerText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal visible={isVisible} transparent animationType="none" onRequestClose={closeModal}>
        <Pressable style={styles.overlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Pressable onPress={() => {}}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Select an option</Text>
                <Pressable onPress={closeModal} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>

              <FlatList
                data={options}
                renderItem={renderOption}
                keyExtractor={(item) => item.value}
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    minHeight: 48,
  },
  triggerText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  placeholderText: {
    color: "#9ca3af",
  },
  arrow: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: width * 0.85,
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "bold",
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  selectedOption: {
    backgroundColor: "#dbeafe",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedOptionText: {
    color: "#1d4ed8",
    fontWeight: "500",
  },
})

CustomSelect.displayName = 'Select';

export { CustomSelect as Select }
export default CustomSelect;
