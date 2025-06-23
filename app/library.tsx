import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, UserEntry, Movie } from '../services/database';
import { router, useFocusEffect } from 'expo-router';

type LibraryItem = UserEntry & Movie;

const STATUS_FILTERS = [
  { key: 'all', label: 'All', icon: 'apps' as const },
  { key: 'watching', label: 'Watching', icon: 'play-circle' as const },
  { key: 'completed', label: 'Completed', icon: 'checkmark-circle' as const },
  { key: 'watchlist', label: 'Watchlist', icon: 'bookmark' as const },
  { key: 'dropped', label: 'Dropped', icon: 'close-circle' as const },
];

export default function LibraryScreen() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadLibrary = async () => {
    try {
      const entries = await db.getUserEntries();
      setItems(entries);
      filterItems(entries, activeFilter);
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  };

  const filterItems = (allItems: LibraryItem[], filter: string) => {
    if (filter === 'all') {
      setFilteredItems(allItems);
    } else {
      setFilteredItems(allItems.filter(item => item.status === filter));
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    filterItems(items, filter);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLibrary();
    setRefreshing(false);
  };

  const handleItemPress = (item: LibraryItem) => {
    router.push({
      pathname: '/modal',
      params: { movieId: item.movieId },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'watching': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'watchlist': return '#3b82f6';
      case 'dropped': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'watching': return 'play-circle';
      case 'completed': return 'checkmark-circle';
      case 'watchlist': return 'bookmark';
      case 'dropped': return 'close-circle';
      default: return 'help-circle';
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [])
  );

  const renderItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity
      className="flex-row p-4 bg-white mb-2 rounded-lg shadow-sm"
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{ 
          uri: item.poster || 'https://via.placeholder.com/80x120?text=No+Image'
        }}
        className="w-16 h-24 rounded mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-600 mb-2">
          {item.year} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
        
        <View className="flex-row items-center mb-2">
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text 
            className="text-sm ml-1 capitalize"
            style={{ color: getStatusColor(item.status) }}
          >
            {item.status}
          </Text>
        </View>

        {item.personalRating && (
          <View className="flex-row items-center mb-1">
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text className="text-sm text-gray-600 ml-1">
              {item.personalRating}/10
            </Text>
          </View>
        )}

        {item.progress && (
          <Text className="text-sm text-gray-500">
            Progress: {item.progress}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterItem = ({ item }: { item: typeof STATUS_FILTERS[0] }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-2 ${
        activeFilter === item.key 
          ? 'bg-blue-600' 
          : 'bg-gray-200'
      }`}
      onPress={() => handleFilterChange(item.key)}
    >
      <View className="flex-row items-center">
        <Ionicons 
          name={item.icon} 
          size={16} 
          color={activeFilter === item.key ? 'white' : '#6b7280'} 
        />
        <Text 
          className={`ml-1 text-sm ${
            activeFilter === item.key 
              ? 'text-white font-medium' 
              : 'text-gray-600'
          }`}
        >
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 pb-2">
        <FlatList
          data={STATUS_FILTERS}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        />
      </View>

      {filteredItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="library-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg mt-4">
            {activeFilter === 'all' ? 'Your library is empty' : `No ${activeFilter} items`}
          </Text>
          <Text className="text-gray-400 text-center mt-2 px-8">
            {activeFilter === 'all' 
              ? 'Start by searching and adding movies or shows'
              : `You haven't added any ${activeFilter} items yet`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}