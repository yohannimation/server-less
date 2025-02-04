const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const dataController = require('../controllers/dataAnalyzedController');

router.post('/', upload.single('csvFile'), dataController.processCSV);

module.exports = router;
