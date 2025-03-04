const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// Route for the history page
router.get('/', historyController.getHistory);

router.get('/:fileName', historyController.getHistoryByFile);

module.exports = router;