import EmptyState from "@components/ui/EmptyState";
import { EnhancedPagination } from "@components/ui/Pagination";
import { Select } from "@components/ui/Select";
import { useToast } from "@components/ui/Toast";
import { FlashcardContentType } from "@constants/flashcard.enum";
import { useDebounce } from "@hooks/useDebounce";
import {
    useFlashcardDeckCards,
    useRemoveWordFromFlashcardDeck,
    useUpdateFlashcardDeckCard,
} from "@hooks/useFlashcard";
import { IFlashcardDeckCard } from "@models/flashcard/flashcard.common";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
    Check,
    ChevronLeft,
    ChevronUp,
    Edit,
    Loader2,
    MoreVertical,
    Plus,
    Search,
    Shuffle,
    StickyNote,
    Trash2,
    Volume2,
    X,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Animated,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const FilterToggle = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    className={`flex-row items-center px-4 py-2 rounded-2xl border ${
      active ? "bg-sky-100 border-sky-400" : "bg-white border-slate-200"
    }`}
  >
    <View
      className={`h-5 w-5 rounded-md border mr-2 items-center justify-center ${
        active ? "bg-sky-500 border-sky-500" : "border-slate-300"
      }`}
    >
      {active && <Check size={14} color="#fff" />}
    </View>
    <Text
      style={{
        fontSize: 14,
        fontWeight: "600",
        color: active ? "#0c4a6e" : "#1f2937",
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const ITEMS_PER_PAGE_OPTIONS = [
  { label: "10", value: "10" },
  { label: "20", value: "20" },
  { label: "50", value: "50" },
];

const parseMeanings = (meanings?: unknown): string[] => {
  if (!meanings) return [];
  if (typeof meanings === "string") {
    return meanings
      .split(/[\n;,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (Array.isArray(meanings)) {
    return meanings
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item) {
          return (
            // @ts-ignore - handle loose typing from BE
            item.meaning ||
            // @ts-ignore
            item.text ||
            ""
          );
        }
        return "";
      })
      .filter(Boolean);
  }
  return [];
};

const formatDate = (date?: string | null) => {
  if (!date) return "";
  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return formatter.format(new Date(date));
  } catch {
    return date;
  }
};

const FlashcardDeckDetailScreen = () => {
  const { deckId, name } = useLocalSearchParams<{
    deckId?: string;
    name?: string;
  }>();
  const numericDeckId = deckId ? Number(deckId) : null;

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filters, setFilters] = useState({
    word: true,
    meaning: true,
    phonetic: true,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<IFlashcardDeckCard | null>(null);
  const [editFormData, setEditFormData] = useState({
    word: "",
    phonetic: "",
    mean: "",
    wordType: "",
  });
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});

  const debouncedSearch = useDebounce(searchKeyword, 400);
  const insets = useSafeAreaInsets();
  const insetBottom = Math.max(insets.bottom, 10);
  const { t } = useTranslation();
  const { toast } = useToast();

  const queryParams = useMemo(
    () => ({
      currentPage,
      pageSize,
      contentType: FlashcardContentType.VOCABULARY,
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

  const { data, isLoading, isFetching, refetch } = useFlashcardDeckCards(
    numericDeckId,
    queryParams
  );

  const updateCardMutation = useUpdateFlashcardDeckCard();
  const removeWordMutation = useRemoveWordFromFlashcardDeck();

  const cards: IFlashcardDeckCard[] = useMemo(
    () => data?.data?.results ?? [],
    [data]
  );
  const pagination = data?.data?.pagination;
  const totalItems = pagination?.totalItem ?? 0;
  const totalPages = Math.max(pagination?.totalPage ?? 1, 1);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId),
    [cards, selectedCardId]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleToggleFilter = (key: "word" | "meaning" | "phonetic") => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChangePageSize = (value: string) => {
    const size = Number(value);
    setPageSize(size);
    setCurrentPage(1);
  };

  const handlePlayAudio = useCallback(async (url?: string | null) => {
    if (!url) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn("Audio playback error", error);
    }
  }, []);

  const handleOpenNoteModal = (cardId: number, currentNote?: string | null) => {
    setSelectedCardId(cardId);
    setNoteValue(currentNote || "");
    setNoteModalVisible(true);
  };

  const handleSaveNote = () => {
    if (!numericDeckId || !selectedCardId) return;
    updateCardMutation.mutate(
      {
        deckId: numericDeckId,
        cardId: selectedCardId,
        data: {
          notes: noteValue.trim() ? noteValue.trim() : null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: t("flashcard_detail.note_update_success_title", "Đã lưu ghi chú"),
            description: t("flashcard_detail.note_update_success_desc", "Ghi chú đã được cập nhật."),
          });
          setNoteModalVisible(false);
        },
        onError: () => {
          toast({
            title: t("flashcard_detail.note_update_error_title", "Có lỗi xảy ra"),
            description: t("flashcard_detail.note_update_error_desc", "Vui lòng thử lại sau."),
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleOpenEditModal = (card: IFlashcardDeckCard) => {
    const vocabulary = card?.vocabulary;
    let meaningsText = "";
    
    // Handle meanings - could be translation key or actual array/string
    if (vocabulary?.meanings) {
      if (typeof vocabulary.meanings === "string" && vocabulary.meanings.startsWith("vocabulary.")) {
        // Try to translate, fallback to empty if translation key doesn't exist
        const translated = t(vocabulary.meanings, { defaultValue: "" });
        meaningsText = translated || "";
      } else {
        const meanings = parseMeanings(vocabulary.meanings);
        meaningsText = meanings.join("; ");
      }
    }
    
    setEditingCard(card);
    setEditFormData({
      word: vocabulary?.wordJp || "",
      phonetic: vocabulary?.reading || "",
      mean: meaningsText,
      wordType: vocabulary?.levelN ? `N${vocabulary.levelN}` : "",
    });
    setEditModalVisible(true);
    
    // Close swipeable
    if (swipeableRefs.current[card.id]) {
      swipeableRefs.current[card.id]?.close();
    }
  };

  const handleSaveEdit = () => {
    // TODO: Implement save edit functionality when API is ready
    toast({
      title: t("flashcard_detail.edit_saved_title", "Đã lưu"),
      description: t("flashcard_detail.edit_saved_desc", "Thông tin đã được cập nhật."),
    });
    setEditModalVisible(false);
    setEditingCard(null);
  };

  const handleDelete = (card: IFlashcardDeckCard) => {
    if (!numericDeckId || !card.vocabularyId) return;
    
    // Close swipeable
    if (swipeableRefs.current[card.id]) {
      swipeableRefs.current[card.id]?.close();
    }

    removeWordMutation.mutate(
      {
        deckId: numericDeckId,
        vocabularyId: card.vocabularyId,
      },
      {
        onSuccess: () => {
          toast({
            title: t("flashcard_detail.delete_success_title", "Đã xóa"),
            description: t("flashcard_detail.delete_success_desc", "Từ đã được xóa khỏi bộ thẻ."),
          });
        },
        onError: () => {
          toast({
            title: t("flashcard_detail.delete_error_title", "Có lỗi xảy ra"),
            description: t("flashcard_detail.delete_error_desc", "Vui lòng thử lại sau."),
            variant: "destructive",
          });
        },
      }
    );
  };

  const renderRightActions = (card: IFlashcardDeckCard, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <View 
        className="flex-row items-stretch" 
        style={{ 
          width: 160,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-red-500"
          onPress={() => handleDelete(card)}
          style={{ paddingHorizontal: 20 }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Trash2 size={24} color="#fff" />
          </Animated.View>
          <Text style={{ color: "#fff", fontSize: 12, marginTop: 4, fontWeight: "600" }}>
            {t("flashcard_detail.delete", "Delete")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center justify-center bg-green-500"
          onPress={() => handleOpenEditModal(card)}
          style={{ paddingHorizontal: 20 }}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Edit size={24} color="#fff" />
          </Animated.View>
          <Text style={{ color: "#fff", fontSize: 12, marginTop: 4, fontWeight: "600" }}>
            {t("flashcard_detail.edit", "Edit")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCardItem = (card: IFlashcardDeckCard, index: number) => {
    const vocabulary = card?.vocabulary;
    const meanings = parseMeanings(vocabulary?.meanings);
    return (
      <View className="mb-4" key={card.id}>
        <Swipeable
          ref={(ref) => {
            swipeableRefs.current[card.id] = ref;
          }}
          renderRightActions={(progress, dragX) => renderRightActions(card, dragX)}
          overshootRight={false}
        >
          <View
            className="rounded-2xl bg-white shadow-sm border border-slate-100"
            style={{
              padding: 16,
            }}
          >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 rounded-full bg-sky-100 items-center justify-center">
              <Text style={{ color: "#0284c7", fontWeight: "700" }}>
                {index + 1 + (currentPage - 1) * pageSize}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
                {vocabulary?.wordJp || t("flashcard_detail.unknown_word", "Chưa rõ")}
              </Text>
              {filters.phonetic && !!vocabulary?.reading && (
                <Text style={{ color: "#0ea5e9", marginTop: 2 }}>
                  {vocabulary?.reading}
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            {vocabulary?.audioUrl && (
              <TouchableOpacity
                onPress={() => handlePlayAudio(vocabulary?.audioUrl)}
                className="p-2 rounded-full bg-slate-100"
              >
                <Volume2 size={18} color="#0284c7" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100"
              onPress={() => handleOpenNoteModal(card.id, card.notes)}
            >
              <StickyNote size={16} color="#0ea5e9" />
              <Text style={{ fontSize: 13, color: "#0f172a", fontWeight: "600" }}>
                {t("flashcard_detail.note_button", "Note")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {filters.word && !!vocabulary?.wordJp && (
          <View className="mb-3">
            <Text style={{ fontSize: 32, fontWeight: "700", color: "#0369a1" }}>
              {vocabulary?.wordJp}
            </Text>
          </View>
        )}

        {filters.meaning && meanings.length > 0 && (
          <View className="mb-3">
            {meanings.map((meaning, idx) => (
              <Text
                key={`${card.id}-meaning-${idx}`}
                style={{
                  color: "#1f2937",
                  fontSize: 16,
                  marginBottom: idx === meanings.length - 1 ? 0 : 4,
                }}
              >
                {meaning}
              </Text>
            ))}
          </View>
        )}

        {card.notes && (
          <View className="mt-2 px-3 py-2 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <Text style={{ fontSize: 13, color: "#475569" }}>{card.notes}</Text>
          </View>
        )}

        <View className="mt-4 flex-row items-center justify-between">
          <Text style={{ fontSize: 12, color: "#94a3b8" }}>
            {formatDate(card.updatedAt || card.createdAt)}
          </Text>
          <Text style={{ fontSize: 12, color: "#0284c7" }}>
            #{card.id}
          </Text>
        </View>
          </View>
        </Swipeable>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View className="flex-1 bg-slate-50">
        <View className="px-4 py-3 flex-row items-center justify-between bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-slate-100">
          <ChevronLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-1 px-3">
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a" }}>
            {name || t("flashcard_detail.title", "Flashcard Deck")}
          </Text>
          <Text style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            VOCABULARY • {totalItems} {t("flashcard_detail.cards_label", "thẻ")}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="p-2 rounded-full bg-slate-100">
            <Search size={18} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 rounded-full bg-slate-100">
            <Plus size={18} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 rounded-full bg-slate-100">
            <MoreVertical size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insetBottom + 130 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="flex-row flex-wrap gap-3 mb-4">
          <FilterToggle
            label={t("flashcard_detail.filter_word", "Word")}
            active={filters.word}
            onPress={() => handleToggleFilter("word")}
          />
          <FilterToggle
            label={t("flashcard_detail.filter_mean", "Mean")}
            active={filters.meaning}
            onPress={() => handleToggleFilter("meaning")}
          />
          <FilterToggle
            label={t("flashcard_detail.filter_phonetic", "Phonetic")}
            active={filters.phonetic}
            onPress={() => handleToggleFilter("phonetic")}
          />
        </View>

        <View className="bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-4 flex-row items-center">
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder={t("flashcard_detail.search_placeholder", "Tìm kiếm từ vựng...")}
            placeholderTextColor="#94a3b8"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            style={{ flex: 1, marginHorizontal: 12, fontSize: 15, color: "#0f172a" }}
            returnKeyType="search"
          />
          <TouchableOpacity className="p-1.5 rounded-full bg-slate-100">
            <Shuffle size={16} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mb-6 rounded-3xl overflow-hidden"
          activeOpacity={0.9}
          onPress={() => {
            // TODO: wire up practice flow for flashcard decks
          }}
        >
          <LinearGradient colors={["#0ea5e9", "#2563eb"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View className="flex-row items-center justify-between px-5 py-4">
              <View>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {t("flashcard_detail.practice_title", "Practice")}
                </Text>
                <Text style={{ color: "#e0f2fe", fontSize: 13, marginTop: 2 }}>
                  {t("flashcard_detail.practice_subtitle", "Xem lại bộ thẻ này ngay")}
                </Text>
              </View>
              <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center">
                <ChevronUp size={20} color="#fff" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
          </View>
        ) : cards.length === 0 ? (
          <EmptyState
            title={t("flashcard_detail.empty_title", "Chưa có thẻ nào")}
            description={t(
              "flashcard_detail.empty_description",
              "Thử thay đổi bộ lọc hoặc thêm từ mới vào bộ thẻ này."
            )}
          />
        ) : (
          <View>
            {cards.map((card, index) => renderCardItem(card, index))}
            {isFetching && (
              <View className="py-4 flex-row items-center justify-center gap-2">
                <Loader2 size={18} color="#94a3b8" />
                <Text style={{ color: "#64748b" }}>
                  {t("flashcard_detail.loading_more", "Đang cập nhật...")}
                </Text>
              </View>
            )}
          </View>
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
        visible={noteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-md rounded-3xl bg-white p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
                {t("flashcard_detail.note_modal_title", "Ghi chú")}
              </Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: "#475569", marginBottom: 12 }}>
              {selectedCard?.vocabulary?.wordJp}
            </Text>
            <View className="border border-slate-200 rounded-2xl bg-slate-50">
              <TextInput
                multiline
                value={noteValue}
                onChangeText={setNoteValue}
                placeholder={t("flashcard_detail.note_modal_placeholder", "Thêm ghi chú tại đây...")}
                placeholderTextColor="#94a3b8"
                style={{ minHeight: 120, padding: 16, fontSize: 15, color: "#0f172a" }}
              />
            </View>
            <View className="flex-row justify-end gap-3 mt-6">
              <TouchableOpacity
                className="px-4 py-3 rounded-2xl bg-slate-100"
                onPress={() => setNoteModalVisible(false)}
                disabled={updateCardMutation.isPending}
              >
                <Text style={{ color: "#475569", fontWeight: "600" }}>
                  {t("flashcard_detail.note_modal_cancel", "Hủy")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-5 py-3 rounded-2xl bg-sky-500"
                onPress={handleSaveNote}
                disabled={updateCardMutation.isPending}
              >
                {updateCardMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {t("flashcard_detail.note_modal_save", "Lưu")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="w-full max-w-md rounded-3xl bg-white p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a" }}>
                {t("flashcard_detail.edit_word_title", "Edit word")}: &quot;{editingCard?.vocabulary?.wordJp || ""}&quot;
              </Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1f2937", marginBottom: 8 }}>
                {t("flashcard_detail.edit_word_field", "Word")}
              </Text>
              <View className="border border-slate-200 rounded-2xl bg-white">
                <TextInput
                  value={editFormData.word}
                  onChangeText={(text) => setEditFormData((prev) => ({ ...prev, word: text }))}
                  placeholder={t("flashcard_detail.edit_word_placeholder", "Nhập từ")}
                  placeholderTextColor="#94a3b8"
                  style={{ padding: 16, fontSize: 15, color: "#0f172a" }}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1f2937", marginBottom: 8 }}>
                {t("flashcard_detail.edit_phonetic_field", "Phonetic")}
              </Text>
              <View className="border border-slate-200 rounded-2xl bg-white">
                <TextInput
                  value={editFormData.phonetic}
                  onChangeText={(text) => setEditFormData((prev) => ({ ...prev, phonetic: text }))}
                  placeholder={t("flashcard_detail.edit_phonetic_placeholder", "Nhập phiên âm")}
                  placeholderTextColor="#94a3b8"
                  style={{ padding: 16, fontSize: 15, color: "#0f172a" }}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1f2937", marginBottom: 8 }}>
                {t("flashcard_detail.edit_mean_field", "Mean")}
              </Text>
              <View className="border border-slate-200 rounded-2xl bg-white">
                <TextInput
                  value={editFormData.mean}
                  onChangeText={(text) => setEditFormData((prev) => ({ ...prev, mean: text }))}
                  placeholder={t("flashcard_detail.edit_mean_placeholder", "Nhập nghĩa")}
                  placeholderTextColor="#94a3b8"
                  multiline
                  style={{ minHeight: 80, padding: 16, fontSize: 15, color: "#0f172a", textAlignVertical: "top" }}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#1f2937", marginBottom: 8 }}>
                {t("flashcard_detail.edit_word_type_field", "Word")}
              </Text>
              <Select
                options={[
                  { label: t("flashcard_detail.word_type_n5", "N5"), value: "N5" },
                  { label: t("flashcard_detail.word_type_n4", "N4"), value: "N4" },
                  { label: t("flashcard_detail.word_type_n3", "N3"), value: "N3" },
                  { label: t("flashcard_detail.word_type_n2", "N2"), value: "N2" },
                  { label: t("flashcard_detail.word_type_n1", "N1"), value: "N1" },
                ]}
                value={editFormData.wordType}
                onValueChange={(value) => setEditFormData((prev) => ({ ...prev, wordType: value }))}
                placeholder={t("flashcard_detail.word_type_placeholder", "Chọn loại từ")}
                style={{
                  backgroundColor: "#fff",
                  borderColor: "#cbd5e1",
                }}
              />
            </View>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                className="px-4 py-3 rounded-2xl bg-slate-100"
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={{ color: "#475569", fontWeight: "600" }}>
                  {t("flashcard_detail.edit_cancel", "Cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-5 py-3 rounded-2xl bg-sky-500"
                onPress={handleSaveEdit}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {t("flashcard_detail.edit_done", "Done")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FlashcardDeckDetailScreen;

