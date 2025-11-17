import EmptyState from "@components/ui/EmptyState";
import { EnhancedPagination } from "@components/ui/Pagination";
import { Select } from "@components/ui/Select";
import { useDebounce } from "@hooks/useDebounce";
import { useFlashcardDecks } from "@hooks/useFlashcard";
import { IFlashcardDeck } from "@models/flashcard/flashcard.common";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
    ChevronLeft,
    Loader2,
    Plus,
    Search,
    Sparkles,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const ITEMS_PER_PAGE_OPTIONS = [
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "50", value: "50" },
];

const formatDate = (date?: string | null) => {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const statusBadgeStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  ACTIVE: { bg: "#dcfce7", text: "#15803d", label: "Active" },
  INACTIVE: { bg: "#fee2e2", text: "#b91c1c", label: "Inactive" },
  ARCHIVED: { bg: "#e0e7ff", text: "#4338ca", label: "Archived" },
};

const FlashcardDeckListScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const queryParams = useMemo(
    () => ({
      currentPage,
      pageSize,
      search: debouncedSearch || undefined,
    }),
    [currentPage, pageSize, debouncedSearch]
  );

  const itemsPerPageSelectOptions = useMemo(
    () =>
      ITEMS_PER_PAGE_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    []
  );

  const { data, isLoading, isFetching, refetch } =
    useFlashcardDecks(queryParams);

  const decks: IFlashcardDeck[] = data?.data?.results ?? [];
  const pagination = data?.data?.pagination;
  const totalItems = pagination?.totalItem ?? 0;
  const totalPages = Math.max(pagination?.totalPage ?? 1, 1);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleViewDeck = (deck: IFlashcardDeck) => {
    router.push({
      pathname: "/(app)/(me)/flashcards/[deckId]",
      params: {
        deckId: deck.id.toString(),
        name: deck.name,
      },
    });
  };

  const handleChangePageSize = (value: string) => {
    const size = Number(value);
    setPageSize(size);
    setCurrentPage(1);
  };

  const renderDeckCard = (deck: IFlashcardDeck) => {
    const badge = statusBadgeStyles[deck.status] || statusBadgeStyles.ACTIVE;
    return (
      <TouchableOpacity
        key={deck.id}
        className="mb-4 rounded-3xl bg-white border border-slate-100 shadow-xs"
        activeOpacity={0.9}
        onPress={() => handleViewDeck(deck)}
        style={{ padding: 18 }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1 pr-4">
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
              {deck.name}
            </Text>
            <Text style={{ color: "#94a3b8", marginTop: 4, fontSize: 13 }}>
              ID #{deck.id} · {formatDate(deck.updatedAt || deck.createdAt)}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: badge.bg,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text
              style={{ color: badge.text, fontWeight: "600", fontSize: 12 }}
            >
              {t(
                `flashcard_list.status.${deck.status.toLowerCase()}`,
                badge.label
              )}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text style={{ fontSize: 32, fontWeight: "800", color: "#0369a1" }}>
              {deck.totalCards}
            </Text>
            <Text style={{ color: "#64748b", fontSize: 13 }}>
              {t("flashcard_list.cards_count", "cards")}
            </Text>
          </View>

          <View className="items-end">
            <Text style={{ color: "#94a3b8", fontSize: 12 }}>
              {t("flashcard_list.created_at", "Created")}
            </Text>
            <Text style={{ color: "#0f172a", fontWeight: "600" }}>
              {formatDate(deck.createdAt)}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mt-4">
          <TouchableOpacity
            className="flex-1 rounded-2xl bg-slate-100 py-3 items-center"
            onPress={() => handleViewDeck(deck)}
          >
            <Text style={{ color: "#0f172a", fontWeight: "600" }}>
              {t("flashcard_list.view_detail", "View detail")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-2xl bg-sky-500 py-3 items-center"
            onPress={() => handleViewDeck(deck)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {t("flashcard_list.review_now", "Review now")}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const insetBottom = Math.max(insets.bottom, 10);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View className="flex-1 bg-slate-50">
        <View className="px-4 py-3 flex-row items-center justify-between bg-white border-b border-slate-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full bg-slate-100"
          >
            <ChevronLeft size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
            {t("flashcard_list.title", "Flashcard decks")}
          </Text>
          <TouchableOpacity className="p-2 rounded-full bg-slate-100">
            <Plus size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insetBottom + 120,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <LinearGradient
            colors={["#cffafe", "#e0f2fe"]}
            className="rounded-3xl mb-5 overflow-hidden"
          >
            <View className="px-5 py-5 flex-row items-center justify-between">
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}
                >
                  {t("flashcard_list.hero_title", "Quản lý bộ flashcard")}
                </Text>
                <Text style={{ marginTop: 6, color: "#0f172a", opacity: 0.7 }}>
                  {t(
                    "flashcard_list.hero_subtitle",
                    "Xem nhanh tiến độ và mở bộ thẻ để ôn luyện."
                  )}
                </Text>
              </View>
              <View className="h-14 w-14 rounded-2xl bg-white/80 items-center justify-center">
                <Sparkles size={24} color="#0ea5e9" />
              </View>
            </View>
          </LinearGradient>

          <View className="bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-4 flex-row items-center">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder={t(
                "flashcard_list.search_placeholder",
                "Search flashcard decks..."
              )}
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              style={{
                flex: 1,
                marginHorizontal: 12,
                fontSize: 15,
                color: "#0f172a",
              }}
              returnKeyType="search"
            />
          </View>

          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#0ea5e9" />
            </View>
          ) : decks.length === 0 ? (
            <EmptyState
              title={t("flashcard_list.empty_title", "Chưa có bộ flashcard")}
              description={t(
                "flashcard_list.empty_description",
                "Tạo bộ flashcard đầu tiên để bắt đầu luyện tập."
              )}
            />
          ) : (
            <>
              {decks.map((deck) => renderDeckCard(deck))}
              {isFetching && (
                <View className="py-4 flex-row items-center justify-center gap-2">
                  <Loader2 size={18} color="#94a3b8" />
                  <Text style={{ color: "#64748b" }}>
                    {t("flashcard_list.loading_more", "Đang tải thêm...")}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#1d4ed8",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insetBottom - 16,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Select
            options={itemsPerPageSelectOptions}
            value={String(pageSize)}
            onValueChange={handleChangePageSize}
            style={{
              minWidth: 110,
              backgroundColor: "#fff",
              borderColor: "#fff",
            }}
          />
          <EnhancedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={setCurrentPage}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FlashcardDeckListScreen;
