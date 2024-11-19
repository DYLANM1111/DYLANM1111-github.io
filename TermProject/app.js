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

// Start server
app.listen(PORT, (error) => {
    if (!error) {
        console.log('Server connected on port ' + PORT);
    } else {
        console.error("Express connection failed:", error);
        process.exit(1);
    }
});

module.exports = app;