// functions/convertHtmlToPdf.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
require('dotenv').config();

function makeTmpDir(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
}

// פונקציה להמרת HTML ל-PDF
const convertHtmlToPdf = async (html) => {
    const userDataDir = makeTmpDir('pptr-ud-'); // פרופיל זמני ומבודד לכל בקשה

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        `--user-data-dir=${userDataDir}`, // הכי חשוב: לא להשתמש ב-~/.config
    ];

    const puppeteerObj = process.env.ENVIRONMENT === 'dev'
        ? { headless: true, args, userDataDir }
        : { headless: true, executablePath: '/usr/bin/chromium-browser', args, userDataDir };

    let browser;
    try {
        browser = await puppeteer.launch(puppeteerObj);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        return pdfBuffer;
    } finally {
        if (browser) await browser.close();
        try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch { }
    }
};

module.exports = { convertHtmlToPdf };