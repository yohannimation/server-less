exports.getHistory = async (req, res) => {
    try {
        // Get uploaded files
        const responseUploadedFiles = await fetch('http://localhost:3000/upload', {
            method: 'GET',
        });

        if (!responseUploadedFiles.ok) {
            throw new Error(`Upload API Error: ${responseUploadedFiles.statusText}`);
        }

        const responseUploadedData = await responseUploadedFiles.json();
        const filteredUploadedData = responseUploadedData.filter((file) => !file.name.includes("analysis-result"))


        // Get analysis result foreach uploaded files
        await Promise.all(
            filteredUploadedData.map(async file => {
                const responseGet = await fetch(`http://localhost:3000/analysis/${file.name}`, {
                    method: 'GET',
                });

                if (!responseGet.ok) {
                    throw new Error(`Upload API Error: ${responseGet.statusText}`);
                }

                const responseGetData = await responseGet.json();
                const anomaliesResult = responseGetData.results.anomalies

                const date = new Date(file.createdOn);
                file.date = date.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }).replace(',', ' -');

                const countPrice = anomaliesResult.prix.length;
                const countQty = anomaliesResult.quantite.length;
                const countReview = anomaliesResult.note.length;
                file.nbrAnomaly = countPrice + countQty + countReview;
            })
        )

        res.render(`history-list`, { title: "Server-less - History list", uploadedFilesData: filteredUploadedData });
    } catch (error) {
        console.error('Get failed:', error);
        res.status(500).send("Failed to get files.");
    }
};

exports.getHistoryByFile = async (req, res) => {
    const fileName = req.params.fileName;
    
    // Get analysis result
    const responseGet = await fetch(`http://localhost:3000/analysis/${fileName}`, {
        method: 'GET',
    });

    if (!responseGet.ok) {
        throw new Error(`Upload API Error: ${responseGet.statusText}`);
    }

    const responseGetData = await responseGet.json();

    console.log(responseGetData)

    res.render('history', { title: `Server-less - ${fileName}`, analysisData: responseGetData.results });
};