import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { db } from '../services/database';
import type { Movie } from '../services/database';

export default function AddScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    type: 'movie' as 'movie' | 'series',
    genre: '',
    director: '',
    actors: '',
    runtime: '',
    plot: '',
    status: 'watchlist' as 'watching' | 'completed' | 'watchlist' | 'dropped',
    personalRating: '',
    review: '',
    progress: '',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.year.trim()) {
      Alert.alert('Error', 'Title and Year are required fields');
      return;
    }

    try {
      // Generate a unique ID for the movie
      const movieId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create movie object
      const movie: Movie = {
        id: movieId,
        title: formData.title.trim(),
        year: formData.year.trim(),
        type: formData.type,
        genre: formData.genre.trim() || undefined,
        director: formData.director.trim() || undefined,
        actors: formData.actors.trim() || undefined,
        runtime: formData.runtime.trim() || undefined,
        plot: formData.plot.trim() || undefined,
      };

      // Add movie to database
      await db.addMovie(movie);

      // Add user entry
      await db.addUserEntry({
        movieId,
        status: formData.status,
        personalRating: formData.personalRating ? parseInt(formData.personalRating) : undefined,
        review: formData.review.trim() || undefined,
        progress: formData.progress.trim() || undefined,
        dateAdded: new Date().toISOString(),
        dateCompleted: formData.status === 'completed' ? new Date().toISOString() : undefined,
      });

      Alert.alert('Success', 'Movie/Show added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setFormData({
              title: '',
              year: '',
              type: 'movie',
              genre: '',
              director: '',
              actors: '',
              runtime: '',
              plot: '',
              status: 'watchlist',
              personalRating: '',
              review: '',
              progress: '',
            });
            // Navigate to library to see the added item
            router.push('/library');
          },
        },
      ]);
    } catch (error) {
      console.error('Error adding movie/show:', error);
      Alert.alert('Error', 'Failed to add movie/show. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 p-4">
        <View className="space-y-4">
          {/* Title */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Title *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter movie/show title"
            />
          </View>

          {/* Year */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Year *</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              placeholder="e.g. 2023"
              keyboardType="numeric"
            />
          </View>

          {/* Type */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Type</Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <Picker.Item label="Movie" value="movie" />
                <Picker.Item label="TV Series" value="series" />
              </Picker>
            </View>
          </View>

          {/* Genre */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Genre</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.genre}
              onChangeText={(text) => setFormData({ ...formData, genre: text })}
              placeholder="e.g. Action, Comedy, Drama"
            />
          </View>

          {/* Director */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Director</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.director}
              onChangeText={(text) => setFormData({ ...formData, director: text })}
              placeholder="Director name"
            />
          </View>

          {/* Actors */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Actors</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.actors}
              onChangeText={(text) => setFormData({ ...formData, actors: text })}
              placeholder="Main actors (comma separated)"
            />
          </View>

          {/* Runtime */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Runtime</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.runtime}
              onChangeText={(text) => setFormData({ ...formData, runtime: text })}
              placeholder="e.g. 120 min or 8 seasons"
            />
          </View>

          {/* Plot */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Plot</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.plot}
              onChangeText={(text) => setFormData({ ...formData, plot: text })}
              placeholder="Brief description of the plot"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Status */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Status</Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <Picker.Item label="Watchlist" value="watchlist" />
                <Picker.Item label="Currently Watching" value="watching" />
                <Picker.Item label="Completed" value="completed" />
                <Picker.Item label="Dropped" value="dropped" />
              </Picker>
            </View>
          </View>

          {/* Personal Rating */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Personal Rating (1-10)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.personalRating}
              onChangeText={(text) => setFormData({ ...formData, personalRating: text })}
              placeholder="Rate from 1 to 10"
              keyboardType="numeric"
            />
          </View>

          {/* Review */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Review</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.review}
              onChangeText={(text) => setFormData({ ...formData, review: text })}
              placeholder="Your thoughts and review"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Progress */}
          <View>
            <Text className="text-base font-medium text-gray-700 mb-2">Progress</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={formData.progress}
              onChangeText={(text) => setFormData({ ...formData, progress: text })}
              placeholder="e.g. Episode 5 of Season 2, 50%"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 mt-6"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Add Movie/Show
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}