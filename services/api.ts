import axios from 'axios';
import { Movie } from './database';

// Note: You'll need to get a free API key from http://www.omdbapi.com/apikey.aspx
const OMDB_API_KEY = 'YOUR_OMDB_API_KEY';
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

export interface SearchResult {
  Search?: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
  totalResults?: string;
  Response: string;
  Error?: string;
}

export interface DetailedMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  Error?: string;
}

class APIService {
  private validateApiKey(): void {
    if (!OMDB_API_KEY || OMDB_API_KEY === 'YOUR_OMDB_API_KEY') {
      throw new Error('Please set your OMDB API key in services/api.ts');
    }
  }

  async searchMovies(query: string, page: number = 1): Promise<SearchResult> {
    this.validateApiKey();

    try {
      const response = await axios.get(OMDB_BASE_URL, {
        params: {
          apikey: OMDB_API_KEY,
          s: query,
          page: page.toString(),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('Failed to search movies');
    }
  }

  async getMovieDetails(imdbID: string): Promise<DetailedMovie> {
    this.validateApiKey();

    try {
      const response = await axios.get(OMDB_BASE_URL, {
        params: {
          apikey: OMDB_API_KEY,
          i: imdbID,
          plot: 'full',
        },
      });

      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error getting movie details:', error);
      throw new Error('Failed to get movie details');
    }
  }

  convertToMovie(omdbMovie: DetailedMovie): Movie {
    return {
      id: omdbMovie.imdbID,
      imdbID: omdbMovie.imdbID,
      title: omdbMovie.Title,
      year: omdbMovie.Year,
      type: omdbMovie.Type as 'movie' | 'series',
      poster: omdbMovie.Poster !== 'N/A' ? omdbMovie.Poster : undefined,
      plot: omdbMovie.Plot !== 'N/A' ? omdbMovie.Plot : undefined,
      genre: omdbMovie.Genre !== 'N/A' ? omdbMovie.Genre : undefined,
      director: omdbMovie.Director !== 'N/A' ? omdbMovie.Director : undefined,
      actors: omdbMovie.Actors !== 'N/A' ? omdbMovie.Actors : undefined,
      runtime: omdbMovie.Runtime !== 'N/A' ? omdbMovie.Runtime : undefined,
      imdbRating: omdbMovie.imdbRating !== 'N/A' ? omdbMovie.imdbRating : undefined,
    };
  }

  convertSearchResultToMovie(searchItem: SearchResult['Search'][0]): Movie {
    return {
      id: searchItem.imdbID,
      imdbID: searchItem.imdbID,
      title: searchItem.Title,
      year: searchItem.Year,
      type: searchItem.Type as 'movie' | 'series',
      poster: searchItem.Poster !== 'N/A' ? searchItem.Poster : undefined,
    };
  }
}

export const apiService = new APIService();