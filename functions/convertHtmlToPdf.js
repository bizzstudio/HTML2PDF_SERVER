// functions/convertHtmlToPdf.js
const puppeteer = require('puppeteer');

// פונקציה להמרת HTML ל-PDF
const convertHtmlToPdf = async (html) => {
    const browser = await puppeteer.launch({
        headless: true, // מתאים לסביבת שרת
        args: ['--no-sandbox'],
    });
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