// functions/convertHtmlToPdf.js
const puppeteer = require('puppeteer');
require('dotenv').config();

// פונקציה להמרת HTML ל-PDF
const convertHtmlToPdf = async (html) => {
    const puppeteerObj = process.env.ENVIRONMENT === 'dev' ?
        {
            headless: true, // מתאים לסביבת שרת
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        } :
        {
            headless: true, // מתאים לסביבת שרת
            executablePath: '/usr/bin/chromium-browser', // נתיב לדפדפן Chromium המותקן
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        };

    const browser = await puppeteer.launch(puppeteerObj);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
};

module.exports = { convertHtmlToPdf };