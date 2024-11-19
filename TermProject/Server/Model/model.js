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

    // Added to match route parameter
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
}

module.exports = new MovieModel();