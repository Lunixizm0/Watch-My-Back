# Watch My Back 🛡️

Veri ihlali kontrol uygulaması. E-posta adresinizin veri sızıntılarında yer alıp almadığını kontrol edin.

## 🎯 Özellikler

- **HIBP Entegrasyonu**: Have I Been Pwned veritabanından veri ihlali kontrolü
- **Güvenli Mimari**: Backend internetten izole, sadece frontend üzerinden erişim
- **Modern Arayüz**: Glassmorphism tasarım, animasyonlar ve responsive yapı
- **Puppeteer Scraping**: Cloudflare bypass için stealth plugin

## 🏗️ Mimari

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Kullanıcı     │────▶│   Frontend      │────▶│   Backend       │
│   (Tarayıcı)    │     │   (Port 5000)   │     │   (localhost)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                        │                       │
       │                        │                       │
       ▼                        ▼                       ▼
   İnternete Açık         Proxy Sunucu            İzole API
```

- **Frontend**: Kullanıcı arayüzü + API proxy
- **Backend**: HIBP scraping (sadece localhost'tan erişilebilir)

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/Lunixizm0/Watch-My-Back.git
cd Watch-My-Back
```

2. **Backend kurulumu**
```bash
cd backend
npm install
cp .env.example .env
```

3. **Frontend kurulumu**
```bash
cd ../frontend
npm install
cp .env.example .env
```

## 💻 Çalıştırma

### Geliştirme Ortamı

İki ayrı terminal açın:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Tarayıcıda `http://localhost:5000` adresine gidin.

### Üretim Ortamı (Deploy)

#### Render.com

Bu projeyi Render üzerinde yayınlayabilirsiniz:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Butona tıklayın.
2. Render hesabınızla giriş yapın.
3. "Apply" butonuna tıklayarak kurulumu başlatın.
4. Render sizin için Frontend ve Backend servislerini otomatik kuracak ve birbirine bağlayacaktır.

---

### Manuel Kurulum

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
``` 


## ⚙️ Yapılandırma

### Backend (.env)

```env
PORT=3001
ALLOWED_IPS=127.0.0.1,::1
```

### Frontend (.env)

```env
PORT=5000
BACKEND_URL=http://127.0.0.1:3001
```

## 📁 Proje Yapısı

```
Watch-My-Back/
├── backend/
│   ├── server.js          # API sunucusu
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── server.js          # Frontend sunucusu (proxy)
│   ├── package.json
│   ├── .env.example
│   └── public/
│       ├── index.html     # Ana sayfa
│       ├── css/
│       │   └── style.css  # Stiller
│       └── js/
│           └── app.js     # Uygulama mantığı
├── .gitignore
├── LICENSE
└── README.md
```

## 🔒 Güvenlik

- Backend **public internete kapalı** (Internal Service) veya **API Key** ile korunur.
- Frontend ve Backend arasında `x-api-key` ile güvenli iletişim sağlanır.
- Rate limiting (15 dakikada 100 istek)
- Helmet.js güvenlik başlıkları

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeniOzellik`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için issue açabilirsiniz.
