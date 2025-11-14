import BackScreen from '@components/molecules/Back';
import { useDebounce } from '@hooks/useDebounce';
import { useDictionarySearch, useSearchHistory, useWordDetails } from '@hooks/useDictionary';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  BookOpen,
  Clock,
  Lightbulb,
  Search,
  X
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dictionary result interface
interface DictionaryResult {
  id: string;
  word: string;
  reading?: string;
  romaji?: string;
  meaning: string;
  type?: string;
}

// Search history item from API
interface SearchHistoryItem {
  id: number;
  searchKeyword: string;
  createdAt: string;
}

export default function DictionaryScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'ja' | 'en'>('en');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [showWordDetail, setShowWordDetail] = useState(false);
  const [shouldAutoSelect, setShouldAutoSelect] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Get word details when a word is selected
  const { data: wordDetailData, isLoading: wordDetailLoading } = useWordDetails(selectedWordId);

  // Use API hook for real search
  const { data: apiData, isLoading: apiLoading } = useDictionarySearch(
    {
      query: debouncedQuery,
      currentPage,
      pageSize: 10,
    },
    true // Always use API
  );

  // Get search history from API
  const { data: searchHistoryData, refetch: refetchHistory } = useSearchHistory({
    currentPage: 1,
    pageSize: 20, // Get more history items for display
  });

  // Get search results from API
  const searchResults = useMemo(() => apiData?.data?.results || [], [apiData?.data?.results]);
  const isLoading = apiLoading;

  // Get search history results
  const searchHistory: SearchHistoryItem[] = searchHistoryData?.data?.results || [];

  // Refetch history after successful search
  useEffect(() => {
    if (debouncedQuery.trim() && searchResults.length > 0) {
      // Refetch history to get updated list from server
      setTimeout(() => {
        refetchHistory();
      }, 500);
    }
  }, [searchResults.length, debouncedQuery, refetchHistory]);

  // Auto-select first result when search query is set from history
  useEffect(() => {
    if (shouldAutoSelect && searchQuery.trim() && searchResults.length > 0) {
      // Auto-select first result when search completes
      const firstResult = searchResults[0];
      if (firstResult) {
        setSelectedWordId(firstResult.id);
        setShouldAutoSelect(false);
        setIsFocused(false);
        searchInputRef.current?.blur();
      }
    }
  }, [shouldAutoSelect, searchResults, searchQuery]);

  const renderSearchResult = ({ item }: { item: DictionaryResult }) => (
    <TouchableOpacity
      className="py-4 px-4 border-b border-gray-100"
      activeOpacity={0.7}
      onPress={() => {
        setSelectedWordId(item.id);
        setShowWordDetail(true);
        setIsFocused(false);
        searchInputRef.current?.blur();
      }}
    >
      <View className="flex-row items-center mb-1">
        <Text className="text-2xl font-bold text-gray-900 mr-2">{item.word}</Text>
        {item.reading && (
          <Text className="text-base text-gray-500">「{item.reading}」</Text>
        )}
      </View>
      {item.meaning && (
        <Text className="text-base text-gray-700 mt-1">{item.meaning}</Text>
      )}
      {item.type && (
        <Text className="text-xs text-gray-400 mt-1">({item.type})</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#4A9FA2', '#5FA8AB']}
        className="pb-4"
      >
        <BackScreen
          onPress={() => router.back()}
          color="white"
          title={t('dictionary.title')}
        />

        {/* Search Bar */}
        <View className="px-4 mb-3">
          <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm relative z-10">
            <Search size={20} color="#9ca3af" />
            <TextInput
              ref={searchInputRef}
              className="flex-1 mx-3 text-base text-gray-900"
              placeholder={t('dictionary.search_placeholder')}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                // Reset to page 1 when search query changes
                setCurrentPage(1);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // Delay to allow dropdown item press
                setTimeout(() => setIsFocused(false), 200);
              }}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                <X size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
            
            {/* Language Toggle */}
            <View className="flex-row ml-2 bg-gray-100 rounded-full p-1">
              <TouchableOpacity
                className={`px-3 py-1.5 rounded-full ${language === 'ja' ? 'bg-white' : ''}`}
                onPress={() => setLanguage('ja')}
              >
                <Text className={`text-sm font-semibold ${language === 'ja' ? 'text-blue-600' : 'text-gray-500'}`}>
                  ja
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-3 py-1.5 rounded-full ${language === 'en' ? 'bg-white' : ''}`}
                onPress={() => setLanguage('en')}
              >
                <Text className={`text-sm font-semibold ${language === 'en' ? 'text-blue-600' : 'text-gray-500'}`}>
                  en
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Overlay to detect outside clicks */}
      {isFocused && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setIsFocused(false);
            searchInputRef.current?.blur();
          }}
        />
      )}

      {/* Dropdown for search suggestions/history - positioned right after gradient */}
      {isFocused && (
        <View 
          style={styles.dropdownWrapper}
          className="px-4 -mt-6"
        >
          <Pressable
            onPress={(e) => {
              // Prevent overlay from triggering when clicking inside dropdown
              e.stopPropagation();
            }}
          >
            <View 
              className="bg-white rounded-xl shadow-lg border border-gray-200"
              style={styles.dropdownContainer}
            >
          {searchQuery.trim() ? (
            // Show search suggestions when typing
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
                  {searchResults.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="py-3 px-4 border-b border-gray-50 active:bg-gray-50"
                      onPress={() => {
                        setSelectedWordId(item.id);
                        setIsFocused(false);
                        searchInputRef.current?.blur();
                      }}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center mb-1">
                        <Text className="text-lg font-bold text-gray-900 mr-2">{item.word}</Text>
                        {item.reading && (
                          <Text className="text-sm text-gray-500">「{item.reading}」</Text>
                        )}
                      </View>
                      {item.meaning && (
                        <Text className="text-sm text-gray-700 mt-1">{item.meaning}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View className="py-6 px-4">
                  <Text className="text-sm text-gray-400 text-center">
                    {t('dictionary.no_results')}
                  </Text>
                </View>
              )}
            </>
          ) : (
            // Show search history when no query
            searchHistory.length > 0 && (
              <>
                <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                  <Clock size={16} color="#9ca3af" />
                  <Text className="text-sm font-semibold text-gray-700 ml-2">
                    {t('dictionary.recent_searches')}
                  </Text>
                </View>
                <ScrollView 
                  style={styles.dropdownScrollView}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  {searchHistory.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      className="flex-row items-center py-3 px-4 border-b border-gray-50 active:bg-gray-50"
                      onPress={() => {
                        setSearchQuery(item.searchKeyword);
                        setSelectedWordId(null);
                        setShouldAutoSelect(true); // Flag to auto-select first result
                        setIsFocused(false);
                        searchInputRef.current?.blur();
                      }}
                      activeOpacity={0.7}
                    >
                      <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-3">
                        <Clock size={14} color="#3b82f6" />
                      </View>
                      <Text className="flex-1 text-base text-gray-900 font-medium">
                        {item.searchKeyword}
                      </Text>
                      <Text className="text-xs text-gray-400 ml-2">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
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

      {/* Results - only show when not focused or when search is submitted */}
      {!isFocused && (
      <View className="flex-1">
          {/* Show word detail if selected */}
          {selectedWordId && wordDetailData?.data ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-4 py-6">
                {/* Back button to clear selection */}
                <TouchableOpacity
                  className="flex-row items-center mb-4"
                  onPress={() => {
                    setSelectedWordId(null);
                  }}
                >
                  <X size={20} color="#374151" />
                  <Text className="text-base text-gray-700 ml-2">
                    Quay lại
                  </Text>
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

                {/* Meanings */}
                {wordDetailData.data.meanings && wordDetailData.data.meanings.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Nghĩa
                    </Text>
                    {wordDetailData.data.meanings.map((meaning: any, index: number) => (
                      <View key={index} className="mb-3 pb-3 border-b border-gray-100">
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
                    ))}
                  </View>
                )}

                {/* Related Words */}
                {wordDetailData.data.relatedWords && wordDetailData.data.relatedWords.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Từ liên quan
                    </Text>
                    <View className="flex-row flex-wrap">
                      {wordDetailData.data.relatedWords.map((related: any) => (
                        <TouchableOpacity
                          key={related.id}
                          className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                          onPress={() => {
                            setSelectedWordId(related.id.toString());
                          }}
                          activeOpacity={0.7}
                        >
                          <Text className="text-base text-gray-900">
                            {related.wordJp}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : wordDetailLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4A9FA2" />
            </View>
          ) : isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4A9FA2" />
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsContainer}
          />
        ) : searchQuery.trim() ? (
          <View className="flex-1 items-center justify-center px-6">
            <BookOpen size={64} color="#d1d5db" />
            <Text className="text-lg font-semibold text-gray-400 mt-4 text-center">
              {t('dictionary.no_results')}
            </Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              {t('dictionary.try_different_search')}
            </Text>
          </View>
          ) : (
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
                      • Đăng nhập tài khoản Mazii để được đồng bộ dữ liệu và sử dụng trên nhiều thiết bị.
                    </Text>
                    <Text className="text-sm text-gray-700 mb-2">
                      • Mazii có thể chuyển thành te, ta, bị động... ở dạng nguyên thể, thử 食べた
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
                {t('dictionary.recent_searches')}
              </Text>
                      <TouchableOpacity>
                        <Text className="text-sm text-blue-600">
                          {t('dictionary.see_more') || 'Xem thêm'}
                        </Text>
                      </TouchableOpacity>
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
                          onPress={() => {
                            setSearchQuery(item.searchKeyword);
                            setSelectedWordId(null);
                            setShouldAutoSelect(true); // Flag to auto-select first result
                            setIsFocused(false);
                            searchInputRef.current?.blur();
                          }}
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
                    <TouchableOpacity>
                      <Text className="text-sm text-blue-600">
                        {t('dictionary.see_more') || 'Xem thêm'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row flex-wrap">
                    {[
                      '利用', '人', '偶然', '共有', '被害', '維持', '情報', 
                      '後', 'ば', 'が', '空', 'を', '遠慮', '様子', 'に'
                    ].map((keyword, index) => (
                      <TouchableOpacity
                        key={index}
                        className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                        onPress={() => {
                          setSearchQuery(keyword);
                          searchInputRef.current?.focus();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text className="text-base text-gray-900">
                          {keyword}
                        </Text>
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
                    {['N1', 'N2', 'N3', 'N4', 'N5'].map((level, index) => (
                      <TouchableOpacity
                        key={index}
                        className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                        onPress={() => {
                          // Could navigate to JLPT level or search for JLPT content
                        }}
                        activeOpacity={0.7}
                      >
                        <Text className="text-base text-gray-900">
                          {level}
                </Text>
              </TouchableOpacity>
            ))}
                  </View>
                </View>

                {/* Empty State when no history */}
                {searchHistory.length === 0 && (
                  <View className="items-center justify-center py-12">
            <Search size={64} color="#d1d5db" />
            <Text className="text-lg font-semibold text-gray-400 mt-4 text-center">
              {t('dictionary.start_searching')}
            </Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              {t('dictionary.search_description')}
            </Text>
          </View>
        )}
      </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Word Detail Modal */}
      <Modal
        visible={showWordDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowWordDetail(false);
          setSelectedWordId(null);
        }}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              {t('dictionary.word_detail') || 'Chi tiết từ vựng'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowWordDetail(false);
                setSelectedWordId(null);
              }}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {wordDetailLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4A9FA2" />
            </View>
          ) : wordDetailData?.data ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <View className="px-4 py-6">
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

                {/* Meanings */}
                {wordDetailData.data.meanings && wordDetailData.data.meanings.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Nghĩa
                    </Text>
                    {wordDetailData.data.meanings.map((meaning: any, index: number) => (
                      <View key={index} className="mb-3 pb-3 border-b border-gray-100">
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
                    ))}
                  </View>
                )}

                {/* Related Words */}
                {wordDetailData.data.relatedWords && wordDetailData.data.relatedWords.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-lg font-semibold text-gray-900 mb-3">
                      Từ liên quan
                    </Text>
                    <View className="flex-row flex-wrap">
                      {wordDetailData.data.relatedWords.map((related: any) => (
                        <TouchableOpacity
                          key={related.id}
                          className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
                          onPress={() => {
                            setSelectedWordId(related.id.toString());
                            // Modal will update automatically via useWordDetails hook
                          }}
                          activeOpacity={0.7}
                        >
                          <Text className="text-base text-gray-900">
                            {related.wordJp}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-base text-gray-400 text-center">
                Không tìm thấy thông tin chi tiết
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    paddingBottom: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 9, // For Android, slightly lower than dropdown
  },
  dropdownWrapper: {
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
});

