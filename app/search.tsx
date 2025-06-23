import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService, SearchResult } from '../services/api';
import { db } from '../services/database';
import { router } from 'expo-router';

interface SearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await apiService.searchMovies(query);
      
      if (response.Response === 'True' && response.Search) {
        setResults(response.Search);
      } else {
        setResults([]);
        if (response.Error) {
          Alert.alert('Search Error', response.Error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search. Please check your API key and internet connection.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (item: SearchItem) => {
    try {
      const movie = apiService.convertSearchResultToMovie(item);
      await db.addMovie(movie);
      
      const existingEntry = await db.getUserEntry(movie.id);
      if (existingEntry) {
        Alert.alert('Already in Library', 'This item is already in your library.');
        return;
      }

      await db.addUserEntry({
        movieId: movie.id,
        status: 'watchlist',
        dateAdded: new Date().toISOString(),
      });

      Alert.alert('Added!', 'Added to your watchlist.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add to watchlist.');
      console.error('Add to watchlist error:', error);
    }
  };

  const handleItemPress = async (item: SearchItem) => {
    try {
      const details = await apiService.getMovieDetails(item.imdbID);
      const movie = apiService.convertToMovie(details);
      await db.addMovie(movie);
      
      router.push({
        pathname: '/modal',
        params: { movieId: movie.id },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load movie details.');
      console.error('Load details error:', error);
    }
  };

  const renderItem = ({ item }: { item: SearchItem }) => (
    <TouchableOpacity
      className="flex-row p-4 bg-white mb-2 rounded-lg shadow-sm"
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{ 
          uri: item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/80x120?text=No+Image'
        }}
        className="w-16 h-24 rounded mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {item.Title}
        </Text>
        <Text className="text-sm text-gray-600 mb-2">
          {item.Year} • {item.Type.charAt(0).toUpperCase() + item.Type.slice(1)}
        </Text>
        <TouchableOpacity
          className="flex-row items-center mt-auto"
          onPress={(e) => {
            e.stopPropagation();
            handleAddToWatchlist(item);
          }}
        >
          <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
          <Text className="text-blue-600 text-sm ml-1">Add to Watchlist</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row">
          <TextInput
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 mr-2"
            placeholder="Search movies and TV shows..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            className="bg-blue-600 px-4 py-2 rounded-lg justify-center"
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="search" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-600 mt-2">Searching...</Text>
        </View>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="search" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg mt-4">No results found</Text>
          <Text className="text-gray-400 text-center mt-2 px-8">
            Try searching with different keywords
          </Text>
        </View>
      )}

      {!loading && !hasSearched && (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="film" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg mt-4">Search for Movies & Shows</Text>
          <Text className="text-gray-400 text-center mt-2 px-8">
            Find your favorite movies and TV shows to track
          </Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.imdbID}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </View>
  );
}