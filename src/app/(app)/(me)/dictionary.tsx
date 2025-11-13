import BackScreen from '@components/molecules/Back';
import { useDebounce } from '@hooks/useDebounce';
import { useDictionarySearch, useSearchHistory } from '@hooks/useDictionary';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  BookOpen,
  Clock,
  Search,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
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
  
  // Debounce search query to avoid too many API calls
  const debouncedQuery = useDebounce(searchQuery, 300);

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
    pageSize: 10,
  });

  // Get search results from API
  const searchResults = apiData?.data?.results || [];
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

  const renderSearchResult = ({ item }: { item: DictionaryResult }) => (
    <TouchableOpacity
      className="py-4 px-4 border-b border-gray-100"
      activeOpacity={0.7}
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
          <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm">
            <Search size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 mx-3 text-base text-gray-900"
              placeholder={t('dictionary.search_placeholder')}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                // Reset to page 1 when search query changes
                setCurrentPage(1);
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

      {/* Results */}
      <View className="flex-1">
        {isLoading ? (
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
        ) : searchHistory.length > 0 ? (
          <ScrollView className="flex-1 px-4 py-4">
            <View className="flex-row items-center mb-3">
              <Clock size={18} color="#9ca3af" />
              <Text className="text-base font-semibold text-gray-700 ml-2">
                {t('dictionary.recent_searches')}
              </Text>
            </View>
            {searchHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center py-3 px-2 border-b border-gray-100"
                onPress={() => setSearchQuery(item.searchKeyword)}
                activeOpacity={0.6}
              >
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                  <Clock size={18} color="#3b82f6" />
                </View>
                <Text className="flex-1 text-base text-gray-900 ml-3 font-medium">
                  {item.searchKeyword}
                </Text>
                <Text className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center px-6">
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    paddingBottom: 20,
  },
});

