const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.processCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file sent.");
    }

    try {
        // Prepare CSV file to send it to the API
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));

        // Upload file
        const responseUpload = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        if (!responseUpload.ok) {
            throw new Error(`Upload API Error: ${responseUpload.statusText}`);
        }

        const responseUploadData = await responseUpload.json();
        fs.unlinkSync(req.file.path); // Delete the temp file

        uploadedFileName = responseUploadData.fileName;


        // Check analysis done
        let isAnalysisComplete = false;
        let attempts = 0;
        const maxAttempts = 15;

        do {
            await sleep(5000);
            attempts++;

            const responseAnalysis = await fetch(`http://localhost:3000/analysis/${uploadedFileName}`, {
                method: 'GET',
            });

            if (!responseAnalysis.ok) {
                throw new Error(`Analysis API Error: ${responseAnalysis.statusText}`);
            }

            const analysisData = await responseAnalysis.json();
            isAnalysisComplete = analysisData.success;

            console.log(`Tentative ${attempts}: Analyse terminée ? ${isAnalysisComplete}`);

        } while (!isAnalysisComplete && attempts < maxAttempts);

        if (!isAnalysisComplete) {
            throw new Error("L'analyse a pris trop de temps et a été abandonnée.");
        }


        // Get analysis result
        const responseGet = await fetch(`http://localhost:3000/analysis/${uploadedFileName}`, {
            method: 'GET',
        });

        if (!responseGet.ok) {
            throw new Error(`Upload API Error: ${responseGet.statusText}`);
        }

        const responseGetData = await responseGet.json();

        res.render(`data-analyzed`, { title: "CSV Uploaded", analysisData: responseGetData.results });
    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).send("Failed to upload file.");
    }
};