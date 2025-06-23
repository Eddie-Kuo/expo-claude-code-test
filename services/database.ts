import * as SQLite from 'expo-sqlite';

export interface Movie {
  id: string;
  imdbID?: string;
  title: string;
  year: string;
  type: 'movie' | 'series';
  poster?: string;
  plot?: string;
  genre?: string;
  director?: string;
  actors?: string;
  runtime?: string;
  imdbRating?: string;
}

export interface UserEntry {
  id: number;
  movieId: string;
  status: 'watching' | 'completed' | 'watchlist' | 'dropped';
  personalRating?: number;
  review?: string;
  progress?: string;
  dateAdded: string;
  dateCompleted?: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('movietracker.db');
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS movies (
        id TEXT PRIMARY KEY,
        imdbID TEXT UNIQUE,
        title TEXT NOT NULL,
        year TEXT NOT NULL,
        type TEXT NOT NULL,
        poster TEXT,
        plot TEXT,
        genre TEXT,
        director TEXT,
        actors TEXT,
        runtime TEXT,
        imdbRating TEXT
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movieId TEXT NOT NULL,
        status TEXT NOT NULL,
        personalRating INTEGER,
        review TEXT,
        progress TEXT,
        dateAdded TEXT NOT NULL,
        dateCompleted TEXT,
        FOREIGN KEY (movieId) REFERENCES movies (id)
      );
    `);
  }

  async addMovie(movie: Movie): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(`
      INSERT OR REPLACE INTO movies (id, imdbID, title, year, type, poster, plot, genre, director, actors, runtime, imdbRating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      movie.id,
      movie.imdbID || null,
      movie.title,
      movie.year,
      movie.type,
      movie.poster || null,
      movie.plot || null,
      movie.genre || null,
      movie.director || null,
      movie.actors || null,
      movie.runtime || null,
      movie.imdbRating || null
    ]);
  }

  async addUserEntry(entry: Omit<UserEntry, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(`
      INSERT INTO user_entries (movieId, status, personalRating, review, progress, dateAdded, dateCompleted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      entry.movieId,
      entry.status,
      entry.personalRating || null,
      entry.review || null,
      entry.progress || null,
      entry.dateAdded,
      entry.dateCompleted || null
    ]);

    return result.lastInsertRowId!;
  }

  async updateUserEntry(id: number, updates: Partial<UserEntry>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.personalRating !== undefined) {
      fields.push('personalRating = ?');
      values.push(updates.personalRating);
    }
    if (updates.review !== undefined) {
      fields.push('review = ?');
      values.push(updates.review);
    }
    if (updates.progress !== undefined) {
      fields.push('progress = ?');
      values.push(updates.progress);
    }
    if (updates.dateCompleted !== undefined) {
      fields.push('dateCompleted = ?');
      values.push(updates.dateCompleted);
    }

    if (fields.length === 0) return;

    values.push(id);
    await this.db.runAsync(`
      UPDATE user_entries SET ${fields.join(', ')} WHERE id = ?
    `, values);
  }

  async getUserEntries(status?: string): Promise<(UserEntry & Movie)[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = `
      SELECT ue.*, m.*
      FROM user_entries ue
      JOIN movies m ON ue.movieId = m.id
    `;
    let params: any[] = [];

    if (status) {
      query += ' WHERE ue.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ue.dateAdded DESC';

    const result = await this.db.getAllAsync(query, params);
    return result as (UserEntry & Movie)[];
  }

  async getUserEntry(movieId: string): Promise<UserEntry | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(`
      SELECT * FROM user_entries WHERE movieId = ?
    `, [movieId]);

    return result as UserEntry | null;
  }

  async deleteUserEntry(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM user_entries WHERE id = ?', [id]);
  }

  async getStats(): Promise<{
    totalMovies: number;
    totalShows: number;
    completed: number;
    watching: number;
    watchlist: number;
    averageRating: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const stats = await this.db.getFirstAsync(`
      SELECT 
        COUNT(CASE WHEN m.type = 'movie' THEN 1 END) as totalMovies,
        COUNT(CASE WHEN m.type = 'series' THEN 1 END) as totalShows,
        COUNT(CASE WHEN ue.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN ue.status = 'watching' THEN 1 END) as watching,
        COUNT(CASE WHEN ue.status = 'watchlist' THEN 1 END) as watchlist,
        AVG(ue.personalRating) as averageRating
      FROM user_entries ue
      JOIN movies m ON ue.movieId = m.id
    `);

    return stats as any;
  }
}

export const db = new DatabaseService();