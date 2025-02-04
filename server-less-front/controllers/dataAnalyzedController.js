const fs = require('fs');
const csv = require('csv-parser');

exports.processCSV = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file sent.' });
    }

    const results = [];
    const filePath = req.file.path; // Temporarily path of the uploaded file

    fs.createReadStream(filePath, { encoding: 'utf8' })
        .pipe(csv())
        .on('data', (data) => results.push(data)) // Reading CSV data
        .on('end', () => {
            fs.unlinkSync(filePath); // Deleting the temporarily file
            res.render('data-analyzed', { title: "Server-less - Data analyzed", data: results });
        })
        .on('error', (err) => {
            console.error('CSV file error:', err);
            res.status(500).json({ error: 'CSV file error.' });
        });
};