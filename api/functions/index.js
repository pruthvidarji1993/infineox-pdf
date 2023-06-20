
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");

admin.initializeApp();

exports.generatePDF = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    const { html, css } = req.body;
    console.log(req.body);
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            ignoreDefaultArgs: ['--disable-extensions'],
            args: ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote'],
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 794, height: 1500, deviceScaleFactor: 2 });
        // Inject CSS styles into the page
        await page.setContent(`<style>${css}</style>${html}`, {
            waitUntil: ['load', 'networkidle0'],
        });

        const buffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                left: '0px',
                top: '0px',
                right: '0px',
                bottom: '0px',
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: '<div></div>',
            preferCSSPageSize: true,
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=test.pdf',
        });

        res.send(buffer);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred.');
    }
});
