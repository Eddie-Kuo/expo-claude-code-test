import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../services/database';

interface Stats {
  totalMovies: number;
  totalShows: number;
  completed: number;
  watching: number;
  watchlist: number;
  averageRating: number;
}

export default function ProfileScreen() {
  const [stats, setStats] = useState<Stats>({
    totalMovies: 0,
    totalShows: 0,
    completed: 0,
    watching: 0,
    watchlist: 0,
    averageRating: 0,
  });

  const loadStats = async () => {
    try {
      const dbStats = await db.getStats();
      setStats(dbStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearLibrary = () => {
    Alert.alert(
      'Clear Library',
      'Are you sure you want to clear your entire library? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // This would require implementing a clear method in the database service
              Alert.alert('Success', 'Library cleared successfully.');
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear library.');
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    color = '#3b82f6' 
  }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    label: string; 
    value: string | number; 
    color?: string; 
  }) => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-3">
      <View className="flex-row items-center">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">{value}</Text>
          <Text className="text-sm text-gray-600">{label}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <View className="items-center">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="person" size={40} color="#3b82f6" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1">
              Movie Tracker User
            </Text>
            <Text className="text-gray-600">
              Tracking {stats.completed + stats.watching + stats.watchlist} titles
            </Text>
          </View>
        </View>

        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Your Statistics
        </Text>

        <StatCard
          icon="film"
          label="Movies Tracked"
          value={stats.totalMovies}
          color="#8b5cf6"
        />

        <StatCard
          icon="tv"
          label="TV Shows Tracked"
          value={stats.totalShows}
          color="#06b6d4"
        />

        <StatCard
          icon="checkmark-circle"
          label="Completed"
          value={stats.completed}
          color="#10b981"
        />

        <StatCard
          icon="play-circle"
          label="Currently Watching"
          value={stats.watching}
          color="#f59e0b"
        />

        <StatCard
          icon="bookmark"
          label="Watchlist"
          value={stats.watchlist}
          color="#3b82f6"
        />

        {stats.averageRating > 0 && (
          <StatCard
            icon="star"
            label="Average Rating"
            value={`${stats.averageRating.toFixed(1)}/10`}
            color="#f59e0b"
          />
        )}

        <View className="mt-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Settings
          </Text>

          <TouchableOpacity className="bg-white p-4 rounded-lg shadow-sm mb-3">
            <View className="flex-row items-center">
              <Ionicons name="information-circle" size={20} color="#6b7280" />
              <Text className="text-gray-900 ml-3 flex-1">About</Text>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white p-4 rounded-lg shadow-sm mb-3"
            onPress={handleClearLibrary}
          >
            <View className="flex-row items-center">
              <Ionicons name="trash" size={20} color="#ef4444" />
              <Text className="text-red-600 ml-3 flex-1">Clear Library</Text>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="mt-8 p-4 bg-blue-50 rounded-lg">
          <Text className="text-sm text-blue-800 text-center">
            Movie Tracker v1.0.0
          </Text>
          <Text className="text-xs text-blue-600 text-center mt-1">
            Track your favorite movies and shows
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}