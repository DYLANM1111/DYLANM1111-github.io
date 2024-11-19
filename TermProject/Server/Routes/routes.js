// routes.js
"use strict";
const express = require("express");
const router = express.Router();
const contentController = require("../Controller/Controller");

console.log('Controllers loaded:', Object.keys(contentController));

router.get("/all", contentController.getAllMovies);
router.get("/categories", contentController.getCategoriesWithMovies);
router.get("/categories/:categoryId/movies", contentController.getMoviesByCategory);
router.get("/movies/search", contentController.searchMovies);
router.get("/movies/:id", contentController.getMovieDetails);
router.post("/cart/add", contentController.addToCart);
router.get("/cart/count/:userId", contentController.getCartCount);

module.exports = router;