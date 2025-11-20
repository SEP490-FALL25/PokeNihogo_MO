import EmptyState from "@components/ui/EmptyState";
import { EnhancedPagination } from "@components/ui/Pagination";
import { Select } from "@components/ui/Select";
import { useToast } from "@components/ui/Toast";
import { useDebounce } from "@hooks/useDebounce";
import {
  useCreateFlashcardDeck,
  useFlashcardDecks,
} from "@hooks/useFlashcard";
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
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ITEMS_PER_PAGE_OPTIONS = [
  { labelKey: "flashcard_list.pagination.10", fallback: "10", value: "10" },
  { labelKey: "flashcard_list.pagination.20", fallback: "20", value: "20" },
  { labelKey: "flashcard_list.pagination.50", fallback: "50", value: "50" },
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
  { bg: string; text: string; labelKey: string; fallback: string }
> = {
  ACTIVE: {
    bg: "#dcfce7",
    text: "#15803d",
    labelKey: "flashcard_list.status.active",
    fallback: "Active",
  },
  INACTIVE: {
    bg: "#fee2e2",
    text: "#b91c1c",
    labelKey: "flashcard_list.status.inactive",
    fallback: "Inactive",
  },
  ARCHIVED: {
    bg: "#e0e7ff",
    text: "#4338ca",
    labelKey: "flashcard_list.status.archived",
    fallback: "Archived",
  },
};

const FlashcardDeckListScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [createDeckError, setCreateDeckError] = useState<string | null>(null);
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
        label: t(option.labelKey, option.fallback),
        value: option.value,
      })),
    [t]
  );

  const { data, isLoading, isFetching, refetch } =
    useFlashcardDecks(queryParams);
  const createDeckMutation = useCreateFlashcardDeck();

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
              {t(badge.labelKey, badge.fallback)}
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
            className="flex-1 rounded-2xl bg-sky-500 py-3 items-center"
            onPress={() => handleViewDeck(deck)}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {t("flashcard_list.view_detail", "View detail")}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            className="flex-1 rounded-2xl bg-sky-500 py-3 items-center"
            onPress={() => handleViewDeck(deck)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {t("flashcard_list.review_now", "Review now")}
            </Text>
          </TouchableOpacity> */}
        </View>
      </TouchableOpacity>
    );
  };

  const insetBottom = Math.max(insets.bottom, 10);

  const handleOpenCreateModal = () => {
    setCreateDeckError(null);
    setNewDeckName("");
    setIsCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    if (createDeckMutation.isPending) return;
    setIsCreateModalVisible(false);
  };

  const handleCreateDeck = () => {
    const trimmedName = newDeckName.trim();
    if (!trimmedName) {
      setCreateDeckError(
        t("flashcard_list.create_error_required", "Tên bộ flashcard không được để trống")
      );
      return;
    }

    setCreateDeckError(null);
    createDeckMutation.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          toast({
            title: t("flashcard_list.create_success_title", "Tạo bộ flashcard thành công"),
            description: t(
              "flashcard_list.create_success_desc",
              "Bạn có thể thêm từ mới ngay bây giờ."
            ),
          });
          setIsCreateModalVisible(false);
          setNewDeckName("");
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            t("flashcard_list.create_error_desc", "Không thể tạo bộ flashcard. Vui lòng thử lại.");
          toast({
            title: t("flashcard_list.create_error_title", "Tạo bộ flashcard thất bại"),
            description: message,
            variant: "destructive",
          });
        },
      }
    );
  };

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
          <TouchableOpacity
            className="p-2 rounded-full bg-slate-100"
            onPress={handleOpenCreateModal}
            disabled={createDeckMutation.isPending}
          >
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

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseCreateModal}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <TouchableWithoutFeedback onPress={handleCloseCreateModal}>
            <View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            />
          </TouchableWithoutFeedback>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 24,
              gap: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
              {t("flashcard_list.create_modal_title", "Tạo bộ flashcard mới")}
            </Text>
            <TextInput
              placeholder={t(
                "flashcard_list.create_modal_placeholder",
                "Nhập tên bộ flashcard"
              )}
              placeholderTextColor="#94a3b8"
              value={newDeckName}
              onChangeText={setNewDeckName}
              style={{
                borderWidth: 1,
                borderColor: createDeckError ? "#f87171" : "#e2e8f0",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: "#0f172a",
              }}
              editable={!createDeckMutation.isPending}
              autoFocus
            />
            {createDeckError ? (
              <Text style={{ color: "#dc2626", fontSize: 13 }}>
                {createDeckError}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <TouchableOpacity
                onPress={handleCloseCreateModal}
                disabled={createDeckMutation.isPending}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              >
                <Text style={{ color: "#64748b", fontWeight: "600" }}>
                  {t("common.cancel", "Hủy")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateDeck}
                disabled={createDeckMutation.isPending}
                style={{
                  backgroundColor: "#0ea5e9",
                  borderRadius: 16,
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  opacity: createDeckMutation.isPending ? 0.7 : 1,
                }}
              >
                {createDeckMutation.isPending && (
                  <ActivityIndicator size="small" color="#fff" />
                )}
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {t("flashcard_list.create_modal_submit", "Tạo mới")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FlashcardDeckListScreen;
