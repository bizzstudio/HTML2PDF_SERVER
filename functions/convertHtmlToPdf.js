// functions/convertHtmlToPdf.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const puppeteer = require('puppeteer');
require('dotenv').config();

function makeTmpDir(prefix) {
    return fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
}

const convertHtmlToPdf = async (html) => {
    // 1) נכפה סביבת ריצה מבודדת לגמרי לכל ריצה
    const TMP_HOME = makeTmpDir('pptr-home');
    const TMP_XDG = makeTmpDir('pptr-xdg');
    const TMP_RUN = makeTmpDir('pptr-run');
    process.env.HOME = TMP_HOME;
    process.env.XDG_CONFIG_HOME = TMP_XDG;
    process.env.XDG_RUNTIME_DIR = TMP_RUN;

    // 2) פרופיל כרום זמני (חשוב!)
    const userDataDir = makeTmpDir('pptr-ud');

    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        `--user-data-dir=${userDataDir}`,
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
        // ניקוי תיקיות זמניות
        for (const d of [TMP_HOME, TMP_XDG, TMP_RUN, userDataDir]) {
            try { fs.rmSync(d, { recursive: true, force: true }); } catch { }
        }
    }
};

module.exports = { convertHtmlToPdf };