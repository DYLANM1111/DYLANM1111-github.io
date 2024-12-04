"use strict";
const db = require("./db-conn");

class MovieModel {
    async getAllMovies() {
        try {
            return await db.all(`
                SELECT m.*, md.director, md.genre, md.trailer_url
                FROM MOVIES m
                LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
            `);
        } catch (error) {
            throw new Error('Error fetching all movies: ' + error.message);
        }
    }

    async getCategoriesWithMovies() {
        try {
            const categories = await db.all(`SELECT * FROM CATEGORIES ORDER BY display_order`);
            
            for (let category of categories) {
                category.movies = await db.all(`
                    SELECT m.*, md.director, md.genre, md.trailer_url
                    FROM MOVIES m
                    LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
                    WHERE m.category_id = ?
                `, [category.id]);
            }
            return categories;
        } catch (error) {
            throw new Error('Error fetching categories with movies: ' + error.message);
        }
    }

    async getMoviesByCategory(categoryId) {
        try {
            return await db.all(`
                SELECT m.*, md.director, md.genre, md.trailer_url
                FROM MOVIES m
                LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
                WHERE m.category_id = ?
            `, [categoryId]);
        } catch (error) {
            throw new Error('Error fetching category movies: ' + error.message);
        }
    }

    async searchMovies(searchTerm) {
        try {
            return await db.all(`
                SELECT m.*, c.name as category_name, md.director, md.genre
                FROM MOVIES m
                LEFT JOIN CATEGORIES c ON m.category_id = c.id
                LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
                WHERE m.title LIKE ? OR md.director LIKE ? OR md.genre LIKE ?
            `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
        } catch (error) {
            throw new Error('Error searching movies: ' + error.message);
        }
    }

    async getMovieDetails(movieId) {
        try {
            const movie = await db.get(`
                SELECT m.*, md.*, c.name as category_name
                FROM MOVIES m
                LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
                LEFT JOIN CATEGORIES c ON m.category_id = c.id
                WHERE m.id = ?
            `, [movieId]);
            return movie;
        } catch (error) {
            throw new Error('Error fetching movie details: ' + error.message);
        }
    }

    async getMoviesForAdmin() {
        try {
            return await db.all(`
                SELECT m.*, c.name as category_name, 
                       md.director, md.genre, md.trailer_url
                FROM MOVIES m
                LEFT JOIN CATEGORIES c ON m.category_id = c.id
                LEFT JOIN MOVIE_DETAILS md ON m.id = md.movie_id
                ORDER BY m.id DESC
            `);
        } catch (error) {
            throw new Error('Error fetching admin movies: ' + error.message);
        }
    }

    async addMovie(movieData) {
        try {
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
    
            // Return the movie details after insertion
            return await this.getMovieDetails(movieId);
        } catch (error) {
            // If an error occurs, the caller will handle the rollback
            throw error;
        }
    }
    

    
    async updateMovie(id, movieData) {
        try {
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
    
            await db.run('COMMIT');
            return await this.getMovieDetails(id);
        } catch (error) {
            await db.run('ROLLBACK');
            throw error;
        }
    }

    async deleteMovie(id) {
        try {
            await db.run('DELETE FROM MOVIE_DETAILS WHERE movie_id = ?', [id]);
            await db.run('DELETE FROM MOVIES WHERE id = ?', [id]);
        } catch (error) {
            throw new Error('Error deleting movie: ' + error.message);
        }
    }
    // model.js
    async ensureCategory(categoryData) {
        const existing = await db.get(
            'SELECT id FROM categories WHERE name = ?', 
            [categoryData.name]
        );
        if (existing) return existing.id;

        const result = await db.run(
            'INSERT INTO categories (name, display_order) VALUES (?, ?)',
            [categoryData.name, categoryData.display_order]
        );
        return result.lastID;
    }

    async bulkUpload(req, res) {
        try {
            await db.run('BEGIN TRANSACTION');

            // Process each category and its movies
            for (const category of req.body.categories) {
                // Ensure category exists and retrieve its ID
                const categoryId = await this.ensureCategory(category);

                // Process movies within the category
                for (const movie of category.movies) {
                    // Add movie and associate it with the category
                    await this.addMovie({
                        ...movie,
                        category_id: categoryId
                    });
                }
            }

            await db.run('COMMIT');
            res.status(200).json({ message: 'Bulk upload successful!' });
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error during bulk upload:', error);
            res.status(500).json({ error: error.message });
        }
    }


}


module.exports = new MovieModel();