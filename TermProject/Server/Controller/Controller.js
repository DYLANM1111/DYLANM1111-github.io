// Controller.js
"use strict";
const MovieModel = require("../Model/model");

const contentController = {
    getAllMovies: async (req, res) => {
        try {
            const allMovies = await MovieModel.getAllMovies();
            res.json(allMovies);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCategoriesWithMovies: async (req, res) => {
        try {
            const categories = await MovieModel.getCategoriesWithMovies();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getMoviesByCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const movies = await MovieModel.getMoviesByCategory(categoryId);
            res.json(movies);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    searchMovies: async (req, res) => {
        try {
            const { term } = req.query;
            const movies = await MovieModel.searchMovies(term);
            res.json(movies);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getMovieDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const movie = await MovieModel.getMovieDetails(id);
            if (!movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }
            res.json(movie);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    addToCart: async (req, res) => {
        try {
            const { movieId, quantity } = req.body;
            // Implement cart functionality
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getCartCount: async (req, res) => {
        try {
            const { userId } = req.params;
            // Implement cart count functionality
            res.json({ count: 0 });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = contentController;