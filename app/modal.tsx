import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { db, Movie, UserEntry } from '../services/database';

export default function MovieDetailScreen() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [userEntry, setUserEntry] = useState<UserEntry | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [status, setStatus] = useState<'watching' | 'completed' | 'watchlist' | 'dropped'>('watchlist');

  const loadMovieData = async () => {
    if (!movieId) return;

    try {
      const entries = await db.getUserEntries();
      const movieEntry = entries.find(entry => entry.movieId === movieId);
      
      if (movieEntry) {
        setMovie(movieEntry);
        setUserEntry(movieEntry);
        setRating(movieEntry.personalRating || 0);
        setReview(movieEntry.review || '');
        setProgress(movieEntry.progress || '');
        setStatus(movieEntry.status);
      }
    } catch (error) {
      console.error('Failed to load movie data:', error);
    }
  };

  const handleSave = async () => {
    if (!movie) return;

    try {
      const entryData = {
        movieId: movie.id,
        status,
        personalRating: rating > 0 ? rating : undefined,
        review: review.trim() || undefined,
        progress: progress.trim() || undefined,
        dateAdded: userEntry?.dateAdded || new Date().toISOString(),
        dateCompleted: status === 'completed' ? new Date().toISOString() : undefined,
      };

      if (userEntry) {
        await db.updateUserEntry(userEntry.id, entryData);
      } else {
        await db.addUserEntry(entryData);
      }

      Alert.alert('Success', 'Your changes have been saved!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes.');
      console.error('Save error:', error);
    }
  };

  const handleDelete = () => {
    if (!userEntry) return;

    Alert.alert(
      'Remove from Library',
      'Are you sure you want to remove this from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.deleteUserEntry(userEntry.id);
              Alert.alert('Removed', 'Item removed from your library.');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item.');
            }
          },
        },
      ]
    );
  };

  const StatusButton = ({ 
    statusValue, 
    label, 
    icon, 
    color 
  }: { 
    statusValue: typeof status; 
    label: string; 
    icon: keyof typeof Ionicons.glyphMap; 
    color: string; 
  }) => (
    <TouchableOpacity
      className={`flex-1 p-3 rounded-lg mr-2 ${
        status === statusValue ? 'opacity-100' : 'opacity-60'
      }`}
      style={{ 
        backgroundColor: status === statusValue ? color : '#f3f4f6',
      }}
      onPress={() => setStatus(statusValue)}
    >
      <View className="items-center">
        <Ionicons 
          name={icon} 
          size={20} 
          color={status === statusValue ? 'white' : '#6b7280'} 
        />
        <Text 
          className={`text-sm mt-1 ${
            status === statusValue ? 'text-white font-medium' : 'text-gray-600'
          }`}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const RatingStars = () => (
    <View className="flex-row justify-center my-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          className="mx-1"
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={24}
            color={star <= rating ? '#f59e0b' : '#d1d5db'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  useEffect(() => {
    loadMovieData();
  }, [movieId]);

  if (!movie) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="relative">
          <Image
            source={{ 
              uri: movie.poster || 'https://via.placeholder.com/300x450?text=No+Image'
            }}
            className="w-full h-96"
            resizeMode="cover"
          />
          <View className="absolute top-12 left-4">
            <TouchableOpacity
              className="w-10 h-10 bg-black bg-opacity-50 rounded-full items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {movie.title}
          </Text>
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-600">
              {movie.year} • {movie.type.charAt(0).toUpperCase() + movie.type.slice(1)}
            </Text>
            {movie.imdbRating && (
              <View className="flex-row items-center ml-4">
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text className="text-gray-600 ml-1">
                  {movie.imdbRating} IMDb
                </Text>
              </View>
            )}
          </View>

          {movie.plot && (
            <View className="mb-6">
              <Text className="text-gray-800 leading-6">{movie.plot}</Text>
            </View>
          )}

          {movie.genre && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-1">Genre</Text>
              <Text className="text-gray-600">{movie.genre}</Text>
            </View>
          )}

          {movie.director && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-1">Director</Text>
              <Text className="text-gray-600">{movie.director}</Text>
            </View>
          )}

          <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Track This {movie.type === 'movie' ? 'Movie' : 'Show'}
            </Text>

            <Text className="text-sm font-medium text-gray-900 mb-2">Status</Text>
            <View className="flex-row mb-4">
              <StatusButton
                statusValue="watchlist"
                label="Watchlist"
                icon="bookmark"
                color="#3b82f6"
              />
              <StatusButton
                statusValue="watching"
                label="Watching"
                icon="play-circle"
                color="#f59e0b"
              />
              <StatusButton
                statusValue="completed"
                label="Completed"
                icon="checkmark-circle"
                color="#10b981"
              />
              <StatusButton
                statusValue="dropped"
                label="Dropped"
                icon="close-circle"
                color="#ef4444"
              />
            </View>

            <Text className="text-sm font-medium text-gray-900 mb-2">
              Your Rating ({rating}/10)
            </Text>
            <RatingStars />

            {movie.type === 'series' && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-900 mb-2">Progress</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., S2E5, Episode 12, etc."
                  value={progress}
                  onChangeText={setProgress}
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-900 mb-2">Notes</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 h-24"
                placeholder="Your thoughts, review, or notes..."
                value={review}
                onChangeText={setReview}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-blue-600 py-3 rounded-lg mr-2"
                onPress={handleSave}
              >
                <Text className="text-white text-center font-medium">
                  {userEntry ? 'Update' : 'Add to Library'}
                </Text>
              </TouchableOpacity>
              
              {userEntry && (
                <TouchableOpacity
                  className="bg-red-600 px-4 py-3 rounded-lg"
                  onPress={handleDelete}
                >
                  <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}
