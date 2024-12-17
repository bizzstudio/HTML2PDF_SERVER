// index.js
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors'); // ייבוא CORS
const { convertHtmlToPdf } = require('./functions/convertHtmlToPdf');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // שימוש ב-CORS
app.use(bodyParser.json({ limit: '10mb' })); // תומך ב-POST עם תוכן JSON

// ראוט להמרת HTML ל-PDF
app.post('/generate-pdf', async (req, res) => {
    try {
        const { html } = req.body;
        const apiKey = req.headers['x-api-key']; // קריאת ה-API Key מהכותרות
        console.log(`Incoming request with API key: ${apiKey}`);

        // בדיקת מפתח ה-API
        if (apiKey !== process.env.PDF_API_KEY) {
            return res.status(403).send('Forbidden: Invalid API Key');
        };

        if (!html) {
            return res.status(400).send('Missing HTML content in request body');
        };

        const pdfBuffer = await convertHtmlToPdf(html);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length, // הוספת אורך התוכן
            'Content-Disposition': 'attachment; filename="output.pdf"',
        });

        console.log('Sending HTML to remote PDF server...');
        res.end(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF');
    }
});

// שרת מאזין
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
