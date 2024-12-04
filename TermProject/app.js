// app.js
const express = require('express');
const PORT = 3000;
const app = express();
// Middleware
app.use(express.json());



// Routes
const routes = require('./Server/Routes/routes');
app.use('/api', routes);

// Static files
app.use('/client', express.static('public/client'));
app.use('/admin', express.static('public/admin'));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, (error) => {
    if (!error) {
        console.log('Server connected on port ' + PORT);
    } else {
        console.error("Express connection failed:", error);
        process.exit(1);
    }
});
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "imgUrl") {
            cb(null, 'client/Images/');
        } else if (file.fieldname === "trailer_url") {
            cb(null, 'client/trailers/');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

app.use('/api/movies', upload.fields([
    { name: 'imgUrl', maxCount: 1 },
    { name: 'trailer_url', maxCount: 1 }
]));

module.exports = app;