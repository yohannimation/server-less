const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('csvFile'), (req, res) => {
    console.log(req)

    if (!req.file) {
        return res.status(400).send('Aucun fichier envoyé.');
    }

    const results = [];
    const filePath = req.file.path; // Temporarily path of the uploaded file

    fs.createReadStream(filePath, { encoding: 'utf8' })
        .pipe(csv())
        .on('data', (data) => results.push(data)) // Reading CSV data
        .on('end', () => {
            fs.unlinkSync(filePath); // Deleting the temporarily file
            res.render('data-analysed', { title: "Server-less - Data analyzed", data: results });
        });
});

module.exports = router;
