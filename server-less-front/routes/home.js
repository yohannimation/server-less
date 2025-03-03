const express = require('express');
const router = express.Router();

// Route for the home page
router.get('/', (req, res) => {
    res.render('home', { title: 'Server-less - Form' });
});

module.exports = router;