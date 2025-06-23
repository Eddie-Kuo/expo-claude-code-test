# Movie Tracker App

A React Native Expo app for tracking movies and TV shows, similar to Letterboxd. Track what you're watching, rate content, write reviews, and manage your personal library.

## Features

- **Search Movies & TV Shows**: Search using the OMDB API
- **Personal Library**: Organize content by status (Watching, Completed, Watchlist, Dropped)
- **Rating System**: Rate content from 1-10 stars
- **Reviews & Notes**: Add personal thoughts and reviews
- **Progress Tracking**: Track episode/season progress for TV shows
- **Statistics**: View your watching statistics and ratings
- **Offline Storage**: All data stored locally using SQLite

## Screenshots

[Add screenshots here when available]

## Setup Instructions

### Prerequisites

- Node.js (version 18 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expo-claude-code-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get OMDB API Key**
   - Visit [http://www.omdbapi.com/apikey.aspx](http://www.omdbapi.com/apikey.aspx)
   - Sign up for a free API key
   - Copy the API key

4. **Configure API Key**
   - Open `services/api.ts`
   - Replace `YOUR_OMDB_API_KEY` with your actual API key:
   ```typescript
   const OMDB_API_KEY = 'your-actual-api-key-here';
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

## App Structure

```
app/
├── _layout.tsx          # Tab navigation layout
├── index.tsx            # Home screen
├── search.tsx           # Search movies & shows
├── library.tsx          # Personal library
├── profile.tsx          # User profile & stats
└── modal.tsx            # Movie detail screen

services/
├── database.ts          # SQLite database service
└── api.ts               # OMDB API service
```

## Usage

### Adding Movies/Shows
1. Go to the **Search** tab
2. Search for a movie or TV show
3. Tap "Add to Watchlist" or tap the item for more details
4. Set status, rating, and add notes in the detail screen

### Managing Your Library
1. Go to the **Library** tab
2. Filter by status (All, Watching, Completed, Watchlist, Dropped)
3. Tap any item to edit its details

### Viewing Statistics
1. Go to the **Profile** tab
2. View your watching statistics and average ratings

## API Integration

This app uses the [OMDB API](http://www.omdbapi.com/) for movie and TV show data. The free tier includes:
- 1,000 requests per day
- Basic movie/show information
- Poster images
- IMDb ratings

## Database Schema

The app uses SQLite with two main tables:

### Movies Table
- Movie/show metadata from OMDB API
- Posters, plot summaries, cast information

### User Entries Table
- Personal tracking data
- Status, ratings, reviews, progress
- Date tracking

## Development

### Available Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm test` - Run tests

### Tech Stack
- **React Native** with **Expo**
- **TypeScript** for type safety
- **NativeWind** for styling (Tailwind CSS)
- **Expo Router** for navigation
- **Expo SQLite** for local database
- **Axios** for API requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Common Issues

**API Key Error**
- Make sure you've set your OMDB API key in `services/api.ts`
- Verify the API key is valid and has remaining requests

**Database Issues**
- Clear app data/storage if you encounter database errors
- The database will be recreated on next app launch

**Search Not Working**
- Check your internet connection
- Verify API key is configured correctly
- Check the Expo logs for detailed error messages

### Getting Help

- Check the [Expo Documentation](https://docs.expo.dev/)
- Review [React Native Documentation](https://reactnative.dev/docs/getting-started)
- Open an issue in this repository for bugs or questions

## Future Enhancements

- [ ] User authentication and cloud sync
- [ ] Social features (sharing lists, following users)
- [ ] Advanced filtering and sorting options
- [ ] Export data functionality
- [ ] Dark mode support
- [ ] Push notifications for new releases
- [ ] Integration with streaming services
- [ ] Watchlist sharing