const express = require('express');
const app = express();
const port = 3000;

// Main route
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.get('/api', (req, res) => {
    res.json({ message: "Bienvenue sur l'API Express !" });
});

// Start server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
