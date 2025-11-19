import BackScreen from "@components/molecules/Back";
import { useToast } from "@components/ui/Toast";
import { HOT_KEYWORDS, JLPT_LEVELS } from "@constants/dictionary.constants";
import { FlashcardContentType } from "@constants/flashcard.enum";
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
import { DictionaryResult } from "@services/dictionary";
import { formatDateVN } from "@utils/date";
import { AxiosError } from "axios";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import {
  Clock,
  Lightbulb,
  Plus,
  Search,
  Volume2,
  X,
} from "lucide-react-native";
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
  Image,
  ImageBackground,
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
import {
  RelatedWord,
  SearchHistoryItem,
  WordMeaning,
} from "../../../types/dictionary.types";

export default function DictionaryScreen() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [shouldAutoSelect, setShouldAutoSelect] = useState(false);
  const [searchBarY, setSearchBarY] = useState(0);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showCreateFlashcardModal, setShowCreateFlashcardModal] =
    useState(false);
  const [newFlashcardName, setNewFlashcardName] = useState("");
  const [flashcardNotes, setFlashcardNotes] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const searchContainerRef = useRef<View>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);

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

  const hasAudioPronunciation = Boolean(wordDetailData?.data?.audioUrl);
  const isPronouncing = hasAudioPronunciation ? isAudioPlaying : isSpeaking;
  const formattedWordType = useMemo(
    () => wordDetailData?.data?.wordType?.replace(/_/g, " "),
    [wordDetailData?.data?.wordType]
  );

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
  }, [debouncedQuery, searchResults.length, refetchHistory]);

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
    setFlashcardNotes("");
  }, []);

  // Handle search from keyword/history
  const handleSearch = useCallback((keyword: string, autoSelect = false) => {
    setSearchQuery(keyword);
    setSelectedWordId(null);
    if (autoSelect) {
      setShouldAutoSelect(true);
    }
    setIsFocused(false);
    searchInputRef.current?.blur();
  }, []);

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
          deckId: typeof deckId === "string" ? Number(deckId) : deckId,
          id: Number(selectedWordId),
          contentType: FlashcardContentType.VOCABULARY,
          notes: flashcardNotes.trim() || undefined,
        });
        toast({
          variant: "Success",
          title: t("dictionary.add_word_success_title"),
          description: t("dictionary.add_word_success_description"),
        });
        closeFlashcardModal();
      } catch (error) {
        console.error("Error adding word to flashcard deck:", error);
        
        // Check if it's a 409 conflict error (content already exists)
        const axiosError = error as AxiosError<{ statusCode?: number; message?: string }>;
        const isConflictError = 
          axiosError?.response?.status === 409 ||
          axiosError?.response?.data?.statusCode === 409;
        
        if (isConflictError) {
          toast({
            variant: "destructive",
            title: t("dictionary.add_word_conflict_title"),
            description: t("dictionary.add_word_conflict_description"),
          });
        } else {
          toast({
            variant: "destructive",
            title: t("dictionary.add_word_error_title"),
            description: t("dictionary.add_word_error_description"),
          });
        }
      }
    },
    [selectedWordId, flashcardNotes, addWordToFlashcardDeckMutation, closeFlashcardModal, toast, t]
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
            deckId: newDeckId,
            id: Number(selectedWordId),
            contentType: FlashcardContentType.VOCABULARY,
            notes: flashcardNotes.trim() || undefined,
          });
          toast({
            variant: "Success",
            title: t("dictionary.add_word_success_title"),
            description: t("dictionary.add_word_success_description"),
          });
        } catch (error) {
          console.error("Error adding word to new flashcard deck:", error);
          
          // Check if it's a 409 conflict error (content already exists)
          const axiosError = error as AxiosError<{ statusCode?: number; message?: string }>;
          const isConflictError = 
            axiosError?.response?.status === 409 ||
            axiosError?.response?.data?.statusCode === 409;
          
          if (isConflictError) {
            toast({
              variant: "destructive",
              title: t("dictionary.add_word_conflict_title"),
              description: t("dictionary.add_word_conflict_description"),
            });
          } else {
            toast({
              variant: "destructive",
              title: t("dictionary.add_word_error_title"),
              description: t("dictionary.add_word_error_description"),
            });
          }
        }
      }

      toast({
        variant: "Success",
        title: t("dictionary.create_deck_success_title"),
        description: t("dictionary.create_deck_success_description"),
      });
      closeCreateFlashcardModal();
      closeFlashcardModal();
    } catch (error) {
      console.error("Error creating flashcard deck:", error);
      toast({
        variant: "destructive",
        title: t("dictionary.create_deck_error_title"),
        description: t("dictionary.create_deck_error_description"),
      });
    }
  }, [
    newFlashcardName,
    selectedWordId,
    flashcardNotes,
    createFlashcardDeckMutation,
    addWordToFlashcardDeckMutation,
    closeCreateFlashcardModal,
    closeFlashcardModal,
    toast,
    t,
  ]);

  // Handle select word from result
  const handleSelectWord = useCallback((wordId: string) => {
    setSelectedWordId(wordId);
    setIsFocused(false);
    searchInputRef.current?.blur();
  }, []);

  // Cleanup audio resource
  const cleanupAudio = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.stopAsync();
      } catch (error) {
        console.error("Error stopping audio playback:", error);
      }
      try {
        await audioRef.current.unloadAsync();
      } catch (error) {
        console.error("Error unloading audio resource:", error);
      }
      audioRef.current = null;
    }
    currentAudioUrlRef.current = null;
    setIsAudioPlaying(false);
  }, []);

  // Handle pronunciation playback (prefer BE audio, fallback to TTS)
  const handlePronounce = useCallback(async () => {
    const audioUrl = wordDetailData?.data?.audioUrl;

    if (audioUrl) {
      if (isAudioLoading) return;

      try {
        setIsAudioLoading(true);

        if (!audioRef.current || currentAudioUrlRef.current !== audioUrl) {
          await cleanupAudio();
          const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
          audioRef.current = sound;
          currentAudioUrlRef.current = audioUrl;

          audioRef.current.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) {
              setIsAudioPlaying(false);
              return;
            }

            setIsAudioPlaying(Boolean(status.isPlaying));

            if ("didJustFinish" in status && status.didJustFinish) {
              setIsAudioPlaying(false);
            }
          });
        } else if (isAudioPlaying) {
          await audioRef.current.pauseAsync();
          setIsAudioPlaying(false);
          setIsAudioLoading(false);
          return;
        }

        await audioRef.current.playFromPositionAsync(0);
      } catch (error) {
        console.error("Error playing audio:", error);
        toast({
          variant: "destructive",
          title: t("dictionary.audio_error_title", {
            defaultValue: "Không thể phát âm thanh",
          }),
          description: t("dictionary.audio_error_description", {
            defaultValue: "Vui lòng thử lại sau.",
          }),
        });
      } finally {
        setIsAudioLoading(false);
      }

      return;
    }

    if (!wordDetailData?.data) return;

    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      wordDetailData.data.reading || wordDetailData.data.wordJp;

    if (!textToSpeak) return;

    setIsSpeaking(true);
    Speech.speak(textToSpeak, {
      language: "ja-JP",
      pitch: 1.0,
      rate: 0.75,
      onDone: () => {
        setIsSpeaking(false);
      },
      onStopped: () => {
        setIsSpeaking(false);
      },
      onError: () => {
        setIsSpeaking(false);
      },
    });
  }, [
    cleanupAudio,
    isAudioLoading,
    isAudioPlaying,
    isSpeaking,
    toast,
    t,
    wordDetailData?.data,
  ]);

  // Stop pronunciation when word changes
  useEffect(() => {
    Speech.stop();
    setIsSpeaking(false);
    cleanupAudio();
  }, [selectedWordId, cleanupAudio]);

  // Cleanup pronunciation when component unmounts
  useEffect(() => {
    return () => {
      Speech.stop();
      cleanupAudio();
    };
  }, [cleanupAudio]);

  // Handle open create flashcard modal
  const handleOpenCreateFlashcardModal = useCallback(() => {
    setShowFlashcardModal(false);
    setShowCreateFlashcardModal(true);
  }, []);

  // Handle stop propagation - reusable for dropdown and modals
  const handleStopPropagation = useCallback((e: { stopPropagation: () => void }) => {
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
    searchContainerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setSearchBarY(pageY + height + 8);
    });
  }, []);

  // Render search result item (for dropdown) - memoized component
  const SearchResultItem = React.memo(({ item, onSelect }: { item: DictionaryResult; onSelect: (id: string) => void }) => (
    <TouchableOpacity
      className="py-3 px-4 border-b border-gray-50 active:bg-gray-50"
      onPress={() => onSelect(item.id)}
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
  ));
  SearchResultItem.displayName = "SearchResultItem";

  // Handle open flashcard modal
  const handleOpenFlashcardModal = useCallback(() => {
    setShowFlashcardModal(true);
  }, []);

  // Memoized home content component
  const DictionaryHomeContent = React.memo(({ 
    searchHistory, 
    onSearch 
  }: { 
    searchHistory: SearchHistoryItem[]; 
    onSearch: (keyword: string, autoSelect?: boolean) => void;
  }) => {
    const { t } = useTranslation();
    
    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Tips Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Lightbulb size={20} color="#fbbf24" />
              <Text className="text-lg font-semibold text-gray-900 ml-2">
                {t("dictionary.tips")}
              </Text>
            </View>
            <View className="pl-7">
              <Text className="text-sm text-gray-700 mb-2">
                {t("dictionary.tips_sync_account")}
              </Text>
              <Text className="text-sm text-gray-700 mb-2">
                {t("dictionary.tips_conjugation")}
              </Text>
              <Text className="text-sm text-gray-700">
                {t("dictionary.tips_katakana")}
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
                {searchHistory.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="bg-gray-100 rounded-full px-4 py-2 mr-2"
                    onPress={() => onSearch(item.searchKeyword, true)}
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
                {t("dictionary.hot_keywords")}
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              {HOT_KEYWORDS.map((keyword) => (
                <TouchableOpacity
                  key={keyword}
                  className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                  onPress={() => onSearch(keyword, true)}
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
    );
  });
  DictionaryHomeContent.displayName = "DictionaryHomeContent";

  return (
    <ImageBackground
      source={{
        uri: "https://res.cloudinary.com/duzumnf05/image/upload/v1762878756/background/images/file_nv77kp.png",
      }}
      style={styles.container}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Overlay để làm mờ ảnh nền */}
      <View style={styles.overlayBackground} />
      <SafeAreaView className="flex-1">
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
            <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-lg border border-gray-200/50 relative z-10">
              <Search size={20} color="#6b7280" />
              <TextInput
                ref={searchInputRef}
                className="flex-1 mx-3 text-base text-gray-900"
                placeholder={t("dictionary.search_placeholder")}
                placeholderTextColor="#9ca3af"
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
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

      {/* Overlay to detect outside clicks */}
      {isFocused && (
        <Pressable style={styles.overlay} onPress={handleOverlayPress} />
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
                  {apiLoading ? (
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
                      {searchResults.map((item) => (
                        <SearchResultItem
                          key={item.id}
                          item={item}
                          onSelect={handleSelectWord}
                        />
                      ))}
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
                      {searchHistory.map((item: SearchHistoryItem) => (
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
                            {formatDateVN(item.createdAt)}
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

      {/* Results - always show content */}
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
                  <Text className="text-base text-gray-700 ml-2">
                    {t("dictionary.back")}
                  </Text>
                </TouchableOpacity>

                {/* Word Header */}
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1 flex-row items-center flex-wrap">
                      <Text className="text-4xl font-bold text-gray-900 mr-3">
                        {wordDetailData.data.wordJp}
                      </Text>
                      {/* Pronunciation Button */}
                      <TouchableOpacity
                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-2"
                        onPress={handlePronounce}
                        activeOpacity={0.7}
                        disabled={isAudioLoading}
                      >
                        {isAudioLoading ? (
                          <ActivityIndicator size="small" color="#3b82f6" />
                        ) : (
                          <Volume2
                            size={20}
                            color={isPronouncing ? "#3b82f6" : "#6b7280"}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    {/* Add to Flashcard Icon Button */}
                    <TouchableOpacity
                      className="ml-3 w-10 h-10 bg-blue-600 rounded-full items-center justify-center"
                      onPress={handleOpenFlashcardModal}
                      activeOpacity={0.8}
                    >
                      <Plus size={22} color="white" />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center flex-wrap mb-2">
                    {wordDetailData.data.reading && (
                      <Text className="text-xl text-gray-600 mr-2">
                        {wordDetailData.data.reading}
                      </Text>
                    )}
                    {wordDetailData.data.kanjiMeaning && (
                      <Text className="text-lg text-gray-500">
                        ({wordDetailData.data.kanjiMeaning})
                      </Text>
                    )}
                  </View>
                  {(wordDetailData.data.levelN || formattedWordType) && (
                    <View className="flex-row flex-wrap items-center gap-2 mt-2">
                      {wordDetailData.data.levelN && (
                        <View className="bg-blue-100 rounded-full px-3 py-1">
                          <Text className="text-sm font-semibold text-blue-700">
                            N{wordDetailData.data.levelN}
                          </Text>
                        </View>
                      )}
                      {formattedWordType && (
                        <View className="bg-emerald-100 rounded-full px-3 py-1">
                          <Text className="text-sm font-semibold text-emerald-700">
                            {formattedWordType}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {wordDetailData.data.imageUrl && (
                    <Image
                      source={{ uri: wordDetailData.data.imageUrl }}
                      className="w-full h-48 rounded-3xl mt-4 mb-2 bg-gray-100"
                      resizeMode="cover"
                    />
                  )}
                </View>

                {/* Meanings */}
                {wordDetailData.data.meanings &&
                  wordDetailData.data.meanings.length > 0 && (
                    <View className="mb-6">
                      <Text className="text-2xl font-semibold text-gray-900 mb-4">
                        {t("dictionary.meanings")}
                      </Text>
                      {wordDetailData.data.meanings.map(
                        (meaning: WordMeaning, index: number) => (
                          <View
                            key={`meaning-${index}-${meaning.meaning || index}`}
                            className="mb-4 pb-4 border-b border-gray-100"
                          >
                            {meaning.wordType && (
                              <Text className="text-sm font-semibold text-blue-600 uppercase mb-2">
                                {meaning.wordType.replace(/_/g, " ")}
                              </Text>
                            )}
                            {meaning.meaning && (
                              <Text className="text-2xl text-gray-800 mb-4 leading-8">
                                {meaning.meaning}
                              </Text>
                            )}
                            {meaning.exampleSentenceJp && (
                              <View className="mt-3">
                                <Text className="text-lg text-gray-500 mb-3">
                                  {t("dictionary.example")}
                                </Text>
                                <Text className="text-2xl text-gray-900 mb-3 leading-9">
                                  {meaning.exampleSentenceJp}
                                </Text>
                                {meaning.exampleSentence && (
                                  <Text className="text-xl text-gray-600 leading-7">
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
                      <Text className="text-2xl font-semibold text-gray-900 mb-4">
                        {t("dictionary.related_words")}
                      </Text>
                      <View className="flex-row flex-wrap">
                        {wordDetailData.data.relatedWords.map(
                          (related: RelatedWord) => (
                            <TouchableOpacity
                              key={related.id}
                              className="bg-gray-100 rounded-full px-5 py-3 mr-2 mb-2"
                              onPress={() =>
                                handleSelectWord(related.id.toString())
                              }
                              activeOpacity={0.7}
                            >
                              <Text className="text-xl text-gray-900">
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
            <DictionaryHomeContent
              searchHistory={searchHistory}
              onSearch={handleSearch}
            />
          )}
        </View>

      {/* Flashcard Selection Modal */}
      <Modal
        visible={showFlashcardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFlashcardModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={closeFlashcardModal}>
          <Pressable
            style={styles.modalContent}
            onPress={handleStopPropagation}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">
                {t("dictionary.add_to_flashcard")}
              </Text>
              <TouchableOpacity
                onPress={closeFlashcardModal}
                className="w-8 h-8 items-center justify-center"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Notes Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {t("dictionary.notes_label")}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 min-h-[80px]"
                placeholder={t("dictionary.notes_placeholder")}
                value={flashcardNotes}
                onChangeText={setFlashcardNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
              />
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
                {t("dictionary.create_flashcard_deck")}
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
                      {t("dictionary.created_date")} {formatDateVN(deck.createdAt, true)}
                    </Text>
                    {deck.totalCards !== undefined && (
                      <Text className="text-sm text-gray-400 mt-1">
                        {deck.totalCards} {t("dictionary.words_count")}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="py-8 items-center justify-center">
                <Text className="text-sm text-gray-400 text-center">
                  {t("dictionary.no_flashcard_decks")} {t("dictionary.no_flashcard_decks_description")}
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
                {t("dictionary.create_new_flashcard_deck")}
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
                {t("dictionary.flashcard_name")}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder={t("dictionary.flashcard_name_placeholder")}
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
                  {t("dictionary.cancel")}
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
                    {t("dictionary.create")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.55)", // Làm mờ với màu trắng 55% opacity
  },
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
