const express = require('express');

const path = require('path');
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

const dataRoutes = require('./routes/data-analyzed');
app.use('/data-analyzed', dataRoutes);

const historyRoutes = require('./routes/history');
app.use('/history', historyRoutes);

// Start server
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});