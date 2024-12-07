// Controller.js
"use strict";
const MovieModel = require("../Model/model");
const multer = require('multer');
const path = require('path');
const db = require('../Model/db-conn');  // Import db-conn


// Configure multer for file uploads
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
       if (file.fieldname === 'imgUrl') {
           cb(null, 'client/Images/');
       } else if (file.fieldname === 'trailer_url') {
           cb(null, 'client/trailers/');
       }
   },
   filename: function (req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
       cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
   }
});

const fileFilter = (req, file, cb) => {
   if (file.fieldname === 'imgUrl') {
       if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
           return cb(new Error('Only image files are allowed!'), false);
       }
   } else if (file.fieldname === 'trailer_url') {
       if (!file.originalname.match(/\.(mp4|mov|avi|wmv)$/)) {
           return cb(new Error('Only video files are allowed!'), false);
       }
   }
   cb(null, true);
};

const upload = multer({ 
   storage: storage,
   fileFilter: fileFilter,
   limits: {
       fileSize: 100 * 1024 * 1024 // 100MB limit
   }
});

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
   },

// Controller.js
createMovie: async (req, res) => {
    const uploadMiddleware = upload.fields([
        { name: 'imgUrl', maxCount: 1 },
        { name: 'trailer_url', maxCount: 1 }
    ]);

    uploadMiddleware(req, res, async function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const movieData = req.body;
            
            // If files were uploaded, use their paths
            if (req.files?.imgUrl) {
                movieData.imgUrl = `Images/${req.files.imgUrl[0].filename}`;
            } else if (movieData.imgUrl) {
                // If a path was provided in the body, use that
                // Keep the path as provided, don't override it
            } else {
                // Only use placeholder if no image path or file was provided
                movieData.imgUrl = 'Images/placeholder.jpg';
            }
                
            if (req.files?.trailer_url) {
                movieData.trailer_url = `trailers/${req.files.trailer_url[0].filename}`;
            }
            // Keep existing trailer_url if provided in body

            const movie = await MovieModel.addMovie(movieData);
            res.json(movie);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
},

   updateMovie: async (req, res) => {
       const uploadMiddleware = upload.fields([
           { name: 'imgUrl', maxCount: 1 },
           { name: 'trailer_url', maxCount: 1 }
       ]);

       uploadMiddleware(req, res, async function(err) {
           if (err) {
               return res.status(400).json({ error: 'File upload error: ' + err.message });
           }

           try {
               const { id } = req.params;
               const movieData = req.body;

               // Get current movie data
               const currentMovie = await MovieModel.getMovieDetails(id);
               if (!currentMovie) {
                   return res.status(404).json({ error: 'Movie not found' });
               }

               // Handle file updates
               if (req.files) {
                   if (req.files.imgUrl) {
                       movieData.imgUrl = 'Images/' + req.files.imgUrl[0].filename;
                   }
                   if (req.files.trailer_url) {
                       movieData.trailer_url = 'trailers/' + req.files.trailer_url[0].filename;
                   }
               }

               // Merge current data with updates
               const updatedData = {
                   ...currentMovie,
                   ...movieData
               };

               const movie = await MovieModel.updateMovie(id, updatedData);
               res.json(movie);
           } catch (error) {
               res.status(500).json({ error: error.message });
           }
       });
   },

   deleteMovie: async (req, res) => {
       try {
           const { id } = req.params;
           await MovieModel.deleteMovie(id);
           res.json({ success: true });
       } catch (error) {
           res.status(500).json({ error: error.message });
       }
   },
   bulkUpload: async (req, res) => {
    console.log('Bulk upload request received');
    console.log('Request body:', req.body);

    const dbTransaction = db.runAsync || db.run; // Use an async wrapper if available
    try {
        await dbTransaction('BEGIN TRANSACTION'); // Start the transaction

        const { categories } = req.body;

        if (!categories || categories.length === 0) {
            throw new Error('No categories found in request body');
        }

        for (const category of categories) {
            const categoryId = await MovieModel.ensureCategory(category);
            console.log(`Ensuring category '${category.name}' (ID: ${categoryId})`);

            if (!category.movies || category.movies.length === 0) {
                console.warn(`No movies found for category '${category.name}'`);
                continue;
            }

            for (const movie of category.movies) {
                console.log(`Processing movie '${movie.title}'`);
                await MovieModel.addMovie({
                    ...movie,
                    category_id: categoryId,
                    ...movie.movie_details,
                });
            }
        }

        await dbTransaction('COMMIT'); // Commit the transaction
        console.log('Bulk upload successful');
        res.json({ success: true });
    } catch (error) {
        try {
            await dbTransaction('ROLLBACK'); // Rollback the transaction on error
        } catch (rollbackError) {
            console.error('Error during transaction rollback:', rollbackError);
        }

        console.error('Error during bulk upload:', error);
        res.status(500).json({ error: error.message });
    }
}

};

module.exports = contentController;