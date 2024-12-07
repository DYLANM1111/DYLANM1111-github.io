"use strict";
const db = require("./db-conn");

class MovieModel {
  async getAllMovies() {
    try {
      console.log("Fetching all movies");
      const movies = await db.all(`
        SELECT m.*, md.director, md.genre, md.trailer_url
        FROM MOVIES m
        LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
      `);
      console.log(`Fetched ${movies.length} movies`);
      return movies;
    } catch (error) {
      console.error('Error fetching all movies:', error);
      throw new Error('Error fetching all movies: ' + error.message);
    }
  }

  async getCategoriesWithMovies() {
    try {
      console.log("Fetching categories with movies");
      const categories = await db.all(`SELECT * FROM CATEGORIES ORDER BY display_order`);

      for (let category of categories) {
        console.log(`Fetching movies for category '${category.name}'`);
        category.movies = await db.all(`
          SELECT m.*, md.director, md.genre, md.trailer_url
          FROM MOVIES m
          LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
          WHERE m.category_id = ?
        `, [category.id]);
        console.log(`Found ${category.movies.length} movies for category '${category.name}'`);
      }

      console.log(`Fetched ${categories.length} categories with movies`);
      return categories;
    } catch (error) {
      console.error('Error fetching categories with movies:', error);
      throw new Error('Error fetching categories with movies: ' + error.message);
    }
  }

  async getMoviesByCategory(categoryId) {
    try {
      console.log(`Fetching movies for category ID ${categoryId}`);
      const movies = await db.all(`
        SELECT m.*, md.director, md.genre, md.trailer_url
        FROM MOVIES m
        LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
        WHERE m.category_id = ?
      `, [categoryId]);
      console.log(`Fetched ${movies.length} movies for category ID ${categoryId}`);
      return movies;
    } catch (error) {
      console.error(`Error fetching movies for category ID ${categoryId}:`, error);
      throw new Error(`Error fetching category movies: ${error.message}`);
    }
  }

  async searchMovies(searchTerm) {
    try {
      console.log(`Searching movies for term '${searchTerm}'`);
      const movies = await db.all(`
        SELECT m.*, c.name as category_name, md.director, md.genre
        FROM MOVIES m
        LEFT JOIN CATEGORIES c ON m.category_id = c.id
        LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
        WHERE m.title LIKE ? OR md.director LIKE ? OR md.genre LIKE ?
      `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
      console.log(`Found ${movies.length} movies matching the search term '${searchTerm}'`);
      return movies;
    } catch (error) {
      console.error(`Error searching movies for term '${searchTerm}':`, error);
      throw new Error(`Error searching movies: ${error.message}`);
    }
  }

  async getMovieDetails(movieId) {
    try {
      console.log(`Fetching details for movie ID ${movieId}`);
      const movie = await db.get(`
        SELECT m.*, md.*, c.name as category_name
        FROM MOVIES m
        LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
        LEFT JOIN CATEGORIES c ON m.category_id = c.id
        WHERE m.id = ?
      `, [movieId]);
      console.log(`Fetched details for movie ID ${movieId}`);
      return movie;
    } catch (error) {
      console.error(`Error fetching movie details for ID ${movieId}:`, error);
      throw new Error(`Error fetching movie details: ${error.message}`);
    }
  }

  async getMoviesForAdmin() {
    try {
      console.log("Fetching movies for admin");
      const movies = await db.all(`
        SELECT m.*, c.name as category_name, 
              md.director, md.genre, md.trailer_url
        FROM MOVIES m
        LEFT JOIN CATEGORIES c ON m.category_id = c.id
        LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
        ORDER BY m.id DESC
      `);
      console.log(`Fetched ${movies.length} movies for admin`);
      return movies;
    } catch (error) {
      console.error('Error fetching admin movies:', error);
      throw new Error('Error fetching admin movies: ' + error.message);
    }
  }

  async addMovie(movieData) {
    try {
      console.log(`Adding movie '${movieData.title}'`);

      // Perform the first insert into the 'movies' table
      const movieInsert = await db.run(`
        INSERT INTO movies (title, description, imgUrl, price, 
            category_id, release_year, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        movieData.title,
        movieData.description,
        movieData.imgUrl,
        Number(movieData.price),
        Number(movieData.category_id),
        movieData.release_year,
        movieData.is_featured ? 1 : 0
      ]);

      // Get the last inserted movie ID
      const lastInsertInfo = await db.get('SELECT last_insert_rowid() as id');
      const movieId = lastInsertInfo.id;
      console.log(`New movie '${movieData.title}' created with ID ${movieId}`);

      // Perform the second insert into the 'movie_details' table
      await db.run(`
        INSERT INTO movie_details (movie_id, director, genre, trailer_url,
            rating, time, subtitles, language, staring)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        movieId,
        movieData.director,
        movieData.genre,
        movieData.trailer_url,
        Number(movieData.rating || 0),
        movieData.time || '',
        movieData.subtitles || '',
        movieData.language || '',
        movieData.staring || ''
      ]);
      console.log(`Movie details inserted for '${movieData.title}'`);

      // Return the movie details after insertion
      return await this.getMovieDetails(movieId);
    } catch (error) {
      console.error(`Error adding movie '${movieData.title}':`, error);
      // If an error occurs, the caller will handle the rollback
      throw error;
    }
  }

