const express = require('express');
const multer = require('multer');
const dataController = require('../controllers/dataAnalyzedController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('csvFile'), dataController.processCSV);

module.exports = router;
