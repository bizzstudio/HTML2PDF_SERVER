// functions/convertHtmlToPdf.js
const puppeteer = require('puppeteer');
require('dotenv').config();

const convertHtmlToPdf = async (html) => {
    // נוודא שאנחנו מריצים את הכרומיום הפנימי של Puppeteer, לא את זה של השרת
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: puppeteer.executablePath(), // ← זה הקריטי
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ],
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