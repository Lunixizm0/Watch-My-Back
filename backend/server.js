const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Allowed origins for CORS
const allowedOrigins = [
    `http://localhost:${port}`,
    'http://127.0.0.1:' + port
];

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow inline scripts for our frontend
}));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like same-origin requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'CORS policy: Origin not allowed';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// HIBP Scraper class
class HibpScraper {
    constructor() {
        this.browser = null;
    }

    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    formatBreachData(breach) {
        return {
            Name: breach.Name || 'Unknown Source',
            BreachDate: breach.BreachDate || 'Unknown Date',
            DataClasses: breach.DataClasses || ['Unknown Data Types'],
            Description: breach.Description || 'No description available',
            source: 'HIBP'
        };
    }

    async checkEmail(email) {
        const browser = await this.init();
        const page = await browser.newPage();

        try {
            // Set user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/117.0.0.0 Safari/537.36');

            // Set extra headers
            await page.setExtraHTTPHeaders({
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'DNT': '1'
            });

            // First visit the main page
            await page.goto('https://haveibeenpwned.com/', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait a bit for any cloudflare checks
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Navigate to the unified search endpoint
            const response = await page.goto(`https://haveibeenpwned.com/unifiedsearch/${email}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            const status = response.status();

            if (status === 404) {
                // No breaches found
                await page.close();
                return [];
            }

            if (status !== 200) {
                await page.close();
                return [];
            }

            // Get the JSON content
            const content = await page.content();

            // Extract JSON from the page
            const jsonMatch = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
            let data;

            if (jsonMatch) {
                data = JSON.parse(jsonMatch[1]);
            } else {
                // Try to get raw text content
                const bodyText = await page.evaluate(() => document.body.innerText);
                data = JSON.parse(bodyText);
            }

            await page.close();

            const breaches = data.Breaches || [];
            return breaches.map(breach => this.formatBreachData(breach));

        } catch (error) {
            console.error('Error scraping HIBP:', error);
            await page.close();
            return [];
        }
    }
}

const scraper = new HibpScraper();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/', async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.json({
            status: 'error',
            message: 'Lütfen bir e-posta adresi girin'
        });
    }

    try {
        const breaches = await scraper.checkEmail(email);

        res.json({
            status: 'success',
            email: email,
            breaches: breaches
        });
    } catch (error) {
        console.error('Error checking email:', error);
        res.json({
            status: 'error',
            message: 'Veri ihlalleri kontrol edilirken bir hata oluştu'
        });
    }
});

// Cleanup on exit
process.on('SIGINT', async () => {
    await scraper.close();
    process.exit();
});

process.on('SIGTERM', async () => {
    await scraper.close();
    process.exit();
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});