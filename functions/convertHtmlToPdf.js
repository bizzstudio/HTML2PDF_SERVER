// functions/convertHtmlToPdf.js
const puppeteer = require('puppeteer');
require('dotenv').config();

// פונקציה להמרת HTML ל-PDF
const convertHtmlToPdf = async (html) => {
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        // ⬅️ זה העיקר: להשתמש בפרופיל של snap ולא ב-/tmp
        '--user-data-dir=/root/snap/chromium/common/chromium',
    ];

    const puppeteerObj = process.env.ENVIRONMENT === 'dev'
        ? { headless: true, args }
        : { headless: true, executablePath: '/usr/bin/chromium-browser', args };

    const browser = await puppeteer.launch(puppeteerObj);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
};

module.exports = { convertHtmlToPdf };