// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { convertHtmlToPdf } = require('./functions/convertHtmlToPdf');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '10mb' })); // תומך ב-POST עם תוכן JSON

// ראוט להמרת HTML ל-PDF
app.post('/generate-pdf', async (req, res) => {
    try {
        const { html } = req.body;
        if (!html) {
            return res.status(400).send('Missing HTML content in request body');
        }

        const pdfBuffer = await convertHtmlToPdf(html);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="output.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Failed to generate PDF');
    }
});

// שרת מאזין
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
