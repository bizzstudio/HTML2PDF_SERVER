// functions/convertHtmlToPdf.js
const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

// פונקציה להמרת HTML ל-PDF
const convertHtmlToPdf = async (html) => {
    let userDataDir;
    
    const puppeteerObj = process.env.ENVIRONMENT === 'dev' ?
        {
            headless: true, // מתאים לסביבת שרת
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        } :
        {
            headless: true, // מתאים לסביבת שרת
            executablePath: '/usr/bin/chromium-browser', // נתיב לדפדפן Chromium המותקן
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--user-data-dir=' + (userDataDir = `/tmp/chrome-user-data-${Date.now()}-${Math.random().toString(36).substring(7)}`)
            ],
        };

    const browser = await puppeteer.launch(puppeteerObj);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();
    
    // ניקוי התיקייה הזמנית
    if (userDataDir && fs.existsSync(userDataDir)) {
        try {
            fs.rmSync(userDataDir, { recursive: true, force: true });
        } catch (err) {
            // התעלמות משגיאות ניקוי
        }
    }
    
    return pdfBuffer;
};

module.exports = { convertHtmlToPdf };