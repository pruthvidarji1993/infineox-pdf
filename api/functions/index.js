
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const cors = require('cors')({ origin: true });
//const puppeteer = require('puppeteer-core');

admin.initializeApp();

exports.generatePDF = functions.runWith({
    memory: "1GB",
    timeoutSeconds: 300,
}).https.onRequest(async (req, res) => {

    cors(req, res, async () => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        const { html, css } = req.body;

        const browser = await puppeteer.launch({
            headless: 'true',
            ignoreDefaultArgs: ['--disable-extensions'],
            args: ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote'],
        });
        try {

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
            console.log("buffer", buffer);
        } catch (error) {
            console.error(error);
            res.status(500).send('An error occurred.');
        }

    })
});
