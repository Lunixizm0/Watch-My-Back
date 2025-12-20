/**
 * Watch My Back - Backend API Sunucusu
 * 
 * Bu sunucu HIBP (Have I Been Pwned) üzerinden veri ihlali kontrolü yapar.
 * Puppeteer ile web scraping kullanarak Cloudflare korumasını aşar.
 * 
 * GÜVENLİK: Bu sunucu sadece localhost'tan erişilebilir.
 * Frontend sunucusu proxy görevi görerek bu API'ye erişir.
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Puppeteer stealth plugin - Cloudflare bypass için
puppeteer.use(StealthPlugin());

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// İzin verilen IP adresleri - sadece frontend sunucusu erişebilir
const allowedIPs = process.env.ALLOWED_IPS
    ? process.env.ALLOWED_IPS.split(',').map(ip => ip.trim())
    : ['127.0.0.1', '::1', 'localhost'];

console.log('İzin verilen IP\'ler:', allowedIPs);

/**
 * IP Kısıtlama Middleware
 * Sadece izin verilen IP adreslerinden gelen istekleri kabul eder
 */
const ipRestriction = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    // IPv6 localhost formatını normalize et
    const normalizedIP = clientIP.replace('::ffff:', '');

    if (allowedIPs.some(ip => normalizedIP.includes(ip))) {
        next();
    } else {
        console.log('Reddedilen IP:', clientIP);
        res.status(403).json({ error: 'Erişim reddedildi' });
    }
};

// Güvenlik middleware'leri
app.use(helmet());
app.use(ipRestriction);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - 15 dakikada maksimum 100 istek
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' }
});
app.use(limiter);

/**
 * HIBP Scraper Sınıfı
 * Have I Been Pwned web sitesinden veri ihlali bilgilerini çeker
 */
class HibpScraper {
    constructor() {
        this.browser = null;
    }

    /**
     * Puppeteer tarayıcısını başlat
     */
    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    /**
     * Tarayıcıyı kapat
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * İhlal verisini formatla
     */
    formatBreachData(breach) {
        return {
            Name: breach.Name || 'Bilinmeyen Kaynak',
            BreachDate: breach.BreachDate || 'Bilinmeyen Tarih',
            DataClasses: breach.DataClasses || ['Bilinmeyen Veri Türleri'],
            Description: breach.Description || 'Açıklama mevcut değil',
            source: 'HIBP'
        };
    }

    /**
     * E-posta adresini HIBP'de kontrol et
     * @param {string} email - Kontrol edilecek e-posta adresi
     * @returns {Array} Bulunan ihlaller listesi
     */
    async checkEmail(email) {
        const browser = await this.init();
        const page = await browser.newPage();

        try {
            // Tarayıcı ayarları
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/117.0.0.0 Safari/537.36');

            await page.setExtraHTTPHeaders({
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'DNT': '1'
            });

            // Ana sayfayı ziyaret et (Cloudflare kontrolü için)
            await page.goto('https://haveibeenpwned.com/', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Cloudflare kontrollerini bekle
            await new Promise(resolve => setTimeout(resolve, 2000));

            // E-posta adresini kontrol et
            const response = await page.goto(`https://haveibeenpwned.com/unifiedsearch/${email}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            const status = response.status();

            // 404: İhlal bulunamadı
            if (status === 404) {
                await page.close();
                return [];
            }

            // Başka bir hata
            if (status !== 200) {
                await page.close();
                return [];
            }

            // JSON içeriğini al
            const content = await page.content();
            const jsonMatch = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
            let data;

            if (jsonMatch) {
                data = JSON.parse(jsonMatch[1]);
            } else {
                const bodyText = await page.evaluate(() => document.body.innerText);
                data = JSON.parse(bodyText);
            }

            await page.close();

            // İhlalleri formatla ve döndür
            const breaches = data.Breaches || [];
            return breaches.map(breach => this.formatBreachData(breach));

        } catch (error) {
            console.error('HIBP scraping hatası:', error);
            await page.close();
            return [];
        }
    }
}

// Scraper instance'ı oluştur
const scraper = new HibpScraper();

// ============================================
// API ROUTES
// ============================================

/**
 * POST /api/check-email
 * E-posta adresini veri ihlalleri için kontrol eder
 */
app.post('/api/check-email', async (req, res) => {
    const email = req.body.email;

    if (!email) {
        return res.status(400).json({
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
        console.error('E-posta kontrol hatası:', error);
        res.status(500).json({
            status: 'error',
            message: 'Veri ihlalleri kontrol edilirken bir hata oluştu'
        });
    }
});

/**
 * GET /api/health
 * Sunucu sağlık kontrolü
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// SUNUCU KAPANIŞI
// ============================================

// SIGINT sinyali (Ctrl+C) yakalandığında
process.on('SIGINT', async () => {
    console.log('\nSunucu kapatılıyor...');
    await scraper.close();
    process.exit();
});

// SIGTERM sinyali yakalandığında
process.on('SIGTERM', async () => {
    console.log('\nSunucu kapatılıyor...');
    await scraper.close();
    process.exit();
});

// ============================================
// SUNUCUYU BAŞLAT
// ============================================

// Sadece localhost'ta dinle - internete kapalı
app.listen(port, '127.0.0.1', () => {
    console.log(`\n🛡️  Watch My Back - Backend API`);
    console.log(`📍 Adres: http://127.0.0.1:${port}`);
    console.log(`🔒 Sadece localhost'tan erişilebilir\n`);
});