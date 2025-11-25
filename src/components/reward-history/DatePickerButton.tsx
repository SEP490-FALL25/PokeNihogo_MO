import { Calendar } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { TFunction } from "i18next";
import { REWARD_HISTORY_COLORS } from "@constants/reward-history.constants";
import {
  formatRewardDateString,
  getRewardCalendarDays,
  REWARD_MONTH_NAMES,
  REWARD_WEEK_DAYS,
} from "@utils/reward-history.utils";

interface DatePickerButtonProps {
  value: string;
  onSelect: (date: string) => void;
  placeholder?: string;
  t?: TFunction;
}

export const DatePickerButton: React.FC<DatePickerButtonProps> = React.memo(({
  value,
  onSelect,
  placeholder = "Select date",
  t,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  // Sync selectedDate with value prop
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleConfirm = useCallback(() => {
    if (selectedDate) {
      onSelect(formatRewardDateString(selectedDate));
    }
    setShowPicker(false);
  }, [selectedDate, onSelect]);

  const handleClear = useCallback(() => {
    setSelectedDate(null);
    onSelect("");
    setShowPicker(false);
  }, [onSelect]);

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setSelectedDate((prev) => {
      const current = prev || new Date();
      const newDate = new Date(current);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const selectDay = useCallback((day: number) => {
    setSelectedDate((prev) => {
      const current = prev || new Date();
      return new Date(current.getFullYear(), current.getMonth(), day);
    });
  }, []);

  const calendarData = useMemo(() => {
    const currentDate = selectedDate || new Date();
    return getRewardCalendarDays(currentDate);
  }, [selectedDate]);

  const { days, year, month } = calendarData;

  const isSelected = useCallback(
    (day: number | null): boolean => {
      if (!day || !selectedDate) return false;
      const current = selectedDate;
      return (
        current.getDate() === day &&
        current.getMonth() === month &&
        current.getFullYear() === year
      );
    },
    [selectedDate, month, year]
  );

  const isToday = useCallback(
    (day: number | null): boolean => {
      if (!day) return false;
      const today = new Date();
      return (
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year
      );
    },
    [month, year]
  );

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
      >
        <Text
          className={`text-sm ${value ? "text-slate-800" : "text-slate-400"}`}
        >
          {value || placeholder}
        </Text>
        <Calendar size={18} color="#64748b" strokeWidth={2} />
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-4"
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-sm"
          >
            {/* Calendar Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Pressable
                onPress={() => navigateMonth("prev")}
                className="p-2"
              >
                <Text className="text-xl font-bold text-slate-600">‹</Text>
              </Pressable>
              <Text className="text-lg font-bold text-slate-800">
                {REWARD_MONTH_NAMES[month]} {year}
              </Text>
              <Pressable
                onPress={() => navigateMonth("next")}
                className="p-2"
              >
                <Text className="text-xl font-bold text-slate-600">›</Text>
              </Pressable>
            </View>

            {/* Week Days */}
            <View className="flex-row mb-2">
              {REWARD_WEEK_DAYS.map((day) => (
                <View key={day} className="flex-1 items-center py-2">
                  <Text className="text-xs font-bold text-slate-500">
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap mb-4">
              {days.map((day, index) => (
                <Pressable
                  key={index}
                  onPress={() => day && selectDay(day)}
                  className={`w-[14.28%] p-3 aspect-square items-center justify-center ${
                    isSelected(day)
                      ? "bg-green-500 rounded-xl"
                      : isToday(day)
                        ? "bg-green-100 rounded-xl"
                        : ""
                  }`}
                  style={
                    isSelected(day)
                      ? { backgroundColor: REWARD_HISTORY_COLORS.PRIMARY }
                      : undefined
                  }
                >
                  {day && (
                    <Text
                      className={`text-sm font-semibold ${
                        isSelected(day)
                          ? "text-white"
                          : isToday(day)
                            ? "text-green-600"
                            : "text-slate-700"
                      }`}
                    >
                      {day}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Actions */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleClear}
                className="flex-1 bg-slate-100 rounded-xl py-3 items-center"
              >
                <Text className="text-sm font-bold text-slate-600">
                  {t ? t("reward_history.filter.clear") : "Clear"}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                className="flex-1 bg-green-500 rounded-xl py-3 items-center"
                style={{ backgroundColor: REWARD_HISTORY_COLORS.PRIMARY }}
              >
                <Text className="text-sm font-bold text-white">
                  {t ? t("reward_history.filter.confirm") : "Confirm"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});

DatePickerButton.displayName = "DatePickerButton";

