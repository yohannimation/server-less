const express = require('express');
const router = express.Router();

// Route for the history page
router.get('/', (req, res) => {
    res.render('history', { title: 'Server-less - History' });
});

module.exports = router;