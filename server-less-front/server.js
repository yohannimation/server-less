const express = require('express');
const path = require('path');

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Import bootstrap
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));


// Define EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Use static file from /public
app.use(express.static(path.join(__dirname, 'public')));


// Import and use routes
const homeRoutes = require('./routes/home');
app.use('/', homeRoutes);

const dataRoutes = require('./routes/data');
app.use('/', dataRoutes);

const historyRoutes = require('./routes/history');
app.use('/history', historyRoutes);


// Put temporarily the CSV files in the folder "uploads"
const upload = multer({ dest: 'uploads/' });


// Start server
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});