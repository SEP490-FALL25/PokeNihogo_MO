import BackScreen from "@components/molecules/Back";
import { useDebounce } from "@hooks/useDebounce";
import {
  useDictionarySearch,
  useSearchHistory,
  useWordDetails,
} from "@hooks/useDictionary";
import {
  useAddWordToFlashcardDeck,
  useCreateFlashcardDeck,
  useFlashcardDecks,
} from "@hooks/useFlashcard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Clock, Lightbulb, Plus, Search, X } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Dictionary result interface
interface DictionaryResult {
  id: string;
  word: string;
  reading?: string;
  meaning: string;
  type?: string;
}

// Word Detail interfaces
interface WordMeaning {
  meaning?: string;
  exampleSentenceJp?: string;
  exampleSentence?: string;
}

interface RelatedWord {
  id: number | string;
  wordJp: string;
}

// Constants
const HOT_KEYWORDS = [
  "利用",
  "人",
  "偶然",
  "共有",
  "被害",
  "維持",
  "情報",
  "後",
  "ば",
  "が",
  "空",
  "を",
  "遠慮",
  "様子",
  "に",
];

const JLPT_LEVELS = ["N1", "N2", "N3", "N4", "N5"];

// Helper function to format date
const formatDate = (dateString: string, includeYear = false) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    ...(includeYear && { year: "numeric" }),
  });
};

