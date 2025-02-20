// index.js
const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors'); // ייבוא CORS
const archiver = require('archiver'); // ספרייה ליצירת ZIP
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

// להמרת מספר HTMLs, והחזרה כקובץ ZIP
app.post('/generate-pdf-batch', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        console.log(`Incoming batch request with API key: ${apiKey}`);

        if (apiKey !== process.env.PDF_API_KEY) {
            return res.status(403).send('Forbidden: Invalid API Key');
        };

        const { documents } = req.body;
        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            return res.status(400).send('Missing or invalid "documents" array in request body');
        };

        // הגדרת הפרמטרים לקובץ ה-ZIP
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="pdfs.zip"');

        // יצירת ארכיון ZIP ו"חיבור" ל-Response
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.on('error', (err) => {
            throw err;
        });
        archive.pipe(res);

        // לעבור על כל קובץ וליצור PDF מ-HTML
        for (const doc of documents) {
            console.time(`PDF Conversion Time - ${doc.filename}`); // התחלת מדידת זמן

            // 1) המרת ה-HTML ל-PDF
            const pdfUint8Array = await convertHtmlToPdf(doc.html);

            // המרה ל-Buffer
            const pdfBuffer = Buffer.from(pdfUint8Array);
            // console.log(`Generated PDF for ${doc.filename}:`, pdfBuffer);

            // 2) הוספת ה-PDF לארכיון עם שם קובץ
            const filename = doc.filename || `document-${Date.now()}.pdf`;
            archive.append(pdfBuffer, { name: filename });

            console.timeEnd(`PDF Conversion Time - ${doc.filename}`); // סיום מדידת זמן
        }

        // סיום הארכיון
        await archive.finalize();
        console.log('Sent batch ZIP of PDFs');

    } catch (error) {
        console.error('Error generating batch PDFs:', error);
        res.status(500).send('Failed to generate batch PDFs');
    }
});

// שרת מאזין
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