  async updateMovie(id, movieData) {
    try {
      console.log(`Updating movie with ID ${id}`);
      await db.run('BEGIN TRANSACTION');

      // Movie table update
      await db.run(`
        UPDATE movies SET 
        title = ?, description = ?, imgUrl = ?, price = ?,
        category_id = ?, release_year = ?, is_featured = ?
        WHERE id = ?
      `, [
        movieData.title,
        movieData.description,
        movieData.imgUrl,
        Number(movieData.price),
        Number(movieData.category_id),
        movieData.release_year,
        movieData.is_featured === 'on' ? 1 : 0,
        Number(id)
      ]);
      console.log(`Movie with ID ${id} updated in the movies table`);

      // Movie details update
      await db.run(`
        UPDATE movie_details SET 
        director = ?, genre = ?, trailer_url = ?,
        rating = ?, time = ?, subtitles = ?, 
        language = ?, staring = ?
        WHERE movie_id = ?
      `, [
        movieData.director,
        movieData.genre,
        movieData.trailer_url,
        Number(movieData.rating || 0),
        movieData.time,
        movieData.subtitles,
        movieData.language,
        movieData.staring,
        Number(id)
      ]);
      console.log(`Movie details with ID ${id} updated in the movie_details table`);

      await db.run('COMMIT');
      console.log(`Update successful for movie with ID ${id}`);
      return await this.getMovieDetails(id);
    } catch (error) {
      await db.run('ROLLBACK');
      console.error(`Error updating movie with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteMovie(id) {
    try {
      console.log(`Deleting movie with ID ${id}`);
      await db.run('DELETE FROM MOVIE_DETAILS WHERE movie_id = ?', [id]);
      await db.run('DELETE FROM MOVIES WHERE id = ?', [id]);
      console.log(`Movie with ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting movie with ID ${id}:`, error);
      throw new Error(`Error deleting movie: ${error.message}`);
    }
  }

  async ensureCategory(categoryData) {
    try {
      console.log(`Ensuring category '${categoryData.name}' exists`);
      const existing = await db.get(
        'SELECT id FROM categories WHERE name = ?', 
        [categoryData.name]
      );
      if (existing) {
        console.log(`Category '${categoryData.name}' already exists with ID ${existing.id}`);
        return existing.id;
      }

      console.log(`Creating new category '${categoryData.name}'`);
      const result = await db.run(
        'INSERT INTO categories (name, display_order) VALUES (?, ?)',
        [categoryData.name, categoryData.display_order]
      );
      console.log(`New category '${categoryData.name}' created with ID ${result.lastID}`);
      return result.lastID;
    } catch (error) {
      console.error(`Error ensuring category '${categoryData.name}':`, error);
      throw new Error(`Error ensuring category: ${error.message}`);
    }
  }

  async bulkUpload(req, res) {
    try {
      console.log('Bulk upload request received');
      console.log('Request body:', req.body);

      await db.run('BEGIN TRANSACTION');

      // Process each category and its movies
      for (const category of req.body.categories) {
        // Ensure category exists and retrieve its ID
        const categoryId = await this.ensureCategory(category);
        console.log(`Processing category '${category.name}' (ID: ${categoryId})`);

        // Process movies within the category
        for (const movie of category.movies) {
          console.log(`Adding movie '${movie.title}' in category '${category.name}'`);
          await this.addMovie({
            ...movie,
            category_id: categoryId
          });
        }
      }

      await db.run('COMMIT');
      console.log('Bulk upload successful');
      res.status(200).json({ message: 'Bulk upload successful!' });
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('Error during bulk upload:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MovieModel();