export default function DictionaryScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [shouldAutoSelect, setShouldAutoSelect] = useState(false);
  const [searchBarY, setSearchBarY] = useState(0);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showCreateFlashcardModal, setShowCreateFlashcardModal] =
    useState(false);
  const [newFlashcardName, setNewFlashcardName] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const searchContainerRef = useRef<View>(null);

  // Flashcard hooks
  const { data: flashcardDecksData, isLoading: flashcardDecksLoading } =
    useFlashcardDecks({ currentPage: 1, pageSize: 100 });
  const createFlashcardDeckMutation = useCreateFlashcardDeck();
  const addWordToFlashcardDeckMutation = useAddWordToFlashcardDeck();

  const flashcardDecks = flashcardDecksData?.data?.results || [];

  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Get word details when a word is selected
  const { data: wordDetailData, isLoading: wordDetailLoading } =
    useWordDetails(selectedWordId);

  // Use API hook for real search
  const { data: apiData, isLoading: apiLoading } = useDictionarySearch(
    {
      query: debouncedQuery,
      currentPage: 1,
      pageSize: 10,
    },
    true
  );

  // Get search history from API
  const { data: searchHistoryData, refetch: refetchHistory } = useSearchHistory(
    {
      currentPage: 1,
      pageSize: 20,
    }
  );

  // Get search results from API - memoized to prevent unnecessary re-renders
  const searchResults = useMemo(
    () => apiData?.data?.results || [],
    [apiData?.data?.results]
  );

  // Memoize loading state
  const isLoading = apiLoading;

  // Get search history results - memoized to prevent unnecessary re-renders
  const searchHistory = useMemo(
    () => searchHistoryData?.data?.results || [],
    [searchHistoryData?.data?.results]
  );

  // Refetch history after successful search
  useEffect(() => {
    if (debouncedQuery.trim() && searchResults.length > 0) {
      refetchHistory();
    }
  }, [searchResults.length, debouncedQuery, refetchHistory]);

  // Auto-select first result when search query is set from history
  useEffect(() => {
    if (shouldAutoSelect && searchQuery.trim() && searchResults.length > 0) {
      const firstResult = searchResults[0];
      if (firstResult) {
        setSelectedWordId(firstResult.id);
        setShouldAutoSelect(false);
        setIsFocused(false);
        searchInputRef.current?.blur();
      }
    }
  }, [shouldAutoSelect, searchResults, searchQuery]);

  // Close modal and reset state
  const closeCreateFlashcardModal = useCallback(() => {
    setShowCreateFlashcardModal(false);
    setNewFlashcardName("");
  }, []);

  // Close flashcard modal
  const closeFlashcardModal = useCallback(() => {
    setShowFlashcardModal(false);
  }, []);

  // Handle search from keyword/history
  const handleSearch = useCallback(
    (keyword: string, autoSelect = false) => {
      setSearchQuery(keyword);
      setSelectedWordId(null);
      if (autoSelect) {
        setShouldAutoSelect(true);
      }
      setIsFocused(false);
      searchInputRef.current?.blur();
    },
    []
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSelectedWordId(null);
    setShouldAutoSelect(false);
  }, []);

  // Handle back from word detail
  const handleBackFromDetail = useCallback(() => {
    setSelectedWordId(null);
    setSearchQuery("");
    setShouldAutoSelect(false);
    setIsFocused(false);
    searchInputRef.current?.blur();
  }, []);

  // Handle add word to flashcard deck
  const handleAddToFlashcardDeck = useCallback(
    async (deckId: number | string) => {
      if (!selectedWordId) return;

      try {
        await addWordToFlashcardDeckMutation.mutateAsync({
          flashcardDeckId: typeof deckId === "string" ? Number(deckId) : deckId,
          vocabularyId: Number(selectedWordId),
        });
        closeFlashcardModal();
      } catch (error) {
        console.error("Error adding word to flashcard deck:", error);
      }
    },
    [selectedWordId, addWordToFlashcardDeckMutation, closeFlashcardModal]
  );

  // Handle create new flashcard deck
  const handleCreateFlashcardDeck = useCallback(async () => {
    if (!newFlashcardName.trim()) return;

    try {
      const response = await createFlashcardDeckMutation.mutateAsync({
        name: newFlashcardName.trim(),
      });

      // If flashcard deck was created successfully and there's a selected word, add word to it
      const newDeckId = response?.data?.id;
      if (newDeckId && selectedWordId) {
        try {
          await addWordToFlashcardDeckMutation.mutateAsync({
            flashcardDeckId: newDeckId,
            vocabularyId: Number(selectedWordId),
          });
        } catch (error) {
          console.error("Error adding word to new flashcard deck:", error);
        }
      }

      closeCreateFlashcardModal();
      closeFlashcardModal();
    } catch (error) {
      console.error("Error creating flashcard deck:", error);
    }
  }, [
    newFlashcardName,
    selectedWordId,
    createFlashcardDeckMutation,
    addWordToFlashcardDeckMutation,
    closeCreateFlashcardModal,
    closeFlashcardModal,
  ]);

  // Handle select word from result
  const handleSelectWord = useCallback((wordId: string) => {
    setSelectedWordId(wordId);
    setIsFocused(false);
    searchInputRef.current?.blur();
  }, []);

  // Handle open create flashcard modal
  const handleOpenCreateFlashcardModal = useCallback(() => {
    setShowFlashcardModal(false);
    setShowCreateFlashcardModal(true);
  }, []);

  // Handle stop propagation - reusable for dropdown and modals
  const handleStopPropagation = useCallback((e: any) => {
    e.stopPropagation();
  }, []);

  // Handle blur search input
  const handleBlurSearch = useCallback(() => {
    setTimeout(() => setIsFocused(false), 200);
  }, []);

  // Handle focus search input
  const handleFocusSearch = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Handle overlay press
  const handleOverlayPress = useCallback(() => {
    setIsFocused(false);
    searchInputRef.current?.blur();
  }, []);

  // Handle search container layout
  const handleSearchContainerLayout = useCallback(() => {
    searchContainerRef.current?.measure(
      (x, y, width, height, pageX, pageY) => {
        setSearchBarY(pageY + height + 8);
      }
    );
  }, []);

  // Render search result item (for dropdown)
  const renderResultItem = useCallback(
    (item: DictionaryResult) => (
      <TouchableOpacity
        key={item.id}
        className="py-3 px-4 border-b border-gray-50 active:bg-gray-50"
        onPress={() => handleSelectWord(item.id)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center mb-1">
          <Text className="text-lg font-bold text-gray-900 mr-2">
            {item.word}
          </Text>
          {item.reading && (
            <Text className="text-sm text-gray-500">「{item.reading}」</Text>
          )}
        </View>
        {item.meaning && (
          <Text className="text-sm text-gray-700 mt-1">{item.meaning}</Text>
        )}
      </TouchableOpacity>
    ),
    [handleSelectWord]
  );

  // Handle open flashcard modal
  const handleOpenFlashcardModal = useCallback(() => {
    setShowFlashcardModal(true);
  }, []);

  // Render home content (Tips, Hot Keywords, JLPT) - memoized
  const renderHomeContent = useMemo(
    () => (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Tips Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Lightbulb size={20} color="#fbbf24" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                Tips
              </Text>
            </View>
            <View className="pl-7">
              <Text className="text-sm text-gray-700 mb-2">
                • Đăng nhập tài khoản PokeNihongo để được đồng bộ dữ liệu và sử
                dụng trên nhiều thiết bị.
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                • PokeNihongo có thể chuyển thành te, ta, bị động... ở dạng nguyên
                thể, thử 食べた
              </Text>
              <Text className="text-sm text-gray-700">
                • Tra cứu katakana: viết hoa chữ đó, ví dụ: BETONAMU
              </Text>
            </View>
          </View>

          {/* Search History Section */}
          {searchHistory.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900">
                  {t("dictionary.recent_searches")}
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.historyScrollContainer}
              >
                {searchHistory.map((item: { id: number; searchKeyword: string; createdAt: string }) => (
                  <TouchableOpacity
                    key={item.id}
                    className="bg-gray-100 rounded-full px-4 py-2 mr-2"
                    onPress={() => handleSearch(item.searchKeyword, true)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base text-gray-900">
                      {item.searchKeyword}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Hot Keywords Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Từ khoá hot
              </Text>
            </View>
            <View className="flex-row flex-wrap">
            {HOT_KEYWORDS.map((keyword) => (
              <TouchableOpacity
                key={keyword}
                className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                onPress={() => handleSearch(keyword, true)}
                activeOpacity={0.7}
              >
                <Text className="text-base text-gray-900">{keyword}</Text>
              </TouchableOpacity>
            ))}
            </View>
          </View>

          {/* JLPT Section */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              JLPT
            </Text>
            <View className="flex-row flex-wrap">
            {JLPT_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                activeOpacity={0.7}
              >
                <Text className="text-base text-gray-900">{level}</Text>
              </TouchableOpacity>
            ))}
            </View>
          </View>

          {/* Empty State when no history */}
          {searchHistory.length === 0 && (
            <View className="items-center justify-center py-12">
              <Search size={64} color="#d1d5db" />
              <Text className="text-lg font-semibold text-gray-400 mt-4 text-center">
                {t("dictionary.start_searching")}
              </Text>
              <Text className="text-sm text-gray-400 mt-2 text-center">
                {t("dictionary.search_description")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    ),
    [searchHistory, handleSearch, t]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with gradient */}
      <LinearGradient colors={["#4A9FA2", "#5FA8AB"]} className="pb-4">
        <BackScreen
          onPress={() => router.back()}
          color="white"
          title={t("dictionary.title")}
        />

        {/* Search Bar */}
        <View
          className="px-4 mb-3"
          ref={searchContainerRef}
          onLayout={handleSearchContainerLayout}
        >
          <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm relative z-10">
            <Search size={20} color="#9ca3af" />
            <TextInput
              ref={searchInputRef}
              className="flex-1 mx-3 text-base text-gray-900"
              placeholder={t("dictionary.search_placeholder")}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleFocusSearch}
              onBlur={handleBlurSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Overlay to detect outside clicks */}
      {isFocused && (
          <Pressable
          style={styles.overlay}
          onPress={handleOverlayPress}
        />
      )}

      {/* Dropdown for search suggestions/history - absolute positioned overlay */}
      {isFocused && searchBarY > 0 && (
        <View
          style={[styles.dropdownWrapper, { top: searchBarY }]}
          className="absolute left-4 right-4"
        >
          <Pressable onPress={handleStopPropagation}>
            <View
              className="bg-white rounded-xl shadow-lg border border-gray-200"
              style={styles.dropdownContainer}
            >
              {searchQuery.trim() ? (
                <>
                  {isLoading ? (
                    <View className="py-8 items-center justify-center">
                      <ActivityIndicator size="small" color="#4A9FA2" />
                    </View>
                  ) : searchResults.length > 0 ? (
                    <ScrollView
                      style={styles.dropdownScrollView}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={true}
                    >
                      {searchResults.map(renderResultItem)}
                    </ScrollView>
                  ) : (
                    <View className="py-6 px-4">
                      <Text className="text-sm text-gray-400 text-center">
                        {t("dictionary.no_results")}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                searchHistory.length > 0 && (
                  <>
                    <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                      <Clock size={16} color="#9ca3af" />
                      <Text className="text-sm font-semibold text-gray-700 ml-2">
                        {t("dictionary.recent_searches")}
                      </Text>
                    </View>
                    <ScrollView
                      style={styles.dropdownScrollView}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled={true}
                    >
                      {searchHistory.map((item: { id: number; searchKeyword: string; createdAt: string }) => (
                        <TouchableOpacity
                          key={item.id}
                          className="flex-row items-center py-3 px-4 border-b border-gray-50 active:bg-gray-50"
                          onPress={() => handleSearch(item.searchKeyword, true)}
                          activeOpacity={0.7}
                        >
                          <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                            <Clock size={14} color="#3b82f6" />
                          </View>
                          <Text className="flex-1 text-base text-gray-900 font-medium">
                            {item.searchKeyword}
                          </Text>
                          <Text className="text-xs text-gray-400 ml-2">
                            {formatDate(item.createdAt)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )
              )}
            </View>
          </Pressable>
        </View>
      )}


      {/* Results - show when not focused or when there's content to show */}
      {!isFocused && (
        <View className="flex-1">
          {/* Show word detail if selected */}
          {selectedWordId && wordDetailData?.data ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-4 py-6">
                {/* Back button to clear selection */}
                <TouchableOpacity
                  className="flex-row items-center mb-4"
                  onPress={handleBackFromDetail}
                >
                  <X size={20} color="#374151" />
                  <Text className="text-base text-gray-700 ml-2">Quay lại</Text>
                </TouchableOpacity>

                {/* Word Header */}
                <View className="mb-6">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-4xl font-bold text-gray-900 mr-3">
                      {wordDetailData.data.wordJp}
                    </Text>
                    {wordDetailData.data.kanjiMeaning && (
                      <Text className="text-lg text-gray-500">
                        ({wordDetailData.data.kanjiMeaning})
                      </Text>
                    )}
                  </View>
                  {wordDetailData.data.reading && (
                    <Text className="text-xl text-gray-600 mb-2">
                      {wordDetailData.data.reading}
                    </Text>
                  )}
                  {wordDetailData.data.levelN && (
                    <View className="self-start bg-blue-100 rounded-full px-3 py-1 mt-2">
                      <Text className="text-sm font-semibold text-blue-700">
                        N{wordDetailData.data.levelN}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Add to Flashcard Button */}
                <TouchableOpacity
                  className="bg-blue-600 rounded-xl px-4 py-3 flex-row items-center justify-center mb-6"
                  onPress={handleOpenFlashcardModal}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold text-base mr-2">
                    Thêm vào sổ tay
                  </Text>
                  <Plus size={20} color="white" />
                </TouchableOpacity>

                {/* Meanings */}
                {wordDetailData.data.meanings &&
                  wordDetailData.data.meanings.length > 0 && (
                    <View className="mb-6">
                      <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Nghĩa
                      </Text>
                      {wordDetailData.data.meanings.map(
                        (meaning: WordMeaning, index: number) => (
                          <View
                            key={`meaning-${index}-${meaning.meaning?.slice(0, 20)}`}
                            className="mb-3 pb-3 border-b border-gray-100"
                          >
                            {meaning.meaning && (
                              <Text className="text-base text-gray-700 mb-2">
                                {meaning.meaning}
                              </Text>
                            )}
                            {meaning.exampleSentenceJp && (
                              <View className="mt-2">
                                <Text className="text-sm text-gray-500 mb-1">
                                  Ví dụ:
                                </Text>
                                <Text className="text-base text-gray-900 mb-1">
                                  {meaning.exampleSentenceJp}
                                </Text>
                                {meaning.exampleSentence && (
                                  <Text className="text-sm text-gray-600">
                                    {meaning.exampleSentence}
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                        )
                      )}
                    </View>
                  )}

                {/* Related Words */}
                {wordDetailData.data.relatedWords &&
                  wordDetailData.data.relatedWords.length > 0 && (
                    <View className="mb-6">
                      <Text className="text-lg font-semibold text-gray-900 mb-3">
                        Từ liên quan
                      </Text>
                      <View className="flex-row flex-wrap">
                        {wordDetailData.data.relatedWords.map(
                          (related: RelatedWord) => (
                            <TouchableOpacity
                              key={related.id}
                              className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                              onPress={() =>
                                handleSelectWord(related.id.toString())
                              }
                              activeOpacity={0.7}
                            >
                              <Text className="text-base text-gray-900">
                                {related.wordJp}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>
                  )}
              </View>
            </ScrollView>
          ) : wordDetailLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4A9FA2" />
            </View>
          ) : (
            renderHomeContent
          )}
        </View>
      )}

      {/* Flashcard Selection Modal */}
      <Modal
        visible={showFlashcardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFlashcardModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeFlashcardModal}
        >
          <Pressable
            style={styles.modalContent}
            onPress={handleStopPropagation}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                Thêm từ vào sổ tay
              </Text>
              <TouchableOpacity
                onPress={closeFlashcardModal}
                className="w-8 h-8 items-center justify-center"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Create New Flashcard Button */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-blue-50 rounded-xl px-4 py-3 mb-4 border border-blue-200"
              onPress={handleOpenCreateFlashcardModal}
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-2">
                <Plus size={18} color="white" />
              </View>
              <Text className="text-blue-600 font-semibold text-base">
                Tạo sổ tay mới
              </Text>
            </TouchableOpacity>

            {/* Flashcard Deck List */}
            {flashcardDecksLoading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" color="#4A9FA2" />
              </View>
            ) : flashcardDecks.length > 0 ? (
              <ScrollView
                style={styles.flashcardList}
                showsVerticalScrollIndicator={false}
              >
                {flashcardDecks.map((deck) => (
                  <TouchableOpacity
                    key={deck.id}
                    className="bg-white rounded-xl px-4 py-4 mb-3 border border-gray-200 shadow-sm"
                    onPress={() => handleAddToFlashcardDeck(deck.id)}
                    activeOpacity={0.7}
                    disabled={addWordToFlashcardDeckMutation.isPending}
                  >
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      {deck.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Ngày tạo: {formatDate(deck.createdAt, true)}
                    </Text>
                    {deck.totalCards !== undefined && (
                      <Text className="text-sm text-gray-400 mt-1">
                        {deck.totalCards} từ
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="py-8 items-center justify-center">
                <Text className="text-sm text-gray-400 text-center">
                  Bạn chưa có sổ tay nào. Tạo sổ tay mới để bắt đầu!
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Create Flashcard Modal */}
      <Modal
        visible={showCreateFlashcardModal}
        transparent
        animationType="fade"
        onRequestClose={closeCreateFlashcardModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeCreateFlashcardModal}
        >
          <Pressable
            style={styles.modalContent}
            onPress={handleStopPropagation}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                Tạo sổ tay mới
              </Text>
              <TouchableOpacity
                onPress={closeCreateFlashcardModal}
                className="w-8 h-8 items-center justify-center"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Tên sổ tay
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="Nhập tên sổ tay..."
                value={newFlashcardName}
                onChangeText={setNewFlashcardName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateFlashcardDeck}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 items-center justify-center"
                onPress={closeCreateFlashcardModal}
                activeOpacity={0.7}
              >
                <Text className="text-gray-700 font-semibold text-base">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-600 rounded-xl px-4 py-3 items-center justify-center"
                onPress={handleCreateFlashcardDeck}
                activeOpacity={0.8}
                disabled={
                  !newFlashcardName.trim() ||
                  createFlashcardDeckMutation.isPending
                }
              >
                {createFlashcardDeckMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Tạo
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 9, // For Android, slightly lower than dropdown
  },
  dropdownWrapper: {
    position: "absolute",
    zIndex: 1000,
    elevation: 10, // For Android
  },
  dropdownContainer: {
    maxHeight: 400,
  },
  dropdownScrollView: {
    maxHeight: 350,
  },
  historyScrollContainer: {
    paddingRight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  flashcardList: {
    maxHeight: 300,
  },
});
