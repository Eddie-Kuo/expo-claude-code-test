import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, UserEntry, Movie } from '../services/database';
import { router, useFocusEffect } from 'expo-router';

type LibraryItem = UserEntry & Movie;

export default function HomeScreen() {
  const [recentItems, setRecentItems] = useState<LibraryItem[]>([]);
  const [watchingItems, setWatchingItems] = useState<LibraryItem[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    completed: 0,
    watching: 0,
    watchlist: 0,
  });

  const loadData = async () => {
    try {
      const [allEntries, dbStats] = await Promise.all([
        db.getUserEntries(),
        db.getStats(),
      ]);

      setRecentItems(allEntries.slice(0, 5));
      setWatchingItems(allEntries.filter(item => item.status === 'watching').slice(0, 3));
      setStats({
        totalItems: allEntries.length,
        completed: dbStats.completed,
        watching: dbStats.watching,
        watchlist: dbStats.watchlist,
      });
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleItemPress = (item: LibraryItem) => {
    router.push({
      pathname: '/modal',
      params: { movieId: item.movieId },
    });
  };

  const QuickStatCard = ({ 
    icon, 
    label, 
    value, 
    color,
    onPress 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    label: string; 
    value: number; 
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity 
      className="bg-white p-4 rounded-lg shadow-sm flex-1 mx-1"
      onPress={onPress}
    >
      <View className="items-center">
        <Ionicons name={icon} size={24} color={color} />
        <Text className="text-lg font-bold text-gray-900 mt-1">{value}</Text>
        <Text className="text-xs text-gray-600 text-center">{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity
      className="bg-white p-3 rounded-lg shadow-sm mr-3 w-32"
      onPress={() => handleItemPress(item)}
    >
      <Image
        source={{ 
          uri: item.poster || 'https://via.placeholder.com/80x120?text=No+Image'
        }}
        className="w-full h-32 rounded mb-2"
        resizeMode="cover"
      />
      <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
        {item.title}
      </Text>
      <Text className="text-xs text-gray-600">{item.year}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </Text>
          <Text className="text-gray-600">
            {stats.totalItems > 0 
              ? `You're tracking ${stats.totalItems} titles`
              : "Start building your movie collection"
            }
          </Text>
        </View>

        <View className="flex-row mb-6">
          <QuickStatCard
            icon="checkmark-circle"
            label="Completed"
            value={stats.completed}
            color="#10b981"
            onPress={() => router.push('/library')}
          />
          <QuickStatCard
            icon="play-circle"
            label="Watching"
            value={stats.watching}
            color="#f59e0b"
            onPress={() => router.push('/library')}
          />
          <QuickStatCard
            icon="bookmark"
            label="Watchlist"
            value={stats.watchlist}
            color="#3b82f6"
            onPress={() => router.push('/library')}
          />
        </View>

        {watchingItems.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Continue Watching
              </Text>
              <TouchableOpacity onPress={() => router.push('/library')}>
                <Text className="text-blue-600 text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={watchingItems}
              renderItem={renderRecentItem}
              keyExtractor={(item) => `watching-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {recentItems.length > 0 && (
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Recently Added
              </Text>
              <TouchableOpacity onPress={() => router.push('/library')}>
                <Text className="text-blue-600 text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentItems}
              renderItem={renderRecentItem}
              keyExtractor={(item) => `recent-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {stats.totalItems === 0 && (
          <View className="bg-white p-6 rounded-lg shadow-sm items-center">
            <Ionicons name="film" size={48} color="#d1d5db" />
            <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
              Start Your Collection
            </Text>
            <Text className="text-gray-600 text-center mb-4">
              Search for movies and TV shows to begin tracking your favorites
            </Text>
            <TouchableOpacity
              className="bg-blue-600 px-6 py-3 rounded-lg"
              onPress={() => router.push('/search')}
            >
              <Text className="text-white font-medium">Search Movies & Shows</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
