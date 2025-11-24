import { Select } from "@components/ui/Select";
import { RewardSourceType } from "@constants/reward.enum";
import { REWARD_HISTORY_COLORS } from "@constants/reward-history.constants";
import { Filter, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { TFunction } from "react-i18next";
import { DatePickerButton } from "./DatePickerButton";

interface FilterSectionProps {
  sourceType: RewardSourceType | undefined;
  dateFrom: string;
  dateTo: string;
  onSourceTypeChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearFilters: () => void;
  t: TFunction;
}

export const FilterSection: React.FC<FilterSectionProps> = React.memo(({
  sourceType,
  dateFrom,
  dateTo,
  onSourceTypeChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  t,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = useMemo(
    () => !!(sourceType || dateFrom || dateTo),
    [sourceType, dateFrom, dateTo]
  );

  const activeFilterCount = useMemo(
    () => [sourceType, dateFrom, dateTo].filter(Boolean).length,
    [sourceType, dateFrom, dateTo]
  );

  const sourceTypeOptions = useMemo(
    () => [
      { label: t("reward_history.filter.all"), value: "" },
      {
        label: t("reward_history.source.exercise"),
        value: RewardSourceType.EXERCISE,
      },
      {
        label: t("reward_history.source.lesson"),
        value: RewardSourceType.LESSON,
      },
      {
        label: t("reward_history.source.daily_login"),
        value: RewardSourceType.DAILY_REQUEST,
      },
      {
        label: t("reward_history.source.achievement"),
        value: RewardSourceType.ACHIEVEMENT_REWARD,
      },
      {
        label: t("reward_history.source.attendance"),
        value: RewardSourceType.ATTENDANCE,
      },
      {
        label: t("reward_history.source.season_reward"),
        value: RewardSourceType.SEASON_REWARD,
      },
      { label: t("reward_history.source.other"), value: RewardSourceType.OTHER },
    ],
    [t]
  );

  const handleClearClick = (e: any) => {
    e.stopPropagation();
    onClearFilters();
  };

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setShowFilters(!showFilters)}
        className="bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm"
      >
        <View className="flex-row items-center">
          <Filter
            size={20}
            color={REWARD_HISTORY_COLORS.PRIMARY}
            strokeWidth={2.5}
          />
          <Text className="ml-2 text-base font-bold text-slate-800">
            {t("reward_history.filter.title")}
          </Text>
          {hasActiveFilters && (
            <View
              className="ml-2 bg-green-500 rounded-full px-2 py-0.5"
              style={{ backgroundColor: REWARD_HISTORY_COLORS.PRIMARY }}
            >
              <Text className="text-xs font-bold text-white">
                {activeFilterCount}
              </Text>
            </View>
          )}
        </View>
        {hasActiveFilters && (
          <Pressable onPress={handleClearClick} className="ml-2">
            <X
              size={18}
              color={REWARD_HISTORY_COLORS.ERROR}
              strokeWidth={2.5}
            />
          </Pressable>
        )}
      </Pressable>

      {showFilters && (
        <View className="mt-2 bg-white rounded-2xl p-4 shadow-sm">
          {/* Source Type Filter */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-600 mb-2">
              {t("reward_history.filter.source_type")}
            </Text>
            <Select
              options={sourceTypeOptions}
              selectedValue={sourceType || ""}
              onValueChange={onSourceTypeChange}
              placeholder={t("reward_history.filter.select_source_type")}
            />
          </View>

          {/* Date Range Filter */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-slate-600 mb-2">
              {t("reward_history.filter.date_range")}
            </Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-slate-500 mb-1">
                  {t("reward_history.filter.date_from")}
                </Text>
                <DatePickerButton
                  value={dateFrom}
                  onSelect={onDateFromChange}
                  placeholder={t("reward_history.filter.select_date")}
                  t={t}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-slate-500 mb-1">
                  {t("reward_history.filter.date_to")}
                </Text>
                <DatePickerButton
                  value={dateTo}
                  onSelect={onDateToChange}
                  placeholder={t("reward_history.filter.select_date")}
                  t={t}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

FilterSection.displayName = "FilterSection";

