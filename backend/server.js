const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

async function checkHaveIBeenPwned(browser, email) {
    try {
        const page = await browser.newPage();
        await page.goto('https://haveibeenpwned.com/');
        
        // Type email and search
        await page.type('input[name="email"]', email);
        await page.click('button[type="submit"]');
        
        // Wait for results
        await page.waitForSelector('.pwnedSearchResult', { timeout: 10000 });
        
        // Get breach information
        const breaches = await page.evaluate(() => {
            const breachElements = document.querySelectorAll('.pwnedWebsite');
            return Array.from(breachElements).map(element => ({
                name: element.querySelector('.pwnedSiteName').textContent,
                date: element.querySelector('.pwnedDate').textContent,
                description: element.querySelector('.pwnedDescription').textContent
            }));
        });
        
        await page.close();
        return breaches;
    } catch (error) {
        console.error('Error in HIBP check:', error);
        return [];
    }
}

async function checkDeHashed(browser, email, username) {
    try {
        const page = await browser.newPage();
        await page.goto('https://dehashed.com/search');
        
        // Search with email or username
        await page.type('input[type="text"]', email || username);
        await page.click('button[type="submit"]');
        
        // Wait for results
        await page.waitForSelector('.search-results', { timeout: 10000 });
        
        // Extract results
        const results = await page.evaluate(() => {
            const entries = document.querySelectorAll('.search-result');
            return Array.from(entries).map(entry => ({
                source: entry.querySelector('.source').textContent,
                leaked_data: entry.querySelector('.leaked-data').textContent,
                date: entry.querySelector('.breach-date').textContent
            }));
        });
        
        await page.close();
        return results;
    } catch (error) {
        console.error('Error in DeHashed check:', error);
        return [];
    }
}

// API endpoints
app.post('/api/check-breach', async (req, res) => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const { email, username, passwordHash } = req.body;
        const results = [];

        if (email) {
            const hibpResults = await checkHaveIBeenPwned(browser, email);
            results.push({
                source: 'Have I Been Pwned',
                breaches: hibpResults
            });
        }

        await browser.close();
        
        res.json({
            success: true,
            results
        });
    } catch (error) {
        await browser.close();
        console.error('Error checking breaches:', error);
        res.status(500).json({
            success: false,
            error: 'Error checking for data breaches'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});