/**
 * Watch My Back - Frontend Sunucusu
 * 
 * Bu sunucu kullanıcı arayüzünü sunar ve API isteklerini
 * izole backend sunucusuna proxy'ler.
 * 
 * Kullanıcılar bu sunucuya bağlanır, backend'e doğrudan erişemezler.
 */

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

console.log('Frontend sunucusu başlatılıyor...');
console.log('Backend URL:', backendUrl);

// Güvenlik middlewarei
app.use(helmet({
    contentSecurityPolicy: false // Inline scriptlere izin ver
}));

// Rate limiting - 15 dakikada maksimum 200 istek
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.' }
});
app.use(limiter);

// JSON ve form verisini parse et
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosyaları sun (CSS, JS, resimler vb.)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// API PROXY ROUTES
// ============================================

/**
 * POST /api/check-email
 * E-posta kontrol isteğini backende proxyle ileitir
 */
app.post('/api/check-email', async (req, res) => {
    try {
        const response = await fetch(`${backendUrl}/api/check-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Backend proxy hatası:', error);
        res.status(500).json({
            status: 'error',
            message: 'Backend sunucusuna bağlanılamadı'
        });
    }
});

/**
 * GET /api/health
 * Sistem sağlık kontrolü (frontend + backend)
 */
app.get('/api/health', async (req, res) => {
    try {
        const response = await fetch(`${backendUrl}/api/health`);
        const data = await response.json();
        res.json({
            frontend: 'ok',
            backend: data.status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            frontend: 'ok',
            backend: 'erişilemez',
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// SAYFA ROUTES
// ============================================

/**
 * Tüm diğer istekler için index.html döndür
 * (Single Page Application desteği)
 */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// SUNUCUYU BAŞLAT
// ============================================

app.listen(port, () => {
    console.log(`\n🌐 Watch My Back - Frontend`);
    console.log(`📍 Adres: http://localhost:${port}`);
    console.log(`🔗 Backend: ${backendUrl}\n`);
});
