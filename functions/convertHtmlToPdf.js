// functions/convertHtmlToPdf.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
require('dotenv').config();

const makeTmpUserDataDir = () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'puppeteer-'));
    return base;
};

// פונקציה להמרת HTML ל-PDF
const convertHtmlToPdf = async (html) => {
    const userDataDir = makeTmpUserDataDir();

    const commonArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--single-process',          // לעתים עוזר בשרתים דלי משאבים
        '--disable-gpu',             // אין צורך ב-GPU בשרת
        `--user-data-dir=${userDataDir}`, // הכי חשוב – פרופיל ייחודי
    ];

    const puppeteerObj = process.env.ENVIRONMENT === 'dev' ?
        {
            headless: true,
            args: commonArgs,
        } :
        {
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            args: commonArgs,
        };

    let browser;
    try {
        browser = await puppeteer.launch(puppeteerObj);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        return pdfBuffer;
    } finally {
        if (browser) await browser.close();
        // ניקוי הפרופיל הזמני
        try { 
            fs.rmSync(userDataDir, { recursive: true, force: true }); 
        } catch (_) {}
    }
};

module.exports = { convertHtmlToPdf };