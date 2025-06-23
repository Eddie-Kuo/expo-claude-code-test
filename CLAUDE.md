# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npx expo start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm run web` - Run on web browser
- `npm test` - Run Jest tests

### Setup Requirements
- Configure OMDB API key in `services/api.ts` (replace `YOUR_OMDB_API_KEY`)
- Get free API key from http://www.omdbapi.com/apikey.aspx

## Architecture Overview

### App Structure
- **Navigation**: Expo Router with tab-based navigation
- **Screens**: Home, Search, Library, Profile + Modal for movie details
- **Database**: SQLite with offline-first approach using Expo SQLite
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **API**: OMDB API integration for movie/TV show data

### Key Services
- `services/database.ts` - SQLite database operations, schemas, and queries
- `services/api.ts` - OMDB API service with search and detail fetching

### Database Schema
Two main tables:
- `movies` - Movie/show metadata from OMDB API
- `user_entries` - Personal tracking data (status, ratings, reviews, progress)

### Status System
User entries track content with statuses: `watching`, `completed`, `watchlist`, `dropped`

## Technical Details

### Data Flow
1. Search movies via OMDB API (`services/api.ts`)
2. Store movie metadata in SQLite (`services/database.ts`)
3. Create user entries for personal tracking
4. Display in tab-based navigation with real-time updates

### Key Components
- `app/_layout.tsx` - Tab navigation setup and database initialization
- `app/modal.tsx` - Movie detail screen (presented as modal)
- Database initializes automatically on app start via `useEffect` in `_layout.tsx`

### Styling Approach
- Uses NativeWind for consistent styling across platforms
- Tailwind classes configured in `tailwind.config.js`
- Global styles in `global.css`

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured (`@/*` maps to root)
- Expo-specific types included